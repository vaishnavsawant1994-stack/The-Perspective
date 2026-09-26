import { NextResponse } from "next/server";
import { z } from "zod";
import {
  authenticationProblem,
  getAuthenticationRequestMetadata,
  parseAuthenticationJson,
  requireSameOrigin,
} from "@/modules/authentication/http/request-security";
import { setSessionCookie } from "@/modules/authentication/http/session-cookie";
import { verifyMfaLogin } from "@/modules/authentication/service";

const schema = z.object({
  challengeToken: z.string().min(40).max(128),
  code: z.string().regex(/^\d{6}$/u),
});

export async function POST(request: Request) {
  if (!requireSameOrigin(request)) return authenticationProblem(403, "Request denied.", "AUTH_ORIGIN_DENIED");
  const input = await parseAuthenticationJson(request, schema);
  if (!input) return authenticationProblem(400, "Invalid request.", "AUTH_INVALID_REQUEST");
  try {
    const result = await verifyMfaLogin(
      input.challengeToken,
      input.code,
      getAuthenticationRequestMetadata(request),
    );
    if (result.kind === "context-selection-required") {
      const response = NextResponse.json(
        {
          status: "context_selection_required",
          surface: result.session.surface,
          contexts: result.contexts,
        },
        { status: 202, headers: { "Cache-Control": "no-store" } },
      );
      setSessionCookie(response, result.token, result.session.expiresAt);
      return response;
    }
    if (result.kind !== "authenticated") {
      return authenticationProblem(401, "Unable to verify code.", "AUTH_MFA_INVALID");
    }
    const response = NextResponse.json(
      { status: "authenticated", surface: result.session.surface },
      { headers: { "Cache-Control": "no-store" } },
    );
    setSessionCookie(response, result.token, result.session.expiresAt);
    return response;
  } catch {
    return authenticationProblem(503, "Authentication is unavailable.", "AUTH_UNAVAILABLE");
  }
}

