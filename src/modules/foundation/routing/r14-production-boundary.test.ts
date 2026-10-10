import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { buildSignInLocation, classifyRouteAccess, sanitizeProtectedReturnPath } from "./access-policy";

describe("R14 production route boundary", () => {
  it.each(["/my", "/my/saved", "/my/newsletters", "/my/support"])("protects member route %s", (pathname) => {
    const access = classifyRouteAccess(pathname);
    expect(access).toEqual({ kind: "protected-team", signInPath: "/login" });
    if (access.kind !== "public") {
      expect(buildSignInLocation(access, pathname)).toBe(`/login?next=${encodeURIComponent(pathname)}`);
    }
  });

  it("accepts member paths as safe authenticated TEAM return locations", () => {
    expect(sanitizeProtectedReturnPath("/my/saved?from=home", "TEAM")).toBe("/my/saved?from=home");
  });

  it.each(["subscribe", "newsletters", "advertise", "my", "my/saved", "my/support"])("ships canonical page /%s", (route) => {
    expect(existsSync(join(process.cwd(), "src/app", route, "page.tsx"))).toBe(true);
  });
});
