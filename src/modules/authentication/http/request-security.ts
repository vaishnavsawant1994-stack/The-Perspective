import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import type { z } from "zod";
import { requireAuthenticationConfiguration } from "../configuration";
import type { AuthenticationRequestMetadata } from "../types";

const MAX_AUTH_BODY_BYTES = 16 * 1024;

export function authenticationProblem(
  status: number,
  title: string,
  code: string,
) {
  return NextResponse.json(
    { type: "about:blank", title, status, code },
    {
      status,
      headers: {
        "Cache-Control": "no-store",
        "Content-Type": "application/problem+json",
      },
    },
  );
}

export function requireSameOrigin(request: Request) {
  const configuration = requireAuthenticationConfiguration(process.env);
  const origin = request.headers.get("origin");
  if (!origin) return false;

  try {
    return new URL(origin).origin === configuration.publicOrigin;
  } catch {
    return false;
  }
}

export async function parseAuthenticationJson<T extends z.ZodType>(
  request: Request,
  schema: T,
): Promise<z.infer<T> | null> {
  if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) {
    return null;
  }
  const declaredLength = Number(request.headers.get("content-length") ?? "0");
  if (Number.isFinite(declaredLength) && declaredLength > MAX_AUTH_BODY_BYTES) {
    return null;
  }

  try {
    const text = await request.text();
    if (Buffer.byteLength(text, "utf8") > MAX_AUTH_BODY_BYTES) return null;
    const result = schema.safeParse(JSON.parse(text));
    return result.success ? result.data : null;
  } catch {
    return null;
  }
}

export function getAuthenticationRequestMetadata(
  request: Request,
): AuthenticationRequestMetadata {
  const requestId = request.headers.get("x-request-id");
  const correlationId =
    requestId && /^[a-zA-Z0-9._:-]{1,128}$/u.test(requestId)
      ? requestId
      : randomUUID();
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const realIp = request.headers.get("x-real-ip")?.trim();
  const userAgent = request.headers.get("user-agent") ?? "unknown";

  return {
    correlationId,
    ipAddress: forwarded || realIp || undefined,
    deviceId: userAgent.slice(0, 256),
  };
}

