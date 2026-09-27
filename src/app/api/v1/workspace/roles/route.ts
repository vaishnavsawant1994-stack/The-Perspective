import { NextResponse } from "next/server";
import { z } from "zod";

import {
  parseAuthenticationJson,
  requireSameOrigin,
} from "@/modules/authentication/http/request-security";
import {
  authorizationAdminErrorResponse,
} from "@/modules/authorization/admin-http";
import {
  createCustomAuthorizationRole,
  listAuthorizationRoles,
} from "@/modules/authorization/admin";
import {
  authorizeTrustedHttpOperation,
  authorizationProblem,
  resolveAuthorizedHttpRequest,
} from "@/modules/authorization/http";
import { getR5FieldPolicy } from "@/modules/authorization/fields";

const createRoleSchema = z.object({
  key: z.string().trim().regex(/^custom-[a-z0-9][a-z0-9-]{2,63}$/u),
  name: z.string().trim().min(2).max(120),
  description: z.string().trim().max(500).nullable().optional(),
  defaultScope: z.enum(["ORG", "DEPT", "ASN", "OWN", "READ", "NONE"]),
  reason: z.string().trim().min(3).max(500),
}).strict();

export async function GET(request: Request) {
  const resolved = await resolveAuthorizedHttpRequest(request, "TEAM");
  if (resolved.kind === "response") return resolved.response;

  const authorization = await authorizeTrustedHttpOperation({
    context: resolved.context,
    permissionKey: "team.view",
    resource: {
      resourceType: "role",
      ownerOrganizationId: resolved.context.tenant.organizationId,
    },
    command: {
      action: "list",
      workflowSatisfied: true,
      fieldPolicy: getR5FieldPolicy("TEAM", "role"),
      requestedFields: [
        "id",
        "key",
        "name",
        "description",
        "systemRole",
        "defaultScope",
        "status",
        "updatedAt",
      ],
    },
  });
  if (authorization.kind === "response") return authorization.response;

  const roles = await listAuthorizationRoles(resolved.context);
  return NextResponse.json(
    { roles },
    { headers: { "Cache-Control": "no-store" } },
  );
}

export async function POST(request: Request) {
  if (!requireSameOrigin(request)) {
    return authorizationProblem(403, "AUTHZ_DENIED");
  }

  const input = await parseAuthenticationJson(request, createRoleSchema);
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

  const result = await createCustomAuthorizationRole(resolved.context, input);
  if (result.kind !== "ok") return authorizationAdminErrorResponse(result);

  return NextResponse.json(
    { role: result.value },
    { status: 201, headers: { "Cache-Control": "no-store" } },
  );
}
