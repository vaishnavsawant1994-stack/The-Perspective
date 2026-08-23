import { NextResponse } from "next/server";
import { readSessionCookie } from "@/modules/authentication/http/session-cookie";
import { verifySessionToken } from "@/modules/authentication/service";

export async function GET(request: Request) {
  const token = readSessionCookie(request);
  try {
    const session =
      (await verifySessionToken(token, "TEAM")) ??
      (await verifySessionToken(token, "CLIENT"));
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

