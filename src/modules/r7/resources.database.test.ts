import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { seedIds } from "../../../prisma/seed/stable-ids";
import type {
  AuthorizedRequestContext,
  MembershipId,
  OrganizationId,
  TenantScopedRequestContext,
  UserId,
} from "@/modules/foundation/request-context";
import { createPrismaClient } from "@/modules/persistence/client";
import { registerCommercialResource, withCommercialTenantTransaction } from "@/modules/commercial/persistence";
import {
  loadClientProposalAcceptanceResource,
  loadR7InvoiceResource,
  loadR7PaymentResource,
  loadR7ProposalResource,
  loadR7ProposalVersionResource,
} from "./resources";

const database = createPrismaClient();
const epoch = new Date("2026-09-29T04:00:00.000Z");
const primaryOrganizationId = crypto.randomUUID();
const foreignOrganizationId = crypto.randomUUID();
const clientOrganizationId = crypto.randomUUID();
const primaryMembershipId = crypto.randomUUID();
const foreignMembershipId = crypto.randomUUID();
const customerMembershipId = crypto.randomUUID();
const samePersonCustomerMembershipId = crypto.randomUUID();
const proposalId = crypto.randomUUID();
const proposalResourceId = crypto.randomUUID();
const proposalVersionId = crypto.randomUUID();
const invoiceId = crypto.randomUUID();
const invoiceResourceId = crypto.randomUUID();
const paymentId = crypto.randomUUID();
const clientAccountId = crypto.randomUUID();
const clientAccountResourceId = crypto.randomUUID();
const customerProposalId = crypto.randomUUID();
const customerProposalResourceId = crypto.randomUUID();
const customerProposalVersionId = crypto.randomUUID();

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

function clientContext(input: {
  organizationId: string;
  membershipId: string;
  userId: string;
  requestId: string;
}): AuthorizedRequestContext {
  const organizationId = input.organizationId as OrganizationId;
  const membershipId = input.membershipId as MembershipId;
  return {
    authentication: "authenticated",
    scope: "authorized",
    requestId: input.requestId,
    identity: { userId: input.userId as UserId },
    session: {
      sessionId: ("r7-client-resource-" + input.requestId) as never,
      issuedAt: epoch,
      expiresAt: new Date(epoch.getTime() + 60 * 60 * 1000),
      authenticationMethod: "TEST",
    },
    membership: { membershipId, organizationId, surface: "CLIENT" },
    tenant: { membershipId, organizationId, surface: "CLIENT" },
    authorization: {
      roleKeys: ["R17"],
      permissions: new Set(),
      blockedPermissions: new Set(),
      grantPaths: [],
    },
  };
}

const customer = clientContext({
  organizationId: clientOrganizationId,
  membershipId: customerMembershipId,
  userId: seedIds.user.asteriaAdmin,
  requestId: "customer",
});
const customerSameAsCreator = clientContext({
  organizationId: clientOrganizationId,
  membershipId: samePersonCustomerMembershipId,
  userId: seedIds.user.operator,
  requestId: "customer-same-as-creator",
});
const unrelatedCustomer = clientContext({
  organizationId: foreignOrganizationId,
  membershipId: foreignMembershipId,
  userId: seedIds.user.asteriaAdmin,
  requestId: "unrelated-customer",
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
      {
        id: clientOrganizationId,
        organizationType: "CLIENT",
        legalName: "R7 Resource Client",
        displayName: "R7 Resource Client",
        slug: "r7-resource-client-" + clientOrganizationId.slice(0, 8),
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
      {
        id: customerMembershipId,
        organizationId: clientOrganizationId,
        userAccountId: seedIds.user.asteriaAdmin,
        membershipType: "CLIENT",
        status: "ACTIVE",
        joinedAt: epoch,
      },
      {
        id: samePersonCustomerMembershipId,
        organizationId: clientOrganizationId,
        userAccountId: seedIds.user.operator,
        membershipType: "CLIENT",
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
    await registerCommercialResource(transaction, {
      id: clientAccountResourceId,
      type: "client-account",
      title: "R7 resource test client",
      clientOrganizationId,
      sensitivity: "CONFIDENTIAL",
    });
    await transaction.$executeRawUnsafe(
      `INSERT INTO commercial.client_accounts
       (id, resource_id, owner_organization_id, client_organization_id,
        visibility, sensitivity, portal_state, updated_at)
       VALUES ($1::uuid, $2::uuid, $3::uuid, $4::uuid,
               'INTERNAL', 'CONFIDENTIAL', 'PROVISIONED', $5::timestamptz)`,
      clientAccountId,
      clientAccountResourceId,
      primaryOrganizationId,
      clientOrganizationId,
      epoch,
    );
    await transaction.$executeRawUnsafe(
      `INSERT INTO commercial.proposals
       (id, resource_id, owner_organization_id, deal_id, client_account_id,
        status, current_version, currency, row_version, created_by_membership_id)
       VALUES ($1::uuid, $2::uuid, $3::uuid, $4::uuid, $5::uuid,
               'SENT', 1, 'USD', 3, $6::uuid)`,
      customerProposalId,
      customerProposalResourceId,
      primaryOrganizationId,
      crypto.randomUUID(),
      clientAccountId,
      primaryMembershipId,
    );
    await transaction.$executeRawUnsafe(
      `INSERT INTO commercial.proposal_versions
       (id, owner_organization_id, proposal_id, version, status, issued_at,
        immutable, currency, subtotal_minor, tax_minor, total_minor)
       VALUES ($1::uuid, $2::uuid, $3::uuid, 1, 'SENT', $4::timestamptz,
               true, 'USD', 100, 0, 100)`,
      customerProposalVersionId,
      primaryOrganizationId,
      customerProposalId,
      epoch,
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

  it("resolves customer acceptance only for the related active client identity and exact sent version", async () => {
    expect(
      await loadClientProposalAcceptanceResource(customer, customerProposalId, database),
    ).toMatchObject({
      proposalId: customerProposalId,
      proposalVersionId: customerProposalVersionId,
      currentVersion: 1,
      rowVersion: 3,
      separationOfDutySatisfied: true,
      authorizationResource: {
        resourceType: "client-proposal",
        resourceId: customerProposalResourceId,
        ownerOrganizationId: primaryOrganizationId,
        clientOrganizationId,
        lifecycleState: "SENT",
        version: 1,
      },
    });
    expect(
      await loadClientProposalAcceptanceResource(unrelatedCustomer, customerProposalId, database),
    ).toBeNull();
    expect(
      await loadClientProposalAcceptanceResource(
        customerSameAsCreator,
        customerProposalId,
        database,
      ),
    ).toBeNull();

    await database.organizationMembership.update({
      where: { id: customerMembershipId },
      data: { status: "SUSPENDED" },
    });
    expect(
      await loadClientProposalAcceptanceResource(customer, customerProposalId, database),
    ).toBeNull();
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
