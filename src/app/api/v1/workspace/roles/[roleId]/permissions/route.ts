import { NextResponse } from "next/server";
import { z } from "zod";

import {
  parseAuthenticationJson,
  requireSameOrigin,
} from "@/modules/authentication/http/request-security";
import {
  readRolePermissions,
  replaceCustomRolePermissions,
} from "@/modules/authorization/admin";
import { authorizationAdminErrorResponse } from "@/modules/authorization/admin-http";
import { getR5FieldPolicy } from "@/modules/authorization/fields";
import {
  authorizeTrustedHttpOperation,
  authorizationProblem,
  resolveAuthorizedHttpRequest,
} from "@/modules/authorization/http";

const replacePermissionsSchema = z.object({
  expectedPermissionsHash: z.string().regex(/^[a-f0-9]{64}$/u),
  permissions: z.array(
    z.object({
      permissionKey: z.string().min(1).max(128),
      effect: z.enum(["ALLOW", "DENY"]),
      constraints: z.unknown().optional(),
    }).strict(),
  ).max(170),
  reason: z.string().trim().min(3).max(500),
}).strict();

export async function GET(
  request: Request,
  context: { params: Promise<{ roleId: string }> },
) {
  const resolved = await resolveAuthorizedHttpRequest(request, "TEAM");
  if (resolved.kind === "response") return resolved.response;

  const { roleId } = await context.params;
  const authorization = await authorizeTrustedHttpOperation({
    context: resolved.context,
    permissionKey: "team.view",
    resource: {
      resourceId: roleId,
      resourceType: "role-permission",
      ownerOrganizationId: resolved.context.tenant.organizationId,
    },
    command: {
      action: "view",
      workflowSatisfied: true,
      fieldPolicy: getR5FieldPolicy("TEAM", "role-permission"),
      requestedFields: [
        "roleId",
        "permissionsHash",
        "permissionKey",
        "effect",
        "constraints",
      ],
    },
    concealResource: true,
  });
  if (authorization.kind === "response") return authorization.response;

  const result = await readRolePermissions(resolved.context, roleId);
  if (result.kind !== "ok") return authorizationAdminErrorResponse(result);

  return NextResponse.json(
    result.value,
    { headers: { "Cache-Control": "no-store" } },
  );
}

export async function PUT(
  request: Request,
  context: { params: Promise<{ roleId: string }> },
) {
  if (!requireSameOrigin(request)) {
    return authorizationProblem(403, "AUTHZ_DENIED");
  }

  const input = await parseAuthenticationJson(request, replacePermissionsSchema);
  if (!input) {
    return NextResponse.json(
      {
        type: "about:blank",
        title: "Invalid authorization administration request.",
        status: 400,
        code: "AUTHZ_ADMIN_INVALID",
      },
      {
        status: 400,
        headers: {
          "Cache-Control": "no-store",
          "Content-Type": "application/problem+json",
        },
      },
    );
  }

  const resolved = await resolveAuthorizedHttpRequest(request, "TEAM");
  if (resolved.kind === "response") return resolved.response;

  const { roleId } = await context.params;
  const result = await replaceCustomRolePermissions(
    resolved.context,
    roleId,
    input,
  );
  if (result.kind !== "ok") return authorizationAdminErrorResponse(result);

  return NextResponse.json(
    result.value,
    { headers: { "Cache-Control": "no-store" } },
  );
}
