import { describe, expect, it } from "vitest";
import {
  assertProductionDatabaseTarget,
  productionBootstrapDatabaseUrl,
  PRODUCTION_NEON_HOST,
} from "./production-database-target";

describe("first-owner production database target", () => {
  it("accepts the pinned production Neon endpoint and its pooler with full TLS verification", () => {
    expect(() =>
      assertProductionDatabaseTarget(
        `postgresql://operator:placeholder@${PRODUCTION_NEON_HOST}/neondb?sslmode=verify-full`,
      ),
    ).not.toThrow();
    expect(() =>
      assertProductionDatabaseTarget(
        "postgresql://operator:placeholder@ep-cool-waterfall-bavwtqv2-pooler.c-8.eu-central-1.aws.neon.tech/neondb?sslmode=verify-full",
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

  it("forces full TLS verification for the pinned production direct and pooled URLs", () => {
    const pooler = "postgresql://operator:placeholder@ep-cool-waterfall-bavwtqv2-pooler.c-8.eu-central-1.aws.neon.tech/neondb";
    expect(new URL(productionBootstrapDatabaseUrl(pooler)).searchParams.get("sslmode")).toBe("verify-full");
    expect(new URL(productionBootstrapDatabaseUrl(
      `postgresql://operator:placeholder@${PRODUCTION_NEON_HOST}/neondb?sslmode=disable`,
    )).searchParams.get("sslmode")).toBe("verify-full");
    expect(() => productionBootstrapDatabaseUrl(
      "postgresql://operator:placeholder@ep-unrelated.c-8.eu-central-1.aws.neon.tech/neondb",
    )).toThrow(/pinned production Neon endpoint/u);
  });
});

