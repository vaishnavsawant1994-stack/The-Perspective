import { describe, expect, it } from "vitest";

import type { AuthorizedRequestContext, EffectiveAuthorizationGrant, MembershipId, OrganizationId, PermissionKey, SessionId, UserId } from "@/modules/foundation/request-context";

import { evaluateAuthorization } from "./policy";
import { R12_ACTIVE_PERMISSION_KEYS } from "./r12-policy";
import type { CanonicalPermissionKey } from "./registry";

function grant(permissionKey: CanonicalPermissionKey): EffectiveAuthorizationGrant {
  return {
    membershipRoleId: "membership-role-r12",
    roleId: "role-r12",
    roleKey: "R12",
    permissionKey: permissionKey as PermissionKey,
    effect: "ALLOW",
    scope: "CLIENT",
    constraints: {},
    validFrom: new Date("2026-10-03T00:00:00.000Z"),
    validUntil: null,
  };
}

function context(grants: readonly EffectiveAuthorizationGrant[]): AuthorizedRequestContext {
  const membershipId = "membership-r12" as MembershipId;
  const organizationId = "client-org-r12" as OrganizationId;
  return {
    authentication: "authenticated",
    scope: "authorized",
    requestId: "r12-policy",
    identity: { userId: "user-r12" as UserId },
    session: {
      sessionId: "session-r12" as SessionId,
      issuedAt: new Date("2026-10-03T12:00:00.000Z"),
      expiresAt: new Date("2026-10-03T13:00:00.000Z"),
      authenticationMethod: "password",
      mfaVerifiedAt: new Date("2026-10-03T12:00:00.000Z"),
    },
    membership: { membershipId, organizationId, surface: "CLIENT" },
    tenant: { membershipId, organizationId, surface: "CLIENT" },
    authorization: {
      roleKeys: ["R12"],
      permissions: new Set(grants.map((item) => item.permissionKey)),
      blockedPermissions: new Set(),
      grantPaths: grants,
    },
  };
}

const dashboard = {
  resourceType: "client-dashboard",
  ownerOrganizationId: "owner-r12",
  clientOrganizationId: "client-org-r12",
  visibility: "CLIENT_SHARED" as const,
  sensitivity: "STANDARD" as const,
};

describe("R12 authorization slice", () => {
  it("activates five client read keys and no new registry key", () => {
    expect(R12_ACTIVE_PERMISSION_KEYS).toEqual([
      "client.dashboard.view",
      "client.project.view",
      "client.approval.view",
      "client.billing.view",
      "client.contract.view",
    ]);
  });

  it("allows a client projection and denies a team surface", () => {
    expect(evaluateAuthorization(context([grant("client.dashboard.view")]), "client.dashboard.view", dashboard, {
      action: "view",
      clientSafeProjection: true,
    }).decision).toBe("ALLOW");
    const client = context([grant("client.dashboard.view")]);
    expect(evaluateAuthorization({
      ...client,
      membership: { ...client.membership, surface: "TEAM" },
      tenant: { ...client.tenant, surface: "TEAM" },
    }, "client.dashboard.view", dashboard, { action: "view", clientSafeProjection: true }).decision).toBe("DENY");
  });

  it("denies a projection that was not marked client-safe", () => {
    expect(evaluateAuthorization(context([grant("client.billing.view")]), "client.billing.view", {
      ...dashboard,
      resourceType: "client-invoice",
    }, { action: "list" })).toMatchObject({ decision: "DENY", reasonCode: "CLIENT_PROJECTION_DENIED" });
  });

  it("keeps payment, signing, and portal administration dormant", () => {
    for (const key of ["client.billing.pay", "client.contract.sign", "client.org.manage"] as const) {
      expect(evaluateAuthorization(context([grant(key)]), key, dashboard, {
        action: "pay",
        workflowSatisfied: true,
        clientSafeProjection: true,
        financialEvidencePresent: true,
        exactVersionMatches: true,
      }).decision).toBe("DENY");
    }
  });
});
