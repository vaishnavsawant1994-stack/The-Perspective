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
  getR6FieldPolicy,
  getR6PermissionBinding,
  isR6ActivePermissionKey,
  R6_ACTIVE_PERMISSION_KEYS,
  R6_DORMANT_PERMISSION_KEYS,
  R6_PERMISSION_BINDINGS,
} from "./r6-policy";
import type { CanonicalPermissionKey } from "./registry";

function grant(
  permissionKey: CanonicalPermissionKey,
  options: Partial<EffectiveAuthorizationGrant> = {},
): EffectiveAuthorizationGrant {
  return {
    membershipRoleId: "membership-role-r6",
    roleId: "role-r6",
    roleKey: "R06",
    permissionKey: permissionKey as PermissionKey,
    effect: "ALLOW",
    scope: "ORG",
    constraints: {},
    validFrom: new Date("2026-09-27T00:00:00.000Z"),
    validUntil: null,
    ...options,
  };
}

function context(
  grants: readonly EffectiveAuthorizationGrant[],
): AuthorizedRequestContext {
  const organizationId = "org-r6" as OrganizationId;
  const membershipId = "membership-r6" as MembershipId;
  return {
    authentication: "authenticated",
    scope: "authorized",
    requestId: "r6-policy-test",
    identity: { userId: "user-r6" as UserId },
    session: {
      sessionId: "session-r6" as SessionId,
      issuedAt: new Date("2026-09-27T10:00:00.000Z"),
      expiresAt: new Date("2026-09-27T11:00:00.000Z"),
      authenticationMethod: "password",
    },
    membership: {
      membershipId,
      organizationId,
      surface: "TEAM",
    },
    tenant: {
      membershipId,
      organizationId,
      surface: "TEAM",
    },
    authorization: {
      roleKeys: ["R06"],
      permissions: new Set(
        grants
          .filter((candidate) => candidate.effect === "ALLOW")
          .map((candidate) => candidate.permissionKey),
      ),
      blockedPermissions: new Set(),
      grantPaths: grants,
      actorDepartmentId: "dept-r6",
    },
  };
}

function resource(resourceType: string, extra: Record<string, unknown> = {}) {
  return {
    resourceId: "resource-r6",
    resourceType,
    ownerOrganizationId: "org-r6",
    ownerMembershipId: "membership-r6",
    departmentId: "dept-r6",
    assignedMembershipIds: ["membership-r6"],
    visibility: "INTERNAL" as const,
    sensitivity: "CONFIDENTIAL" as const,
    lifecycleState: "ACTIVE",
    version: 1,
    ...extra,
  };
}

