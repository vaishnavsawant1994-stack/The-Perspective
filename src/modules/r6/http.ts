import "server-only";

import { NextResponse } from "next/server";

import {
  authorizationProblem,
  resolveAuthorizedHttpRequest,
} from "@/modules/authorization/http";

export interface R6ListRequest {
  readonly limit: number;
}

export function parseR6ListRequest(request: Request): R6ListRequest | undefined {
  const url = new URL(request.url);
  const rawLimit = url.searchParams.get("limit");
  const limit = rawLimit === null ? 50 : Number(rawLimit);

  if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
    return undefined;
  }

  return { limit };
}

export async function resolveR6TeamRequest(request: Request) {
  return resolveAuthorizedHttpRequest(request, "TEAM");
}

export function invalidR6Request() {
  return NextResponse.json(
    {
      type: "about:blank",
      title: "Invalid R6 request.",
      status: 400,
      code: "R6_INVALID_REQUEST",
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

export function unavailableR6Request() {
  return authorizationProblem(503, "AUTHZ_UNAVAILABLE");
}

export function r6Json(body: unknown) {
  return NextResponse.json(body, {
    headers: {
      "Cache-Control": "no-store",
    },
  });
}
