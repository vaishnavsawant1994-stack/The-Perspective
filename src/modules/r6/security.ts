import "server-only";

import { createHmac, createHash, timingSafeEqual } from "node:crypto";

import type { RequestSession } from "@/modules/foundation/request-context";

export const R6_RECENT_AUTH_WINDOW_MS = 15 * 60 * 1000;
export const R6_CALLBACK_MAX_SKEW_MS = 5 * 60 * 1000;
export const R6_MAX_CALLBACK_BODY_BYTES = 256 * 1024;

function secureEqual(left: string, right: string) {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  return a.length === b.length && timingSafeEqual(a, b);
}

export function r6RecentAuthenticationSatisfied(
  session: RequestSession,
  now = new Date(),
) {
  return (
    session.issuedAt.getTime() <= now.getTime() &&
    now.getTime() - session.issuedAt.getTime() <= R6_RECENT_AUTH_WINDOW_MS &&
    session.expiresAt.getTime() > now.getTime()
  );
}

export function r6MfaSatisfied(session: RequestSession, now = new Date()) {
  return Boolean(
    session.mfaVerifiedAt &&
      session.mfaVerifiedAt.getTime() <= now.getTime() &&
      session.expiresAt.getTime() > now.getTime(),
  );
}

export function verifyR6WorkerRequest(
  request: Request,
  env: NodeJS.ProcessEnv = process.env,
) {
  const expected = env.PERSPECTIVE_R6_WORKER_TOKEN?.trim();
  if (!expected || expected.length < 32) return false;
  const authorization = request.headers.get("authorization") ?? "";
  if (!authorization.startsWith("Bearer ")) return false;
  const supplied = authorization.slice("Bearer ".length).trim();
  return supplied.length >= 32 && secureEqual(supplied, expected);
}

function callbackKeys(env: NodeJS.ProcessEnv) {
  try {
    const parsed = JSON.parse(env.PERSPECTIVE_R6_PROVIDER_CALLBACK_KEYS ?? "{}");
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
    return parsed as Record<string, unknown>;
  } catch {
    return {};
  }
}

export interface VerifiedR6ProviderCallback {
  readonly provider: string;
  readonly externalEventId: string;
  readonly timestamp: string;
  readonly payloadHash: string;
}

export function verifyR6ProviderCallback(input: {
  readonly provider: string;
  readonly externalEventId: string;
  readonly timestamp: string;
  readonly signature: string;
  readonly rawBody: string;
  readonly now?: Date;
  readonly env?: NodeJS.ProcessEnv;
}): VerifiedR6ProviderCallback | undefined {
  const provider = input.provider.trim().toLowerCase();
  if (!/^[a-z0-9][a-z0-9._-]{1,63}$/u.test(provider)) return undefined;
  if (!/^[A-Za-z0-9._:-]{1,200}$/u.test(input.externalEventId)) return undefined;

  const timestampSeconds = Number(input.timestamp);
  if (!Number.isInteger(timestampSeconds)) return undefined;
  const now = input.now ?? new Date();
  if (
    Math.abs(now.getTime() - timestampSeconds * 1000) >
    R6_CALLBACK_MAX_SKEW_MS
  ) {
    return undefined;
  }

  const configured = callbackKeys(input.env ?? process.env)[provider];
  if (typeof configured !== "string" || configured.length < 32) return undefined;

  const supplied = input.signature.startsWith("sha256=")
    ? input.signature.slice("sha256=".length)
    : input.signature;
  if (!/^[a-f0-9]{64}$/iu.test(supplied)) return undefined;

  const expected = createHmac("sha256", configured)
    .update(`${input.timestamp}.${input.externalEventId}.${input.rawBody}`)
    .digest("hex");
  if (!secureEqual(supplied.toLowerCase(), expected)) return undefined;

  return {
    provider,
    externalEventId: input.externalEventId,
    timestamp: input.timestamp,
    payloadHash: createHash("sha256").update(input.rawBody).digest("hex"),
  };
}

export async function readR6CallbackBody(request: Request) {
  const declared = Number(request.headers.get("content-length") ?? "0");
  if (Number.isFinite(declared) && declared > R6_MAX_CALLBACK_BODY_BYTES) {
    return undefined;
  }
  const rawBody = await request.text();
  if (Buffer.byteLength(rawBody, "utf8") > R6_MAX_CALLBACK_BODY_BYTES) {
    return undefined;
  }
  return rawBody;
}
