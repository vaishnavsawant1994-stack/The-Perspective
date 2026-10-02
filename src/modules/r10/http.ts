import "server-only";

import { NextResponse } from "next/server";
import { z } from "zod";

import { parseAuthenticationJson, requireSameOrigin } from "@/modules/authentication/http/request-security";
import { authorizationProblem, authorizeTrustedHttpOperation, resolveAuthorizedHttpRequest } from "@/modules/authorization/http";
import type { R10ActivePermissionKey, R10AuthorizationResourceType } from "@/modules/authorization/r10-policy";
import type { AuthorizedRequestContext } from "@/modules/foundation/request-context";
import { r6MfaSatisfied, r6RecentAuthenticationSatisfied } from "@/modules/r6/security";

import { readPublicDelivery, runR10Command, runReconcile, type R10Result } from "./commands";

const KEY = /^[A-Za-z0-9._:-]{8,128}$/u;

export function r10Json(body: unknown, status = 200) {
  return NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } });
}

export function r10Invalid() {
  return NextResponse.json(
    { type: "about:blank", title: "Invalid R10 request.", status: 400, code: "R10_INVALID_REQUEST" },
    { status: 400, headers: { "Cache-Control": "no-store", "Content-Type": "application/problem+json" } },
  );
}

function r10Error(code: string) {
  const status = code === "NOT_FOUND" ? 404
    : code === "TEAM_REQUIRED" ? 403
    : ["CONFLICT", "STALE_WRITE", "IDEMPOTENCY_CONFLICT", "INELIGIBLE", "PROVIDER_UNCONFIGURED"].includes(code) ? 409
    : 400;
  return NextResponse.json(
    { type: "about:blank", title: status === 404 ? "Resource not available." : "R10 command rejected.", status, code: "R10_COMMAND_REJECTED" },
    { status, headers: { "Cache-Control": "no-store", "Content-Type": "application/problem+json" } },
  );
}

function resultResponse(result: R10Result) {
  if (result.kind === "error") return r10Error(result.code);
  const value = Object.fromEntries(Object.entries(result.value).filter(([field]) => field !== "kind" && field !== "code"));
  return r10Json({ result: value }, result.value.replayed ? 200 : 201);
}

export async function teamCommand(
  request: Request,
  permissionKey: R10ActivePermissionKey,
  resourceType: R10AuthorizationResourceType,
  action: string,
  command: string,
  schema: z.ZodType,
  obligations: { readonly reason?: boolean; readonly session?: boolean } = {},
) {
  if (!requireSameOrigin(request)) return authorizationProblem(403, "AUTHZ_DENIED");
  const idempotencyKey = request.headers.get("idempotency-key")?.trim();
  if (!idempotencyKey || !KEY.test(idempotencyKey)) return r10Invalid();
  const input = await parseAuthenticationJson(request, schema);
  if (!input || typeof input !== "object" || Array.isArray(input)) return r10Invalid();
  const resolved = await resolveAuthorizedHttpRequest(request, "TEAM");
  if (resolved.kind === "response") return resolved.response;
  const now = new Date();
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
      exactVersionMatches: true,
      separationOfDutySatisfied: true,
      reason: obligations.reason ? command : undefined,
      recentAuthenticationSatisfied: obligations.session ? r6RecentAuthenticationSatisfied(resolved.context.session, now) : undefined,
      mfaSatisfied: obligations.session ? r6MfaSatisfied(resolved.context.session, now) : undefined,
    },
  });
  if (authorization.kind === "response") return authorization.response;
  try {
    return resultResponse(await runR10Command(resolved.context, command, input as Record<string, unknown>, idempotencyKey));
  } catch {
    return authorizationProblem(503, "AUTHZ_UNAVAILABLE");
  }
}

export async function teamRead(
  request: Request,
  permissionKey: R10ActivePermissionKey,
  resourceType: R10AuthorizationResourceType,
  action: "view" | "list",
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
    command: { action, requestedFields: [], workflowSatisfied: true },
  });
  if (authorization.kind === "response") return authorization.response;
  try {
    const loaded = await load(resolved.context);
    if (loaded instanceof Response) return loaded;
    return r10Json({ result: loaded });
  } catch {
    return authorizationProblem(503, "AUTHZ_UNAVAILABLE");
  }
}

export async function publicDelivery(slug: string) {
  if (!/^[a-z0-9-]{1,80}$/u.test(slug)) return r10Invalid();
  try {
    const value = await readPublicDelivery(slug);
    if (value === null) return authorizationProblem(404, "AUTHZ_NOT_FOUND");
    return r10Json({ result: value });
  } catch {
    return authorizationProblem(404, "AUTHZ_NOT_FOUND");
  }
}

export async function runWorker(request: Request) {
  const expected = process.env.PERSPECTIVE_R10_WORKER_TOKEN?.trim();
  const supplied = (request.headers.get("authorization") ?? "").replace(/^Bearer\s+/u, "").trim();
  if (!expected || expected.length < 32 || supplied !== expected) return authorizationProblem(403, "AUTHZ_DENIED");
  try {
    return r10Json({ result: await runReconcile() });
  } catch {
    return authorizationProblem(503, "AUTHZ_UNAVAILABLE");
  }
}
