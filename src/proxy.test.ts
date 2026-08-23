import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";

import { proxy } from "./proxy";

function request(path: string, cookie?: string) {
  return new NextRequest(`https://perspective.example${path}`, {
    headers: cookie ? { cookie } : undefined,
  });
}

describe("R1 proxy security boundary", () => {
  it.each([
    ["/app", "/login?next=%2Fapp"],
    [
      "/app/sales/leads/an-arbitrary-id?tab=activity",
      "/login?next=%2Fapp%2Fsales%2Fleads%2Fan-arbitrary-id%3Ftab%3Dactivity",
    ],
    ["/client", "/client/login?next=%2Fclient"],
    [
      "/client/contracts/an-arbitrary-id",
      "/client/login?next=%2Fclient%2Fcontracts%2Fan-arbitrary-id",
    ],
  ])("redirects unauthenticated %s", async (path, expectedLocation) => {
    const response = await proxy(request(path));

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe(
      `https://perspective.example${expectedLocation}`,
    );
  });

  it("does not treat an unverified cookie as authentication", async () => {
    const response = await proxy(
      request("/app/settings", "session=spoofed; authenticated=true"),
    );

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toContain("/login?next=");
  });

  it.each([
    "/client/login",
    "/client/recover-access",
    "/client/activate/an-arbitrary-token",
  ])("allows public client auth fixture %s", async (path) => {
    const response = await proxy(request(path));

    expect(response.status).toBe(200);
    expect(response.headers.get("x-middleware-next")).toBe("1");
  });

  it("preserves public magazine reader validation", async () => {
    const response = await proxy(request("/magazine/read/not-a-readable-magazine"));

    expect(response.status).toBe(404);
    expect(response.headers.get("x-middleware-rewrite")).toBe(
      "https://perspective.example/_not-found",
    );
  });
});
