import "server-only";

import { NextResponse } from "next/server";
import { z } from "zod";

import { parseAuthenticationJson, requireSameOrigin } from "@/modules/authentication/http/request-security";
import { authorizationProblem, authorizeTrustedHttpOperation, resolveAuthorizedHttpRequest } from "@/modules/authorization/http";
import type { AuthorizedRequestContext } from "@/modules/foundation/request-context";
import { withCommercialTenantTransaction } from "@/modules/commercial/persistence";
import { r6MfaSatisfied, r6RecentAuthenticationSatisfied } from "@/modules/r6/security";

import { companySlug } from "./schema";

const key = z.string().regex(/^[A-Za-z0-9._:-]{8,128}$/u);
const uuid = z.string().uuid();
const reason = z.string().trim().min(8).max(400);
const https = z.string().url().refine((value) => {
  const parsed = new URL(value);
  return parsed.protocol === "https:" && !parsed.username && !parsed.password;
});
const source = z.object({
  label: z.string().trim().min(2).max(180),
  url: https,
  capturedAt: z.string().datetime({ offset: true }),
}).strict();

const baseContent = z.object({
  name: z.string().trim().min(2).max(180),
  summary: z.string().trim().min(12).max(800),
  websiteUrl: https.nullable().optional(),
  disclosureKind: z.enum(["NONE","SPONSORED","COMMISSIONED"]).default("NONE"),
  disclosureText: z.string().trim().min(10).max(1000).nullable().optional(),
  sources: z.array(source).max(40),
});

const companyContent = baseContent.extend({
  industry: z.string().trim().max(120).nullable().optional(),
  headquarters: z.string().trim().max(160).nullable().optional(),
  overview: z.string().trim().max(6000).nullable().optional(),
}).strict();

const personContent = baseContent.extend({
  headline: z.string().trim().max(200).nullable().optional(),
  biography: z.string().trim().max(8000).nullable().optional(),
  organizationName: z.string().trim().max(180).nullable().optional(),
  coverage: z.array(z.object({
    title: z.string().trim().min(2).max(200),
    href: z.string().regex(/^\/(?:article|magazine\/read|podcasts|videos)\/[a-z0-9]+(?:-[a-z0-9]+)*$/u),
    kind: z.enum(["ARTICLE","INTERVIEW","MAGAZINE","PODCAST","VIDEO"]),
  }).strict()).max(50).default([]),
}).strict();

const submitBody = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("COMPANY"), slug: companySlug, payload: companyContent }).strict(),
  z.object({ kind: z.literal("PROFESSIONAL"), slug: companySlug, payload: personContent }).strict(),
  z.object({ kind: z.literal("EDITOR"), slug: companySlug, payload: personContent }).strict(),
]).superRefine((value, context) => {
  if (value.payload.disclosureKind !== "NONE" &&
      !value.payload.disclosureText) {
    context.addIssue({ code: "custom", path: ["payload","disclosureText"], message: "Commercial disclosure is mandatory." });
  }
});

const reviewBody = z.object({
  decision: z.enum(["APPROVE","REJECT"]),
  reason,
}).strict();

const publishBody = z.object({
  action: z.enum(["PUBLISH","WITHDRAW"]),
  reason,
}).strict();

function respond(result: Record<string,unknown>) {
  if (result.kind !== "ok") {
    const code = String(result.code || "INELIGIBLE");
    const status = code === "TEAM_REQUIRED" || code === "SEPARATION_REQUIRED" ? 403
      : code === "NOT_FOUND" ? 404
      : ["INELIGIBLE","CONFLICT","IDEMPOTENCY_CONFLICT"].includes(code) ? 409
      : 400;
    return NextResponse.json(
      { type: "about:blank", title: "Editorial profile operation rejected.", status, code: "PN_EDITORIAL_REJECTED" },
      { status, headers: { "Cache-Control": "no-store", "Content-Type": "application/problem+json" } },
    );
  }
  return NextResponse.json(
    { result: Object.fromEntries(Object.entries(result).filter(([name]) => name !== "kind")) },
    { status: result.replayed ? 200 : 201, headers: { "Cache-Control": "no-store" } },
  );
}

async function authorized(
  request: Request,
  permissionKey: "editorial.view" | "editorial.review" | "editorial.approve" | "publication.publish",
  action: "list" | "create" | "approve" | "publish" | "archive",
  mutation: boolean,
  operationReason?: string,
) {
  if (mutation && !requireSameOrigin(request)) return { response: authorizationProblem(403,"AUTHZ_DENIED") } as const;
  const r = await resolveAuthorizedHttpRequest(request, "TEAM");
  if (r.kind === "response") return { response: r.response } as const;

  const resourceType = permissionKey === "editorial.approve" ? "draft-version"
    : permissionKey === "publication.publish" ? "issue" : "editorial-review";

  const now = new Date();
  const allowed = await authorizeTrustedHttpOperation({
    context: r.context,
    permissionKey,
    resource: { resourceType, ownerOrganizationId: r.context.tenant.organizationId, visibility: "INTERNAL", sensitivity: "STANDARD" },
    command: {
      action, requestedFields: [], workflowSatisfied: true, exactVersionMatches: true,
      reason: operationReason,
      separationOfDutySatisfied: true,
      mfaSatisfied: mutation ? r6MfaSatisfied(r.context.session,now) : undefined,
      recentAuthenticationSatisfied: mutation ? r6RecentAuthenticationSatisfied(r.context.session,now) : undefined,
    },
    concealResource: action !== "list" && action !== "create",
  });
  if (allowed.kind === "response") return { response: allowed.response } as const;
  return { context: r.context } as const;
}

