import { NextResponse } from "next/server";
import { z } from "zod";
import { authenticatePassword } from "@/modules/authentication/service";
import {
  authenticationProblem,
  getAuthenticationRequestMetadata,
  parseAuthenticationJson,
  requireSameOrigin,
} from "@/modules/authentication/http/request-security";
import { setSessionCookie } from "@/modules/authentication/http/session-cookie";

const loginSchema = z.object({
  email: z.string().email().max(320),
  password: z.string().min(1).max(1024),
  surface: z.enum(["TEAM", "CLIENT"]),
  remember: z.boolean().optional(),
});

export async function POST(request: Request) {
  if (!requireSameOrigin(request)) {
    return authenticationProblem(403, "Request denied.", "AUTH_ORIGIN_DENIED");
  }
  const input = await parseAuthenticationJson(request, loginSchema);
  if (!input) return authenticationProblem(400, "Invalid request.", "AUTH_INVALID_REQUEST");

  try {
    const result = await authenticatePassword(
      input,
      getAuthenticationRequestMetadata(request),
    );
    if (result.kind === "throttled") {
      return authenticationProblem(429, "Unable to sign in.", "AUTH_RATE_LIMITED");
    }
    if (result.kind === "invalid") {
      return authenticationProblem(401, "Unable to sign in.", "AUTH_INVALID_CREDENTIALS");
    }
    if (result.kind === "mfa-required") {
      return NextResponse.json(
        {
          status: "mfa_required",
          challengeToken: result.challengeToken,
          expiresAt: result.expiresAt,
        },
        { status: 202, headers: { "Cache-Control": "no-store" } },
      );
    }

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

