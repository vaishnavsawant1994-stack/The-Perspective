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
  isR8DormantPermissionKey,
  R8_ACTIVE_PERMISSION_KEYS,
  R8_DORMANT_PERMISSION_KEYS,
} from "./r8-policy";
import { PERMISSION_DEFINITIONS, type CanonicalPermissionKey } from "./registry";

function grant(
  permissionKey: CanonicalPermissionKey,
  scope: EffectiveAuthorizationGrant["scope"] = "ORG",
): EffectiveAuthorizationGrant {
  return {
    membershipRoleId: "membership-role-r8",
    roleId: "role-r8",
    roleKey: "R08",
    permissionKey: permissionKey as PermissionKey,
    effect: "ALLOW",
    scope,
    constraints: {},
    validFrom: new Date("2026-10-01T00:00:00.000Z"),
    validUntil: null,
  };
}

function context(
  grants: readonly EffectiveAuthorizationGrant[],
  surface: "TEAM" | "CLIENT" = "TEAM",
  organizationId = surface === "CLIENT" ? "client-org" : "org-r8",
): AuthorizedRequestContext {
  const membershipId = "membership-r8" as MembershipId;
  const org = organizationId as OrganizationId;
  return {
    authentication: "authenticated",
    scope: "authorized",
    requestId: "r8-policy",
    identity: { userId: "user-r8" as UserId },
    session: {
      sessionId: "session-r8" as SessionId,
      issuedAt: new Date("2026-10-01T10:00:00.000Z"),
      expiresAt: new Date("2026-10-01T11:00:00.000Z"),
      authenticationMethod: "password",
    },
    membership: { membershipId, organizationId: org, surface },
    tenant: { membershipId, organizationId: org, surface },
    authorization: {
      roleKeys: ["R08"],
      permissions: new Set(grants.map((item) => item.permissionKey)),
      blockedPermissions: new Set(),
      grantPaths: grants,
    },
  };
}

const project = {
  resourceType: "project",
  ownerOrganizationId: "org-r8",
  visibility: "INTERNAL" as const,
  sensitivity: "STANDARD" as const,
};

describe("R8 authorization slice", () => {
  it("activates the twenty frozen production keys and no others", () => {
    expect(R8_ACTIVE_PERMISSION_KEYS).toHaveLength(20);
    expect(new Set(R8_ACTIVE_PERMISSION_KEYS).size).toBe(20);
    expect(PERMISSION_DEFINITIONS).toHaveLength(171);
    for (const key of R8_DORMANT_PERMISSION_KEYS) {
      expect(isR8DormantPermissionKey(key)).toBe(true);
      expect(R8_ACTIVE_PERMISSION_KEYS).not.toContain(key);
    }
  });

  it("allows a team project create and rejects server-owned state", () => {
    const allowed = evaluateAuthorization(context([grant("project.create")]), "project.create", project, {
      action: "create",
      requestedFields: ["proposalId", "title"],
    });
    expect(allowed.decision).toBe("ALLOW");

    const forged = evaluateAuthorization(context([grant("project.manage")]), "project.manage", project, {
      action: "update",
      requestedFields: ["state"],
    });
    expect(forged).toMatchObject({ decision: "DENY", reasonCode: "FIELD_DENIED" });
  });

  it("keeps dormant R8 keys denied after the stage is active", () => {
    for (const key of ["approval.decide", "approval.override", "calendar.view", "workflow.template.manage"] as const) {
      expect(evaluateAuthorization(context([grant(key)]), key, {
        resourceType: "approval",
        ownerOrganizationId: "org-r8",
      }, {
        action: "approve",
        workflowSatisfied: true,
        exactVersionMatches: true,
        separationOfDutySatisfied: true,
      })).toMatchObject({ decision: "DENY", reasonCode: "WORKFLOW_DENIED" });
    }
  });

  it("does not let a team grant decide as the client", () => {
    const denied = evaluateAuthorization(
      context([grant("approval.client.decide", "CLIENT")], "TEAM", "client-org"),
      "approval.client.decide",
      {
        resourceType: "draft-version",
        ownerOrganizationId: "org-r8",
        clientOrganizationId: "client-org",
        visibility: "CLIENT_SHARED",
        sensitivity: "STANDARD",
      },
      {
        action: "decide",
        workflowSatisfied: true,
        exactVersionMatches: true,
        separationOfDutySatisfied: true,
        clientSafeProjection: true,
      },
    );
    expect(denied.decision).toBe("DENY");
  });

  it("allows only the client decision when version, duty, and projection are present", () => {
    const resource = {
      resourceType: "draft-version",
      ownerOrganizationId: "org-r8",
      clientOrganizationId: "client-org",
      visibility: "CLIENT_SHARED" as const,
      sensitivity: "STANDARD" as const,
    };
    const client = context([grant("approval.client.decide", "CLIENT")], "CLIENT");
    expect(evaluateAuthorization(client, "approval.client.decide", resource, {
      action: "decide",
      workflowSatisfied: true,
      exactVersionMatches: true,
      separationOfDutySatisfied: true,
      clientSafeProjection: true,
    }).decision).toBe("ALLOW");
    expect(evaluateAuthorization(client, "approval.client.decide", resource, {
      action: "decide",
      workflowSatisfied: true,
      exactVersionMatches: false,
      separationOfDutySatisfied: true,
      clientSafeProjection: true,
    })).toMatchObject({ decision: "DENY", reasonCode: "WORKFLOW_DENIED" });
    expect(evaluateAuthorization(client, "approval.client.decide", { ...resource, visibility: "INTERNAL" }, {
      action: "decide",
      workflowSatisfied: true,
      exactVersionMatches: true,
      separationOfDutySatisfied: true,
      clientSafeProjection: true,
    })).toMatchObject({ decision: "DENY", reasonCode: "SCOPE_DENIED" });
  });

  it("requires workflow evidence for move, assignment, and editorial review", () => {
    expect(evaluateAuthorization(context([grant("workflow.move")]), "workflow.move", project, {
      action: "transition",
    })).toMatchObject({ decision: "DENY", reasonCode: "WORKFLOW_DENIED" });
    expect(evaluateAuthorization(context([grant("workflow.move")]), "workflow.move", project, {
      action: "transition",
      workflowSatisfied: true,
    }).decision).toBe("ALLOW");
    expect(evaluateAuthorization(context([grant("project.assign")]), "project.assign", project, {
      action: "assign",
    })).toMatchObject({ decision: "DENY", reasonCode: "WORKFLOW_DENIED" });
    expect(evaluateAuthorization(context([grant("editorial.review")]), "editorial.review", {
      resourceType: "editorial-review",
      ownerOrganizationId: "org-r8",
      visibility: "INTERNAL",
      sensitivity: "STANDARD",
    }, { action: "create", workflowSatisfied: true }).decision).toBe("ALLOW");
  });

  it("keeps later publishing, portal, and media keys dormant", () => {
    for (const key of ["publication.publish", "client.questionnaire.edit", "design.approve", "distribution.launch"] as const) {
      expect(evaluateAuthorization(context([grant(key)]), key, project, {
        action: "view",
        workflowSatisfied: true,
      }).decision).toBe("DENY");
    }
  });
});
