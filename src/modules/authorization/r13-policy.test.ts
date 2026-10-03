import { describe, expect, it } from "vitest";

import type { AuthorizedRequestContext, EffectiveAuthorizationGrant, MembershipId, OrganizationId, PermissionKey, SessionId, UserId } from "@/modules/foundation/request-context";

import { evaluateAuthorization } from "./policy";
import { R13_ACTIVE_PERMISSION_KEYS } from "./r13-policy";
import type { CanonicalPermissionKey } from "./registry";

function grant(permissionKey: CanonicalPermissionKey): EffectiveAuthorizationGrant {
  return {
    membershipRoleId: "membership-role-r13",
    roleId: "role-r13",
    roleKey: "R01",
    permissionKey: permissionKey as PermissionKey,
    effect: "ALLOW",
    scope: "ORG",
    constraints: {},
    validFrom: new Date("2026-10-03T00:00:00.000Z"),
    validUntil: null,
  };
}

function context(grants: readonly EffectiveAuthorizationGrant[], surface: "TEAM" | "CLIENT" = "TEAM"): AuthorizedRequestContext {
  const membershipId = "membership-r13" as MembershipId;
  const organizationId = "org-r13" as OrganizationId;
  return {
    authentication: "authenticated",
    scope: "authorized",
    requestId: "r13-policy",
    identity: { userId: "user-r13" as UserId },
    session: {
      sessionId: "session-r13" as SessionId,
      issuedAt: new Date("2026-10-03T12:00:00.000Z"),
      expiresAt: new Date("2026-10-03T13:00:00.000Z"),
      authenticationMethod: "password",
      mfaVerifiedAt: new Date("2026-10-03T12:00:00.000Z"),
    },
    membership: { membershipId, organizationId, surface },
    tenant: { membershipId, organizationId, surface },
    authorization: {
      roleKeys: ["R01"],
      permissions: new Set(grants.map((item) => item.permissionKey)),
      blockedPermissions: new Set(),
      grantPaths: grants,
    },
  };
}

const settings = {
  resourceType: "organization-settings",
  ownerOrganizationId: "org-r13",
  visibility: "INTERNAL" as const,
  sensitivity: "STANDARD" as const,
};

const command = {
  action: "update",
  reason: "Change the support label",
  recentAuthenticationSatisfied: true,
  mfaSatisfied: true,
};

describe("R13 authorization slice", () => {
  it("activates the two stamped keys and no new registry key", () => {
    expect(R13_ACTIVE_PERMISSION_KEYS).toEqual(["settings.manage", "integration.manage"]);
  });

  it("allows a team settings update and denies a client surface", () => {
    expect(evaluateAuthorization(context([grant("settings.manage")]), "settings.manage", settings, command).decision).toBe("ALLOW");
    expect(evaluateAuthorization(context([grant("settings.manage")], "CLIENT"), "settings.manage", settings, command).decision).toBe("DENY");
  });

  it("requires MFA and rejects a verified field on an integration", () => {
    expect(evaluateAuthorization(context([grant("settings.manage")]), "settings.manage", settings, {
      ...command,
      mfaSatisfied: false,
    })).toMatchObject({ decision: "DENY", reasonCode: "OBLIGATION_REQUIRED" });
    expect(evaluateAuthorization(context([grant("integration.manage")]), "integration.manage", {
      ...settings,
      resourceType: "integration-declaration",
    }, {
      action: "verify",
      reason: "Check the provider",
      recentAuthenticationSatisfied: true,
      mfaSatisfied: true,
      requestedFields: ["verified"],
    })).toMatchObject({ decision: "DENY", reasonCode: "FIELD_DENIED" });
  });
});
