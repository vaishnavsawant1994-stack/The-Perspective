import "server-only";

import { NextResponse } from "next/server";
import { z } from "zod";

import { parseAuthenticationJson, requireSameOrigin } from "@/modules/authentication/http/request-security";
import { authorizationProblem, authorizeTrustedHttpOperation, resolveAuthorizedHttpRequest } from "@/modules/authorization/http";
import type { R8ActivePermissionKey, R8AuthorizationResourceType } from "@/modules/authorization/r8-policy";
import type { AuthorizedRequestContext } from "@/modules/foundation/request-context";

import { decideClientVersion, resolveClientVersion, runR8Command, type R8Result } from "./commands";

const KEY = /^[A-Za-z0-9._:-]{8,128}$/u;

export function r8Json(body: unknown, status = 200) {
  return NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } });
}

export function r8Invalid() {
  return NextResponse.json(
    { type: "about:blank", title: "Invalid R8 request.", status: 400, code: "R8_INVALID_REQUEST" },
    { status: 400, headers: { "Cache-Control": "no-store", "Content-Type": "application/problem+json" } },
  );
}

function r8Error(code: string) {
  const status = code === "NOT_FOUND" ? 404
    : code === "TEAM_REQUIRED" || code === "CLIENT_REQUIRED" ? 403
    : ["CONFLICT", "STALE_WRITE", "IDEMPOTENCY_CONFLICT", "INELIGIBLE"].includes(code) ? 409
    : 400;
  return NextResponse.json(
    { type: "about:blank", title: status === 404 ? "Resource not available." : "R8 command rejected.", status, code: "R8_COMMAND_REJECTED" },
    { status, headers: { "Cache-Control": "no-store", "Content-Type": "application/problem+json" } },
  );
}

function resultResponse(result: R8Result) {
  if (result.kind === "error") return r8Error(result.code);
  const value = Object.fromEntries(
    Object.entries(result.value).filter(([field]) => field !== "kind" && field !== "code"),
  );
  return r8Json({ result: value }, result.value.replayed ? 200 : 201);
}

export async function teamCommand(
  request: Request,
  permissionKey: R8ActivePermissionKey,
  resourceType: R8AuthorizationResourceType,
  action: string,
  command: string,
  schema: z.ZodType,
  requestedFields: readonly string[] = [],
  flags: {
    readonly workflowSatisfied?: boolean;
    readonly exactVersionMatches?: boolean;
    readonly separationOfDutySatisfied?: boolean;
  } = {},
) {
  if (!requireSameOrigin(request)) return authorizationProblem(403, "AUTHZ_DENIED");
  const idempotencyKey = request.headers.get("idempotency-key")?.trim();
  if (!idempotencyKey || !KEY.test(idempotencyKey)) return r8Invalid();
    const input = await parseAuthenticationJson(request, schema);
    if (!input || typeof input !== "object" || Array.isArray(input)) return r8Invalid();
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
    command: {
      action,
      requestedFields: [...requestedFields],
      workflowSatisfied: flags.workflowSatisfied,
      exactVersionMatches: flags.exactVersionMatches,
      separationOfDutySatisfied: flags.separationOfDutySatisfied,
    },
  });
  if (authorization.kind === "response") return authorization.response;
  try {
    return resultResponse(await runR8Command(resolved.context, command, input as Record<string, unknown>, idempotencyKey));
  } catch {
    return authorizationProblem(503, "AUTHZ_UNAVAILABLE");
  }
}

export async function clientDecision(request: Request, versionId: string) {
  if (!requireSameOrigin(request)) return authorizationProblem(403, "AUTHZ_DENIED");
  const idempotencyKey = request.headers.get("idempotency-key")?.trim();
  if (!idempotencyKey || !KEY.test(idempotencyKey)) return r8Invalid();
  const input = await parseAuthenticationJson(request, z.object({ decision: z.enum(["APPROVED", "REJECTED"]) }).strict());
  if (!input) return r8Invalid();
  const resolved = await resolveAuthorizedHttpRequest(request, "CLIENT");
  if (resolved.kind === "response") return resolved.response;
  const version = await resolveClientVersion(resolved.context, versionId);
  if (!version) return authorizationProblem(404, "AUTHZ_NOT_FOUND");
  const authorization = await authorizeTrustedHttpOperation({
    context: resolved.context,
    permissionKey: "approval.client.decide",
    resource: {
      resourceType: "draft-version",
      ownerOrganizationId: version.ownerOrganizationId,
      clientOrganizationId: resolved.context.tenant.organizationId,
      visibility: "CLIENT_SHARED",
      sensitivity: "STANDARD",
    },
    command: {
      action: "decide",
      requestedFields: [],
      workflowSatisfied: version.state === "CLIENT_REVIEW",
      exactVersionMatches: true,
      separationOfDutySatisfied: true,
      clientSafeProjection: true,
    },
  });
  if (authorization.kind === "response") return authorization.response;
  try {
    const result = await decideClientVersion(resolved.context, version, input.decision, idempotencyKey);
    if (result.kind === "error") return r8Error(result.code);
    return r8Json({
      approval: {
        projectId: version.projectId,
        title: version.title,
        versionId: version.versionId,
        version: version.version,
        decision: input.decision,
        replayed: result.value.replayed,
      },
    }, result.value.replayed ? 200 : 201);
  } catch {
    return authorizationProblem(503, "AUTHZ_UNAVAILABLE");
  }
}

export async function teamRead(
  request: Request,
  permissionKey: R8ActivePermissionKey,
  resourceType: R8AuthorizationResourceType,
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
    command: { action: "view", requestedFields: [] },
  });
  if (authorization.kind === "response") return authorization.response;
  try {
    const loaded = await load(resolved.context);
    if (loaded instanceof Response) return loaded;
    return r8Json({ result: loaded });
  } catch {
    return authorizationProblem(503, "AUTHZ_UNAVAILABLE");
  }
}
