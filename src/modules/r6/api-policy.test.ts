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
import { evaluateAuthorization } from "@/modules/authorization/policy";
import type { CanonicalPermissionKey } from "@/modules/authorization/registry";

function grant(permissionKey: CanonicalPermissionKey): EffectiveAuthorizationGrant {
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
  };
}

function context(permissionKey: CanonicalPermissionKey): AuthorizedRequestContext {
  const organizationId = "org-r6" as OrganizationId;
  const membershipId = "membership-r6" as MembershipId;
  const path = grant(permissionKey);

  return {
    authentication: "authenticated",
    scope: "authorized",
    requestId: "r6-api-policy-test",
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
      permissions: new Set([path.permissionKey]),
      blockedPermissions: new Set(),
      grantPaths: [path],
      actorDepartmentId: "dept-r6",
    },
  };
}

function resource(resourceType: string, sensitivity: "STANDARD" | "CONFIDENTIAL" | "PII") {
  return {
    resourceType,
    ownerOrganizationId: "org-r6",
    ownerMembershipId: "membership-r6",
    departmentId: "dept-r6",
    visibility: "INTERNAL" as const,
    sensitivity,
    lifecycleState: "ACTIVE",
    version: 0,
  };
}

describe("R6 API canonical mutation fields", () => {
  it("allows browser company creation only through canonical mutable fields", () => {
    expect(
      evaluateAuthorization(
        context("company.edit"),
        "company.edit",
        resource("company", "STANDARD"),
        {
          action: "create",
          requestedFields: ["name", "domain", "industry", "country"],
        },
      ).decision,
    ).toBe("ALLOW");
  });

  it("rejects provider-owned lead sourceRecordKey from browser mutation", () => {
    expect(
      evaluateAuthorization(
        context("lead.edit"),
        "lead.edit",
        resource("lead", "CONFIDENTIAL"),
        {
          action: "create",
          requestedFields: ["companyId", "sourceRecordKey"],
        },
      ),
    ).toMatchObject({
      decision: "DENY",
      reasonCode: "FIELD_DENIED",
    });
  });

  it.each(["emailOriginal", "emailNormalized", "phoneNormalized"] as const)(
    "rejects protected contact field %s from browser mutation",
    (field) => {
      expect(
        evaluateAuthorization(
          context("contact.edit"),
          "contact.edit",
          resource("contact", "PII"),
          {
            action: "create",
            requestedFields: ["title", field],
          },
        ),
      ).toMatchObject({
        decision: "DENY",
        reasonCode: "FIELD_DENIED",
      });
    },
  );

  it("allows the declared deal-create API fields for an authorized same-tenant pipeline", () => {
    expect(
      evaluateAuthorization(
        context("deal.edit"),
        "deal.edit",
        {
          ...resource("deal", "CONFIDENTIAL"),
          sensitivity: "FINANCIAL",
        },
        {
          action: "create",
          requestedFields: [
            "pipelineId",
            "companyId",
            "primaryContactId",
            "amountMinor",
            "currency",
            "probability",
            "expectedCloseDate",
          ],
        },
      ).decision,
    ).toBe("ALLOW");
  });

  it("treats deal pipelineId as create-only rather than generally mutable", () => {
    expect(
      evaluateAuthorization(
        context("deal.edit"),
        "deal.edit",
        {
          ...resource("deal", "CONFIDENTIAL"),
          sensitivity: "FINANCIAL",
        },
        {
          action: "update",
          requestedFields: ["pipelineId"],
        },
      ),
    ).toMatchObject({
      decision: "DENY",
      reasonCode: "FIELD_DENIED",
    });
  });

  it("allows lead-source sourceType only while creating the source", () => {
    expect(
      evaluateAuthorization(
        context("source.manage"),
        "source.manage",
        resource("lead-source", "CONFIDENTIAL"),
        {
          action: "create",
          requestedFields: ["sourceType", "name"],
        },
      ).decision,
    ).toBe("ALLOW");

    expect(
      evaluateAuthorization(
        context("source.manage"),
        "source.manage",
        resource("lead-source", "CONFIDENTIAL"),
        {
          action: "update",
          requestedFields: ["sourceType"],
        },
      ),
    ).toMatchObject({
      decision: "DENY",
      reasonCode: "FIELD_DENIED",
    });
  });

  it("allows lead-list listType only on create and keeps memberCount server-owned", () => {
    expect(
      evaluateAuthorization(
        context("lead.list.manage"),
        "lead.list.manage",
        resource("lead-list", "CONFIDENTIAL"),
        {
          action: "create",
          requestedFields: ["name", "listType", "filterDefinition"],
        },
      ).decision,
    ).toBe("ALLOW");

    expect(
      evaluateAuthorization(
        context("lead.list.manage"),
        "lead.list.manage",
        resource("lead-list", "CONFIDENTIAL"),
        {
          action: "update",
          requestedFields: ["listType"],
        },
      ),
    ).toMatchObject({
      decision: "DENY",
      reasonCode: "FIELD_DENIED",
    });

    expect(
      evaluateAuthorization(
        context("lead.list.manage"),
        "lead.list.manage",
        resource("lead-list", "CONFIDENTIAL"),
        {
          action: "create",
          requestedFields: ["name", "memberCount"],
        },
      ),
    ).toMatchObject({
      decision: "DENY",
      reasonCode: "FIELD_DENIED",
    });
  });

  it("keeps authorized reads of server-owned fields available", () => {
    expect(
      evaluateAuthorization(
        context("lead.view"),
        "lead.view",
        resource("lead", "CONFIDENTIAL"),
        {
          action: "view",
          requestedFields: ["lifecycleState", "fitScore"],
        },
      ).decision,
    ).toBe("ALLOW");
  });

  it("rejects authority fields even if a route accidentally forwards them", () => {
    expect(
      evaluateAuthorization(
        context("company.edit"),
        "company.edit",
        resource("company", "STANDARD"),
        {
          action: "create",
          requestedFields: ["name", "ownerOrganizationId"],
        },
      ),
    ).toMatchObject({
      decision: "DENY",
      reasonCode: "FIELD_DENIED",
    });
  });
});
