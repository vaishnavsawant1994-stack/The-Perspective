import "server-only";

import { NextResponse } from "next/server";

import {
  authorizationProblem,
  resolveAuthorizedHttpRequest,
} from "@/modules/authorization/http";

/**
 * Shared R7 HTTP boundary. Business routes remain thin adapters: resolve this
 * authenticated TEAM context, validate input, load canonical resources, call
 * authorizeTrustedHttpOperation, then invoke an existing domain command.
 */
export async function resolveR7TeamRequest(request: Request) {
  return resolveAuthorizedHttpRequest(request, "TEAM");
}

export async function resolveR7ClientRequest(request: Request) {
  return resolveAuthorizedHttpRequest(request, "CLIENT");
}

export interface R7ListRequest {
  readonly limit: number;
}

export function parseR7ListRequest(request: Request): R7ListRequest | undefined {
  const rawLimit = new URL(request.url).searchParams.get("limit");
  const limit = rawLimit === null ? 50 : Number(rawLimit);

  if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
    return undefined;
  }

  return { limit };
}

export function invalidR7Request() {
  return NextResponse.json(
    {
      type: "about:blank",
      title: "Invalid R7 request.",
      status: 400,
      code: "R7_INVALID_REQUEST",
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

export function r7CommandError(code: string) {
  const status =
    code === "NOT_FOUND" ? 404 :
    code === "PROVIDER_UNAVAILABLE" || code === "PROVIDER_AMBIGUOUS" ? 503 :
    [
      "CONFLICT",
      "STALE_WRITE",
      "IDEMPOTENCY_CONFLICT",
      "TRANSITION_DENIED",
      "PROPOSAL_IMMUTABLE",
      "INVOICE_CLOSED",
      "CORRELATION_DENIED",
      "INELIGIBLE",
      "PROVIDER_FAILED",
    ].includes(code) ? 409 :
    code === "TEAM_REQUIRED" || code === "CLIENT_REQUIRED" ? 403 : 400;

  return NextResponse.json(
    {
      type: "about:blank",
      title: status === 404 ? "Resource not available." : "R7 command rejected.",
      status,
      code: "R7_COMMAND_REJECTED",
    },
    {
      status,
      headers: {
        "Cache-Control": "no-store",
        "Content-Type": "application/problem+json",
      },
    },
  );
}

export function unavailableR7Request() {
  return authorizationProblem(503, "AUTHZ_UNAVAILABLE");
}

export function r7Json(body: unknown, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store",
    },
  });
}
