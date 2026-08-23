import { describe, expect, it } from "vitest";

import {
  assertDemoSeedEnvironment,
  getDatabaseEnvironment,
  requireDatabaseUrl,
} from "./database-environment";

describe("database environment boundary", () => {
  it("accepts PostgreSQL connection URLs", () => {
    expect(
      getDatabaseEnvironment({
        DATABASE_URL: "postgresql://user:pass@localhost:5432/perspective_r2",
      }),
    ).toEqual({
      valid: true,
      databaseUrl: "postgresql://user:pass@localhost:5432/perspective_r2",
    });
  });

  it.each([
    {},
    { DATABASE_URL: "" },
    { DATABASE_URL: "mysql://user:pass@localhost/database" },
    { DATABASE_URL: "not-a-url" },
  ])("rejects missing or non-PostgreSQL configuration", (environment) => {
    expect(getDatabaseEnvironment(environment).valid).toBe(false);
    expect(() => requireDatabaseUrl(environment)).toThrow(
      "Database configuration is unavailable",
    );
  });

  it("requires explicit demo-seed opt-in", () => {
    expect(() =>
      assertDemoSeedEnvironment({
        NODE_ENV: "test",
        DATABASE_URL: "postgresql://user:pass@localhost/perspective_r2",
      }),
    ).toThrow("PERSPECTIVE_ALLOW_DEMO_SEED=true");
  });

  it("refuses the demo seed in production even with opt-in", () => {
    expect(() =>
      assertDemoSeedEnvironment({
        NODE_ENV: "production",
        PERSPECTIVE_ALLOW_DEMO_SEED: "true",
        DATABASE_URL: "postgresql://user:pass@localhost/perspective_r2",
      }),
    ).toThrow("forbidden in production");
  });
});
