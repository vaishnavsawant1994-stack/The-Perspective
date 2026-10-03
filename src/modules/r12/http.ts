import "server-only";

import { NextResponse } from "next/server";
import { z } from "zod";

import { parseAuthenticationJson, requireSameOrigin, getAuthenticationRequestMetadata } from "@/modules/authentication/http/request-security";
import { readSessionCookie } from "@/modules/authentication/http/session-cookie";
import { verifyIdentitySessionToken } from "@/modules/authentication/service";
import { authorizationProblem, authorizeTrustedHttpOperation, resolveAuthorizedHttpRequest } from "@/modules/authorization/http";
import type { R12ActivePermissionKey, R12AuthorizationResourceType } from "@/modules/authorization/r12-policy";

import { readR12Client, readR12Member, runR12Client, runR12Member, runR12Team, runR12Worker, type R12Result } from "./commands";

const KEY = /^[A-Za-z0-9._:-]{8,128}$/u;
const uuid = z.string().uuid();

export function r12Json(body: unknown, status = 200) {
  return NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } });
}

export function r12Invalid() {
  return NextResponse.json(
    { type: "about:blank", title: "Invalid R12 request.", status: 400, code: "R12_INVALID_REQUEST" },
    { status: 400, headers: { "Cache-Control": "no-store", "Content-Type": "application/problem+json" } },
  );
}

function r12Error(code: string) {
  const status = code === "NOT_FOUND" ? 404
    : ["TEAM_REQUIRED", "CLIENT_REQUIRED", "MEMBER_REQUIRED"].includes(code) ? 403
    : ["CONFLICT", "STALE_WRITE", "IDEMPOTENCY_CONFLICT", "INELIGIBLE"].includes(code) ? 409
    : 400;
  return NextResponse.json(
    { type: "about:blank", title: status === 404 ? "Resource not available." : "R12 command rejected.", status, code: "R12_COMMAND_REJECTED" },
    { status, headers: { "Cache-Control": "no-store", "Content-Type": "application/problem+json" } },
  );
}

function resultResponse(result: R12Result, token?: string) {
  if (result.kind === "error") return r12Error(result.code);
  const value = Object.fromEntries(Object.entries(result.value).filter(([field]) => field !== "kind" && field !== "code"));
  return r12Json({ result: token ? { ...value, token } : value }, result.value.replayed ? 200 : 201);
}

async function memberUser(request: Request) {
  const token = readSessionCookie(request);
  const verified = (await verifyIdentitySessionToken(token, "TEAM")) ?? (await verifyIdentitySessionToken(token, "CLIENT"));
  if (!verified) return undefined;
  return verified.userAccountId;
}

export async function teamInvite(request: Request) {
  if (!requireSameOrigin(request)) return authorizationProblem(403, "AUTHZ_DENIED");
  const idempotencyKey = request.headers.get("idempotency-key")?.trim();
  if (!idempotencyKey || !KEY.test(idempotencyKey)) return r12Invalid();
  const input = await parseAuthenticationJson(request, z.object({ clientAccountId: uuid, email: z.string().email().max(200) }).strict());
  if (!input) return r12Invalid();
  const resolved = await resolveAuthorizedHttpRequest(request, "TEAM");
  if (resolved.kind === "response") return resolved.response;
  const authorization = await authorizeTrustedHttpOperation({
    context: resolved.context,
    permissionKey: "client.portal.provision",
    resource: { resourceType: "portal-access", ownerOrganizationId: resolved.context.tenant.organizationId, visibility: "INTERNAL", sensitivity: "STANDARD" },
    command: { action: "invite", requestedFields: [], workflowSatisfied: true },
  });
  if (authorization.kind === "response") return authorization.response;
  try {
    const result = await runR12Team(resolved.context, "invite", input, idempotencyKey);
    return resultResponse(result, "token" in result ? result.token : undefined);
  } catch {
    return authorizationProblem(503, "AUTHZ_UNAVAILABLE");
  }
}

