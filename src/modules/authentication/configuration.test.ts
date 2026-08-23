import { describe, expect, it } from "vitest";
import { getAuthenticationConfiguration } from "./configuration";

const validKey = Buffer.alloc(32, 7).toString("base64");

describe("R3 authentication configuration", () => {
  it("keeps missing configuration fail-closed", () => {
    expect(getAuthenticationConfiguration({})).toMatchObject({
      mode: "deny-all",
      valid: false,
    });
  });

  it("accepts explicit deny-all without secrets", () => {
    expect(
      getAuthenticationConfiguration({ PERSPECTIVE_AUTH_BOUNDARY_MODE: "deny-all" }),
    ).toEqual({ mode: "deny-all", valid: true, issues: [] });
  });

  it("accepts sessions only with every server prerequisite", () => {
    const result = getAuthenticationConfiguration({
      PERSPECTIVE_AUTH_BOUNDARY_MODE: "sessions",
      DATABASE_URL: "postgresql://user:pass@localhost:5432/perspective",
      PERSPECTIVE_PUBLIC_APP_ORIGIN: "https://workspace.example.com/path",
      PERSPECTIVE_AUTH_DATA_KEY: validKey,
      PERSPECTIVE_AUTH_KEY_VERSION: "1",
    });
    expect(result).toMatchObject({
      mode: "sessions",
      valid: true,
      publicOrigin: "https://workspace.example.com",
      keyVersion: 1,
    });
  });

  it.each([
    { DATABASE_URL: undefined },
    { PERSPECTIVE_PUBLIC_APP_ORIGIN: undefined },
    { PERSPECTIVE_AUTH_DATA_KEY: Buffer.alloc(16).toString("base64") },
    { PERSPECTIVE_AUTH_KEY_VERSION: "0" },
  ])("falls back to deny-all for invalid session configuration", (override) => {
    const result = getAuthenticationConfiguration({
      PERSPECTIVE_AUTH_BOUNDARY_MODE: "sessions",
      DATABASE_URL: "postgresql://user:pass@localhost:5432/perspective",
      PERSPECTIVE_PUBLIC_APP_ORIGIN: "https://workspace.example.com",
      PERSPECTIVE_AUTH_DATA_KEY: validKey,
      PERSPECTIVE_AUTH_KEY_VERSION: "1",
      ...override,
    });
    expect(result.mode).toBe("deny-all");
    expect(result.valid).toBe(false);
  });
});

