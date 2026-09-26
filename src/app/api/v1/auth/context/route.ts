import { NextResponse } from "next/server";
import { z } from "zod";
import {
  authenticationProblem,
  getAuthenticationRequestMetadata,
  parseAuthenticationJson,
  requireSameOrigin,
} from "@/modules/authentication/http/request-security";
import { readSessionCookie } from "@/modules/authentication/http/session-cookie";
import { selectSessionContext } from "@/modules/authentication/service";

const schema = z.object({
  membershipId: z.string().uuid(),
});

export async function POST(request: Request) {
  if (!requireSameOrigin(request)) {
    return authenticationProblem(403, "Request denied.", "AUTH_ORIGIN_DENIED");
  }

  const input = await parseAuthenticationJson(request, schema);
  if (!input) {
    return authenticationProblem(400, "Invalid request.", "AUTH_INVALID_REQUEST");
  }

  try {
    const selected = await selectSessionContext(
      readSessionCookie(request),
      input.membershipId,
      getAuthenticationRequestMetadata(request),
    );
    if (!selected) {
      return authenticationProblem(
        403,
        "Unable to select organization context.",
        "AUTH_CONTEXT_DENIED",
      );
    }

    return NextResponse.json(
      { status: "context_selected", context: selected },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return authenticationProblem(
      503,
      "Context selection is unavailable.",
      "AUTH_UNAVAILABLE",
    );
  }
}
