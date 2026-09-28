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
import {
  isR7ActivePermissionKey,
  isR7DormantPermissionKey,
  R7_ACTIVE_PERMISSION_KEYS,
  R7_DORMANT_PERMISSION_KEYS,
} from "./r7-policy";
import type { CanonicalPermissionKey } from "./registry";
import type { AuthorizationResourceContext } from "./types";

function grant(
  permissionKey: CanonicalPermissionKey,
): EffectiveAuthorizationGrant {
  return {
    membershipRoleId: "membership-role-r7",
    roleId: "role-r7",
    roleKey: "R07",
    permissionKey: permissionKey as PermissionKey,
    effect: "ALLOW",
    scope: "ORG",
    constraints: {},
    validFrom: new Date("2026-09-28T00:00:00.000Z"),
    validUntil: null,
  };
}

function context(
  grants: readonly EffectiveAuthorizationGrant[],
  organizationId = "org-r7",
): AuthorizedRequestContext {
  const membershipId = "membership-r7" as MembershipId;
  const org = organizationId as OrganizationId;
  return {
    authentication: "authenticated",
    scope: "authorized",
    requestId: "r7-policy-test",
    identity: { userId: "user-r7" as UserId },
    session: {
      sessionId: "session-r7" as SessionId,
      issuedAt: new Date("2026-09-28T10:00:00.000Z"),
      expiresAt: new Date("2026-09-28T11:00:00.000Z"),
      authenticationMethod: "password",
    },
    membership: {
      membershipId,
      organizationId: org,
      surface: "TEAM",
    },
    tenant: {
      membershipId,
      organizationId: org,
      surface: "TEAM",
    },
    authorization: {
      roleKeys: ["R07"],
      permissions: new Set(
        grants.map((candidate) => candidate.permissionKey),
      ),
      blockedPermissions: new Set(),
      grantPaths: grants,
      actorDepartmentId: "dept-r7",
    },
  };
}

function proposalResource(
  ownerOrganizationId = "org-r7",
): AuthorizationResourceContext {
  return {
    resourceType: "proposal",
    resourceId: "proposal-1",
    ownerOrganizationId,
    sensitivity: "FINANCIAL",
    visibility: "INTERNAL",
  };
}

describe("R7 authorization slice", () => {
  it("activates only the frozen finance keys and keeps contracts dormant", () => {
    expect(R7_ACTIVE_PERMISSION_KEYS).toContain("proposal.view");
    expect(R7_ACTIVE_PERMISSION_KEYS).toContain("invoice.issue");
    expect(R7_ACTIVE_PERMISSION_KEYS).toContain("payment.reconcile");
    expect(isR7ActivePermissionKey("deal.view")).toBe(false);
    expect(isR7DormantPermissionKey("contract.view")).toBe(true);
    expect(R7_DORMANT_PERMISSION_KEYS).toContain("payment.refund");
  });

  it("does not treat physical finance tables as authority", () => {
    const decision = evaluateAuthorization(
      context([]),
      "proposal.view",
      proposalResource(),
      {
        action: "view",
        requestedFields: ["id", "status"],
        fieldPolicy: {
          readableFields: ["id", "status"],
          mutableFields: [],
        },
      },
    );
    expect(decision.decision).toBe("DENY");
  });

  it("rejects R6-only deal authority against a proposal resource", () => {
    const decision = evaluateAuthorization(
      context([grant("deal.view")]),
      "proposal.view",
      proposalResource(),
      {
        action: "view",
        requestedFields: ["id"],
        fieldPolicy: {
          readableFields: ["id"],
          mutableFields: [],
        },
      },
    );
    expect(decision.decision).toBe("DENY");
  });

  it("rejects cross-tenant proposal access even with the R7 view grant", () => {
    const decision = evaluateAuthorization(
      context([grant("proposal.view")]),
      "proposal.view",
      proposalResource("org-foreign"),
      {
        action: "view",
        requestedFields: ["id", "status"],
        fieldPolicy: {
          readableFields: ["id", "status", "currency", "dealId"],
          mutableFields: [],
          serverOwnedFields: ["totalMinor", "ownerOrganizationId"],
        },
      },
    );
    expect(decision.decision).toBe("DENY");
    expect(decision.reasonCode).not.toBeUndefined();
  });

  it("keeps contract permissions workflow-denied in this slice", () => {
    const decision = evaluateAuthorization(
      context([grant("contract.view")]),
      "contract.view",
      {
        resourceType: "contract",
        resourceId: "contract-1",
        ownerOrganizationId: "org-r7",
        sensitivity: "FINANCIAL",
        visibility: "INTERNAL",
      },
      {
        action: "view",
        requestedFields: ["id"],
        fieldPolicy: {
          readableFields: ["id"],
          mutableFields: [],
        },
      },
    );
    expect(decision.decision).toBe("DENY");
    expect(decision.reasonCode).toBe("WORKFLOW_DENIED");
  });
});