describe("R6 authorization activation", () => {
  it("freezes exactly 37 active R6 permissions and keeps Proposal out", () => {
    expect(R6_ACTIVE_PERMISSION_KEYS).toHaveLength(37);
    expect(new Set(R6_ACTIVE_PERMISSION_KEYS).size).toBe(37);
    expect(Object.keys(R6_PERMISSION_BINDINGS)).toHaveLength(37);

    for (const key of R6_DORMANT_PERMISSION_KEYS) {
      expect(isR6ActivePermissionKey(key)).toBe(false);
    }
  });

  it("has explicit action/resource bindings and canonical field policy for every active key", () => {
    for (const key of R6_ACTIVE_PERMISSION_KEYS) {
      const binding = getR6PermissionBinding(key);
      expect(binding.actions.length).toBeGreaterThan(0);
      expect(binding.resourceTypes.length).toBeGreaterThan(0);

      for (const resourceType of binding.resourceTypes) {
        expect(getR6FieldPolicy(resourceType)).toBeDefined();
      }
    }
  });

  it("activates an allowed R6 view action by default", () => {
    const decision = evaluateAuthorization(
      context([grant("lead.view")]),
      "lead.view",
      resource("lead"),
      {
        action: "view",
        requestedFields: ["id", "lifecycleState"],
      },
    );

    expect(decision).toMatchObject({
      decision: "ALLOW",
      effectiveScope: "ORG",
    });
    expect(decision.readableFields).toContain("lifecycleState");
  });

  it("keeps all four historical Proposal R6 keys dormant even with grants", () => {
    for (const key of R6_DORMANT_PERMISSION_KEYS) {
      const decision = evaluateAuthorization(
        context([grant(key)]),
        key,
        resource("proposal"),
        {
          action: "view",
          workflowSatisfied: true,
          exactVersionMatches: true,
          reason: "attempt",
          recentAuthenticationSatisfied: true,
          mfaSatisfied: true,
        },
      );

      expect(decision).toMatchObject({
        decision: "DENY",
        reasonCode: "WORKFLOW_DENIED",
      });
    }
  });

  it("keeps template.manage dormant at R6+", () => {
    const decision = evaluateAuthorization(
      context([grant("template.manage")]),
      "template.manage",
      resource("message-template"),
      {
        action: "manage",
        workflowSatisfied: true,
      },
    );

    expect(decision).toMatchObject({
      decision: "DENY",
      reasonCode: "WORKFLOW_DENIED",
    });
  });

  it.each([
    ["lead.view", "export", "lead"],
    ["campaign.manage", "approve", "outreach-campaign"],
    ["campaign.manage", "launch", "outreach-campaign"],
    ["outreach.prepare", "launch", "outreach-campaign"],
    ["deal.edit", "move-stage", "deal"],
    ["client.contact.manage", "provision", "client-account"],
    ["message.read", "send", "message"],
  ] as const)(
    "rejects action laundering for %s -> %s",
    (permissionKey, action, resourceType) => {
      expect(
        evaluateAuthorization(
          context([grant(permissionKey)]),
          permissionKey,
          resource(resourceType),
          {
            action,
            workflowSatisfied: true,
          },
        ),
      ).toMatchObject({
        decision: "DENY",
        reasonCode: "WORKFLOW_DENIED",
      });
    },
  );

  it("rejects a correct permission on the wrong resource type", () => {
    expect(
      evaluateAuthorization(
        context([grant("lead.view")]),
        "lead.view",
        resource("deal"),
        { action: "view" },
      ),
    ).toMatchObject({
      decision: "DENY",
      reasonCode: "RESOURCE_DENIED",
    });
  });

  it("rejects missing ResourceContext for an active R6 permission", () => {
    expect(
      evaluateAuthorization(
        context([grant("lead.view")]),
        "lead.view",
        undefined,
        { action: "view" },
      ),
    ).toMatchObject({
      decision: "DENY",
      reasonCode: "RESOURCE_DENIED",
    });
  });

  it("ignores a caller-supplied permissive field policy and uses the canonical R6 policy", () => {
    expect(
      evaluateAuthorization(
        context([grant("lead.view")]),
        "lead.view",
        resource("lead"),
        {
          action: "view",
          requestedFields: ["providerSecret"],
          fieldPolicy: {
            readableFields: ["providerSecret"],
            mutableFields: ["providerSecret"],
          },
        },
      ),
    ).toMatchObject({
      decision: "DENY",
      reasonCode: "FIELD_DENIED",
    });
  });

  it("enforces server-defined workflow action guards even when registry metadata is broader", () => {
    expect(
      evaluateAuthorization(
        context([grant("lead.qualify")]),
        "lead.qualify",
        resource("lead"),
        {
          action: "qualify",
          requestedFields: [],
        },
      ),
    ).toMatchObject({
      decision: "DENY",
      reasonCode: "WORKFLOW_DENIED",
    });

    expect(
      evaluateAuthorization(
        context([grant("lead.qualify")]),
        "lead.qualify",
        resource("lead"),
        {
          action: "qualify",
          requestedFields: [],
          workflowSatisfied: true,
        },
      ).decision,
    ).toBe("ALLOW");
  });

  it("requires the full critical outreach.launch obligation set", () => {
    const ctx = context([grant("outreach.launch")]);
    const campaign = resource("outreach-campaign", {
      lifecycleState: "APPROVED",
      version: 4,
    });

    expect(
      evaluateAuthorization(ctx, "outreach.launch", campaign, {
        action: "schedule",
        workflowSatisfied: true,
        reason: "approved send",
        recentAuthenticationSatisfied: true,
        mfaSatisfied: true,
        exactVersionMatches: false,
      }),
    ).toMatchObject({
      decision: "DENY",
      reasonCode: "WORKFLOW_DENIED",
    });

    expect(
      evaluateAuthorization(ctx, "outreach.launch", campaign, {
        action: "schedule",
        workflowSatisfied: true,
        reason: "approved send",
        recentAuthenticationSatisfied: true,
        mfaSatisfied: true,
        exactVersionMatches: true,
      }).decision,
    ).toBe("ALLOW");
  });

  it("keeps later-stage non-R6 authority dormant", () => {
    expect(
      evaluateAuthorization(
        context([grant("commercial.exception.approve")]),
        "commercial.exception.approve",
        resource("deal"),
        {
          action: "approve",
          workflowSatisfied: true,
          reason: "attempt",
          recentAuthenticationSatisfied: true,
          mfaSatisfied: true,
          exactVersionMatches: true,
          separationOfDutySatisfied: true,
        },
      ),
    ).toMatchObject({
      decision: "DENY",
      reasonCode: "WORKFLOW_DENIED",
    });
  });

  it("preserves DENY precedence for an active R6 permission", () => {
    const allowed = grant("deal.view");
    const denied = grant("deal.view", {
      membershipRoleId: "membership-role-deny",
      roleId: "role-deny",
      roleKey: "R99",
      effect: "DENY",
    });

    expect(
      evaluateAuthorization(
        context([allowed, denied]),
        "deal.view",
        resource("deal"),
        { action: "view" },
      ),
    ).toMatchObject({
      decision: "DENY",
      reasonCode: "PERMISSION_DENIED",
    });
  });

  it("preserves trusted scope checks for R6 DEPT, ASN and OWN grants", () => {
    expect(
      evaluateAuthorization(
        context([grant("deal.view", { scope: "DEPT" })]),
        "deal.view",
        resource("deal", { departmentId: "dept-other" }),
        { action: "view" },
      ),
    ).toMatchObject({ decision: "DENY", reasonCode: "SCOPE_DENIED" });

    expect(
      evaluateAuthorization(
        context([grant("deal.view", { scope: "ASN" })]),
        "deal.view",
        resource("deal", { assignedMembershipIds: ["membership-other"] }),
        { action: "view" },
      ),
    ).toMatchObject({ decision: "DENY", reasonCode: "SCOPE_DENIED" });

    expect(
      evaluateAuthorization(
        context([grant("deal.view", { scope: "OWN" })]),
        "deal.view",
        resource("deal", {
          ownerMembershipId: "membership-other",
          ownerUserId: "user-other",
        }),
        { action: "view" },
      ),
    ).toMatchObject({ decision: "DENY", reasonCode: "SCOPE_DENIED" });
  });
});
