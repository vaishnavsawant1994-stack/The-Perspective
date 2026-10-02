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
import { R10_ACTIVE_PERMISSION_KEYS, R10_DORMANT_PERMISSION_KEYS } from "./r10-policy";
import type { CanonicalPermissionKey } from "./registry";

function grant(permissionKey: CanonicalPermissionKey): EffectiveAuthorizationGrant {
  return {
    membershipRoleId: "membership-role-r10",
    roleId: "role-r10",
    roleKey: "R10",
    permissionKey: permissionKey as PermissionKey,
    effect: "ALLOW",
    scope: "ORG",
    constraints: {},
    validFrom: new Date("2026-10-01T00:00:00.000Z"),
    validUntil: null,
  };
}

function context(grants: readonly EffectiveAuthorizationGrant[]): AuthorizedRequestContext {
  const membershipId = "membership-r10" as MembershipId;
  const organizationId = "org-r10" as OrganizationId;
  return {
    authentication: "authenticated",
    scope: "authorized",
    requestId: "r10-policy",
    identity: { userId: "user-r10" as UserId },
    session: {
      sessionId: "session-r10" as SessionId,
      issuedAt: new Date("2026-10-01T12:00:00.000Z"),
      expiresAt: new Date("2026-10-01T13:00:00.000Z"),
      authenticationMethod: "password",
      mfaVerifiedAt: new Date("2026-10-01T12:00:00.000Z"),
    },
    membership: { membershipId, organizationId, surface: "TEAM" },
    tenant: { membershipId, organizationId, surface: "TEAM" },
    authorization: {
      roleKeys: ["R10"],
      permissions: new Set(grants.map((item) => item.permissionKey)),
      blockedPermissions: new Set(),
      grantPaths: grants,
    },
  };
}

const campaign = {
  resourceType: "distribution-campaign",
  ownerOrganizationId: "org-r10",
  visibility: "INTERNAL" as const,
  sensitivity: "STANDARD" as const,
};

describe("R10 authorization slice", () => {
  it("activates the frozen media and distribution keys and leaves R11 dormant", () => {
    expect(R10_ACTIVE_PERMISSION_KEYS).toHaveLength(22);
    expect(R10_DORMANT_PERMISSION_KEYS).toContain("analytics.distribution.view");
    expect(evaluateAuthorization(context([grant("analytics.distribution.view")]), "analytics.distribution.view", campaign, {
      action: "view",
      workflowSatisfied: true,
    }).decision).toBe("DENY");
  });

  it("requires MFA, recent authentication, and the launch action", () => {
    const allowed = evaluateAuthorization(context([grant("distribution.launch")]), "distribution.launch", campaign, {
      action: "launch",
      workflowSatisfied: true,
      exactVersionMatches: true,
      reason: "launch-campaign",
      recentAuthenticationSatisfied: true,
      mfaSatisfied: true,
    });
    expect(allowed.decision).toBe("ALLOW");
    expect(evaluateAuthorization(context([grant("distribution.launch")]), "distribution.launch", campaign, {
      action: "launch",
      workflowSatisfied: true,
      exactVersionMatches: true,
      reason: "launch-campaign",
      recentAuthenticationSatisfied: true,
      mfaSatisfied: false,
    }).decision).toBe("DENY");
    expect(evaluateAuthorization(context([grant("distribution.campaign.view")]), "distribution.launch", campaign, {
      action: "launch",
      workflowSatisfied: true,
      exactVersionMatches: true,
      reason: "launch-campaign",
      recentAuthenticationSatisfied: true,
      mfaSatisfied: true,
    }).decision).toBe("DENY");
  });

  it("lets an editor create a show and does not let that key launch", () => {
    expect(evaluateAuthorization(context([grant("podcast.episode.edit")]), "podcast.episode.edit", {
      resourceType: "podcast-show",
      ownerOrganizationId: "org-r10",
      visibility: "INTERNAL",
      sensitivity: "STANDARD",
    }, { action: "create", workflowSatisfied: true }).decision).toBe("ALLOW");
    expect(evaluateAuthorization(context([grant("podcast.episode.edit")]), "distribution.launch", campaign, {
      action: "launch",
      workflowSatisfied: true,
      exactVersionMatches: true,
      reason: "launch-campaign",
      recentAuthenticationSatisfied: true,
      mfaSatisfied: true,
    }).decision).toBe("DENY");
  });
});
