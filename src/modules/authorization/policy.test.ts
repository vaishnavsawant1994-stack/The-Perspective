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
import type { CanonicalPermissionKey } from "./registry";

function grant(
  permissionKey: CanonicalPermissionKey,
  options: Partial<EffectiveAuthorizationGrant> = {},
): EffectiveAuthorizationGrant {
  return {
    membershipRoleId: "membership-role-1",
    roleId: "role-1",
    roleKey: "R01",
    permissionKey: permissionKey as PermissionKey,
    effect: "ALLOW",
    scope: "ORG",
    constraints: {},
    validFrom: new Date("2026-09-27T00:00:00.000Z"),
    validUntil: null,
    ...options,
  };
}

function authorizedContext(
  grants: readonly EffectiveAuthorizationGrant[],
  options: {
    surface?: "TEAM" | "CLIENT";
    departmentId?: string;
    blocked?: readonly CanonicalPermissionKey[];
  } = {},
): AuthorizedRequestContext {
  const organizationId = "org-1" as OrganizationId;
  const membershipId = "membership-1" as MembershipId;
  const permissionKeys = grants
    .filter((candidate) => candidate.effect === "ALLOW")
    .map((candidate) => candidate.permissionKey);

  return {
    authentication: "authenticated",
    scope: "authorized",
    requestId: "request-1",
    identity: {
      userId: "user-1" as UserId,
    },
    session: {
      sessionId: "session-1" as SessionId,
      issuedAt: new Date("2026-09-27T04:00:00.000Z"),
      expiresAt: new Date("2026-09-27T05:00:00.000Z"),
      authenticationMethod: "password",
    },
    membership: {
      membershipId,
      organizationId,
      surface: options.surface ?? "TEAM",
    },
    tenant: {
      membershipId,
      organizationId,
      surface: options.surface ?? "TEAM",
    },
    authorization: {
      roleKeys: ["R01"],
      permissions: new Set(permissionKeys),
      blockedPermissions: new Set(
        (options.blocked ?? []).map((key) => key as PermissionKey),
      ),
      grantPaths: grants,
      actorDepartmentId: options.departmentId,
    },
  };
}

