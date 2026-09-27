import { NextResponse } from "next/server";

import type { AuthorizationAdminResult } from "./admin";
import { authorizationProblem } from "./http";

function problem(status: number, title: string, code: string) {
  return NextResponse.json(
    { type: "about:blank", title, status, code },
    {
      status,
      headers: {
        "Cache-Control": "no-store",
        "Content-Type": "application/problem+json",
      },
    },
  );
}

export function authorizationAdminErrorResponse(
  result: Exclude<AuthorizationAdminResult<unknown>, { readonly kind: "ok" }>,
) {
  if (result.kind === "denied") {
    return authorizationProblem(403, "AUTHZ_DENIED");
  }

  switch (result.code) {
    case "NOT_FOUND":
      return authorizationProblem(404, "AUTHZ_NOT_FOUND");
    case "CONFLICT":
    case "STALE_WRITE":
      return problem(409, "Authorization administration conflict.", "AUTHZ_ADMIN_CONFLICT");
    case "INVALID":
      return problem(400, "Invalid authorization administration request.", "AUTHZ_ADMIN_INVALID");
    case "SYSTEM_ROLE_IMMUTABLE":
    case "DELEGATION_CEILING":
      return authorizationProblem(403, "AUTHZ_DENIED");
  }
}
