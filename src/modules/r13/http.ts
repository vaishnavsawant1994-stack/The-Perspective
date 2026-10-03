import "server-only";

import { NextResponse } from "next/server";
import { z } from "zod";

import { parseAuthenticationJson, requireSameOrigin } from "@/modules/authentication/http/request-security";
import { authorizationProblem, authorizeTrustedHttpOperation, resolveAuthorizedHttpRequest } from "@/modules/authorization/http";
import type { R13ActivePermissionKey, R13AuthorizationResourceType } from "@/modules/authorization/r13-policy";
import { r6MfaSatisfied, r6RecentAuthenticationSatisfied } from "@/modules/r6/security";

import { readR13, runR13, type R13Result } from "./commands";

const KEY = /^[A-Za-z0-9._:-]{8,128}$/u;
const reason = z.string().trim().min(3).max(200);
const integrationType = z.enum(["EMAIL", "STORAGE", "PAYMENT"]);

export function r13Json(body: unknown, status = 200) {
  return NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } });
}

export function r13Invalid() {
  return NextResponse.json(
    { type: "about:blank", title: "Invalid R13 request.", status: 400, code: "R13_INVALID_REQUEST" },
    { status: 400, headers: { "Cache-Control": "no-store", "Content-Type": "application/problem+json" } },
  );
}

function r13Error(code: string) {
  const status = code === "NOT_FOUND" ? 404
    : code === "TEAM_REQUIRED" ? 403
    : ["CONFLICT", "STALE_WRITE", "IDEMPOTENCY_CONFLICT", "INELIGIBLE"].includes(code) ? 409
    : 400;
  return NextResponse.json(
    { type: "about:blank", title: status === 404 ? "Resource not available." : "R13 command rejected.", status, code: "R13_COMMAND_REJECTED" },
    { status, headers: { "Cache-Control": "no-store", "Content-Type": "application/problem+json" } },
  );
}

function publicValue(result: R13Result) {
  if (result.kind === "error") return r13Error(result.code);
  const value = Object.fromEntries(Object.entries(result.value).filter(([field]) => field !== "kind" && field !== "code"));
  return r13Json({ result: value }, result.value.replayed ? 200 : 201);
}

async function authorize(
  request: Request,
  permissionKey: R13ActivePermissionKey,
  resourceType: R13AuthorizationResourceType,
  action: string,
  commandReason: string,
) {
  const resolved = await resolveAuthorizedHttpRequest(request, "TEAM");
  if (resolved.kind === "response") return resolved;
  const now = new Date();
  const authorization = await authorizeTrustedHttpOperation({
    context: resolved.context,
    permissionKey,
    resource: {
      resourceType,
      ownerOrganizationId: resolved.context.tenant.organizationId,
      visibility: "INTERNAL",
      sensitivity: "CONFIDENTIAL",
    },
    command: {
      action,
      requestedFields: [],
      reason: commandReason,
      recentAuthenticationSatisfied: r6RecentAuthenticationSatisfied(resolved.context.session, now),
      mfaSatisfied: r6MfaSatisfied(resolved.context.session, now),
    },
    concealResource: true,
  });
  if (authorization.kind === "response") return authorization;
  return resolved;
}

export async function readSettings(request: Request) {
  const resolved = await authorize(request, "settings.manage", "organization-settings", "view", "view");
  if ("kind" in resolved && resolved.kind === "response") return resolved.response;
  if (!("context" in resolved)) return authorizationProblem(403, "AUTHZ_DENIED");
  try {
    const result = await readR13(resolved.context, "settings");
    if (result.kind === "error") return r13Error(result.code);
    const value = Object.fromEntries(Object.entries(result.value).filter(([field]) => !["kind", "code", "replayed"].includes(field)));
    return r13Json({ result: value });
  } catch {
    return authorizationProblem(503, "AUTHZ_UNAVAILABLE");
  }
}

export async function updateSettings(request: Request) {
  if (!requireSameOrigin(request)) return authorizationProblem(403, "AUTHZ_DENIED");
  const idempotencyKey = request.headers.get("idempotency-key")?.trim();
  if (!idempotencyKey || !KEY.test(idempotencyKey)) return r13Invalid();
  const input = await parseAuthenticationJson(request, z.object({
    timezone: z.enum(["UTC", "Asia/Kolkata", "America/New_York", "Europe/London"]),
    weekStartsOn: z.enum(["MONDAY", "SUNDAY"]),
    supportLabel: z.string().trim().min(1).max(80),
    expectedVersion: z.number().int().nonnegative(),
    reason: reason,
  }).strict());
  if (!input) return r13Invalid();
  const resolved = await authorize(request, "settings.manage", "organization-settings", "update", input.reason);
  if ("kind" in resolved && resolved.kind === "response") return resolved.response;
  if (!("context" in resolved)) return authorizationProblem(403, "AUTHZ_DENIED");
  try {
    return publicValue(await runR13(resolved.context, "update-settings", input, idempotencyKey));
  } catch {
    return authorizationProblem(503, "AUTHZ_UNAVAILABLE");
  }
}

export async function listIntegrations(request: Request) {
  const resolved = await authorize(request, "integration.manage", "integration-declaration", "list", "view");
  if ("kind" in resolved && resolved.kind === "response") return resolved.response;
  if (!("context" in resolved)) return authorizationProblem(403, "AUTHZ_DENIED");
  try {
    const result = await readR13(resolved.context, "integrations");
    if (result.kind === "error") return r13Error(result.code);
    return r13Json({ result: result.value.result ?? [] });
  } catch {
    return authorizationProblem(503, "AUTHZ_UNAVAILABLE");
  }
}

export async function declareIntegration(request: Request) {
  if (!requireSameOrigin(request)) return authorizationProblem(403, "AUTHZ_DENIED");
  const idempotencyKey = request.headers.get("idempotency-key")?.trim();
  if (!idempotencyKey || !KEY.test(idempotencyKey)) return r13Invalid();
  const input = await parseAuthenticationJson(request, z.object({ integrationType, reason }).strict());
  if (!input) return r13Invalid();
  const resolved = await authorize(request, "integration.manage", "integration-declaration", "declare", input.reason);
  if ("kind" in resolved && resolved.kind === "response") return resolved.response;
  if (!("context" in resolved)) return authorizationProblem(403, "AUTHZ_DENIED");
  try {
    return publicValue(await runR13(resolved.context, "declare", input, idempotencyKey));
  } catch {
    return authorizationProblem(503, "AUTHZ_UNAVAILABLE");
  }
}

export async function changeIntegration(request: Request, type: string, command: "disable" | "verify") {
  if (!requireSameOrigin(request) || !integrationType.safeParse(type).success) return r13Invalid();
  const idempotencyKey = request.headers.get("idempotency-key")?.trim();
  if (!idempotencyKey || !KEY.test(idempotencyKey)) return r13Invalid();
  const input = await parseAuthenticationJson(request, z.object({ reason }).strict());
  if (!input) return r13Invalid();
  const resolved = await authorize(request, "integration.manage", "integration-declaration", command, input.reason);
  if ("kind" in resolved && resolved.kind === "response") return resolved.response;
  if (!("context" in resolved)) return authorizationProblem(403, "AUTHZ_DENIED");
  try {
    return publicValue(await runR13(resolved.context, command, { ...input, integrationType: type }, idempotencyKey));
  } catch {
    return authorizationProblem(503, "AUTHZ_UNAVAILABLE");
  }
}