export async function teamRevoke(request: Request, grantId: string) {
  if (!requireSameOrigin(request) || !z.string().uuid().safeParse(grantId).success) return authorizationProblem(403, "AUTHZ_DENIED");
  const idempotencyKey = request.headers.get("idempotency-key")?.trim();
  if (!idempotencyKey || !KEY.test(idempotencyKey)) return r12Invalid();
  const resolved = await resolveAuthorizedHttpRequest(request, "TEAM");
  if (resolved.kind === "response") return resolved.response;
  const authorization = await authorizeTrustedHttpOperation({
    context: resolved.context,
    permissionKey: "client.portal.manage",
    resource: { resourceType: "portal-access", ownerOrganizationId: resolved.context.tenant.organizationId, visibility: "INTERNAL", sensitivity: "STANDARD" },
    command: { action: "revoke-access", requestedFields: [], workflowSatisfied: true },
  });
  if (authorization.kind === "response") return authorization.response;
  try {
    return resultResponse(await runR12Team(resolved.context, "revoke", { grantId }, idempotencyKey));
  } catch {
    return authorizationProblem(503, "AUTHZ_UNAVAILABLE");
  }
}

export async function clientAccept(request: Request) {
  if (!requireSameOrigin(request)) return authorizationProblem(403, "AUTHZ_DENIED");
  const idempotencyKey = request.headers.get("idempotency-key")?.trim();
  if (!idempotencyKey || !KEY.test(idempotencyKey)) return r12Invalid();
  const input = await parseAuthenticationJson(request, z.object({ token: z.string().min(32).max(200) }).strict());
  if (!input) return r12Invalid();
  const resolved = await resolveAuthorizedHttpRequest(request, "CLIENT");
  if (resolved.kind === "response") return resolved.response;
  try {
    return resultResponse(await runR12Client(resolved.context, "accept", input, idempotencyKey));
  } catch {
    return authorizationProblem(503, "AUTHZ_UNAVAILABLE");
  }
}

export async function clientRead(
  request: Request,
  permissionKey: R12ActivePermissionKey,
  resourceType: R12AuthorizationResourceType,
  action: string,
  command: string,
  payload: Record<string, unknown> = {},
) {
  const resolved = await resolveAuthorizedHttpRequest(request, "CLIENT");
  if (resolved.kind === "response") return resolved.response;
  const authorization = await authorizeTrustedHttpOperation({
    context: resolved.context,
    permissionKey,
    resource: {
      resourceType,
      ownerOrganizationId: resolved.context.tenant.organizationId,
      clientOrganizationId: resolved.context.tenant.organizationId,
      visibility: "CLIENT_SHARED",
      sensitivity: "STANDARD",
    },
    command: { action, requestedFields: [], workflowSatisfied: true, clientSafeProjection: true },
    concealResource: true,
  });
  if (authorization.kind === "response") return authorization.response;
  try {
    const result = await readR12Client(resolved.context, command, payload);
    if (result.kind === "error") return r12Error(result.code);
    return r12Json({ result: result.value.result ?? result.value });
  } catch {
    return authorizationProblem(503, "AUTHZ_UNAVAILABLE");
  }
}

export async function clientDecide(request: Request, versionId: string) {
  if (!requireSameOrigin(request) || !z.string().uuid().safeParse(versionId).success) return r12Invalid();
  const idempotencyKey = request.headers.get("idempotency-key")?.trim();
  if (!idempotencyKey || !KEY.test(idempotencyKey)) return r12Invalid();
  const input = await parseAuthenticationJson(request, z.object({
    decision: z.enum(["APPROVED", "REJECTED"]),
    expectedVersion: z.number().int().positive(),
  }).strict());
  if (!input) return r12Invalid();
  const resolved = await resolveAuthorizedHttpRequest(request, "CLIENT");
  if (resolved.kind === "response") return resolved.response;
  const authorization = await authorizeTrustedHttpOperation({
    context: resolved.context,
    permissionKey: "approval.client.decide",
    resource: {
      resourceType: "draft-version",
      ownerOrganizationId: resolved.context.tenant.organizationId,
      clientOrganizationId: resolved.context.tenant.organizationId,
      visibility: "CLIENT_SHARED",
      sensitivity: "STANDARD",
    },
    command: {
      action: "decide",
      requestedFields: [],
      workflowSatisfied: true,
      exactVersionMatches: true,
      separationOfDutySatisfied: true,
      clientSafeProjection: true,
    },
    concealResource: true,
  });
  if (authorization.kind === "response") return authorization.response;
  try {
    return resultResponse(await runR12Client(resolved.context, "decide", { ...input, versionId }, idempotencyKey));
  } catch {
    return authorizationProblem(503, "AUTHZ_UNAVAILABLE");
  }
}

