import "server-only";

import { NextResponse } from "next/server";
import { z } from "zod";

import { parseAuthenticationJson, requireSameOrigin } from "@/modules/authentication/http/request-security";
import { authorizationProblem, authorizeTrustedHttpOperation, resolveAuthorizedHttpRequest } from "@/modules/authorization/http";
import type { R11ActivePermissionKey, R11AuthorizationResourceType } from "@/modules/authorization/r11-policy";
import { withCommercialTenantTransaction } from "@/modules/commercial/persistence";
import type { AuthorizedRequestContext } from "@/modules/foundation/request-context";

import { observePublic, readPublicMeta, readPublicSearch, runR11Command, runReindex, runRule, type R11Result } from "./commands";

const KEY = /^[A-Za-z0-9._:-]{8,128}$/u;

export function r11Json(body: unknown, status = 200) {
  return NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } });
}

export function r11Invalid() {
  return NextResponse.json(
    { type: "about:blank", title: "Invalid R11 request.", status: 400, code: "R11_INVALID_REQUEST" },
    { status: 400, headers: { "Cache-Control": "no-store", "Content-Type": "application/problem+json" } },
  );
}

function r11Error(code: string) {
  const status = code === "NOT_FOUND" ? 404
    : code === "TEAM_REQUIRED" ? 403
    : ["CONFLICT", "STALE_WRITE", "IDEMPOTENCY_CONFLICT", "INELIGIBLE"].includes(code) ? 409
    : 400;
  return NextResponse.json(
    { type: "about:blank", title: status === 404 ? "Resource not available." : "R11 command rejected.", status, code: "R11_COMMAND_REJECTED" },
    { status, headers: { "Cache-Control": "no-store", "Content-Type": "application/problem+json" } },
  );
}

function resultResponse(result: R11Result) {
  if (result.kind === "error") return r11Error(result.code);
  const value = Object.fromEntries(Object.entries(result.value).filter(([field]) => field !== "kind" && field !== "code"));
  return r11Json({ result: value }, result.value.replayed ? 200 : 201);
}

export async function teamCommand(
  request: Request,
  permissionKey: R11ActivePermissionKey,
  resourceType: R11AuthorizationResourceType,
  action: string,
  command: string,
  schema: z.ZodType,
  obligations: { readonly sod?: boolean } = {},
) {
  if (!requireSameOrigin(request)) return authorizationProblem(403, "AUTHZ_DENIED");
  const idempotencyKey = request.headers.get("idempotency-key")?.trim();
  if (!idempotencyKey || !KEY.test(idempotencyKey)) return r11Invalid();
  const input = await parseAuthenticationJson(request, schema);
  if (!input || typeof input !== "object" || Array.isArray(input)) return r11Invalid();
  const payload = input as Record<string, unknown>;
  const resolved = await resolveAuthorizedHttpRequest(request, "TEAM");
  if (resolved.kind === "response") return resolved.response;
  let separationOfDutySatisfied = true;
  let exactVersionMatches = true;
  if (obligations.sod) {
    const reportId = String(payload.reportId ?? "");
    const expected = Number(payload.expectedRowVersion);
    const rows = await withCommercialTenantTransaction(resolved.context, (transaction) =>
      transaction.$queryRawUnsafe<Array<{ created_by: string; row_version: number }>>(
        `SELECT created_by::text, row_version FROM growth.report_runs WHERE id = $1::uuid`,
        reportId,
      ),
    );
    const row = rows[0];
    if (!row) return authorizationProblem(404, "AUTHZ_NOT_FOUND");
    separationOfDutySatisfied = row.created_by !== resolved.context.membership.membershipId;
    exactVersionMatches = row.row_version === expected;
  }
  const authorization = await authorizeTrustedHttpOperation({
    context: resolved.context,
    permissionKey,
    resource: {
      resourceType,
      ownerOrganizationId: resolved.context.tenant.organizationId,
      visibility: "INTERNAL",
      sensitivity: "STANDARD",
    },
    command: {
      action,
      requestedFields: [],
      workflowSatisfied: true,
      exactVersionMatches,
      separationOfDutySatisfied,
      reason: obligations.sod ? "approve-report" : undefined,
    },
  });
  if (authorization.kind === "response") return authorization.response;
  try {
    return resultResponse(await runR11Command(resolved.context, command, payload, idempotencyKey));
  } catch {
    return authorizationProblem(503, "AUTHZ_UNAVAILABLE");
  }
}

