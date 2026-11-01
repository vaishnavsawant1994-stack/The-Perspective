import { describe, expect, it } from "vitest";
import {
  assertProductionDatabaseTarget,
  PRODUCTION_NEON_HOST,
} from "./production-database-target";

describe("first-owner production database target", () => {
  it("accepts only the pinned production Neon endpoint with full TLS verification", () => {
    expect(() =>
      assertProductionDatabaseTarget(
        `postgresql://operator:placeholder@${PRODUCTION_NEON_HOST}/neondb?sslmode=verify-full`,
      ),
    ).not.toThrow();
  });

  it.each([
    "postgresql://operator:placeholder@ep-other-project.c-8.eu-central-1.aws.neon.tech/neondb?sslmode=verify-full",
    `postgresql://operator:placeholder@${PRODUCTION_NEON_HOST}/neondb?sslmode=require`,
    `postgres://operator:placeholder@${PRODUCTION_NEON_HOST}/neondb?sslmode=verify-full`,
  ])("rejects a non-production or insufficiently verified target", (databaseUrl) => {
    expect(() => assertProductionDatabaseTarget(databaseUrl)).toThrow(
      /pinned production Neon endpoint/u,
    );
  });
});
