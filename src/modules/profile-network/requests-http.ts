import "server-only";

import { NextResponse } from "next/server";
import { z } from "zod";

import { parseAuthenticationJson, requireSameOrigin } from "@/modules/authentication/http/request-security";
import { authorizationProblem, authorizeTrustedHttpOperation, resolveAuthorizedHttpRequest } from "@/modules/authorization/http";
import { withCommercialTenantTransaction } from "@/modules/commercial/persistence";
import { getPrismaClient } from "@/modules/persistence/client";
import { r6MfaSatisfied, r6RecentAuthenticationSatisfied } from "@/modules/r6/security";
import { profileRequestRateKeyFromHeaders } from "./request-rate-key";
import { companySlug } from "./schema";

const https = z.string().url().refine((value) => {
  const url = new URL(value);
  return url.protocol === "https:" && !url.username && !url.password;
});
const requestBody = z.object({
  kind: z.enum(["CORRECTION","REMOVAL","CLAIM"]),
  subjectKind: z.enum(["COMPANY","PROFESSIONAL","EDITOR"]),
  subjectSlug: companySlug,
  description: z.string().trim().min(30).max(2000),
  sourceUrl: https.nullable().optional(),
  contactEmail: z.string().trim().email().max(254).nullable().optional(),
  website: z.string().max(200).default(""), // honeypot; must remain blank
}).strict().superRefine((value,ctx) => {
  if (value.kind === "CLAIM" && !value.contactEmail) {
    ctx.addIssue({ code: "custom", path: ["contactEmail"], message: "A reply address is necessary for relationship review." });
  }
});
const decisionBody = z.object({
  decision: z.enum(["NEEDS_EVIDENCE","CLOSED","DECLINED"]),
  reason: z.string().trim().min(8).max(400),
}).strict();
const uuid = z.string().uuid();
const key = /^[A-Za-z0-9._:-]{8,128}$/u;

function problem() {
  return NextResponse.json(
    { type:"about:blank",title:"Profile request could not be accepted.",status:400,code:"PN_REQUEST_INVALID" },
    { status:400,headers:{"Cache-Control":"no-store","Content-Type":"application/problem+json"} },
  );
}

function rateKey(request: Request) {
  // Hostinger's trusted proxy/header behavior must be verified before release.
  // The database also applies a global volume ceiling to limit spoofing abuse.
  const rawKey = process.env.PERSPECTIVE_AUTH_DATA_KEY;
  const secret = rawKey ? Buffer.from(rawKey, "base64") : Buffer.alloc(0);
  return profileRequestRateKeyFromHeaders(request.headers, secret);
}

export async function submitPublicProfileRequest(request: Request) {
  if (!requireSameOrigin(request)) return authorizationProblem(403,"AUTHZ_DENIED");
  const parsed = await parseAuthenticationJson(request, requestBody);
  if (!parsed) return problem();
  const token = rateKey(request);
  if (!token) return authorizationProblem(503,"AUTHZ_UNAVAILABLE");
  try {
    const database = getPrismaClient();
    await database.$transaction(async (tx) => {
      await tx.$executeRawUnsafe("SET LOCAL ROLE perspective_public");
      await tx.$queryRaw`SELECT set_config('app.organization_id','',true)`;
      await tx.$queryRawUnsafe(
        "SELECT profiles.pn04_public_submit($1::text,$2::text,$3::text,$4::text,$5::text,$6::text,$7::text,$8::text)",
        parsed.kind,parsed.subjectKind,parsed.subjectSlug,parsed.description,
        parsed.sourceUrl || null,parsed.contactEmail || null,token,parsed.website,
      );
    });
    // Deliberately opaque: do not reveal unpublished or non-existent subjects or rate limits.
    return NextResponse.json(
      { message:"If eligible, your request has entered the private editorial review queue. No profile changes or identity verification occur automatically." },
      { status:202,headers:{"Cache-Control":"no-store"} },
    );
  } catch {
    return authorizationProblem(503,"AUTHZ_UNAVAILABLE");
  }
}

async function teamAccess(request: Request, action: "list" | "resolve") {
  if (action === "resolve" && !requireSameOrigin(request)) return {response:authorizationProblem(403,"AUTHZ_DENIED")} as const;
  const resolved = await resolveAuthorizedHttpRequest(request,"TEAM");
  if (resolved.kind === "response") return {response:resolved.response} as const;
  const now = new Date();
  const auth = await authorizeTrustedHttpOperation({
    context:resolved.context,
    permissionKey: action === "list" ? "editorial.view" : "editorial.review",
    resource:{resourceType:"editorial-review",ownerOrganizationId:resolved.context.tenant.organizationId,visibility:"INTERNAL",sensitivity:"PII"},
    command:{
      action,requestedFields:[],workflowSatisfied:true,
      mfaSatisfied: action === "resolve" ? r6MfaSatisfied(resolved.context.session,now) : undefined,
      recentAuthenticationSatisfied: action === "resolve" ? r6RecentAuthenticationSatisfied(resolved.context.session,now) : undefined,
    },
  });
  if (auth.kind === "response") return {response:auth.response} as const;
  return {context:resolved.context} as const;
}

export async function listProfileRequests(request: Request) {
  const auth = await teamAccess(request,"list");
  if ("response" in auth) return auth.response;
  try {
    const rows = await withCommercialTenantTransaction(auth.context, async (tx) =>
      tx.$queryRawUnsafe<Array<{result:unknown}>>(
        "SELECT profiles.pn04_team_queue($1::uuid) AS result",auth.context.membership.membershipId,
      ),
    );
    return NextResponse.json({result:rows[0]?.result ?? []},{headers:{"Cache-Control":"no-store"}});
  } catch {
    return authorizationProblem(503,"AUTHZ_UNAVAILABLE");
  }
}

export async function decideProfileRequest(request: Request,id: string) {
  if (!uuid.safeParse(id).success) return authorizationProblem(404,"AUTHZ_NOT_FOUND");
  const auth = await teamAccess(request,"resolve");
  if ("response" in auth) return auth.response;
  const idempotency = request.headers.get("idempotency-key") || "";
  if (!key.test(idempotency)) return problem();
  const parsed = await parseAuthenticationJson(request,decisionBody);
  if (!parsed) return problem();
  try {
    const rows = await withCommercialTenantTransaction(auth.context,async (tx) =>
      tx.$queryRawUnsafe<Array<{result:Record<string,unknown>}>>(
        "SELECT profiles.pn04_decide($1::uuid,$2::uuid,$3::text,$4::text,$5::text) AS result",
        auth.context.membership.membershipId,id,parsed.decision,parsed.reason,idempotency,
      ),
    );
    const result = rows[0]?.result;
    if (!result || result.kind !== "ok") {
      return NextResponse.json(
        {type:"about:blank",title:"Request decision rejected.",status:409,code:"PN_DECISION_REJECTED"},
        {status:409,headers:{"Cache-Control":"no-store","Content-Type":"application/problem+json"}},
      );
    }
    return NextResponse.json({result},{status:result.replayed ? 200 : 201,headers:{"Cache-Control":"no-store"}});
  } catch {
    return authorizationProblem(503,"AUTHZ_UNAVAILABLE");
  }
}
