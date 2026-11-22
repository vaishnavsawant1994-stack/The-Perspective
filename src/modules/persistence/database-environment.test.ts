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

  it.each(["prefer", "require", "verify-ca"])(
    "pins the current full-verification behavior for the legacy %s TLS alias",
    (sslmode) => {
      const result = getDatabaseEnvironment({
        DATABASE_URL: `postgresql://user:pass@db.example.test/app?sslmode=${sslmode}&application_name=perspective`,
      });

      expect(result.valid).toBe(true);
      if (result.valid) {
        const normalized = new URL(result.databaseUrl);
        expect(normalized.searchParams.get("sslmode")).toBe("verify-full");
        expect(normalized.searchParams.get("application_name")).toBe("perspective");
      }
    },
  );

  it.each(["verify-full", "disable"])(
    "leaves the explicit %s TLS mode unchanged",
    (sslmode) => {
      const databaseUrl = `postgresql://user:pass@db.example.test/app?sslmode=${sslmode}`;
      expect(getDatabaseEnvironment({ DATABASE_URL: databaseUrl })).toEqual({
        valid: true,
        databaseUrl,
      });
    },
  );

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
