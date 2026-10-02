import { describe, expect, it } from "vitest";

import type {
  AuthorizedRequestContext,
  EffectiveAuthorizationGrant,
  MembershipId,
  OrganizationId,
  PermissionKey,
  SessionId,
  UserId,
} from "@/modules/foundation/request-context";

import { evaluateAuthorization } from "./policy";
import { R11_ACTIVE_PERMISSION_KEYS } from "./r11-policy";
import type { CanonicalPermissionKey } from "./registry";

function grant(permissionKey: CanonicalPermissionKey): EffectiveAuthorizationGrant {
  return {
    membershipRoleId: "membership-role-r11",
    roleId: "role-r11",
    roleKey: "R11",
    permissionKey: permissionKey as PermissionKey,
    effect: "ALLOW",
    scope: "ORG",
    constraints: {},
    validFrom: new Date("2026-10-02T00:00:00.000Z"),
    validUntil: null,
  };
}

function context(grants: readonly EffectiveAuthorizationGrant[]): AuthorizedRequestContext {
  const membershipId = "membership-r11" as MembershipId;
  const organizationId = "org-r11" as OrganizationId;
  return {
    authentication: "authenticated",
    scope: "authorized",
    requestId: "r11-policy",
    identity: { userId: "user-r11" as UserId },
    session: {
      sessionId: "session-r11" as SessionId,
      issuedAt: new Date("2026-10-02T12:00:00.000Z"),
      expiresAt: new Date("2026-10-02T13:00:00.000Z"),
      authenticationMethod: "password",
      mfaVerifiedAt: new Date("2026-10-02T12:00:00.000Z"),
    },
    membership: { membershipId, organizationId, surface: "TEAM" },
    tenant: { membershipId, organizationId, surface: "TEAM" },
    authorization: {
      roleKeys: ["R11"],
      permissions: new Set(grants.map((item) => item.permissionKey)),
      blockedPermissions: new Set(),
      grantPaths: grants,
    },
  };
}

const report = {
  resourceType: "growth-report",
  ownerOrganizationId: "org-r11",
  visibility: "INTERNAL" as const,
  sensitivity: "STANDARD" as const,
};

describe("R11 authorization slice", () => {
  it("activates the seven frozen keys", () => {
    expect(R11_ACTIVE_PERMISSION_KEYS).toHaveLength(7);
  });

  it("allows a server-derived report and denies a client surface", () => {
    expect(evaluateAuthorization(context([grant("report.create")]), "report.create", report, {
      action: "create",
      workflowSatisfied: true,
    }).decision).toBe("ALLOW");
    const client = context([grant("report.create")]);
    const denied = evaluateAuthorization({
      ...client,
      membership: { ...client.membership, surface: "CLIENT" },
      tenant: { ...client.tenant, surface: "CLIENT" },
    }, "report.create", report, { action: "create" });
    expect(denied.decision).toBe("DENY");
  });

  it("requires separation of duties before approval", () => {
    expect(evaluateAuthorization(context([grant("report.approve")]), "report.approve", report, {
      action: "approve",
      workflowSatisfied: true,
      exactVersionMatches: true,
      separationOfDutySatisfied: false,
    }).decision).toBe("DENY");
    expect(evaluateAuthorization(context([grant("report.approve")]), "report.approve", report, {
      action: "approve",
      workflowSatisfied: true,
      exactVersionMatches: true,
      separationOfDutySatisfied: true,
    }).decision).toBe("ALLOW");
  });

  it("keeps publish.execute dormant", () => {
    expect(evaluateAuthorization(context([grant("publish.execute")]), "publish.execute", report, {
      action: "publish",
      workflowSatisfied: true,
    }).decision).toBe("DENY");
  });
});
