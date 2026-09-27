import { NextResponse } from "next/server";
import { z } from "zod";

import {
  parseAuthenticationJson,
  requireSameOrigin,
} from "@/modules/authentication/http/request-security";
import { revokeMembershipAuthorizationRole } from "@/modules/authorization/admin";
import { authorizationAdminErrorResponse } from "@/modules/authorization/admin-http";
import {
  authorizationProblem,
  resolveAuthorizedHttpRequest,
} from "@/modules/authorization/http";

const revokeMembershipRoleSchema = z.object({
  expectedCreatedAt: z.coerce.date(),
  reason: z.string().trim().min(3).max(500),
}).strict();

export async function DELETE(
  request: Request,
  context: { params: Promise<{ membershipRoleId: string }> },
) {
  if (!requireSameOrigin(request)) {
    return authorizationProblem(403, "AUTHZ_DENIED");
  }

  const input = await parseAuthenticationJson(
    request,
    revokeMembershipRoleSchema,
  );
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

  const { membershipRoleId } = await context.params;
  const result = await revokeMembershipAuthorizationRole(
    resolved.context,
    {
      membershipRoleId,
      expectedCreatedAt: input.expectedCreatedAt,
      reason: input.reason,
    },
  );
  if (result.kind !== "ok") return authorizationAdminErrorResponse(result);

  return NextResponse.json(
    result.value,
    { headers: { "Cache-Control": "no-store" } },
  );
}
