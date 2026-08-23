import { NextResponse } from "next/server";
import {
  authenticationProblem,
  getAuthenticationRequestMetadata,
  requireSameOrigin,
} from "@/modules/authentication/http/request-security";
import {
  clearSessionCookie,
  readSessionCookie,
} from "@/modules/authentication/http/session-cookie";
import { revokeSession } from "@/modules/authentication/service";

export async function POST(request: Request) {
  if (!requireSameOrigin(request)) {
    return authenticationProblem(403, "Request denied.", "AUTH_ORIGIN_DENIED");
  }
  try {
    await revokeSession(
      readSessionCookie(request),
      getAuthenticationRequestMetadata(request),
    );
  } catch {
    // Cookie expiry is still safe when storage is unavailable; protected
    // requests continue to fail closed because database verification fails.
  }
  const response = NextResponse.json(
    { status: "signed_out" },
    { headers: { "Cache-Control": "no-store" } },
  );
  clearSessionCookie(response);
  return response;
}

