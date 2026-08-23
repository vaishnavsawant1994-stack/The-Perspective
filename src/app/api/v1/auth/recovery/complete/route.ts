import { NextResponse } from "next/server";
import { z } from "zod";
import {
  authenticationProblem,
  getAuthenticationRequestMetadata,
  parseAuthenticationJson,
  requireSameOrigin,
} from "@/modules/authentication/http/request-security";
import { completeRecovery } from "@/modules/authentication/service";

const schema = z.object({
  token: z.string().min(40).max(128),
  password: z.string().min(12).max(1024),
  confirmPassword: z.string().min(12).max(1024),
  surface: z.enum(["TEAM", "CLIENT"]),
}).refine((value) => value.password === value.confirmPassword);

export async function POST(request: Request) {
  if (!requireSameOrigin(request)) return authenticationProblem(403, "Request denied.", "AUTH_ORIGIN_DENIED");
  const input = await parseAuthenticationJson(request, schema);
  if (!input) return authenticationProblem(400, "Invalid request.", "AUTH_INVALID_REQUEST");
  try {
    const completed = await completeRecovery(
      { token: input.token, password: input.password, surface: input.surface },
      getAuthenticationRequestMetadata(request),
    );
    if (!completed) return authenticationProblem(400, "Unable to complete recovery.", "AUTH_RECOVERY_INVALID");
    return NextResponse.json({ status: "completed" }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return authenticationProblem(503, "Recovery is unavailable.", "AUTH_UNAVAILABLE");
  }
}

