import { describe, expect, it, vi } from "vitest";

import type { PrismaClient } from "@/generated/prisma/client";
import type {
  AuthorizedRequestContext,
  MembershipId,
  OrganizationId,
  SessionId,
  UserId,
} from "@/modules/foundation/request-context";

import {
  listAuthorizedCompanies,
  listAuthorizedContacts,
  listDiscoverableLeadSources,
  projectR6ReadableFields,
} from "./queries";

function context(): AuthorizedRequestContext {
  const organizationId = "org-r6" as OrganizationId;
  const membershipId = "membership-r6" as MembershipId;

  return {
    authentication: "authenticated",
    scope: "authorized",
    requestId: "r6-query-test",
    identity: { userId: "user-r6" as UserId },
    session: {
      sessionId: "session-r6" as SessionId,
      issuedAt: new Date("2026-09-27T10:00:00.000Z"),
      expiresAt: new Date("2026-09-27T11:00:00.000Z"),
      authenticationMethod: "password",
    },
    membership: { membershipId, organizationId, surface: "TEAM" },
    tenant: { membershipId, organizationId, surface: "TEAM" },
    authorization: {
      roleKeys: [],
      permissions: new Set(),
      blockedPermissions: new Set(),
      grantPaths: [],
      actorDepartmentId: "dept-r6",
    },
  };
}

describe("R6 API canonical field projection", () => {
  it("drops serializer fields that canonical authorization did not approve", () => {
    const projected = projectR6ReadableFields(
      {
        id: "lead-1",
        resourceId: "resource-1",
        lifecycleState: "QUALIFIED",
        updatedAt: "should-never-leak",
        providerSecret: "should-never-leak",
      },
      ["id", "resourceId", "lifecycleState"],
    );

    expect(projected).toEqual({
      id: "lead-1",
      resourceId: "resource-1",
      lifecycleState: "QUALIFIED",
    });
    expect(projected).not.toHaveProperty("updatedAt");
    expect(projected).not.toHaveProperty("providerSecret");
  });

  it.each([
    ["companies", "crmCompany", listAuthorizedCompanies],
    ["contacts", "crmContact", listAuthorizedContacts],
    ["lead sources", "crmLeadSource", listDiscoverableLeadSources],
  ] as const)(
    "hard-binds %s list candidates to the selected tenant",
    async (_name, modelName, query) => {
      const findMany = vi.fn().mockResolvedValue([]);
      const database = {
        [modelName]: { findMany },
      } as unknown as PrismaClient;

      await query(context(), 25, database);

      expect(findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            ownerOrganizationId: "org-r6",
            archivedAt: null,
          },
          take: 100,
        }),
      );
    },
  );

  it("does not select contact email or phone PII for list serialization", async () => {
    const findMany = vi.fn().mockResolvedValue([]);
    const database = {
      crmContact: { findMany },
    } as unknown as PrismaClient;

    await listAuthorizedContacts(context(), 10, database);

    const call = findMany.mock.calls[0]?.[0] as {
      select?: Record<string, boolean>;
    };
    expect(call.select).toBeDefined();
    expect(call.select).not.toHaveProperty("emailOriginal");
    expect(call.select).not.toHaveProperty("emailNormalized");
    expect(call.select).not.toHaveProperty("phoneNormalized");
  });
});
