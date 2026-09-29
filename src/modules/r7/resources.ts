import "server-only";

import type { PrismaClient } from "@/generated/prisma/client";
import type { AuthorizedRequestContext } from "@/modules/foundation/request-context";
import type { CommercialContext } from "@/modules/commercial/persistence";
import {
  withCommercialTenantTransaction,
} from "@/modules/commercial/persistence";
import { getPrismaClient } from "@/modules/persistence/client";
import type { AuthorizationResourceContext } from "@/modules/authorization/types";

type R7ResourceRow = {
  readonly id: string;
  readonly resource_id?: string;
  readonly owner_organization_id: string;
  readonly status: string;
  readonly row_version?: number;
  readonly version?: number;
  readonly updated_at?: Date;
};

function resourceContext(
  row: R7ResourceRow,
  resourceType: "proposal" | "proposal-version" | "invoice" | "payment",
): AuthorizationResourceContext {
  return {
    resourceId: row.resource_id ?? row.id,
    resourceType,
    ownerOrganizationId: row.owner_organization_id,
    clientOrganizationId: null,
    visibility: "INTERNAL",
    sensitivity: "FINANCIAL",
    lifecycleState: row.status,
    version: row.row_version ?? row.version ?? row.updated_at?.toISOString() ?? null,
  };
}

export async function loadR7ProposalResource(
  context: TenantScopedRequestContext,
  proposalId: string,
  database: PrismaClient = getPrismaClient(),
): Promise<AuthorizationResourceContext | null> {
  const row = await withCommercialTenantTransaction(
    context,
    async (transaction) => {
      const rows = await transaction.$queryRawUnsafe<R7ResourceRow[]>(
        `SELECT id, resource_id, owner_organization_id, status, row_version
         FROM commercial.proposals
         WHERE id = $1::uuid
           AND owner_organization_id = $2::uuid
           AND archived_at IS NULL`,
        proposalId,
        context.tenant.organizationId,
      );
      return rows[0] ?? null;
    },
    database,
  );
  return row ? resourceContext(row, "proposal") : null;
}

export interface ClientProposalAcceptanceResource {
  readonly proposalId: string;
  readonly proposalVersionId: string;
  readonly currentVersion: number;
  readonly rowVersion: number;
  readonly authorizationResource: AuthorizationResourceContext;
  readonly separationOfDutySatisfied: true;
}

type ClientProposalAcceptanceRow = {
  readonly proposal_id: string;
  readonly proposal_resource_id: string;
  readonly owner_organization_id: string;
  readonly client_organization_id: string;
  readonly proposal_status: string;
  readonly current_version: number;
  readonly row_version: number;
  readonly proposal_version_id: string;
  readonly proposal_version: number;
};

/**
 * Loads the canonical client relationship and exact current immutable version.
 * The only caller-controlled identifier is the proposal ID. Tenant, user and
 * membership identifiers come from the resolved authenticated CLIENT context.
 */
export async function loadClientProposalAcceptanceResource(
  context: AuthorizedRequestContext,
  proposalId: string,
  database: PrismaClient = getPrismaClient(),
): Promise<ClientProposalAcceptanceResource | null> {
  if (
    context.authentication !== "authenticated" ||
    context.membership.surface !== "CLIENT" ||
    context.tenant.surface !== "CLIENT" ||
    context.membership.membershipId !== context.tenant.membershipId ||
    context.membership.organizationId !== context.tenant.organizationId
  ) {
    return null;
  }

  const rows = await database.$queryRawUnsafe<ClientProposalAcceptanceRow[]>(
    `SELECT proposal.id AS proposal_id,
            proposal.resource_id AS proposal_resource_id,
            proposal.owner_organization_id,
            client_account.client_organization_id,
            proposal.status AS proposal_status,
            proposal.current_version,
            proposal.row_version,
            version.id AS proposal_version_id,
            version.version AS proposal_version
     FROM commercial.proposals AS proposal
     JOIN commercial.client_accounts AS client_account
       ON client_account.id = proposal.client_account_id
      AND client_account.owner_organization_id = proposal.owner_organization_id
      AND client_account.archived_at IS NULL
     JOIN iam.organization_memberships AS customer_membership
       ON customer_membership.id = $3::uuid
      AND customer_membership.organization_id = client_account.client_organization_id
      AND customer_membership.user_account_id = $4::uuid
      AND customer_membership.membership_type = 'CLIENT'
      AND customer_membership.status = 'ACTIVE'
     JOIN iam.organization_memberships AS creator_membership
       ON creator_membership.id = proposal.created_by_membership_id
      AND creator_membership.organization_id = proposal.owner_organization_id
      AND creator_membership.user_account_id <> customer_membership.user_account_id
     JOIN commercial.proposal_versions AS version
       ON version.proposal_id = proposal.id
      AND version.owner_organization_id = proposal.owner_organization_id
      AND version.version = proposal.current_version
     WHERE proposal.id = $1::uuid
       AND client_account.client_organization_id = $2::uuid
       AND proposal.archived_at IS NULL
       AND proposal.status IN ('SENT', 'VIEWED')
       AND version.status IN ('SENT', 'VIEWED')
       AND version.immutable IS TRUE
       AND version.issued_at IS NOT NULL
     LIMIT 1`,
    proposalId,
    context.tenant.organizationId,
    context.membership.membershipId,
    context.identity.userId,
  );

  const row = rows[0];
  if (!row || row.client_organization_id !== context.tenant.organizationId) {
    return null;
  }

  return {
    proposalId: row.proposal_id,
    proposalVersionId: row.proposal_version_id,
    currentVersion: row.current_version,
    rowVersion: row.row_version,
    separationOfDutySatisfied: true,
    authorizationResource: {
      resourceType: "client-proposal",
      resourceId: row.proposal_resource_id,
      ownerOrganizationId: row.owner_organization_id,
      clientOrganizationId: row.client_organization_id,
      visibility: "CLIENT_SHARED",
      sensitivity: "FINANCIAL",
      lifecycleState: row.proposal_status,
      version: row.current_version,
    },
  };
}

