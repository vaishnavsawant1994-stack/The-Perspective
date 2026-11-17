import { NextResponse } from "next/server";
import { readSessionCookie } from "@/modules/authentication/http/session-cookie";
import { verifyIdentitySessionToken } from "@/modules/authentication/service";
import { getPrismaClient } from "@/modules/persistence/client";

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
    let mfaEnrollmentRequired = false;
    let mfaReauthenticationRequired = false;
    if (
      session.surface === "TEAM" &&
      session.contextState === "selected"
    ) {
      const database = getPrismaClient();
      const privilegedGrant = await database.membershipRole.findFirst({
        where: {
          membershipId: session.membershipId,
          validUntil: null,
          role: { key: "R01", status: "ACTIVE" },
        },
        select: { id: true },
      });
      if (privilegedGrant && !session.mfaVerifiedAt) {
        const verifiedMethod = await database.mfaMethod.findFirst({
          where: {
            userAccountId: session.userAccountId,
            verifiedAt: { not: null },
            disabledAt: null,
          },
          select: { id: true },
        });
        mfaEnrollmentRequired = !verifiedMethod;
        mfaReauthenticationRequired = Boolean(verifiedMethod);
      }
    }
    return NextResponse.json(
      {
        authenticated: true,
        surface: session.surface,
        contextSelected: session.contextState === "selected",
        expiresAt: session.expiresAt,
        mfaVerified: Boolean(session.mfaVerifiedAt),
        mfaEnrollmentRequired,
        mfaReauthenticationRequired,
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

