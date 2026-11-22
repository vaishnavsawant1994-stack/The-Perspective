import { describe, expect, it } from "vitest";

import { profileRequestRateKeyFromHeaders } from "./request-rate-key";

describe("profileRequestRateKey", () => {
  it("returns the same bucket for the same IP regardless of user-agent", () => {
    const secret = Buffer.alloc(32, 7);
    const fromOneUserAgent = profileRequestRateKeyFromHeaders(new Headers({
      "x-real-ip": "203.0.113.8",
      "user-agent": "Browser A",
    }), secret);
    const fromAnotherUserAgent = profileRequestRateKeyFromHeaders(new Headers({
      "x-real-ip": "203.0.113.8",
      "user-agent": "Rotated Browser B",
    }), secret);

    expect(fromOneUserAgent).toMatch(/^[0-9a-f]{64}$/u);
    expect(fromAnotherUserAgent).toBe(fromOneUserAgent);
  });

  it("uses the last proxy address in X-Forwarded-For when X-Real-IP is absent", () => {
    const secret = Buffer.alloc(32, 7);
    const fromForwarded = profileRequestRateKeyFromHeaders(new Headers({
      "x-forwarded-for": "198.51.100.9, 203.0.113.8",
    }), secret);
    const fromRealIp = profileRequestRateKeyFromHeaders(new Headers({
      "x-real-ip": "203.0.113.8",
    }), secret);

    expect(fromForwarded).toBe(fromRealIp);
  });

  it("rejects missing, malformed, or weakly-keyed addresses", () => {
    const secret = Buffer.alloc(32, 1);
    expect(profileRequestRateKeyFromHeaders(new Headers(), secret)).toBeNull();
    expect(profileRequestRateKeyFromHeaders(new Headers({ "x-real-ip": "unknown" }), secret)).toBeNull();
    expect(profileRequestRateKeyFromHeaders(new Headers({ "x-real-ip": "203.0.113.8" }), Buffer.alloc(31, 1))).toBeNull();
  });
});
