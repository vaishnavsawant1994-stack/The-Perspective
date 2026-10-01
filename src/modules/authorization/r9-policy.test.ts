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
import { isR9DormantPermissionKey, R9_ACTIVE_PERMISSION_KEYS, R9_DORMANT_PERMISSION_KEYS } from "./r9-policy";
import type { CanonicalPermissionKey } from "./registry";

function grant(permissionKey: CanonicalPermissionKey, scope: EffectiveAuthorizationGrant["scope"] = "ORG"): EffectiveAuthorizationGrant {
  return {
    membershipRoleId: "membership-role-r9",
    roleId: "role-r9",
    roleKey: "R09",
    permissionKey: permissionKey as PermissionKey,
    effect: "ALLOW",
    scope,
    constraints: {},
    validFrom: new Date("2026-10-01T00:00:00.000Z"),
    validUntil: null,
  };
}

function context(grants: readonly EffectiveAuthorizationGrant[]): AuthorizedRequestContext {
  const membershipId = "membership-r9" as MembershipId;
  const organizationId = "org-r9" as OrganizationId;
  return {
    authentication: "authenticated",
    scope: "authorized",
    requestId: "r9-policy",
    identity: { userId: "user-r9" as UserId },
    session: {
      sessionId: "session-r9" as SessionId,
      issuedAt: new Date("2026-10-01T12:00:00.000Z"),
      expiresAt: new Date("2026-10-01T12:10:00.000Z"),
      authenticationMethod: "password",
      mfaVerifiedAt: new Date("2026-10-01T12:00:00.000Z"),
    },
    membership: { membershipId, organizationId, surface: "TEAM" },
    tenant: { membershipId, organizationId, surface: "TEAM" },
    authorization: {
      roleKeys: ["R09"],
      permissions: new Set(grants.map((item) => item.permissionKey)),
      blockedPermissions: new Set(),
      grantPaths: grants,
    },
  };
}

const issue = {
  resourceType: "issue",
  ownerOrganizationId: "org-r9",
  visibility: "INTERNAL" as const,
  sensitivity: "STANDARD" as const,
};

describe("R9 authorization slice", () => {
  it("activates only the frozen publishing keys", () => {
    expect(R9_ACTIVE_PERMISSION_KEYS).toHaveLength(11);
    for (const key of R9_DORMANT_PERMISSION_KEYS) {
      expect(isR9DormantPermissionKey(key)).toBe(true);
      expect(R9_ACTIVE_PERMISSION_KEYS).not.toContain(key);
    }
  });

  it("does not let a desk reader publish, and keeps the second publish keys dormant", () => {
    const reader = evaluateAuthorization(context([grant("magazine.view")]), "publication.publish", issue, {
      action: "publish",
      workflowSatisfied: true,
      exactVersionMatches: true,
      separationOfDutySatisfied: true,
      reason: "publication.publish",
      recentAuthenticationSatisfied: true,
      mfaSatisfied: true,
    });
    expect(reader.decision).toBe("DENY");

    for (const key of ["magazine.reader.publish", "publish.execute"] as const) {
      expect(evaluateAuthorization(context([grant(key)]), key, issue, {
        action: "publish",
        workflowSatisfied: true,
        exactVersionMatches: true,
        separationOfDutySatisfied: true,
        reason: "no",
        recentAuthenticationSatisfied: true,
        mfaSatisfied: true,
      })).toMatchObject({ decision: "DENY", reasonCode: "WORKFLOW_DENIED" });
    }
  });

  it("allows publication only with the publish grant and its obligations", () => {
    const allowed = evaluateAuthorization(context([grant("publication.publish", "ORG")]), "publication.publish", issue, {
      action: "publish",
      workflowSatisfied: true,
      exactVersionMatches: true,
      separationOfDutySatisfied: true,
      reason: "publication.publish",
      recentAuthenticationSatisfied: true,
      mfaSatisfied: true,
    });
    expect(allowed.decision).toBe("ALLOW");

    const missingMfa = evaluateAuthorization(context([grant("publication.publish", "ORG")]), "publication.publish", issue, {
      action: "publish",
      workflowSatisfied: true,
      exactVersionMatches: true,
      reason: "publication.publish",
      recentAuthenticationSatisfied: true,
      mfaSatisfied: false,
    });
    expect(missingMfa).toMatchObject({ decision: "DENY", reasonCode: "OBLIGATION_REQUIRED" });
  });

  it("rejects a browser-owned ready flag as a field", () => {
    const forged = evaluateAuthorization(context([grant("magazine.proof.review")]), "magazine.proof.review", issue, {
      action: "ready",
      requestedFields: ["ready"],
      workflowSatisfied: true,
    });
    expect(forged).toMatchObject({ decision: "DENY", reasonCode: "FIELD_DENIED" });
  });
});