describe("R5 resource policy", () => {
  it("allows an active R5 permission only inside the selected organization", () => {
    const context = authorizedContext([grant("role.manage")]);

    const allowed = evaluateAuthorization(
      context,
      "role.manage",
      {
        resourceType: "role",
        ownerOrganizationId: "org-1",
        targetMembershipId: "membership-2",
      },
      {
        action: "manage",
        fieldPolicy: { readableFields: [], mutableFields: [] },
        reason: "Owner-approved access administration",
        recentAuthenticationSatisfied: true,
        mfaSatisfied: true,
        delegationCeilingSatisfied: true,
        optimisticConcurrencySatisfied: true,
      },
    );

    expect(allowed.decision).toBe("ALLOW");
    expect(allowed.effectiveScope).toBe("ORG");

    expect(
      evaluateAuthorization(
        context,
        "role.manage",
        {
          resourceType: "role",
          ownerOrganizationId: "org-2",
          targetMembershipId: "membership-2",
        },
        {
          action: "manage",
          reason: "attempt",
          recentAuthenticationSatisfied: true,
          mfaSatisfied: true,
          delegationCeilingSatisfied: true,
          optimisticConcurrencySatisfied: true,
        },
      ),
    ).toMatchObject({
      decision: "DENY",
      reasonCode: "SCOPE_DENIED",
    });
  });

  it("makes explicit DENY win over an otherwise applicable ALLOW", () => {
    const context = authorizedContext([
      grant("team.view"),
      grant("team.view", {
        membershipRoleId: "membership-role-deny",
        roleId: "role-deny",
        roleKey: "R02",
        effect: "DENY",
      }),
    ]);

    expect(
      evaluateAuthorization(
        context,
        "team.view",
        {
          resourceType: "team",
          ownerOrganizationId: "org-1",
        },
        { action: "view" },
      ),
    ).toMatchObject({
      decision: "DENY",
      reasonCode: "PERMISSION_DENIED",
    });
  });

  it("allows an independent valid path despite another malformed edge", () => {
    const context = authorizedContext([grant("team.view")], {
      blocked: ["team.view"],
    });

    expect(
      evaluateAuthorization(
        context,
        "team.view",
        {
          resourceType: "team",
          ownerOrganizationId: "org-1",
        },
        {
          action: "view",
          fieldPolicy: { readableFields: [], mutableFields: [] },
        },
      ),
    ).toMatchObject({
      decision: "ALLOW",
      effectiveScope: "ORG",
    });
  });

  it("fails closed when malformed edges are the only evidence for a permission", () => {
    const context = authorizedContext([], {
      blocked: ["team.view"],
    });

    expect(
      evaluateAuthorization(
        context,
        "team.view",
        {
          resourceType: "team",
          ownerOrganizationId: "org-1",
        },
        { action: "view" },
      ),
    ).toMatchObject({
      decision: "DENY",
      reasonCode: "POLICY_INVALID",
    });
  });

  it("keeps future-stage permissions dormant during R5", () => {
    const context = authorizedContext([grant("approval.decide")]);

    expect(
      evaluateAuthorization(
        context,
        "approval.decide",
        {
          resourceType: "approval",
          ownerOrganizationId: "org-1",
        },
        {
          action: "approve",
          workflowSatisfied: true,
          exactVersionMatches: true,
          separationOfDutySatisfied: true,
        },
      ),
    ).toMatchObject({
      decision: "DENY",
      reasonCode: "WORKFLOW_DENIED",
    });
  });

  it("requires a field policy whenever permission metadata requires one", () => {
    const context = authorizedContext([grant("team.view")]);

    expect(
      evaluateAuthorization(
        context,
        "team.view",
        {
          resourceType: "team",
          ownerOrganizationId: "org-1",
        },
        { action: "view" },
      ),
    ).toMatchObject({
      decision: "DENY",
      reasonCode: "FIELD_DENIED",
    });
  });

  it("does not let a view permission authorize a mutation action", () => {
    const context = authorizedContext([grant("team.view")]);

    expect(
      evaluateAuthorization(
        context,
        "team.view",
        {
          resourceType: "membership",
          ownerOrganizationId: "org-1",
        },
        { action: "delete" },
      ),
    ).toMatchObject({
      decision: "DENY",
      reasonCode: "WORKFLOW_DENIED",
    });
  });

  it("fails closed when a field-group constraint has no trusted field mapping", () => {
    const context = authorizedContext([
      grant("team.view", {
        constraints: { deniedFieldGroups: ["internal"] },
      }),
    ]);

    expect(
      evaluateAuthorization(
        context,
        "team.view",
        {
          resourceType: "membership",
          ownerOrganizationId: "org-1",
        },
        {
          action: "view",
          requestedFields: ["id"],
          fieldPolicy: {
            readableFields: ["id"],
            mutableFields: [],
          },
        },
      ),
    ).toMatchObject({
      decision: "DENY",
      reasonCode: "SCOPE_DENIED",
    });
  });

  it("enforces allowed and denied field groups from a trusted field policy", () => {
    const context = authorizedContext([
      grant("team.view", {
        constraints: {
          allowedFieldGroups: ["public"],
          deniedFieldGroups: ["internal"],
        },
      }),
    ]);
    const resource = {
      resourceType: "membership",
      ownerOrganizationId: "org-1",
    };
    const fieldPolicy = {
      readableFields: ["id", "secret"],
      mutableFields: [],
      fieldGroups: {
        public: ["id"],
        internal: ["secret"],
      },
    };

    expect(
      evaluateAuthorization(context, "team.view", resource, {
        action: "view",
        requestedFields: ["id"],
        fieldPolicy,
      }).decision,
    ).toBe("ALLOW");

    expect(
      evaluateAuthorization(context, "team.view", resource, {
        action: "view",
        requestedFields: ["secret"],
        fieldPolicy,
      }),
    ).toMatchObject({
      decision: "DENY",
      reasonCode: "SCOPE_DENIED",
    });
  });

  it("does not let READ authority prove export without an explicit export permission", () => {
    const context = authorizedContext([
      grant("team.view", { scope: "READ" }),
    ]);

    expect(
      evaluateAuthorization(
        context,
        "team.view",
        {
          resourceType: "membership",
          ownerOrganizationId: "org-1",
        },
        {
          action: "export",
          requestedFields: ["id"],
          fieldPolicy: {
            readableFields: ["id"],
            mutableFields: [],
          },
        },
      ),
    ).toMatchObject({
      decision: "DENY",
      reasonCode: "WORKFLOW_DENIED",
    });
  });

  it("requires trusted department equality for DEPT scope", () => {
    const context = authorizedContext(
      [grant("workspace.search", { scope: "DEPT" })],
      { departmentId: "dept-1" },
    );

    expect(
      evaluateAuthorization(
        context,
        "workspace.search",
        {
          resourceType: "search-document",
          ownerOrganizationId: "org-1",
          departmentId: "dept-1",
        },
        {
          action: "search",
          fieldPolicy: { readableFields: [], mutableFields: [] },
        },
      ).decision,
    ).toBe("ALLOW");

    expect(
      evaluateAuthorization(
        context,
        "workspace.search",
        {
          resourceType: "search-document",
          ownerOrganizationId: "org-1",
          departmentId: "dept-2",
        },
        { action: "search" },
      ),
    ).toMatchObject({
      decision: "DENY",
      reasonCode: "SCOPE_DENIED",
    });
  });

  it("requires explicit client-safe projection on a Client role", () => {
    const context = authorizedContext(
      [grant("client.project.view", { scope: "CLIENT", roleKey: "R17" })],
      { surface: "CLIENT" },
    );
    const resource = {
      resourceType: "project",
      clientOrganizationId: "org-1",
      visibility: "CLIENT_SHARED" as const,
    };

    expect(
      evaluateAuthorization(
        context,
        "client.project.view",
        resource,
        {
          action: "view",
          fieldPolicy: { readableFields: [], mutableFields: [] },
          clientSafeProjection: false,
        },
        { activeStages: new Set(["R12"]) },
      ),
    ).toMatchObject({
      decision: "DENY",
      reasonCode: "CLIENT_PROJECTION_DENIED",
    });

    expect(
      evaluateAuthorization(
        context,
        "client.project.view",
        resource,
        {
          action: "view",
          fieldPolicy: { readableFields: [], mutableFields: [] },
          clientSafeProjection: true,
        },
        { activeStages: new Set(["R12"]) },
      ).decision,
    ).toBe("ALLOW");
  });

  it("denies requested fields outside the server field policy", () => {
    const context = authorizedContext([grant("team.view")]);
    const resource = {
      resourceType: "membership",
      ownerOrganizationId: "org-1",
    };

    expect(
      evaluateAuthorization(
        context,
        "team.view",
        resource,
        {
          action: "view",
          requestedFields: ["id", "secret"],
          fieldPolicy: {
            readableFields: ["id", "displayName"],
            mutableFields: [],
          },
        },
      ),
    ).toMatchObject({
      decision: "DENY",
      reasonCode: "FIELD_DENIED",
    });
  });

  it("requires workflow and high-risk obligations before ALLOW", () => {
    const context = authorizedContext([grant("role.manage")]);
    const resource = {
      resourceType: "role",
      ownerOrganizationId: "org-1",
      targetMembershipId: "membership-2",
    };

    expect(
      evaluateAuthorization(
        context,
        "role.manage",
        resource,
        {
          action: "manage",
          fieldPolicy: { readableFields: [], mutableFields: [] },
          reason: "",
          recentAuthenticationSatisfied: true,
          mfaSatisfied: true,
          delegationCeilingSatisfied: true,
          optimisticConcurrencySatisfied: true,
        },
      ),
    ).toMatchObject({
      decision: "DENY",
      reasonCode: "OBLIGATION_REQUIRED",
    });
  });
});
