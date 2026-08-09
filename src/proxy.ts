import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getReadableMagazineSlugs } from "@/lib/magazine-reader";

export function proxy(request: NextRequest) {
  const slug = request.nextUrl.pathname.split("/").at(-1);

  if (!slug || !getReadableMagazineSlugs().includes(slug)) {
    return NextResponse.rewrite(new URL("/_not-found", request.url), { status: 404 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/magazine/read/:slug",
};
