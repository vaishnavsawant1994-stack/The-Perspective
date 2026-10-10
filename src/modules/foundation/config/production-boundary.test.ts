import { describe, expect, it } from "vitest";

import { assertProductionConfiguration, productionConfigurationErrors } from "./production-boundary";

const complete = {
  PERSPECTIVE_REQUIRE_PRODUCTION_CONFIG: "true",
  PERSPECTIVE_AUTH_BOUNDARY_MODE: "sessions",
  PERSPECTIVE_PUBLIC_APP_ORIGIN: "https://perspective.example.com",
  NEXT_PUBLIC_PERSPECTIVE_SITE_URL: "https://perspective.example.com",
  NEXT_PUBLIC_PERSPECTIVE_EDITORIAL_EMAIL: "editorial@perspective.example.com",
  PERSPECTIVE_AUTH_DATA_KEY: Buffer.alloc(32, 1).toString("base64"),
  PERSPECTIVE_AUTH_KEY_VERSION: "1",
  DATABASE_URL: "postgresql://runtime@db.internal:5432/perspective",
};

describe("production configuration", () => {
  it("does nothing unless production enforcement is requested", () => {
    expect(productionConfigurationErrors({})).toEqual([]);
  });

  it("accepts a complete https configuration", () => {
    expect(productionConfigurationErrors(complete)).toEqual([]);
  });

  it("rejects wildcard origins, http without an explicit allowance, and a short key", () => {
    expect(productionConfigurationErrors({
      ...complete,
      PERSPECTIVE_PUBLIC_APP_ORIGIN: "https://*.example.com",
      PERSPECTIVE_AUTH_DATA_KEY: "short",
    })).toEqual(expect.arrayContaining(["origin", "site url", "data key"]));
    expect(productionConfigurationErrors({
      ...complete,
      PERSPECTIVE_PUBLIC_APP_ORIGIN: "http://localhost:3100",
    })).toEqual(expect.arrayContaining(["https origin", "site url"]));
    expect(() => assertProductionConfiguration({
      ...complete,
      PERSPECTIVE_AUTH_BOUNDARY_MODE: "deny-all",
      DATABASE_URL: "",
    })).toThrow(/auth mode/);
  });

  it("rejects placeholder or mismatched public identity", () => {
    expect(productionConfigurationErrors({
      ...complete,
      NEXT_PUBLIC_PERSPECTIVE_SITE_URL: "https://theperspective.example",
      NEXT_PUBLIC_PERSPECTIVE_EDITORIAL_EMAIL: "editorial@theperspective.example",
    })).toEqual(expect.arrayContaining(["site url", "editorial email"]));

    expect(productionConfigurationErrors({
      ...complete,
      NEXT_PUBLIC_PERSPECTIVE_SITE_URL: "https://other.example.com",
    })).toEqual(expect.arrayContaining(["site url"]));
  });
});
