import { describe, expect, it, vi } from "vitest";

import type {
  AuthorizedRequestContext,
  MembershipId,
  OrganizationId,
  PermissionKey,
  SessionId,
  UserId,
} from "@/modules/foundation/request-context";

import {
  recordCompletedAuthorizedActionEvidence,
  recordDeniedAuthorizationEvidence,
} from "./audit";
import type { CanonicalPermissionKey } from "./registry";
import type { AuthorizationDecision } from "./types";

function context(): AuthorizedRequestContext {
  return {
    authentication: "authenticated",
    scope: "authorized",
    requestId: "request-1",
    identity: { userId: "user-1" as UserId },
    session: {
      sessionId: "session-1" as SessionId,
      issuedAt: new Date("2026-09-27T00:00:00.000Z"),
      expiresAt: new Date("2026-09-28T00:00:00.000Z"),
      authenticationMethod: "password",
    },
    membership: {
      membershipId: "membership-1" as MembershipId,
      organizationId: "org-1" as OrganizationId,
      surface: "TEAM",
    },
    tenant: {
      membershipId: "membership-1" as MembershipId,
      organizationId: "org-1" as OrganizationId,
      surface: "TEAM",
    },
    authorization: {
      roleKeys: ["R01"],
      permissions: new Set<PermissionKey>(),
      blockedPermissions: new Set<PermissionKey>(),
      grantPaths: [],
    },
  };
}

function decision(
  permissionKey: CanonicalPermissionKey,
  kind: "ALLOW" | "DENY",
  obligations: AuthorizationDecision<CanonicalPermissionKey>["obligations"] = [],
): AuthorizationDecision<CanonicalPermissionKey> {
  return {
    decision: kind,
    reasonCode: kind === "ALLOW" ? "PERMISSION_DENIED" : "PERMISSION_DENIED",
    permissionKey,
    obligations,
    ...(kind === "ALLOW" ? { effectiveScope: "ORG" as const } : {}),
  };
}

describe("R5 authorization evidence", () => {
  it("returns structured telemetry without persisting ordinary low-risk denies", async () => {
    const create = vi.fn();
    const database = {
      auditEvent: { create },
    } as unknown as Parameters<typeof recordDeniedAuthorizationEvidence>[4]["database"];

    const telemetry = await recordDeniedAuthorizationEvidence(
      context(),
      decision("team.view", "DENY"),
      { resourceType: "team", ownerOrganizationId: "org-1" },
      { action: "view" },
      { database },
    );

    expect(telemetry).toMatchObject({
      decision: "DENY",
      permissionKey: "team.view",
      risk: "LOW",
      persisted: false,
    });
    expect(create).not.toHaveBeenCalled();
  });

  it("persists high-risk denial evidence without protected payloads", async () => {
    const create = vi.fn().mockResolvedValue({});
    const database = {
      auditEvent: { create },
    } as unknown as Parameters<typeof recordDeniedAuthorizationEvidence>[4]["database"];

    const telemetry = await recordDeniedAuthorizationEvidence(
      context(),
      decision("role.manage", "DENY"),
      {
        resourceId: "role-1",
        resourceType: "role",
        ownerOrganizationId: "org-1",
      },
      {
        action: "manage",
        reason: "x".repeat(600),
      },
      { database, occurredAt: new Date("2026-09-27T05:00:00.000Z") },
    );

    expect(telemetry.persisted).toBe(true);
    expect(create).toHaveBeenCalledOnce();

    const data = create.mock.calls[0][0].data;
    expect(data.ownerOrganizationId).toBe("org-1");
    expect(data.actorUserId).toBe("user-1");
    expect(data.actorMembershipId).toBe("membership-1");
    expect(data.action).toBe("authorization.denied.role.manage");
    expect(data.reason).toHaveLength(500);
    expect(data.targetResourceId).toBeUndefined();
    expect(data.redactedDiff).toEqual({
      authorization: {
        phase: "DENIED",
        permissionKey: "role.manage",
        requestedAction: "manage",
        decision: "DENY",
        reasonCode: "PERMISSION_DENIED",
        risk: "CRITICAL",
        surface: "TEAM",
        effectiveScope: null,
        resourceType: "role",
        resourceId: "role-1",
      },
    });
  });

  it("persists completed sensitive action evidence only after an ALLOW", async () => {
    const create = vi.fn().mockResolvedValue({});
    const database = {
      auditEvent: { create },
    } as unknown as Parameters<
      typeof recordCompletedAuthorizedActionEvidence
    >[4]["database"];

    const telemetry = await recordCompletedAuthorizedActionEvidence(
      context(),
      decision("role.manage", "ALLOW", ["audit"]),
      {
        resourceId: "role-resource",
        resourceType: "role",
        ownerOrganizationId: "org-1",
      },
      {
        action: "manage",
        reason: "approved change",
      },
      { database },
    );

    expect(telemetry).toMatchObject({
      decision: "ALLOW",
      risk: "CRITICAL",
      persisted: true,
      effectiveScope: "ORG",
    });
    expect(create.mock.calls[0][0].data.action).toBe(
      "authorization.completed.role.manage",
    );
  });

  it("rejects phase misuse instead of producing misleading evidence", async () => {
    await expect(
      recordDeniedAuthorizationEvidence(
        context(),
        decision("team.view", "ALLOW"),
        undefined,
        { action: "view" },
      ),
    ).rejects.toThrow("requires a DENY");

    await expect(
      recordCompletedAuthorizedActionEvidence(
        context(),
        decision("team.view", "DENY"),
        undefined,
        { action: "view" },
      ),
    ).rejects.toThrow("requires an ALLOW");
  });
});
