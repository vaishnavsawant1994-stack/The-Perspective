import { describe, expect, it } from "vitest";

import { evaluateAuthorization } from "@/modules/authorization/policy";
import type {
  AuthorizedRequestContext,
  EffectiveAuthorizationGrant,
  PermissionKey,
} from "@/modules/foundation/request-context";
import type { AuthorizationResourceContext } from "@/modules/authorization/types";

const now = new Date("2026-09-29T04:00:00.000Z");
const permissionKey = "proposal.view" as PermissionKey;
const grant: EffectiveAuthorizationGrant = {
  membershipRoleId: "membership-role",
  roleId: "role",
  roleKey: "R07",
  permissionKey,
  effect: "ALLOW",
  scope: "ORG",
  constraints: {},
  validFrom: now,
  validUntil: null,
};
const context = {
  authentication: "authenticated",
  scope: "authorized",
  requestId: "r7-proposal-fields",
  identity: { userId: "user" },
  session: {
    sessionId: "session",
    issuedAt: now,
    expiresAt: new Date(now.getTime() + 3600000),
    authenticationMethod: "TEST",
  },
  membership: {
    membershipId: "membership",
    organizationId: "org",
    surface: "TEAM",
  },
  tenant: {
    organizationId: "org",
    membershipId: "membership",
    surface: "TEAM",
  },
  authorization: {
    roleKeys: ["R07"],
    permissions: new Set([permissionKey]),
    blockedPermissions: new Set(),
    grantPaths: [grant],
  },
} as unknown as AuthorizedRequestContext;

describe("R7 proposal read field policy", () => {
  it("allows versioned proposal and line fields while denying tenant ownership metadata", () => {
    const proposal = evaluateAuthorization(
      context,
      "proposal.view",
      {
        resourceId: "proposal-resource",
        resourceType: "proposal",
        ownerOrganizationId: "org",
        sensitivity: "FINANCIAL",
        visibility: "INTERNAL",
        lifecycleState: "DRAFT",
        version: 1,
      },
      {
        action: "view",
        requestedFields: ["id", "status", "currentVersion", "rowVersion"],
      },
    );
    expect(proposal.decision).toBe("ALLOW");

    const line = evaluateAuthorization(
      context,
      "proposal.view",
      {
        resourceId: "proposal-version",
        resourceType: "proposal-version",
        ownerOrganizationId: "org",
        sensitivity: "FINANCIAL",
        visibility: "INTERNAL",
        lifecycleState: "DRAFT",
        version: 1,
      },
      {
        action: "view",
        requestedFields: [
          "description",
          "quantity",
          "unitAmountMinor",
          "lineTotalMinor",
          "position",
        ],
      },
    );
    expect(line.decision).toBe("ALLOW");

    const owner = evaluateAuthorization(
      context,
      "proposal.view",
      {
        resourceId: "proposal-resource",
        resourceType: "proposal",
        ownerOrganizationId: "org",
        sensitivity: "FINANCIAL",
        visibility: "INTERNAL",
      },
      { action: "view", requestedFields: ["ownerOrganizationId"] },
    );
    expect(owner.decision).toBe("DENY");
  });
});

describe("R7 proposal creation field policy", () => {
  const editPermission = "proposal.edit" as PermissionKey;
  const editGrant: EffectiveAuthorizationGrant = { ...grant, permissionKey: editPermission };
  const editContext = {
    ...context,
    authorization: {
      ...context.authorization,
      permissions: new Set([editPermission]),
      grantPaths: [editGrant],
    },
  } as unknown as AuthorizedRequestContext;
  const resource: AuthorizationResourceContext = {
    resourceId: "server-generated-prospective-resource",
    resourceType: "proposal",
    ownerOrganizationId: "org",
    sensitivity: "FINANCIAL",
    visibility: "INTERNAL",
    lifecycleState: "DRAFT",
    version: 1,
  };

  it("allows only deal and draft line inputs, never lifecycle or tenant fields", () => {
    expect(evaluateAuthorization(editContext, "proposal.edit", resource, {
      action: "create",
      requestedFields: ["dealId", "currency", "description", "quantity", "unitAmountMinor"],
    }).decision).toBe("ALLOW");

    for (const field of [
      "ownerOrganizationId", "status", "resourceId", "currentVersion",
      "totalMinor", "taxMinor", "clientAccountId",
    ]) {
      expect(evaluateAuthorization(editContext, "proposal.edit", resource, {
        action: "create",
        requestedFields: [field],
      }).decision).toBe("DENY");
    }
  });
});

