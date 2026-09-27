import { NextResponse } from "next/server";
import { z } from "zod";

import {
  parseAuthenticationJson,
  requireSameOrigin,
} from "@/modules/authentication/http/request-security";
import { assignMembershipAuthorizationRole } from "@/modules/authorization/admin";
import { authorizationAdminErrorResponse } from "@/modules/authorization/admin-http";
import {
  authorizationProblem,
  resolveAuthorizedHttpRequest,
} from "@/modules/authorization/http";

const assignMembershipRoleSchema = z.object({
  membershipId: z.string().uuid(),
  roleId: z.string().uuid(),
  scope: z.enum(["ORG", "DEPT", "ASN", "OWN", "READ", "NONE"]),
  validUntil: z.coerce.date().nullable().optional(),
  expectedMembershipUpdatedAt: z.coerce.date(),
  reason: z.string().trim().min(3).max(500),
}).strict();

export async function POST(request: Request) {
  if (!requireSameOrigin(request)) {
    return authorizationProblem(403, "AUTHZ_DENIED");
  }

  const input = await parseAuthenticationJson(
    request,
    assignMembershipRoleSchema,
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

  const result = await assignMembershipAuthorizationRole(
    resolved.context,
    input,
  );
  if (result.kind !== "ok") return authorizationAdminErrorResponse(result);

  return NextResponse.json(
    result.value,
    { status: 201, headers: { "Cache-Control": "no-store" } },
  );
}
