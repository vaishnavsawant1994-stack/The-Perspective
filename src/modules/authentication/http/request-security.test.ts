import { afterEach, describe, expect, it, vi } from "vitest";

import { requireSameOrigin } from "./request-security";

const validKey = Buffer.alloc(32, 7).toString("base64");

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("same-origin request guard", () => {
  it("fails closed without throwing when authentication configuration is missing", () => {
    vi.stubEnv("PERSPECTIVE_AUTH_BOUNDARY_MODE", "");

    expect(requireSameOrigin(new Request("https://app.example/api", {
      method: "POST",
      headers: { origin: "https://app.example" },
    }))).toBe(false);
  });

  it("rejects requests when the application is configured deny-all", () => {
    vi.stubEnv("PERSPECTIVE_AUTH_BOUNDARY_MODE", "deny-all");

    expect(requireSameOrigin(new Request("https://app.example/api", {
      method: "POST",
      headers: { origin: "https://app.example" },
    }))).toBe(false);
  });

  it("accepts only the configured origin when sessions are enabled", () => {
    vi.stubEnv("PERSPECTIVE_AUTH_BOUNDARY_MODE", "sessions");
    vi.stubEnv("DATABASE_URL", "postgresql://user:pass@localhost:5432/perspective");
    vi.stubEnv("PERSPECTIVE_PUBLIC_APP_ORIGIN", "https://app.example/path");
    vi.stubEnv("PERSPECTIVE_AUTH_DATA_KEY", validKey);
    vi.stubEnv("PERSPECTIVE_AUTH_KEY_VERSION", "1");

    const request = (origin: string) => new Request("https://app.example/api", {
      method: "POST",
      headers: { origin },
    });

    expect(requireSameOrigin(request("https://app.example"))).toBe(true);
    expect(requireSameOrigin(request("https://attacker.example"))).toBe(false);
    expect(requireSameOrigin(request("not a URL"))).toBe(false);
  });
});
