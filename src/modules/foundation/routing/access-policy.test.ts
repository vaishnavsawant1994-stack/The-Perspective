import { describe, expect, it } from "vitest";

import {
  buildSignInLocation,
  classifyRouteAccess,
  isPublicClientAuthPath,
  sanitizeProtectedReturnPath,
  sanitizeRelativeReturnPath,
} from "./access-policy";

describe("route access policy", () => {
  it.each([
    "/app",
    "/app/settings/roles",
    "/app/sales/leads/an-arbitrary-id",
  ])("protects team path %s", (pathname) => {
    expect(classifyRouteAccess(pathname)).toEqual({
      kind: "protected-team",
      signInPath: "/login",
    });
  });

  it.each([
    "/client",
    "/client/contracts/an-arbitrary-id",
    "/client/projects/an-arbitrary-id/timeline",
  ])("protects client path %s", (pathname) => {
    expect(classifyRouteAccess(pathname)).toEqual({
      kind: "protected-client",
      signInPath: "/client/login",
    });
  });

  it.each([
    "/client/login",
    "/client/login/",
    "/client/recover-access",
    "/client/activate/an-arbitrary-token",
  ])("allows frozen public client authentication path %s", (pathname) => {
    expect(isPublicClientAuthPath(pathname)).toBe(true);
    expect(classifyRouteAccess(pathname)).toEqual({ kind: "public" });
  });

  it.each([
    "/",
    "/magazine",
    "/magazine/read/the-perspective-may-2024",
    "/login",
  ])("does not capture unrelated public path %s", (pathname) => {
    expect(classifyRouteAccess(pathname)).toEqual({ kind: "public" });
  });

  it("rejects unsafe return locations", () => {
    expect(sanitizeRelativeReturnPath("https://attacker.example/steal")).toBeUndefined();
    expect(sanitizeRelativeReturnPath("//attacker.example/steal")).toBeUndefined();
    expect(sanitizeRelativeReturnPath("javascript:alert(1)")).toBeUndefined();
  });

  it("accepts only protected return paths for the requested surface", () => {
    expect(sanitizeProtectedReturnPath("/app/reports?range=30d", "TEAM")).toBe(
      "/app/reports?range=30d",
    );
    expect(
      sanitizeProtectedReturnPath("/client/contracts/ctr-1?tab=files", "CLIENT"),
    ).toBe("/client/contracts/ctr-1?tab=files");
    expect(sanitizeProtectedReturnPath("/client/contracts/ctr-1", "TEAM")).toBeUndefined();
    expect(sanitizeProtectedReturnPath("/app/reports", "CLIENT")).toBeUndefined();
    expect(sanitizeProtectedReturnPath("/client/login", "CLIENT")).toBeUndefined();
    expect(
      sanitizeProtectedReturnPath("/client/activate/example-token", "CLIENT"),
    ).toBeUndefined();
  });

  it("encodes a safe return path into the surface-specific sign-in URL", () => {
    const decision = classifyRouteAccess("/app/reports");
    expect(decision.kind).toBe("protected-team");

    if (decision.kind !== "protected-team") {
      throw new Error("Expected a protected team decision.");
    }

    expect(buildSignInLocation(decision, "/app/reports?range=30d")).toBe(
      "/login?next=%2Fapp%2Freports%3Frange%3D30d",
    );
  });
});
