import { NextResponse } from "next/server";
import { z } from "zod";

import {
  parseAuthenticationJson,
  requireSameOrigin,
} from "@/modules/authentication/http/request-security";
import { authorizationAdminErrorResponse } from "@/modules/authorization/admin-http";
import { updateCustomAuthorizationRole } from "@/modules/authorization/admin";
import {
  authorizationProblem,
  resolveAuthorizedHttpRequest,
} from "@/modules/authorization/http";

const updateRoleSchema = z.object({
  name: z.string().trim().min(2).max(120).optional(),
  description: z.string().trim().max(500).nullable().optional(),
  defaultScope: z.enum(["ORG", "DEPT", "ASN", "OWN", "READ", "NONE"]).optional(),
  status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
  expectedUpdatedAt: z.coerce.date(),
  reason: z.string().trim().min(3).max(500),
}).strict().refine(
  (value) =>
    value.name !== undefined ||
    value.description !== undefined ||
    value.defaultScope !== undefined ||
    value.status !== undefined,
  { message: "At least one mutable field is required." },
);

export async function PATCH(
  request: Request,
  context: { params: Promise<{ roleId: string }> },
) {
  if (!requireSameOrigin(request)) {
    return authorizationProblem(403, "AUTHZ_DENIED");
  }

  const input = await parseAuthenticationJson(request, updateRoleSchema);
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
  const result = await updateCustomAuthorizationRole(
    resolved.context,
    roleId,
    input,
  );
  if (result.kind !== "ok") return authorizationAdminErrorResponse(result);

  return NextResponse.json(
    { role: result.value },
    { headers: { "Cache-Control": "no-store" } },
  );
}
