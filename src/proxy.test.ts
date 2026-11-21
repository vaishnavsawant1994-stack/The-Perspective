import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/modules/profile-network/read", () => ({
  publicCompanyExists: vi.fn(),
}));
vi.mock("@/modules/profile-network/person-read", () => ({
  publicPersonExists: vi.fn(),
}));

import { proxy } from "./proxy";
import { publicCompanyExists } from "@/modules/profile-network/read";
import { publicPersonExists } from "@/modules/profile-network/person-read";

function request(path: string, cookie?: string) {
  return new NextRequest(`https://perspective.example${path}`, {
    headers: cookie ? { cookie } : undefined,
  });
}

beforeEach(() => {
  vi.mocked(publicCompanyExists).mockReset();
  vi.mocked(publicPersonExists).mockReset();
  vi.mocked(publicCompanyExists).mockResolvedValue(false);
  vi.mocked(publicPersonExists).mockResolvedValue(false);
});

describe("R1 proxy security boundary", () => {
  it.each([
    ["/app", "/login?next=%2Fapp"],
    ["/security/mfa/setup", "/login"],
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

  it.each([
    ["/companies/unpublished-company", publicCompanyExists],
    ["/professionals/unpublished-person", publicPersonExists],
    ["/editors/unpublished-editor", publicPersonExists],
  ])("returns a real 404 before streaming for unpublished profiles at %s", async (path, exists) => {
    const response = await proxy(request(path));

    expect(response.status).toBe(404);
    expect(response.headers.get("x-middleware-rewrite")).toBe(
      `https://perspective.example/_not-found`,
    );
    expect(exists).toHaveBeenCalled();
  });
});
