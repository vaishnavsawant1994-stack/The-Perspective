import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { seedIds } from "../../../prisma/seed/stable-ids";
import type {
  MembershipId,
  OrganizationId,
  TenantScopedRequestContext,
  UserId,
} from "@/modules/foundation/request-context";
import { createPrismaClient } from "@/modules/persistence/client";
import { withCommercialTenantTransaction } from "@/modules/commercial/persistence";
import {
  loadR7InvoiceResource,
  loadR7PaymentResource,
  loadR7ProposalResource,
  loadR7ProposalVersionResource,
} from "./resources";

const database = createPrismaClient();
const epoch = new Date("2026-09-29T04:00:00.000Z");
const primaryOrganizationId = crypto.randomUUID();
const foreignOrganizationId = crypto.randomUUID();
const primaryMembershipId = crypto.randomUUID();
const foreignMembershipId = crypto.randomUUID();
const proposalId = crypto.randomUUID();
const proposalResourceId = crypto.randomUUID();
const proposalVersionId = crypto.randomUUID();
const invoiceId = crypto.randomUUID();
const invoiceResourceId = crypto.randomUUID();
const paymentId = crypto.randomUUID();

function context(input: {
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
      sessionId: ("r7-resource-" + input.requestId) as never,
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

const primary = context({
  organizationId: primaryOrganizationId,
  membershipId: primaryMembershipId,
  userId: seedIds.user.operator,
  requestId: "primary",
});
const foreign = context({
  organizationId: foreignOrganizationId,
  membershipId: foreignMembershipId,
  userId: seedIds.user.asteriaAdmin,
  requestId: "foreign",
});

beforeAll(async () => {
  await database.organization.createMany({
    data: [
      {
        id: primaryOrganizationId,
        organizationType: "PLATFORM",
        legalName: "R7 Resource Primary",
        displayName: "R7 Resource Primary",
        slug: "r7-resource-primary-" + primaryOrganizationId.slice(0, 8),
        status: "ACTIVE",
      },
      {
        id: foreignOrganizationId,
        organizationType: "PLATFORM",
        legalName: "R7 Resource Foreign",
        displayName: "R7 Resource Foreign",
        slug: "r7-resource-foreign-" + foreignOrganizationId.slice(0, 8),
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
        id: foreignMembershipId,
        organizationId: foreignOrganizationId,
        userAccountId: seedIds.user.asteriaAdmin,
        membershipType: "STAFF",
        status: "ACTIVE",
        joinedAt: epoch,
      },
    ],
  });

  await withCommercialTenantTransaction(primary, async (transaction) => {
    await transaction.$executeRawUnsafe(
      `INSERT INTO commercial.proposals
       (id, resource_id, owner_organization_id, deal_id, status, current_version, currency)
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
       VALUES ($1::uuid, $2::uuid, $3::uuid, 1, 'DRAFT', false, 'USD', 100, 0, 100)`,
      proposalVersionId,
      primaryOrganizationId,
      proposalId,
    );
    await transaction.$executeRawUnsafe(
      `INSERT INTO commercial.invoices
       (id, resource_id, owner_organization_id, client_account_id, status,
        currency, total_minor)
       VALUES ($1::uuid, $2::uuid, $3::uuid, $4::uuid, 'DRAFT', 'USD', 100)`,
      invoiceId,
      invoiceResourceId,
      primaryOrganizationId,
      crypto.randomUUID(),
    );
    await transaction.$executeRawUnsafe(
      `INSERT INTO commercial.payments
       (id, owner_organization_id, invoice_id, provider, status, currency, amount_minor)
       VALUES ($1::uuid, $2::uuid, $3::uuid, 'test', 'CREATED', 'USD', 100)`,
      paymentId,
      primaryOrganizationId,
      invoiceId,
    );
  });
});

afterAll(async () => {
  await database.$disconnect();
});

describe("R7 trusted resource loaders", () => {
  it("loads canonical proposal and version metadata and hides them from a foreign tenant", async () => {
    const proposal = await loadR7ProposalResource(primary, proposalId, database);
    expect(proposal).toMatchObject({
      resourceId: proposalResourceId,
      resourceType: "proposal",
      ownerOrganizationId: primaryOrganizationId,
      lifecycleState: "DRAFT",
      version: 1,
      sensitivity: "FINANCIAL",
    });
    expect(await loadR7ProposalResource(foreign, proposalId, database)).toBeNull();

    const version = await loadR7ProposalVersionResource(primary, proposalVersionId, database);
    expect(version).toMatchObject({
      resourceId: proposalVersionId,
      resourceType: "proposal-version",
      ownerOrganizationId: primaryOrganizationId,
      lifecycleState: "DRAFT",
      version: 1,
    });
    expect(await loadR7ProposalVersionResource(foreign, proposalVersionId, database)).toBeNull();
  });

  it("hides invoice and payment resources across tenant boundaries", async () => {
    expect(await loadR7InvoiceResource(primary, invoiceId, database)).toMatchObject({
      resourceId: invoiceResourceId,
      resourceType: "invoice",
      ownerOrganizationId: primaryOrganizationId,
      lifecycleState: "DRAFT",
      version: 1,
    });
    expect(await loadR7InvoiceResource(foreign, invoiceId, database)).toBeNull();

    expect(await loadR7PaymentResource(primary, paymentId, database)).toMatchObject({
      resourceId: paymentId,
      resourceType: "payment",
      ownerOrganizationId: primaryOrganizationId,
      lifecycleState: "CREATED",
      sensitivity: "FINANCIAL",
    });
    expect(await loadR7PaymentResource(foreign, paymentId, database)).toBeNull();
  });

  it("fails closed when payment points to an invoice outside its tenant", async () => {
    const brokenPaymentId = crypto.randomUUID();
    await withCommercialTenantTransaction(primary, async (transaction) => {
      await transaction.$executeRawUnsafe(
        `INSERT INTO commercial.payments
         (id, owner_organization_id, invoice_id, provider, status, currency, amount_minor)
         VALUES ($1::uuid, $2::uuid, $3::uuid, 'test', 'CREATED', 'USD', 100)`,
        brokenPaymentId,
        primaryOrganizationId,
        crypto.randomUUID(),
      );
    });
    expect(await loadR7PaymentResource(primary, brokenPaymentId, database)).toBeNull();
  });
});
