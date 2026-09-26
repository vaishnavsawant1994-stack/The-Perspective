import { NextResponse } from "next/server";
import { readSessionCookie } from "@/modules/authentication/http/session-cookie";
import { verifyIdentitySessionToken } from "@/modules/authentication/service";

export async function GET(request: Request) {
  const token = readSessionCookie(request);
  try {
    const session =
      (await verifyIdentitySessionToken(token, "TEAM")) ??
      (await verifyIdentitySessionToken(token, "CLIENT"));
    if (!session) {
      return NextResponse.json(
        { authenticated: false },
        { status: 401, headers: { "Cache-Control": "no-store" } },
      );
    }
    return NextResponse.json(
      {
        authenticated: true,
        surface: session.surface,
        contextSelected: session.contextState === "selected",
        expiresAt: session.expiresAt,
        mfaVerified: Boolean(session.mfaVerifiedAt),
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