export async function loadR7ProposalVersionResource(
  context: TenantScopedRequestContext,
  proposalVersionId: string,
  database: PrismaClient = getPrismaClient(),
): Promise<AuthorizationResourceContext | null> {
  const row = await withCommercialTenantTransaction(
    context,
    async (transaction) => {
      const rows = await transaction.$queryRawUnsafe<R7ResourceRow[]>(
        `SELECT version.id, version.owner_organization_id, version.status,
                version.version
         FROM commercial.proposal_versions AS version
         JOIN commercial.proposals AS proposal
           ON proposal.id = version.proposal_id
          AND proposal.owner_organization_id = version.owner_organization_id
         WHERE version.id = $1::uuid
           AND version.owner_organization_id = $2::uuid
           AND proposal.owner_organization_id = $2::uuid
           AND proposal.archived_at IS NULL`,
        proposalVersionId,
        context.tenant.organizationId,
      );
      return rows[0] ?? null;
    },
    database,
  );
  return row ? resourceContext(row, "proposal-version") : null;
}

export async function loadR7InvoiceResource(
  context: TenantScopedRequestContext,
  invoiceId: string,
  database: PrismaClient = getPrismaClient(),
): Promise<AuthorizationResourceContext | null> {
  const row = await withCommercialTenantTransaction(
    context,
    async (transaction) => {
      const rows = await transaction.$queryRawUnsafe<R7ResourceRow[]>(
        `SELECT id, resource_id, owner_organization_id, status, row_version
         FROM commercial.invoices
         WHERE id = $1::uuid
           AND owner_organization_id = $2::uuid
           AND archived_at IS NULL`,
        invoiceId,
        context.tenant.organizationId,
      );
      return rows[0] ?? null;
    },
    database,
  );
  return row ? resourceContext(row, "invoice") : null;
}

export async function loadR7PaymentResource(
  context: TenantScopedRequestContext,
  paymentId: string,
  database: PrismaClient = getPrismaClient(),
): Promise<AuthorizationResourceContext | null> {
  const row = await withCommercialTenantTransaction(
    context,
    async (transaction) => {
      const rows = await transaction.$queryRawUnsafe<R7ResourceRow[]>(
        `SELECT payment.id, payment.owner_organization_id, payment.status,
                payment.updated_at
         FROM commercial.payments AS payment
         LEFT JOIN commercial.invoices AS invoice
           ON invoice.id = payment.invoice_id
          AND invoice.owner_organization_id = payment.owner_organization_id
         WHERE payment.id = $1::uuid
           AND payment.owner_organization_id = $2::uuid
           AND (payment.invoice_id IS NULL OR invoice.id IS NOT NULL)`,
        paymentId,
        context.tenant.organizationId,
      );
      return rows[0] ?? null;
    },
    database,
  );
  return row ? resourceContext(row, "payment") : null;
}


/** Server-built policy context for creating a new TEAM-owned R7 proposal. */
export function buildProspectiveR7ProposalResource(
  context: CommercialContext,
): AuthorizationResourceContext | null {
  if (
    context.authentication !== "authenticated" ||
    context.membership.surface !== "TEAM" ||
    context.tenant.surface !== "TEAM" ||
    context.membership.membershipId !== context.tenant.membershipId ||
    context.membership.organizationId !== context.tenant.organizationId
  ) {
    return null;
  }

  return {
    resourceType: "proposal",
    ownerOrganizationId: context.tenant.organizationId,
    visibility: "INTERNAL",
    sensitivity: "FINANCIAL",
    lifecycleState: "DRAFT",
    version: 1,
  };
}
