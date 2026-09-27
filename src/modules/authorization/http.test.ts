import { describe, expect, it, vi } from "vitest";

import type {
  MembershipId,
  OrganizationId,
  SessionId,
  TenantScopedRequestContext,
  UserId,
} from "@/modules/foundation/request-context";

import {
  authorizationDecisionProblem,
  resolveAuthorizedHttpRequest,
} from "./http";
import type { AuthorizationDecision } from "./types";

function request() {
  return new Request("https://example.test/api/v1/workspace/roles", {
    headers: {
      cookie: "perspective-session=test-token",
      "x-request-id": "request-1",
    },
  });
}

function tenantContext(surface: "TEAM" | "CLIENT"): TenantScopedRequestContext {
  const organizationId = "org-1" as OrganizationId;
  const membershipId = "membership-1" as MembershipId;

  return {
    authentication: "authenticated",
    scope: "tenant",
    requestId: "request-1",
    identity: { userId: "user-1" as UserId },
    session: {
      sessionId: "session-1" as SessionId,
      issuedAt: new Date("2026-09-27T00:00:00.000Z"),
      expiresAt: new Date("2026-09-28T00:00:00.000Z"),
      authenticationMethod: "password",
    },
    membership: {
      membershipId,
      organizationId,
      surface,
    },
    tenant: {
      membershipId,
      organizationId,
      surface,
    },
  };
}

describe("R5 HTTP authorization guard", () => {
  it("returns 401 for anonymous requests", async () => {
    const result = await resolveAuthorizedHttpRequest(request(), "TEAM", {
      resolveAuthenticationContext: vi.fn().mockResolvedValue({
        authentication: "anonymous",
        requestId: "request-1",
      }),
    });

    expect(result.kind).toBe("response");
    if (result.kind !== "response") throw new Error("Expected response");
    expect(result.response.status).toBe(401);
    await expect(result.response.json()).resolves.toMatchObject({
      code: "AUTHZ_AUTH_REQUIRED",
    });
  });

  it("requires an explicitly selected tenant context", async () => {
    const result = await resolveAuthorizedHttpRequest(request(), "TEAM", {
      resolveAuthenticationContext: vi.fn().mockResolvedValue({
        authentication: "authenticated",
        scope: "identity-only",
        requestId: "request-1",
        identity: { userId: "user-1" },
        session: {
          sessionId: "session-1",
          issuedAt: new Date(),
          expiresAt: new Date(Date.now() + 60_000),
          authenticationMethod: "test",
        },
      }),
    });

    expect(result.kind).toBe("response");
    if (result.kind !== "response") throw new Error("Expected response");
    expect(result.response.status).toBe(403);
    await expect(result.response.json()).resolves.toMatchObject({
      code: "AUTHZ_TENANT_REQUIRED",
    });
  });

  it("rejects a surface mismatch before R5 authorization promotion", async () => {
    const promote = vi.fn();
    const result = await resolveAuthorizedHttpRequest(request(), "TEAM", {
      resolveAuthenticationContext: vi
        .fn()
        .mockResolvedValue(tenantContext("CLIENT")),
      resolveAuthorizedContext: promote,
    });

    expect(result.kind).toBe("response");
    expect(promote).not.toHaveBeenCalled();
    if (result.kind !== "response") throw new Error("Expected response");
    expect(result.response.status).toBe(403);
  });

  it("returns a generic deny when current membership authority no longer resolves", async () => {
    const result = await resolveAuthorizedHttpRequest(request(), "TEAM", {
      resolveAuthenticationContext: vi
        .fn()
        .mockResolvedValue(tenantContext("TEAM")),
      resolveAuthorizedContext: vi.fn().mockResolvedValue({
        kind: "denied",
        reasonCode: "MEMBERSHIP_INACTIVE",
        issues: [{ code: "MEMBERSHIP_NOT_ACTIVE" }],
      }),
    });

    expect(result.kind).toBe("response");
    if (result.kind !== "response") throw new Error("Expected response");
    expect(result.response.status).toBe(403);
    await expect(result.response.json()).resolves.toMatchObject({
      code: "AUTHZ_DENIED",
    });
  });

  it("collapses resource-level policy denials to 404 when concealment is requested", async () => {
    const decision: AuthorizationDecision<"team.view"> = {
      decision: "DENY",
      reasonCode: "SCOPE_DENIED",
      permissionKey: "team.view",
      obligations: [],
    };

    const response = authorizationDecisionProblem(decision, {
      concealResource: true,
    });

    expect(response?.status).toBe(404);
    await expect(response?.json()).resolves.toEqual({
      type: "about:blank",
      title: "Resource not available.",
      status: 404,
      code: "AUTHZ_NOT_FOUND",
    });
  });

  it("uses generic 403 for non-concealed authorization denial", async () => {
    const decision: AuthorizationDecision<"team.view"> = {
      decision: "DENY",
      reasonCode: "PERMISSION_MISSING",
      permissionKey: "team.view",
      obligations: [],
    };

    const response = authorizationDecisionProblem(decision);

    expect(response?.status).toBe(403);
    await expect(response?.json()).resolves.toMatchObject({
      code: "AUTHZ_DENIED",
    });
  });
});
