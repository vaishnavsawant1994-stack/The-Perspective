import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { seedIds } from "../../../prisma/seed/stable-ids";
import type {
  MembershipId,
  OrganizationId,
  TenantScopedRequestContext,
  UserId,
} from "@/modules/foundation/request-context";
import { createPrismaClient } from "@/modules/persistence/client";
import {
  countTenantProposals,
  insertDraftProposal,
  insertProduct,
} from "./persistence";

const database = createPrismaClient();
const epoch = new Date("2026-09-28T19:00:00.000Z");
const primaryOrganizationId = crypto.randomUUID();
const secondaryOrganizationId = crypto.randomUUID();
const primaryMembershipId = crypto.randomUUID();
const secondaryMembershipId = crypto.randomUUID();
const dealId = crypto.randomUUID();

const REQUIRED_TABLES = [
  "commercial.products",
  "commercial.proposals",
  "commercial.proposal_versions",
  "commercial.proposal_lines",
] as const;

function teamContext(input: {
  organizationId: string;
  membershipId: string;
  userId: string;
  requestId: string;
}): TenantScopedRequestContext {
  return {
    authentication: "authenticated",
    scope: "tenant",
    requestId: input.requestId,
    identity: { userId: input.userId as UserId },
    session: {
      sessionId: ("r7-finance-" + input.requestId) as never,
      issuedAt: epoch,
      expiresAt: new Date(epoch.getTime() + 60 * 60 * 1000),
      authenticationMethod: "TEST",
    },
    membership: {
      membershipId: input.membershipId as MembershipId,
      organizationId: input.organizationId as OrganizationId,
      surface: "TEAM",
    },
    tenant: {
      organizationId: input.organizationId as OrganizationId,
      membershipId: input.membershipId as MembershipId,
      surface: "TEAM",
    },
  };
}

const platform = teamContext({
  organizationId: primaryOrganizationId,
  membershipId: primaryMembershipId,
  userId: seedIds.user.operator,
  requestId: "r7-finance-platform",
});

const foreign = teamContext({
  organizationId: secondaryOrganizationId,
  membershipId: secondaryMembershipId,
  userId: seedIds.user.asteriaAdmin,
  requestId: "r7-finance-foreign",
});

beforeAll(async () => {
  for (const relation of REQUIRED_TABLES) {
    const present = await database.$queryRawUnsafe<Array<{ exists: boolean | null }>>(
      `SELECT to_regclass($1::text) IS NOT NULL AS exists`,
      relation,
    );
    expect(present[0]?.exists, `${relation} must exist after R7 migrate`).toBe(true);
  }

  await database.organization.createMany({
    data: [
      {
        id: primaryOrganizationId,
        organizationType: "PLATFORM",
        legalName: "R7 Finance Primary Test Org",
        displayName: "R7 Finance Primary",
        slug: "r7-finance-primary-" + primaryOrganizationId.slice(0, 8),
        status: "ACTIVE",
      },
      {
        id: secondaryOrganizationId,
        organizationType: "PLATFORM",
        legalName: "R7 Finance Secondary Test Org",
        displayName: "R7 Finance Secondary",
        slug: "r7-finance-secondary-" + secondaryOrganizationId.slice(0, 8),
        status: "ACTIVE",
      },
    ],
  });
  await database.organizationMembership.createMany({
    data: [
      {
        id: primaryMembershipId,
        organizationId: primaryOrganizationId,
        userAccountId: seedIds.user.operator,
        membershipType: "STAFF",
        status: "ACTIVE",
        joinedAt: epoch,
      },
      {
        id: secondaryMembershipId,
        organizationId: secondaryOrganizationId,
        userAccountId: seedIds.user.asteriaAdmin,
        membershipType: "STAFF",
        status: "ACTIVE",
        joinedAt: epoch,
      },
    ],
  });
});

afterAll(async () => {
  await database.$disconnect();
});

describe("R7 finance persistence", () => {
  it("persists a draft proposal and hides it from a foreign tenant", async () => {
    const product = await insertProduct(
      platform,
      {
        key: "magazine-pack",
        name: "Magazine pack",
        currency: "USD",
        unitAmountMinor: 150000n,
      },
      database,
    );
    expect(product.id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    );

    const created = await insertDraftProposal(
      platform,
      {
        dealId,
        currency: "USD",
        lines: [{ description: "Magazine pack", quantity: 2, unitAmountMinor: 150000n }],
      },
      database,
    );
    expect(created).toMatchObject({
      kind: "ok",
      value: { totalMinor: 300000n },
    });
    if (created.kind !== "ok") return;

    const rows = await database.$queryRawUnsafe<Array<{ total_minor: bigint }>>(
      `SELECT total_minor FROM commercial.proposal_versions WHERE id = $1::uuid`,
      created.value.versionId,
    );
    expect(rows[0]?.total_minor).toBe(300000n);

    expect(await countTenantProposals(platform, database)).toBeGreaterThanOrEqual(1);
    expect(await countTenantProposals(foreign, database)).toBe(0);
  });
});
