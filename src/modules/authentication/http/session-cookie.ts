import type { NextRequest, NextResponse } from "next/server";

export const SESSION_COOKIE_NAME =
  process.env.NODE_ENV === "production"
    ? "__Host-perspective-session"
    : "perspective-session";

export function readSessionCookie(request: NextRequest | Request) {
  if ("cookies" in request) {
    return request.cookies.get(SESSION_COOKIE_NAME)?.value;
  }

  const cookie = request.headers.get("cookie") ?? "";
  const prefix = `${SESSION_COOKIE_NAME}=`;
  return cookie
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(prefix))
    ?.slice(prefix.length);
}

export function setSessionCookie(
  response: NextResponse,
  token: string,
  expiresAt: Date,
) {
  response.cookies.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    priority: "high",
    expires: expiresAt,
  });
}

export function clearSessionCookie(response: NextResponse) {
  response.cookies.set(SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    priority: "high",
    expires: new Date(0),
    maxAge: 0,
  });
}

