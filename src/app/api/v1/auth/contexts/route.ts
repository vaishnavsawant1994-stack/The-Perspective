import { NextResponse } from "next/server";
import { readSessionCookie } from "@/modules/authentication/http/session-cookie";
import { listSessionContexts } from "@/modules/authentication/service";

export async function GET(request: Request) {
  try {
    const result = await listSessionContexts(readSessionCookie(request));
    if (!result) {
      return NextResponse.json(
        { authenticated: false },
        { status: 401, headers: { "Cache-Control": "no-store" } },
      );
    }

    return NextResponse.json(
      {
        authenticated: true,
        surface: result.session.surface,
        contextSelected: result.session.contextState === "selected",
        currentMembershipId: result.currentMembershipId,
        contexts: result.contexts,
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return NextResponse.json(
      { authenticated: false },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
}
