import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";

import { proxy } from "@/proxy";
import {
  classifyRouteAccess,
  sanitizeProtectedReturnPath,
} from "./access-policy";

describe("R14 production member boundary", () => {
  it("protects canonical /my routes as team-member surfaces", () => {
    expect(classifyRouteAccess("/my")).toEqual({ kind: "protected-team", signInPath: "/login" });
    expect(classifyRouteAccess("/my/saved")).toEqual({ kind: "protected-team", signInPath: "/login" });
    expect(sanitizeProtectedReturnPath("/my/saved?from=header", "TEAM")).toBe("/my/saved?from=header");
  });

  it("redirects an anonymous member request to login with a safe return path", async () => {
    const response = await proxy(new NextRequest("https://perspective.example/my/saved?from=header"));

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe(
      "https://perspective.example/login?next=%2Fmy%2Fsaved%3Ffrom%3Dheader",
    );
  });
});