async function execute(context: AuthorizedRequestContext, command:
  "submit" | "review" | "publish",
  args: readonly unknown[],
) {
  const rows = await withCommercialTenantTransaction(context, (transaction) => {
    if (command === "submit") return transaction.$queryRawUnsafe<Array<{ result: unknown }>>(
      "SELECT profiles.pn03_submit($1::uuid,$2::text,$3::text,$4::jsonb,$5::text) AS result", ...args,
    );
    if (command === "review") return transaction.$queryRawUnsafe<Array<{ result: unknown }>>(
      "SELECT profiles.pn03_review($1::uuid,$2::uuid,$3::text,$4::text,$5::text) AS result", ...args,
    );
    return transaction.$queryRawUnsafe<Array<{ result: unknown }>>(
      "SELECT profiles.pn03_publish($1::uuid,$2::uuid,$3::text,$4::text,$5::text) AS result", ...args,
    );
  });
  const value = rows[0]?.result;
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string,unknown> : { kind: "error", code: "INELIGIBLE" };
}

async function parseBody<T extends z.ZodType>(request: Request, schema: T) {
  const parsed = await parseAuthenticationJson(request, schema);
  return parsed ? { value: parsed } as const : { response: NextResponse.json(
    { type: "about:blank", title: "Invalid editorial submission.", status: 400, code: "PN_INVALID" },
    { status: 400, headers: { "Cache-Control": "no-store" } },
  ) } as const;
}

function idempotency(request: Request) {
  const parsed = key.safeParse(request.headers.get("idempotency-key"));
  return parsed.success ? parsed.data : null;
}

export async function listSubmissions(request: Request) {
  const auth = await authorized(request, "editorial.view", "list", false);
  if ("response" in auth) return auth.response;
  try {
    const rows = await withCommercialTenantTransaction(auth.context, async (transaction) =>
      transaction.$queryRawUnsafe<Array<{ result: unknown }>>(
        "SELECT profiles.pn03_team_queue($1::uuid) AS result", auth.context.membership.membershipId,
      ),
    );
    return NextResponse.json(
      { result: rows[0]?.result ?? [] }, { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return authorizationProblem(503,"AUTHZ_UNAVAILABLE");
  }
}

export async function submitProfile(request: Request) {
  const auth = await authorized(request, "editorial.review", "create", true);
  if ("response" in auth) return auth.response;
  const idem = idempotency(request);
  if (!idem) return respond({ kind: "error", code: "INVALID" });
  const parsed = await parseBody(request,submitBody);
  if ("response" in parsed) return parsed.response;
  try {
    const { kind, slug, payload } = parsed.value;
    return respond(await execute(auth.context,"submit",[
      auth.context.membership.membershipId,kind,slug,JSON.stringify(payload),idem,
    ]));
  } catch {
    return authorizationProblem(503,"AUTHZ_UNAVAILABLE");
  }
}

export async function reviewProfile(request: Request, id: string) {
  if (!uuid.safeParse(id).success) return authorizationProblem(404,"AUTHZ_NOT_FOUND");
  const auth = await authorized(request, "editorial.approve", "approve", true);
  if ("response" in auth) return auth.response;
  const idem = idempotency(request);
  if (!idem) return respond({kind:"error",code:"INVALID"});
  const parsed = await parseBody(request,reviewBody);
  if ("response" in parsed) return parsed.response;
  try {
    return respond(await execute(auth.context,"review",[
      auth.context.membership.membershipId,id,parsed.value.decision,parsed.value.reason,idem,
    ]));
  } catch {
    return authorizationProblem(503,"AUTHZ_UNAVAILABLE");
  }
}

export async function publishProfile(request: Request, id: string) {
  if (!uuid.safeParse(id).success) return authorizationProblem(404,"AUTHZ_NOT_FOUND");
  const parsed = await parseBody(request,publishBody);
  if ("response" in parsed) return parsed.response;
  const action = parsed.value.action === "PUBLISH" ? "publish" : "archive";
  const auth = await authorized(request,"publication.publish",action,true,parsed.value.reason);
  if ("response" in auth) return auth.response;
  const idem = idempotency(request);
  if (!idem) return respond({kind:"error",code:"INVALID"});
  try {
    return respond(await execute(auth.context,"publish",[
      auth.context.membership.membershipId,id,parsed.value.action,parsed.value.reason,idem,
    ]));
  } catch {
    return authorizationProblem(503,"AUTHZ_UNAVAILABLE");
  }
}
