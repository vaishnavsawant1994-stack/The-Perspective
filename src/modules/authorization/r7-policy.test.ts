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

import { evaluateAuthorization, evaluateAuthorizationByKey } from "./policy";
import {
  isR7ActivePermissionKey,
  isR7DormantPermissionKey,
  R7_ACTIVE_PERMISSION_KEYS,
  R7_DORMANT_PERMISSION_KEYS,
} from "./r7-policy";
import {
  PERMISSION_DEFINITIONS,
  type CanonicalPermissionKey,
} from "./registry";
import type {
  AuthorizationCommandContext,
  AuthorizationResourceContext,
} from "./types";

function grant(
  permissionKey: CanonicalPermissionKey,
  options: Partial<EffectiveAuthorizationGrant> = {},
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
    ...options,
  };
}

function context(
  grants: readonly EffectiveAuthorizationGrant[],
  organizationId = "org-r7",
  surface: "TEAM" | "CLIENT" = "TEAM",
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
      surface,
    },
    tenant: {
      membershipId,
      organizationId: org,
      surface,
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
  it("allows Proposal Edit line fields only through the explicit edit action", () => {
    const authorized = context([grant("proposal.edit")]);
    const resource = proposalResource();
    const edit = evaluateAuthorization(authorized, "proposal.edit", resource, {
      action: "edit",
      requestedFields: ["currency", "description", "quantity", "unitAmountMinor"],
    });
    expect(edit.decision).toBe("ALLOW");

    const genericUpdate = evaluateAuthorization(authorized, "proposal.edit", resource, {
      action: "update",
      requestedFields: ["currency", "description", "quantity", "unitAmountMinor"],
    });
    expect(genericUpdate.decision).toBe("DENY");
    const create = evaluateAuthorization(authorized, "proposal.edit", resource, {
      action: "create",
      requestedFields: ["currency", "description", "quantity", "unitAmountMinor"],
    });
    expect(create.decision).toBe("ALLOW");

    const derivedValues = evaluateAuthorization(authorized, "proposal.edit", resource, {
      action: "edit",
      requestedFields: ["totalMinor", "status", "ownerOrganizationId", "lineId"],
    });
    expect(derivedValues.decision).toBe("DENY");
  });

type R7AuthorizationCase = {
  permissionKey: CanonicalPermissionKey;
  resourceType: "proposal" | "client-proposal" | "invoice" | "payment" | "contract";
  surface?: "TEAM" | "CLIENT";
  scope?: EffectiveAuthorizationGrant["scope"];
  command: AuthorizationCommandContext;
};

const ACTIVE_R7_CASES: readonly R7AuthorizationCase[] = [
  {
    permissionKey: "proposal.view",
    resourceType: "proposal",
    command: { action: "view", requestedFields: ["id"] },
  },
  {
    permissionKey: "proposal.edit",
    resourceType: "proposal",
    command: { action: "edit", requestedFields: ["currency", "description", "quantity", "unitAmountMinor"] },
  },
  {
    permissionKey: "proposal.send",
    resourceType: "proposal",
    command: {
      action: "send",
      workflowSatisfied: true,
      exactVersionMatches: true,
    },
  },
  {
    permissionKey: "proposal.accept",
    resourceType: "client-proposal",
    surface: "CLIENT",
    scope: "CLIENT",
    command: {
      action: "accept",
      workflowSatisfied: true,
      exactVersionMatches: true,
      separationOfDutySatisfied: true,
    },
  },
  {
    permissionKey: "invoice.view",
    resourceType: "invoice",
    command: { action: "view", requestedFields: ["id"] },
  },
  {
    permissionKey: "invoice.edit",
    resourceType: "invoice",
    command: { action: "create" },
  },
  {
    permissionKey: "invoice.issue",
    resourceType: "invoice",
    command: {
      action: "issue",
      workflowSatisfied: true,
      reason: "Approved invoice issue",
      recentAuthenticationSatisfied: true,
      mfaSatisfied: true,
      financialEvidencePresent: true,
      separationOfDutySatisfied: true,
    },
  },
  {
    permissionKey: "invoice.send",
    resourceType: "invoice",
    command: { action: "send", workflowSatisfied: true },
  },
  {
    permissionKey: "payment.view",
    resourceType: "payment",
    command: {
      action: "view",
      requestedFields: ["id"],
      workflowSatisfied: true,
      financialEvidencePresent: true,
      separationOfDutySatisfied: true,
    },
  },
  {
    permissionKey: "payment.reconcile",
    resourceType: "payment",
    command: {
      action: "reconcile",
      workflowSatisfied: true,
      reason: "Reconciled provider evidence",
      recentAuthenticationSatisfied: true,
      mfaSatisfied: true,
      financialEvidencePresent: true,
      separationOfDutySatisfied: true,
    },
  },
  {
    permissionKey: "contract.send",
    resourceType: "contract",
    command: {
      action: "send",
      workflowSatisfied: true,
      exactVersionMatches: true,
    },
  },
];

function resource(
  resourceType: R7AuthorizationCase["resourceType"],
  ownerOrganizationId = "org-r7",
): AuthorizationResourceContext {
  return {
    resourceType,
    resourceId: `${resourceType}-r7-1`,
    ownerOrganizationId,
    ...(resourceType === "client-proposal"
      ? { clientOrganizationId: "org-r7", visibility: "CLIENT_SHARED" as const }
      : { visibility: "INTERNAL" as const }),
    sensitivity: "FINANCIAL",
  };
}


  it("activates only the frozen finance keys and keeps contracts dormant", () => {
    expect(R7_ACTIVE_PERMISSION_KEYS).toContain("proposal.view");
    expect(R7_ACTIVE_PERMISSION_KEYS).toContain("proposal.accept");
    expect(isR7ActivePermissionKey("proposal.approve")).toBe(false);
    expect(R7_ACTIVE_PERMISSION_KEYS).toContain("invoice.issue");
    expect(R7_ACTIVE_PERMISSION_KEYS).toContain("payment.reconcile");
    expect(isR7ActivePermissionKey("deal.view")).toBe(false);
    expect(isR7DormantPermissionKey("contract.view")).toBe(true);
    expect(isR7DormantPermissionKey("contract.edit")).toBe(true);
    expect(isR7ActivePermissionKey("contract.send")).toBe(true);
    expect(isR7DormantPermissionKey("contract.send")).toBe(false);
    expect(R7_DORMANT_PERMISSION_KEYS).toContain("payment.refund");
    const currencyEdit = evaluateAuthorization(
      context([grant("invoice.edit")]),
      "invoice.edit",
      resource("invoice"),
      { action: "update", requestedFields: ["currency", "totalMinor"] },
    );
    expect(currencyEdit.decision).toBe("DENY");
  });

  it("lets invoice creation name only the contract-version correlation", () => {
    const correlation = ["contractId", "expectedContractVersionId", "expectedContractVersion"];
    expect(
      evaluateAuthorization(
        context([grant("invoice.edit")]),
        "invoice.edit",
        resource("invoice"),
        { action: "create", requestedFields: correlation },
      ).decision,
    ).toBe("ALLOW");

    for (const field of [
      "currency",
      "subtotalMinor",
      "taxMinor",
      "totalMinor",
      "status",
      "sourceContractVersionId",
      "ownerOrganizationId",
    ]) {
      expect(
        evaluateAuthorization(
          context([grant("invoice.edit")]),
          "invoice.edit",
          resource("invoice"),
          { action: "create", requestedFields: [field] },
        ),
      ).toMatchObject({ decision: "DENY", reasonCode: "FIELD_DENIED" });
    }

    expect(
      evaluateAuthorization(
        context([grant("invoice.edit")]),
        "invoice.edit",
        resource("invoice"),
        { action: "update", requestedFields: ["contractId"] },
      ),
    ).toMatchObject({ decision: "DENY", reasonCode: "FIELD_DENIED" });
  });

  it.each(ACTIVE_R7_CASES)(
    "evaluates active R7 permission $permissionKey end to end and denies without its grant",
    ({ permissionKey, resourceType, command, surface, scope }) => {
      const decision = evaluateAuthorization(
        context([grant(permissionKey, { scope: scope ?? (permissionKey === "proposal.accept" ? "CLIENT" : "ORG") })], "org-r7", surface ?? (permissionKey === "proposal.accept" ? "CLIENT" : "TEAM")),
        permissionKey,
        resource(resourceType),
        command,
      );

      expect(decision).toMatchObject({
        decision: "ALLOW",
        permissionKey,
      });
      expect(
        evaluateAuthorization(
          context([], "org-r7", surface ?? (permissionKey === "proposal.accept" ? "CLIENT" : "TEAM")),
          permissionKey,
          resource(resourceType),
          command,
        ),
      ).toMatchObject({
        decision: "DENY",
        reasonCode: "PERMISSION_MISSING",
      });
    },
  );

  it("pins the R7 active and dormant permissions to the complete R7 registry slice", () => {
    const registeredR7Keys = PERMISSION_DEFINITIONS
      .filter((definition) => definition.activationStage === "R7")
      .map((definition) => definition.key)
      .sort();
    const r6StampedR7Keys = R7_ACTIVE_PERMISSION_KEYS.filter(
      (permissionKey) =>
        PERMISSION_DEFINITIONS.find(
          (definition) => definition.key === permissionKey,
        )?.activationStage === "R6",
    ).sort();
    const expectedCompatibilityKeys = [
      "proposal.edit",
      "proposal.send",
      "proposal.view",
    ];
    const expectedActive = [...R7_ACTIVE_PERMISSION_KEYS].sort();
    const expectedDormant = [...R7_DORMANT_PERMISSION_KEYS].sort();

    expect(r6StampedR7Keys).toEqual(expectedCompatibilityKeys);
    expect(
      [...expectedActive, ...expectedDormant].sort(),
    ).toEqual([...registeredR7Keys, ...expectedCompatibilityKeys].sort());
    expect(expectedDormant).toContain("commercial.exception.approve");
    expect(expectedDormant).toContain("package.manage");
    expect(expectedDormant).toContain("payment.refund");
    expect(expectedDormant.filter((key) => key.startsWith("contract."))).toEqual([
      "contract.edit",
      "contract.view",
    ]);

    for (const permissionKey of R7_DORMANT_PERMISSION_KEYS) {
      const decision = evaluateAuthorization(
        context([grant(permissionKey)]),
        permissionKey,
        undefined,
        { action: "view" },
      );
      expect(decision).toMatchObject({
        decision: "DENY",
        reasonCode: "WORKFLOW_DENIED",
      });
    }
  });

  it.each(
    ACTIVE_R7_CASES.filter((item) => item.resourceType !== "proposal" || item.permissionKey === "proposal.view")
      .filter((item) => item.permissionKey.endsWith(".view")),
  )(
    "denies cross-tenant $permissionKey resources",
    ({ permissionKey, resourceType, command }) => {
      expect(
        evaluateAuthorization(
          context([grant(permissionKey)]),
          permissionKey,
          resource(resourceType, "org-foreign"),
          command,
        ),
      ).toMatchObject({ decision: "DENY" });
    },
  );

  it("replaces caller-supplied field policy with the trusted R7 policy", () => {
    expect(
      evaluateAuthorization(
        context([grant("proposal.view")]),
        "proposal.view",
        resource("proposal"),
        {
          action: "view",
          requestedFields: ["internalSecret"],
          fieldPolicy: {
            readableFields: ["internalSecret"],
            mutableFields: ["internalSecret"],
          },
        },
      ),
    ).toMatchObject({
      decision: "DENY",
      reasonCode: "FIELD_DENIED",
    });
  });

  it("rejects resource-type laundering across R7 permissions", () => {
    expect(
      evaluateAuthorization(
        context([grant("proposal.view")]),
        "proposal.view",
        resource("invoice"),
        { action: "view", requestedFields: ["id"] },
      ),
    ).toMatchObject({
      decision: "DENY",
      reasonCode: "RESOURCE_DENIED",
    });
  });

  it.each([
    {
      permissionKey: "payment.view" as const,
      action: "reconcile",
      requestedFields: undefined,
    },
    {
      permissionKey: "payment.reconcile" as const,
      action: "mark-paid",
      requestedFields: undefined,
    },
    {
      permissionKey: "payment.reconcile" as const,
      action: "update",
      requestedFields: ["status"],
    },
  ])(
    "does not let $permissionKey declare provider-owned payment truth",
    ({ permissionKey, action, requestedFields }) => {
      expect(
        evaluateAuthorization(
          context([grant(permissionKey)]),
          permissionKey,
          resource("payment"),
          {
            action,
            requestedFields,
            workflowSatisfied: true,
            reason: "Attempt to set payment status",
            recentAuthenticationSatisfied: true,
            mfaSatisfied: true,
            financialEvidencePresent: true,
            separationOfDutySatisfied: true,
          },
        ),
      ).toMatchObject({
        decision: "DENY",
        reasonCode: "WORKFLOW_DENIED",
      });
    },
  );

  it("denies payment reconciliation when a critical obligation is missing", () => {
    const valid = {
      action: "reconcile",
      workflowSatisfied: true,
      reason: "Reconciled provider evidence",
      recentAuthenticationSatisfied: true,
      mfaSatisfied: true,
      financialEvidencePresent: true,
      separationOfDutySatisfied: true,
    } satisfies AuthorizationCommandContext;
    const incomplete = [
      { ...valid, reason: "" },
      { ...valid, recentAuthenticationSatisfied: false },
      { ...valid, mfaSatisfied: false },
      { ...valid, financialEvidencePresent: false },
      { ...valid, separationOfDutySatisfied: false },
    ];

    for (const command of incomplete) {
      expect(
        evaluateAuthorization(
          context([grant("payment.reconcile")]),
          "payment.reconcile",
          resource("payment"),
          command,
        ),
      ).toMatchObject({ decision: "DENY" });
    }
  });

  it("denies mutation of server-owned invoice lifecycle and money fields", () => {
    expect(
      evaluateAuthorization(
        context([grant("invoice.edit")]),
        "invoice.edit",
        resource("invoice"),
        {
          action: "update",
          requestedFields: ["status", "totalMinor"],
          fieldPolicy: {
            readableFields: ["status", "totalMinor"],
            mutableFields: ["status", "totalMinor"],
          },
        },
      ),
    ).toMatchObject({
      decision: "DENY",
      reasonCode: "FIELD_DENIED",
    });
  });

  it("rejects invalid scope and forged surface on an otherwise granted R7 operation", () => {
    expect(
      evaluateAuthorization(
        context([grant("invoice.view", { scope: "CLIENT" as never })]),
        "invoice.view",
        resource("invoice"),
        { action: "view", requestedFields: ["id"] },
      ),
    ).toMatchObject({ decision: "DENY", reasonCode: "POLICY_INVALID" });

    expect(
      evaluateAuthorization(
        context([grant("invoice.view")], "org-r7", "CLIENT"),
        "invoice.view",
        resource("invoice"),
        { action: "view", requestedFields: ["id"] },
      ),
    ).toMatchObject({ decision: "DENY", reasonCode: "POLICY_INVALID" });
  });

  it("rejects selected-organization context that disagrees with the trusted membership", () => {
    const authorized = context([grant("invoice.view")]);
    const mismatchedContext: AuthorizedRequestContext = {
      ...authorized,
      tenant: {
        ...authorized.tenant,
        organizationId: "org-forged-selection" as OrganizationId,
      },
    };

    expect(
      evaluateAuthorization(
        mismatchedContext,
        "invoice.view",
        resource("invoice", "org-forged-selection"),
        { action: "view", requestedFields: ["id"] },
      ),
    ).toMatchObject({
      decision: "DENY",
      reasonCode: "POLICY_INVALID",
    });
  });

  it("fails closed for unknown permission keys", () => {
    expect(
      evaluateAuthorizationByKey(
        context([]),
        "invoice.unknown",
        resource("invoice"),
        { action: "view" },
      ),
    ).toBeUndefined();
  });

  it.each([
    {
      permissionKey: "proposal.send" as const,
      action: "send",
      resourceType: "proposal" as const,
    },
    {
      permissionKey: "proposal.accept" as const,
      action: "accept",
      resourceType: "proposal" as const,
    },
    {
      permissionKey: "invoice.issue" as const,
      action: "issue",
      resourceType: "invoice" as const,
    },
    {
      permissionKey: "payment.reconcile" as const,
      action: "reconcile",
      resourceType: "payment" as const,
    },
  ])(
    "denies lifecycle operation $permissionKey without workflow evidence",
    ({ permissionKey, action, resourceType }) => {
      expect(
        evaluateAuthorization(
          context([grant(permissionKey, { scope: permissionKey === "proposal.accept" ? "CLIENT" : "ORG" })], "org-r7", permissionKey === "proposal.accept" ? "CLIENT" : "TEAM"),
          permissionKey,
          resource(permissionKey === "proposal.accept" ? "client-proposal" : resourceType),
          { action },
        ),
      ).toMatchObject({
        decision: "DENY",
        reasonCode: "WORKFLOW_DENIED",
      });
    },
  );

  it("denies proposal acceptance with stale version or failed separation of duty", () => {
    const baseCommand: AuthorizationCommandContext = {
      action: "accept",
      workflowSatisfied: true,
      exactVersionMatches: true,
      separationOfDutySatisfied: true,
    };
    for (const command of [
      { ...baseCommand, exactVersionMatches: false },
      { ...baseCommand, separationOfDutySatisfied: false },
    ]) {
      expect(
        evaluateAuthorization(
          context([grant("proposal.accept", { scope: "CLIENT" })], "org-r7", "CLIENT"),
          "proposal.accept",
          resource("client-proposal"),
          command,
        ),
      ).toMatchObject({ decision: "DENY" });
    }
  });

  it("denies invoice issue when any high-risk obligation is missing", () => {
    const valid = {
      action: "issue",
      workflowSatisfied: true,
      reason: "Approved invoice issue",
      recentAuthenticationSatisfied: true,
      mfaSatisfied: true,
      financialEvidencePresent: true,
      separationOfDutySatisfied: true,
    } satisfies AuthorizationCommandContext;
    const incomplete = [
      { ...valid, reason: "" },
      { ...valid, recentAuthenticationSatisfied: false },
      { ...valid, mfaSatisfied: false },
      { ...valid, financialEvidencePresent: false },
      { ...valid, separationOfDutySatisfied: false },
    ];

    for (const command of incomplete) {
      expect(
        evaluateAuthorization(
          context([grant("invoice.issue")]),
          "invoice.issue",
          resource("invoice"),
          command,
        ),
      ).toMatchObject({ decision: "DENY" });
    }
  });

  it("allows only the frozen R7 proposal.accept command with version and SoD evidence", () => {
    const decision = evaluateAuthorization(
      context([grant("proposal.accept", { scope: "CLIENT" })], "org-r7", "CLIENT"),
      "proposal.accept",
      resource("client-proposal"),
      {
        action: "accept",
        workflowSatisfied: true,
        exactVersionMatches: true,
        separationOfDutySatisfied: true,
      },
      { activeStages: new Set(["R5", "R6", "R7"]) },
    );

    expect(decision).toMatchObject({
      decision: "ALLOW",
      permissionKey: "proposal.accept",
    });
  });

  it("restricts proposal.accept to authenticated CLIENT membership and client-shared proposal resources", () => {
    const command = {
      action: "accept",
      workflowSatisfied: true,
      exactVersionMatches: true,
      separationOfDutySatisfied: true,
    } satisfies AuthorizationCommandContext;
    const clientResource = resource("client-proposal");

    expect(
      evaluateAuthorization(
        context([grant("proposal.accept", { scope: "CLIENT" })]),
        "proposal.accept",
        clientResource,
        command,
      ),
    ).toMatchObject({ decision: "DENY", reasonCode: "POLICY_INVALID" });

    expect(
      evaluateAuthorization(
        context([grant("proposal.accept", { scope: "CLIENT" })], "org-r7", "CLIENT"),
        "proposal.accept",
        proposalResource(),
        command,
      ),
    ).toMatchObject({ decision: "DENY", reasonCode: "RESOURCE_DENIED" });

    expect(
      evaluateAuthorization(
        context([grant("proposal.accept", { scope: "CLIENT" })], "org-r7", "CLIENT"),
        "proposal.accept",
        { ...clientResource, clientOrganizationId: "org-foreign" },
        command,
      ),
    ).toMatchObject({ decision: "DENY", reasonCode: "SCOPE_DENIED" });

    expect(
      evaluateAuthorization(
        context([grant("proposal.accept", { scope: "ORG" })], "org-r7", "CLIENT"),
        "proposal.accept",
        clientResource,
        command,
      ),
    ).toMatchObject({ decision: "DENY", reasonCode: "POLICY_INVALID" });
  });

  it("does not let R6 proposal.approve authorize R7 acceptance", () => {
    const decision = evaluateAuthorization(
      context([grant("proposal.approve")]),
      "proposal.approve",
      proposalResource(),
      {
        action: "accept",
        workflowSatisfied: true,
        exactVersionMatches: true,
        separationOfDutySatisfied: true,
      },
      { activeStages: new Set(["R5", "R6", "R7"]) },
    );

    expect(decision).toMatchObject({
      decision: "DENY",
      reasonCode: "WORKFLOW_DENIED",
    });
  });

  it("fails closed for proposal.accept when R7 is not active", () => {
    const decision = evaluateAuthorization(
      context([grant("proposal.accept", { scope: "CLIENT" })], "org-r7", "CLIENT"),
      "proposal.accept",
      resource("client-proposal"),
      {
        action: "accept",
        workflowSatisfied: true,
        exactVersionMatches: true,
        separationOfDutySatisfied: true,
      },
      { activeStages: new Set(["R5", "R6"]) },
    );

    expect(decision).toMatchObject({
      decision: "DENY",
      reasonCode: "WORKFLOW_DENIED",
    });
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
