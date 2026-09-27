import "server-only";

import { NextResponse } from "next/server";
import type { z } from "zod";

import {
  parseAuthenticationJson,
  requireSameOrigin,
} from "@/modules/authentication/http/request-security";
import {
  authorizationProblem,
  resolveAuthorizedHttpRequest,
} from "@/modules/authorization/http";

export async function resolveR6Mutation<T extends z.ZodType>(
  request: Request,
  schema: T,
): Promise<
  | { readonly kind: "ready"; readonly context: Extract<Awaited<ReturnType<typeof resolveAuthorizedHttpRequest>>, { kind: "authorized" }>["context"]; readonly input: z.infer<T> }
  | { readonly kind: "response"; readonly response: NextResponse }
> {
  if (!requireSameOrigin(request)) {
    return { kind: "response", response: authorizationProblem(403, "AUTHZ_DENIED") };
  }

  const input = await parseAuthenticationJson(request, schema);
  if (!input) {
    return {
      kind: "response",
      response: NextResponse.json(
        { type: "about:blank", title: "Invalid R6 request.", status: 400, code: "R6_API_INVALID" },
        { status: 400, headers: { "Cache-Control": "no-store", "Content-Type": "application/problem+json" } },
      ),
    };
  }

  const resolved = await resolveAuthorizedHttpRequest(request, "TEAM");
  if (resolved.kind === "response") return resolved;
  return { kind: "ready", context: resolved.context, input };
}

export function r6DomainResult<T>(
  result: { readonly kind: "ok"; readonly value: T } | { readonly kind: "error"; readonly code: string },
  status = 201,
) {
  if (result.kind === "ok") {
    return NextResponse.json(
      { data: result.value },
      { status, headers: { "Cache-Control": "no-store" } },
    );
  }

  const mapped =
    result.code === "NOT_FOUND" ? 404 :
    result.code === "CONFLICT" || result.code === "STALE_WRITE" || result.code === "IDEMPOTENCY_CONFLICT" ? 409 :
    result.code === "TEAM_REQUIRED" ? 403 :
    422;

  return NextResponse.json(
    { type: "about:blank", title: "R6 operation rejected.", status: mapped, code: "R6_OPERATION_REJECTED" },
    { status: mapped, headers: { "Cache-Control": "no-store", "Content-Type": "application/problem+json" } },
  );
}
