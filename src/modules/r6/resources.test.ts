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
  buildProspectiveR6Resource,
  loadR6CampaignResource,
  loadR6DealResource,
  loadR6LeadResource,
} from "./resources";

function context(): AuthorizedRequestContext {
  const organizationId = "org-r6" as OrganizationId;
  const membershipId = "membership-r6" as MembershipId;

  return {
    authentication: "authenticated",
    scope: "authorized",
    requestId: "r6-resource-test",
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
      roleKeys: [],
      permissions: new Set(),
      blockedPermissions: new Set(),
      grantPaths: [],
      actorDepartmentId: "dept-r6",
    },
  };
}

describe("R6 API trusted resource derivation", () => {
  it("builds prospective authority only from the selected server context", () => {
    expect(
      buildProspectiveR6Resource(
        context(),
        "lead",
        "CONFIDENTIAL",
        "NEW",
      ),
    ).toMatchObject({
      resourceType: "lead",
      ownerOrganizationId: "org-r6",
      ownerMembershipId: "membership-r6",
      departmentId: "dept-r6",
      visibility: "INTERNAL",
      sensitivity: "CONFIDENTIAL",
      lifecycleState: "NEW",
      version: 0,
    });
  });

  it.each([
    [
      "lead",
      loadR6LeadResource,
      "crmLead",
    ],
    [
      "campaign",
      loadR6CampaignResource,
      "commsOutreachCampaign",
    ],
    [
      "deal",
      loadR6DealResource,
      "commercialDeal",
    ],
  ] as const)(
    "constrains %s object lookup to the selected owner organization",
    async (_name, loader, modelName) => {
      const findFirst = vi.fn().mockResolvedValue(null);
      const database = {
        [modelName]: { findFirst },
      } as unknown as PrismaClient;

      await loader(
        context(),
        "00000000-0000-4000-8000-000000000010",
        database,
      );

      expect(findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            id: "00000000-0000-4000-8000-000000000010",
            ownerOrganizationId: "org-r6",
            archivedAt: null,
          },
        }),
      );
    },
  );
});
