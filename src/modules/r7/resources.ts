import "server-only";

import type { PrismaClient } from "@/generated/prisma/client";
import type { TenantScopedRequestContext } from "@/modules/foundation/request-context";
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
