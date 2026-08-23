import { describe, expect, it } from "vitest";

import { getSecurityBoundaryConfiguration } from "./security-boundary";

describe("security environment boundary", () => {
  it("accepts the only R1-supported mode", () => {
    expect(
      getSecurityBoundaryConfiguration({
        PERSPECTIVE_AUTH_BOUNDARY_MODE: "deny-all",
      }),
    ).toEqual({ mode: "deny-all", valid: true, issues: [] });
  });

  it("recognizes the R3 session mode without treating it as full configuration proof", () => {
    expect(
      getSecurityBoundaryConfiguration({
        PERSPECTIVE_AUTH_BOUNDARY_MODE: "sessions",
      }),
    ).toEqual({ mode: "sessions", valid: true, issues: [] });
  });

  it.each([{}, { PERSPECTIVE_AUTH_BOUNDARY_MODE: "allow-all" }])(
    "fails closed for missing or invalid configuration",
    (environment) => {
      const configuration = getSecurityBoundaryConfiguration(environment);

      expect(configuration.mode).toBe("deny-all");
      expect(configuration.valid).toBe(false);
      expect(configuration.issues.length).toBeGreaterThan(0);
    },
  );
});
