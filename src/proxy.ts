import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getReadableMagazineSlugs } from "@/lib/magazine-reader";
import { getSecurityBoundaryConfiguration } from "@/modules/foundation/config/security-boundary";
import {
  buildSignInLocation,
  classifyRouteAccess,
} from "@/modules/foundation/routing/access-policy";
import { SESSION_COOKIE_NAME } from "@/modules/authentication/http/session-cookie";
import { verifySessionToken } from "@/modules/authentication/service";

export async function proxy(request: NextRequest) {
  const access = classifyRouteAccess(request.nextUrl.pathname);

  if (access.kind !== "public") {
    const boundary = getSecurityBoundaryConfiguration(process.env);

    let verified = false;

    if (boundary.mode === "sessions") {
      try {
        verified = Boolean(
          await verifySessionToken(
            request.cookies.get(SESSION_COOKIE_NAME)?.value,
            access.kind === "protected-team" ? "TEAM" : "CLIENT",
          ),
        );
      } catch {
        verified = false;
      }
    }

    if (!verified) {
      const returnPath = `${request.nextUrl.pathname}${request.nextUrl.search}`;
      const location = buildSignInLocation(access, returnPath);
      return NextResponse.redirect(new URL(location, request.url));
    }
  }

  if (!request.nextUrl.pathname.startsWith("/magazine/read/")) {
    return NextResponse.next();
  }

  const slug = request.nextUrl.pathname.split("/").at(-1);

  if (!slug || !getReadableMagazineSlugs().includes(slug)) {
    return NextResponse.rewrite(new URL("/_not-found", request.url), { status: 404 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/app/:path*", "/client/:path*", "/magazine/read/:slug"],
};
