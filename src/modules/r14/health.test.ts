import { describe, expect, it } from "vitest";

import { liveStatus, readinessFailureCategory, readyStatus } from "./health";

describe("health", () => {
  it("reports liveness without a database", () => {
    expect(liveStatus()).toEqual({ status: "live" });
  });

  it("hides readiness failures", async () => {
    await expect(readyStatus(async () => undefined)).resolves.toEqual({ httpStatus: 200, body: { status: "ready" } });
    await expect(readyStatus(async () => { throw new Error("password=secret"); })).resolves.toEqual({
      httpStatus: 503,
      body: { status: "not-ready" },
    });
  });

  it("categorizes failure codes without exposing error messages", () => {
    expect(readinessFailureCategory({ code: "DATABASE_URL_UNSET" })).toBe("missing-database-url");
    expect(readinessFailureCategory({ code: "ENOTFOUND", message: "secret" })).toBe("dns");
    expect(readinessFailureCategory({ code: "ETIMEDOUT", message: "secret" })).toBe("network");
    expect(readinessFailureCategory({ code: "28P01", message: "password=secret" })).toBe("authentication");
    expect(readinessFailureCategory({ code: "3D000" })).toBe("database-not-found");
    expect(readinessFailureCategory({ code: "SELF_SIGNED_CERT_IN_CHAIN" })).toBe("tls");
    expect(readinessFailureCategory({ code: "untrusted secret" })).toBe("other");
    expect(readinessFailureCategory(new Error("password=secret"))).toBe("other");
  });

  it("preserves public readiness behavior if diagnostics throw", async () => {
    await expect(
      readyStatus(
        async () => { throw Object.assign(new Error("password=secret"), { code: "28P01" }); },
        () => { throw new Error("diagnostics unavailable"); },
      ),
    ).resolves.toEqual({ httpStatus: 503, body: { status: "not-ready" } });
  });
});
