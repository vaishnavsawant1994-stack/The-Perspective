import { NextResponse } from "next/server";
import { z } from "zod";
import {
  authenticationProblem,
  getAuthenticationRequestMetadata,
  parseAuthenticationJson,
  requireSameOrigin,
} from "@/modules/authentication/http/request-security";
import {
  readSessionCookie,
  setSessionCookie,
} from "@/modules/authentication/http/session-cookie";
import { acceptInvitation, inspectInvitation } from "@/modules/authentication/service";

const schema = z.object({
  displayName: z.string().min(2).max(200),
  password: z.string().min(12).max(1024).optional(),
  confirmPassword: z.string().min(12).max(1024).optional(),
  termsAccepted: z.literal(true),
}).refine((value) => value.password === value.confirmPassword);

export async function GET(
  _request: Request,
  context: { params: Promise<{ token: string }> },
) {
  try {
    const { token } = await context.params;
    const invitation = await inspectInvitation(token);
    if (!invitation) return authenticationProblem(404, "Invitation is unavailable.", "AUTH_INVITATION_INVALID");
    return NextResponse.json(invitation, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return authenticationProblem(503, "Invitation service is unavailable.", "AUTH_UNAVAILABLE");
  }
}

export async function POST(
  request: Request,
  context: { params: Promise<{ token: string }> },
) {
  if (!requireSameOrigin(request)) return authenticationProblem(403, "Request denied.", "AUTH_ORIGIN_DENIED");
  const input = await parseAuthenticationJson(request, schema);
  if (!input) return authenticationProblem(400, "Invalid request.", "AUTH_INVALID_REQUEST");
  try {
    const { token } = await context.params;
    const result = await acceptInvitation(
      {
        token,
        displayName: input.displayName,
        password: input.password,
        termsAccepted: input.termsAccepted,
        existingSessionToken: readSessionCookie(request),
      },
      getAuthenticationRequestMetadata(request),
    );
    if (result.kind === "sign-in-required") {
      return authenticationProblem(409, "Sign in before accepting this invitation.", "AUTH_INVITATION_SIGN_IN_REQUIRED");
    }
    if (result.kind !== "accepted") {
      return authenticationProblem(400, "Invitation is unavailable.", "AUTH_INVITATION_INVALID");
    }
    const response = NextResponse.json(
      { status: "accepted", surface: result.session.surface },
      { headers: { "Cache-Control": "no-store" } },
    );
    setSessionCookie(response, result.token, result.session.expiresAt);
    return response;
  } catch {
    return authenticationProblem(409, "Invitation is unavailable.", "AUTH_INVITATION_CONFLICT");
  }
}

