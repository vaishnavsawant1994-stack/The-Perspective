import { NextResponse } from "next/server";
import { z } from "zod";
import {
  authenticationProblem,
  getAuthenticationRequestMetadata,
  parseAuthenticationJson,
  requireSameOrigin,
} from "@/modules/authentication/http/request-security";
import { requestRecovery } from "@/modules/authentication/service";

const schema = z.object({
  email: z.string().email().max(320),
  surface: z.enum(["TEAM", "CLIENT"]),
});

export async function POST(request: Request) {
  if (!requireSameOrigin(request)) return authenticationProblem(403, "Request denied.", "AUTH_ORIGIN_DENIED");
  const input = await parseAuthenticationJson(request, schema);
  if (!input) return authenticationProblem(400, "Invalid request.", "AUTH_INVALID_REQUEST");
  try {
    await requestRecovery(input, getAuthenticationRequestMetadata(request));
    return NextResponse.json(
      { status: "accepted", message: "If the account is eligible, recovery instructions will be sent." },
      { status: 202, headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return authenticationProblem(503, "Recovery is unavailable.", "AUTH_UNAVAILABLE");
  }
}

