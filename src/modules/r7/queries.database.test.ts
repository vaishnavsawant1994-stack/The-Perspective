import { afterAll, beforeAll, describe, expect, it } from "vitest";

import type {
  AuthorizedRequestContext,
  EffectiveAuthorizationGrant,
  MembershipId,
  OrganizationId,
  PermissionKey,
  SessionId,
  UserId,
} from "@/modules/foundation/request-context";
import { createPrismaClient } from "@/modules/persistence/client";
import { withCommercialTenantTransaction } from "@/modules/commercial/persistence";
import {
  getAuthorizedProposal,
  listAuthorizedProposals,
} from "./queries";

const database = createPrismaClient();
const epoch = new Date("2026-09-29T04:00:00.000Z");
const primaryOrganizationId = crypto.randomUUID();
const foreignOrganizationId = crypto.randomUUID();
const proposalId = crypto.randomUUID();
const proposalResourceId = crypto.randomUUID();
const versionId = crypto.randomUUID();
const foreignProposalId = crypto.randomUUID();
const foreignProposalResourceId = crypto.randomUUID();

function context(
  organizationId: string,
  permissionKey: "proposal.view",
): AuthorizedRequestContext {
  const membershipId = crypto.randomUUID() as MembershipId;
  const grant: EffectiveAuthorizationGrant = {
    membershipRoleId: crypto.randomUUID(),
    roleId: crypto.randomUUID(),
    roleKey: "R07",
    permissionKey: permissionKey as PermissionKey,
    effect: "ALLOW",
    scope: "ORG",
    constraints: {},
    validFrom: epoch,
    validUntil: null,
  };
  const organization = organizationId as OrganizationId;

  return {
    authentication: "authenticated",
    scope: "authorized",
    requestId: crypto.randomUUID(),
    identity: { userId: crypto.randomUUID() as UserId },
    session: {
      sessionId: crypto.randomUUID() as SessionId,
      issuedAt: epoch,
      expiresAt: new Date(epoch.getTime() + 60 * 60 * 1000),
      authenticationMethod: "TEST",
    },
    membership: {
      membershipId,
      organizationId: organization,
      surface: "TEAM",
    },
    tenant: {
      organizationId: organization,
      membershipId,
      surface: "TEAM",
    },
    authorization: {
      roleKeys: ["R07"],
      permissions: new Set([permissionKey as PermissionKey]),
      blockedPermissions: new Set(),
      grantPaths: [grant],
    },
  };
}

const primary = context(primaryOrganizationId, "proposal.view");
const foreign = context(foreignOrganizationId, "proposal.view");

beforeAll(async () => {
  await withCommercialTenantTransaction(primary, async (transaction) => {
    await transaction.$executeRawUnsafe(
      `INSERT INTO commercial.proposals
       (id, resource_id, owner_organization_id, deal_id, status,
        current_version, currency)
       VALUES ($1::uuid, $2::uuid, $3::uuid, $4::uuid, 'DRAFT', 1, 'USD')`,
      proposalId,
      proposalResourceId,
      primaryOrganizationId,
      crypto.randomUUID(),
    );
    await transaction.$executeRawUnsafe(
      `INSERT INTO commercial.proposal_versions
       (id, owner_organization_id, proposal_id, version, status, immutable,
        currency, subtotal_minor, tax_minor, total_minor)
       VALUES ($1::uuid, $2::uuid, $3::uuid, 1, 'DRAFT', false, 'USD', 2500, 0, 2500)`,
      versionId,
      primaryOrganizationId,
      proposalId,
    );
    await transaction.$executeRawUnsafe(
      `INSERT INTO commercial.proposal_lines
       (id, owner_organization_id, proposal_version_id, description,
        quantity, unit_amount_minor, line_total_minor, position)
       VALUES ($1::uuid, $2::uuid, $3::uuid, 'Editorial package', 1, 2500, 2500, 1)`,
      crypto.randomUUID(),
      primaryOrganizationId,
      versionId,
    );
  });

  await withCommercialTenantTransaction(foreign, async (transaction) => {
    await transaction.$executeRawUnsafe(
      `INSERT INTO commercial.proposals
       (id, resource_id, owner_organization_id, deal_id, status,
        current_version, currency)
       VALUES ($1::uuid, $2::uuid, $3::uuid, $4::uuid, 'DRAFT', 1, 'USD')`,
      foreignProposalId,
      foreignProposalResourceId,
      foreignOrganizationId,
      crypto.randomUUID(),
    );
  });
});

afterAll(async () => {
  await database.$disconnect();
});

describe("R7 proposal read queries", () => {
  it("returns only tenant-owned, policy-readable list fields", async () => {
    const proposals = await listAuthorizedProposals(primary, 20, database);
    expect(proposals).toHaveLength(1);
    expect(proposals[0]).toEqual({
      id: proposalId,
      status: "DRAFT",
      currency: "USD",
      dealId: expect.any(String),
      currentVersion: 1,
      rowVersion: 1,
    });
    expect(proposals[0]).not.toHaveProperty("ownerOrganizationId");
    expect(await listAuthorizedProposals(foreign, 20, database)).toHaveLength(1);
  });

  it("returns versioned integer-minor-unit line projections and conceals foreign ids", async () => {
    const proposal = await getAuthorizedProposal(primary, proposalId, database);
    expect(proposal).toMatchObject({
      proposal: {
        id: proposalId,
        status: "DRAFT",
        currentVersion: 1,
        rowVersion: 1,
      },
      version: {
        id: versionId,
        status: "DRAFT",
        subtotalMinor: "2500",
        taxMinor: "0",
        totalMinor: "2500",
        version: 1,
      },
      lines: [
        {
          description: "Editorial package",
          quantity: 1,
          unitAmountMinor: "2500",
          lineTotalMinor: "2500",
          position: 1,
        },
      ],
    });
    expect(proposal).not.toHaveProperty("ownerOrganizationId");
    expect(await getAuthorizedProposal(foreign, proposalId, database)).toBeNull();
    expect(await getAuthorizedProposal(primary, foreignProposalId, database)).toBeNull();
  });
});
