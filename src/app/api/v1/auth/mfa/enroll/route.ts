import { NextResponse } from "next/server";
import { z } from "zod";
import {
  authenticationProblem,
  getAuthenticationRequestMetadata,
  parseAuthenticationJson,
  requireSameOrigin,
} from "@/modules/authentication/http/request-security";
import { readSessionCookie } from "@/modules/authentication/http/session-cookie";
import { beginTotpEnrollment } from "@/modules/authentication/service";

const schema = z.object({ accountName: z.string().min(1).max(320) });

export async function POST(request: Request) {
  if (!requireSameOrigin(request)) return authenticationProblem(403, "Request denied.", "AUTH_ORIGIN_DENIED");
  const input = await parseAuthenticationJson(request, schema);
  if (!input) return authenticationProblem(400, "Invalid request.", "AUTH_INVALID_REQUEST");
  try {
    const result = await beginTotpEnrollment(
      readSessionCookie(request) ?? "",
      input.accountName,
      getAuthenticationRequestMetadata(request),
    );
    if (!result) return authenticationProblem(401, "Authentication required.", "AUTH_SESSION_INVALID");
    return NextResponse.json(result, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return authenticationProblem(503, "Authentication is unavailable.", "AUTH_UNAVAILABLE");
  }
}