export async function memberRead(request: Request, command: string, payload: Record<string, unknown> = {}) {
  const userId = await memberUser(request);
  if (!userId) return authorizationProblem(401, "AUTHZ_AUTH_REQUIRED");
  try {
    const result = await readR12Member(userId, command, payload);
    if (result.kind === "error") return r12Error(result.code);
    return r12Json({ result: result.value.result ?? result.value });
  } catch {
    return authorizationProblem(503, "AUTHZ_UNAVAILABLE");
  }
}

export async function memberRename(request: Request) {
  if (!requireSameOrigin(request)) return authorizationProblem(403, "AUTHZ_DENIED");
  const userId = await memberUser(request);
  if (!userId) return authorizationProblem(401, "AUTHZ_AUTH_REQUIRED");
  const input = await parseAuthenticationJson(request, z.object({ displayName: z.string().trim().min(1).max(80) }).strict());
  if (!input) return r12Invalid();
  try {
    return resultResponse(await runR12Member(userId, "rename", input, `rename-${userId.slice(0, 8)}-${input.displayName.length}`, getAuthenticationRequestMetadata(request).correlationId));
  } catch {
    return authorizationProblem(503, "AUTHZ_UNAVAILABLE");
  }
}

export async function memberCheckout(request: Request) {
  if (!requireSameOrigin(request)) return authorizationProblem(403, "AUTHZ_DENIED");
  const idempotencyKey = request.headers.get("idempotency-key")?.trim();
  if (!idempotencyKey || !KEY.test(idempotencyKey)) return r12Invalid();
  const userId = await memberUser(request);
  if (!userId) return authorizationProblem(401, "AUTHZ_AUTH_REQUIRED");
  const input = await parseAuthenticationJson(request, z.object({ offerId: uuid }).strict());
  if (!input) return r12Invalid();
  try {
    return resultResponse(await runR12Member(userId, "checkout", input, idempotencyKey, getAuthenticationRequestMetadata(request).correlationId));
  } catch {
    return authorizationProblem(503, "AUTHZ_UNAVAILABLE");
  }
}

export async function memberCancel(request: Request, entitlementId: string) {
  if (!requireSameOrigin(request) || !z.string().uuid().safeParse(entitlementId).success) return r12Invalid();
  const idempotencyKey = request.headers.get("idempotency-key")?.trim();
  if (!idempotencyKey || !KEY.test(idempotencyKey)) return r12Invalid();
  const userId = await memberUser(request);
  if (!userId) return authorizationProblem(401, "AUTHZ_AUTH_REQUIRED");
  try {
    return resultResponse(await runR12Member(userId, "cancel", { entitlementId }, idempotencyKey, getAuthenticationRequestMetadata(request).correlationId));
  } catch {
    return authorizationProblem(503, "AUTHZ_UNAVAILABLE");
  }
}

function workerAllowed(request: Request) {
  const expected = process.env.PERSPECTIVE_R12_WORKER_TOKEN?.trim();
  const supplied = (request.headers.get("authorization") ?? "").replace(/^Bearer\s+/u, "").trim();
  return Boolean(expected && expected.length >= 32 && supplied === expected);
}

export async function workerCommand(request: Request, command: "open-offer" | "grant" | "revoke") {
  if (!workerAllowed(request)) return authorizationProblem(403, "AUTHZ_DENIED");
  const schemas = {
    "open-offer": z.object({
      organizationId: uuid,
      code: z.string().min(2).max(40),
      currency: z.string().regex(/^[A-Z]{3}$/u),
      amountMinor: z.number().int().nonnegative(),
      interval: z.enum(["MONTH", "YEAR"]),
      entitlementKey: z.string().min(2).max(80),
    }).strict(),
    grant: z.object({ organizationId: uuid, userId: uuid, issueId: uuid }).strict(),
    revoke: z.object({ organizationId: uuid, entitlementId: uuid }).strict(),
  };
  const idempotencyKey = request.headers.get("idempotency-key")?.trim();
  if (!idempotencyKey || !KEY.test(idempotencyKey)) return r12Invalid();
  const input = await parseAuthenticationJson(request, schemas[command]);
  if (!input) return r12Invalid();
  try {
    return resultResponse(await runR12Worker(command, input, idempotencyKey));
  } catch {
    return authorizationProblem(503, "AUTHZ_UNAVAILABLE");
  }
}
