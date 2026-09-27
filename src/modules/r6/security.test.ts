import { createHmac } from "node:crypto";
import { describe, expect, it } from "vitest";

import type { RequestSession, SessionId } from "@/modules/foundation/request-context";

import {
  r6MfaSatisfied,
  r6RecentAuthenticationSatisfied,
  verifyR6ProviderCallback,
} from "./security";

function session(now: Date): RequestSession {
  return {
    sessionId: "session-r6" as SessionId,
    issuedAt: new Date(now.getTime() - 10 * 60 * 1000),
    expiresAt: new Date(now.getTime() + 60 * 60 * 1000),
    authenticationMethod: "password+mfa",
    mfaVerifiedAt: new Date(now.getTime() - 9 * 60 * 1000),
  };
}

describe("R6 execution security evidence", () => {
  it("requires a live recently-issued session and MFA evidence", () => {
    const now = new Date("2026-09-27T15:00:00.000Z");
    expect(r6RecentAuthenticationSatisfied(session(now), now)).toBe(true);
    expect(r6MfaSatisfied(session(now), now)).toBe(true);

    const stale = {
      ...session(now),
      issuedAt: new Date(now.getTime() - 16 * 60 * 1000),
    };
    expect(r6RecentAuthenticationSatisfied(stale, now)).toBe(false);
  });

  it("authenticates provider callbacks and rejects replay-window drift", () => {
    const now = new Date("2026-09-27T15:00:00.000Z");
    const timestamp = String(Math.floor(now.getTime() / 1000));
    const body = JSON.stringify({ campaignRecipientId: "recipient-1" });
    const secret = "provider-secret-that-is-at-least-thirty-two-bytes";
    const signature = createHmac("sha256", secret)
      .update(`${timestamp}.evt-1.${body}`)
      .digest("hex");

    expect(
      verifyR6ProviderCallback({
        provider: "mail-provider",
        externalEventId: "evt-1",
        timestamp,
        signature: `sha256=${signature}`,
        rawBody: body,
        now,
        env: { PERSPECTIVE_R6_PROVIDER_CALLBACK_KEYS: JSON.stringify({ "mail-provider": secret }) },
      }),
    ).toMatchObject({ provider: "mail-provider", externalEventId: "evt-1" });

    expect(
      verifyR6ProviderCallback({
        provider: "mail-provider",
        externalEventId: "evt-1",
        timestamp,
        signature: `sha256=${signature}`,
        rawBody: body,
        now: new Date(now.getTime() + 6 * 60 * 1000),
        env: { PERSPECTIVE_R6_PROVIDER_CALLBACK_KEYS: JSON.stringify({ "mail-provider": secret }) },
      }),
    ).toBeUndefined();
  });
});