export async function teamRead(
  request: Request,
  permissionKey: R11ActivePermissionKey,
  resourceType: R11AuthorizationResourceType,
  load: (context: AuthorizedRequestContext) => Promise<unknown>,
) {
  const resolved = await resolveAuthorizedHttpRequest(request, "TEAM");
  if (resolved.kind === "response") return resolved.response;
  const authorization = await authorizeTrustedHttpOperation({
    context: resolved.context,
    permissionKey,
    resource: {
      resourceType,
      ownerOrganizationId: resolved.context.tenant.organizationId,
      visibility: "INTERNAL",
      sensitivity: "STANDARD",
    },
    command: { action: "list", requestedFields: [], workflowSatisfied: true },
  });
  if (authorization.kind === "response") return authorization.response;
  try {
    return r11Json({ result: await load(resolved.context) });
  } catch {
    return authorizationProblem(503, "AUTHZ_UNAVAILABLE");
  }
}

export async function publicObservation(request: Request) {
  if (!requireSameOrigin(request)) return authorizationProblem(403, "AUTHZ_DENIED");
  const schema = z.object({
    slug: z.string().regex(/^[a-z0-9-]{1,80}$/u),
    dedupe: z.string().regex(/^[A-Za-z0-9._:-]{8,80}$/u),
    campaignId: z.string().uuid().optional(),
  }).strict();
  const input = await parseAuthenticationJson(request, schema);
  if (!input) return r11Invalid();
  try {
    const value = await observePublic(input.slug, input.dedupe, input.campaignId ?? null);
    if (!value || value.kind === "error") return authorizationProblem(404, "AUTHZ_NOT_FOUND");
    return r11Json({ result: value }, value.replayed ? 200 : 201);
  } catch {
    return authorizationProblem(404, "AUTHZ_NOT_FOUND");
  }
}

export async function publicMeta(slug: string) {
  if (!/^[a-z0-9-]{1,80}$/u.test(slug)) return r11Invalid();
  try {
    const value = await readPublicMeta(slug);
    if (!value || typeof value !== "object") return authorizationProblem(404, "AUTHZ_NOT_FOUND");
    return r11Json({ result: value });
  } catch {
    return authorizationProblem(404, "AUTHZ_NOT_FOUND");
  }
}

export async function publicSearch(request: Request) {
  const query = new URL(request.url).searchParams.get("q") ?? "";
  if (query.length > 80) return r11Invalid();
  try {
    return r11Json({ result: await readPublicSearch(query) });
  } catch {
    return r11Json({ result: [] });
  }
}

function workerAllowed(request: Request) {
  const expected = process.env.PERSPECTIVE_R11_WORKER_TOKEN?.trim();
  const supplied = (request.headers.get("authorization") ?? "").replace(/^Bearer\s+/u, "").trim();
  return Boolean(expected && expected.length >= 32 && supplied === expected);
}

export async function reindexWorker(request: Request) {
  if (!workerAllowed(request)) return authorizationProblem(403, "AUTHZ_DENIED");
  try {
    return r11Json({ result: await runReindex() });
  } catch {
    return authorizationProblem(503, "AUTHZ_UNAVAILABLE");
  }
}

export async function runWorker(request: Request) {
  if (!workerAllowed(request)) return authorizationProblem(403, "AUTHZ_DENIED");
  const schema = z.object({
    organizationId: z.string().uuid(),
    ruleId: z.string().uuid(),
    triggerKey: z.string().regex(/^[A-Za-z0-9._:-]{8,80}$/u),
  }).strict();
  const input = await parseAuthenticationJson(request, schema);
  if (!input) return r11Invalid();
  try {
    const value = await runRule(input.organizationId, input.ruleId, input.triggerKey);
    if (value.kind === "error") return r11Error(String(value.code));
    return r11Json({ result: value });
  } catch {
    return authorizationProblem(503, "AUTHZ_UNAVAILABLE");
  }
}
