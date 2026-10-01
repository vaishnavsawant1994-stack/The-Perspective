import { describe, expect, it } from "vitest";

import {
  invalidR7Request,
  parseR7ListRequest,
  r7CommandError,
  r7Json,
} from "./http";

describe("R7 HTTP boundary helpers", () => {
  it("bounds list sizes and rejects malformed limits", () => {
    expect(parseR7ListRequest(new Request("https://example.test/api/v1/r7/proposals"))).toEqual({ limit: 50 });
    expect(parseR7ListRequest(new Request("https://example.test/api/v1/r7/proposals?limit=100"))).toEqual({ limit: 100 });
    for (const value of ["0", "-1", "101", "1.2", "NaN", ""]) {
      expect(parseR7ListRequest(new Request("https://example.test/api/v1/r7/proposals?limit=" + encodeURIComponent(value)))).toBeUndefined();
    }
  });

  it("returns non-cacheable problem responses for invalid input", async () => {
    const response = invalidR7Request();
    expect(response.status).toBe(400);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(response.headers.get("content-type")).toContain("application/problem+json");
    await expect(response.json()).resolves.toMatchObject({
      code: "R7_INVALID_REQUEST",
      status: 400,
    });
  });

  it("maps stale command failures to a redacted conflict response", async () => {
    const response = r7CommandError("STALE_WRITE");
    expect(response.status).toBe(409);
    expect(response.headers.get("cache-control")).toBe("no-store");
    const body = await response.json() as { code: string; status: number };
    expect(body).toEqual({ type: "about:blank", title: "R7 command rejected.", status: 409, code: "R7_COMMAND_REJECTED" });
  });

  it("marks successful API projections as non-cacheable", async () => {
    const response = r7Json({ ok: true }, 201);
    expect(response.status).toBe(201);
    expect(response.headers.get("cache-control")).toBe("no-store");
    await expect(response.json()).resolves.toEqual({ ok: true });
  });
});
