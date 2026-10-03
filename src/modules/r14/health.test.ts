import { describe, expect, it } from "vitest";

import { liveStatus, readyStatus } from "./health";

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
});
