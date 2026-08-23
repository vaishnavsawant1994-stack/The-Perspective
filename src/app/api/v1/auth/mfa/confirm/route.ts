import { NextResponse } from "next/server";
import { z } from "zod";
import {
  authenticationProblem,
  getAuthenticationRequestMetadata,
  parseAuthenticationJson,
  requireSameOrigin,
} from "@/modules/authentication/http/request-security";
import { readSessionCookie } from "@/modules/authentication/http/session-cookie";
import { confirmTotpEnrollment } from "@/modules/authentication/service";

const schema = z.object({
  challengeToken: z.string().min(40).max(128),
  code: z.string().regex(/^\d{6}$/u),
});

export async function POST(request: Request) {
  if (!requireSameOrigin(request)) return authenticationProblem(403, "Request denied.", "AUTH_ORIGIN_DENIED");
  const input = await parseAuthenticationJson(request, schema);
  if (!input) return authenticationProblem(400, "Invalid request.", "AUTH_INVALID_REQUEST");
  try {
    const confirmed = await confirmTotpEnrollment(
      readSessionCookie(request) ?? "",
      input.challengeToken,
      input.code,
      getAuthenticationRequestMetadata(request),
    );
    if (!confirmed) return authenticationProblem(401, "Unable to verify code.", "AUTH_MFA_INVALID");
    return NextResponse.json({ status: "confirmed" }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return authenticationProblem(503, "Authentication is unavailable.", "AUTH_UNAVAILABLE");
  }
}

