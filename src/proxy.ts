import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getArticleDetailBySlug } from "@/data/mock/article-details";
import { getAuthorProfileBySlug } from "@/data/mock/author-profiles";
import { getMagazineCategoryBySlug } from "@/lib/magazine-categories";
import { getReadableMagazineSlugs } from "@/lib/magazine-reader";
import { getResolvedPersonalMagazineBySlug } from "@/lib/personal-magazines";
import { getSecurityBoundaryConfiguration } from "@/modules/foundation/config/security-boundary";
import {
  buildSignInLocation,
  classifyRouteAccess,
} from "@/modules/foundation/routing/access-policy";
import { SESSION_COOKIE_NAME } from "@/modules/authentication/http/session-cookie";
import { verifySessionToken } from "@/modules/authentication/service";
import {
  publishedAuthorExists,
  publishedPaths,
  publishedShelf,
} from "@/modules/r9/projection";

function routeSlug(pathname: string, prefix: string) {
  if (!pathname.startsWith(`${prefix}/`)) return null;
  const encoded = pathname.slice(prefix.length + 1);
  if (!encoded || encoded.includes("/")) return null;
  try {
    return decodeURIComponent(encoded);
  } catch {
    return "";
  }
}

async function publicResourceExists(pathname: string) {
  const articleSlug = routeSlug(pathname, "/article");
  if (articleSlug !== null) {
    if (!articleSlug) return false;
    if (getArticleDetailBySlug(articleSlug)) return true;
    return (await publishedPaths()).includes(`/article/${articleSlug}`);
  }

  const authorSlug = routeSlug(pathname, "/author");
  if (authorSlug !== null) {
    if (!authorSlug) return false;
    if (getAuthorProfileBySlug(authorSlug)) return true;
    return publishedAuthorExists(authorSlug);
  }

  const personalMagazineSlug = routeSlug(pathname, "/personal-magazines");
  if (personalMagazineSlug !== null) {
    if (!personalMagazineSlug) return false;
    if (personalMagazineSlug === "create" || personalMagazineSlug === "discover") return true;
    if (getResolvedPersonalMagazineBySlug(personalMagazineSlug)) return true;
    return Boolean(await publishedShelf(personalMagazineSlug));
  }

  const categorySlug = routeSlug(pathname, "/magazine/category");
  if (categorySlug !== null) {
    return Boolean(categorySlug && getMagazineCategoryBySlug(categorySlug));
  }

  return true;
}

function rewriteNotFound(request: NextRequest) {
  const destination = request.nextUrl.clone();
  destination.pathname = "/_not-found";
  destination.search = "";
  return NextResponse.rewrite(destination, { status: 404 });
}

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

  if (!(await publicResourceExists(request.nextUrl.pathname))) {
    return rewriteNotFound(request);
  }

  if (!request.nextUrl.pathname.startsWith("/magazine/read/")) {
    return NextResponse.next();
  }

  const slug = request.nextUrl.pathname.split("/").at(-1);

  if (!slug || !getReadableMagazineSlugs().includes(slug)) {
    return rewriteNotFound(request);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/app/:path*",
    "/client/:path*",
    "/magazine/read/:slug",
    "/article/:slug",
    "/author/:slug",
    "/personal-magazines/:slug",
    "/magazine/category/:slug",
  ],
};
