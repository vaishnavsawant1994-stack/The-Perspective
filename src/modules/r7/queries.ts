import "server-only";

import type { PrismaClient } from "@/generated/prisma/client";
import { evaluateAuthorization } from "@/modules/authorization/policy";
import type { AuthorizationResourceContext } from "@/modules/authorization/types";
import type { AuthorizedRequestContext } from "@/modules/foundation/request-context";
import {
  withCommercialTenantTransaction,
} from "@/modules/commercial/persistence";
import { getPrismaClient } from "@/modules/persistence/client";

type ProposalRow = {
  readonly id: string;
  readonly resource_id: string;
  readonly owner_organization_id: string;
  readonly deal_id: string;
  readonly status: string;
  readonly current_version: number;
  readonly row_version: number;
  readonly currency: string;
};

type ProposalVersionRow = {
  readonly id: string;
  readonly version: number;
  readonly status: string;
  readonly currency: string;
  readonly subtotal_minor: bigint;
  readonly tax_minor: bigint;
  readonly total_minor: bigint;
};

type ProposalLineRow = {
  readonly description: string;
  readonly quantity: number;
  readonly unit_amount_minor: bigint;
  readonly line_total_minor: bigint;
  readonly position: number;
};

const PROPOSAL_READ_FIELDS = [
  "id",
  "status",
  "currency",
  "dealId",
  "currentVersion",
  "rowVersion",
] as const;

const VERSION_READ_FIELDS = [
  "id",
  "status",
  "currency",
  "subtotalMinor",
  "taxMinor",
  "totalMinor",
  "version",
] as const;

const LINE_READ_FIELDS = [
  "description",
  "quantity",
  "unitAmountMinor",
  "lineTotalMinor",
  "position",
] as const;

function proposalResource(row: ProposalRow): AuthorizationResourceContext {
  return {
    resourceId: row.resource_id,
    resourceType: "proposal",
    ownerOrganizationId: row.owner_organization_id,
    visibility: "INTERNAL",
    sensitivity: "FINANCIAL",
    lifecycleState: row.status,
    version: row.row_version,
  };
}

function versionResource(
  row: ProposalVersionRow,
  ownerOrganizationId: string,
): AuthorizationResourceContext {
  return {
    resourceId: row.id,
    resourceType: "proposal-version",
    ownerOrganizationId,
    visibility: "INTERNAL",
    sensitivity: "FINANCIAL",
    lifecycleState: row.status,
    version: row.version,
  };
}

function project<T extends Readonly<Record<string, unknown>>>(
  value: T,
  allowed: readonly string[],
) {
  const fields = new Set(allowed);
  return Object.fromEntries(
    Object.entries(value).filter(([field]) => fields.has(field)),
  ) as Partial<T>;
}

function authorizedProposalSummary(
  context: AuthorizedRequestContext,
  row: ProposalRow,
  action: "list" | "view",
) {
  const decision = evaluateAuthorization(
    context,
    "proposal.view",
    proposalResource(row),
    { action, requestedFields: PROPOSAL_READ_FIELDS },
  );
  if (decision.decision !== "ALLOW") return null;

  return project(
    {
      id: row.id,
      status: row.status,
      currency: row.currency,
      dealId: row.deal_id,
      currentVersion: row.current_version,
      rowVersion: row.row_version,
    },
    decision.readableFields ?? [],
  );
}

export async function listAuthorizedProposals(
  context: AuthorizedRequestContext,
  limit: number,
  database: PrismaClient = getPrismaClient(),
) {
  const rows = await withCommercialTenantTransaction(
    context,
    async (transaction) =>
      transaction.$queryRawUnsafe<ProposalRow[]>(
        `SELECT id, resource_id, owner_organization_id, deal_id, status,
                current_version, row_version, currency
         FROM commercial.proposals
         WHERE owner_organization_id = $1::uuid
           AND archived_at IS NULL
         ORDER BY created_at DESC, id ASC
         LIMIT $2::int`,
        context.tenant.organizationId,
        limit,
      ),
    database,
  );

  return rows.flatMap((row) => {
    const summary = authorizedProposalSummary(context, row, "list");
    return summary ? [summary] : [];
  });
}

export async function getAuthorizedProposal(
  context: AuthorizedRequestContext,
  proposalId: string,
  database: PrismaClient = getPrismaClient(),
) {
  const row = await withCommercialTenantTransaction(
    context,
    async (transaction) => {
      const rows = await transaction.$queryRawUnsafe<ProposalRow[]>(
        `SELECT id, resource_id, owner_organization_id, deal_id, status,
                current_version, row_version, currency
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
  if (!row) return null;

  const proposal = authorizedProposalSummary(context, row, "view");
  if (!proposal) return null;

  const version = await withCommercialTenantTransaction(
    context,
    async (transaction) => {
      const rows = await transaction.$queryRawUnsafe<ProposalVersionRow[]>(
        `SELECT id, version, status, currency, subtotal_minor, tax_minor, total_minor
         FROM commercial.proposal_versions
         WHERE proposal_id = $1::uuid
           AND owner_organization_id = $2::uuid
           AND version = $3::int`,
        row.id,
        context.tenant.organizationId,
        row.current_version,
      );
      return rows[0] ?? null;
    },
    database,
  );
  if (!version) return { proposal, version: null, lines: [] };

  const versionDecision = evaluateAuthorization(
    context,
    "proposal.view",
    versionResource(version, row.owner_organization_id),
    { action: "view", requestedFields: VERSION_READ_FIELDS },
  );
  if (versionDecision.decision !== "ALLOW") {
    return { proposal, version: null, lines: [] };
  }

  const lines = await withCommercialTenantTransaction(
    context,
    async (transaction) =>
      transaction.$queryRawUnsafe<ProposalLineRow[]>(
        `SELECT description, quantity, unit_amount_minor, line_total_minor, position
         FROM commercial.proposal_lines
         WHERE proposal_version_id = $1::uuid
           AND owner_organization_id = $2::uuid
         ORDER BY position ASC`,
        version.id,
        context.tenant.organizationId,
      ),
    database,
  );

  const lineDecision = evaluateAuthorization(
    context,
    "proposal.view",
    versionResource(version, row.owner_organization_id),
    { action: "view", requestedFields: LINE_READ_FIELDS },
  );

  return {
    proposal,
    version: project(
      {
        id: version.id,
        status: version.status,
        currency: version.currency,
        subtotalMinor: version.subtotal_minor.toString(),
        taxMinor: version.tax_minor.toString(),
        totalMinor: version.total_minor.toString(),
        version: version.version,
      },
      versionDecision.readableFields ?? [],
    ),
    lines:
      lineDecision.decision === "ALLOW"
        ? lines.map((line) =>
            project(
              {
                description: line.description,
                quantity: line.quantity,
                unitAmountMinor: line.unit_amount_minor.toString(),
                lineTotalMinor: line.line_total_minor.toString(),
                position: line.position,
              },
              lineDecision.readableFields ?? [],
            ),
          )
        : [],
  };
}
type InvoiceRow = {
  readonly id: string;
  readonly resource_id: string;
  readonly owner_organization_id: string;
  readonly status: string;
  readonly row_version: number;
  readonly currency: string;
  readonly total_minor: bigint;
  readonly allocated_minor: bigint;
};

const INVOICE_READ_FIELDS = [
  "id", "status", "currency", "totalMinor", "allocatedMinor",
] as const;

function invoiceResource(row: InvoiceRow): AuthorizationResourceContext {
  return {
    resourceId: row.resource_id,
    resourceType: "invoice",
    ownerOrganizationId: row.owner_organization_id,
    visibility: "INTERNAL",
    sensitivity: "FINANCIAL",
    lifecycleState: row.status,
    version: row.row_version,
  };
}

function authorizedInvoiceSummary(
  context: AuthorizedRequestContext,
  row: InvoiceRow,
  action: "list" | "view",
) {
  const decision = evaluateAuthorization(
    context,
    "invoice.view",
    invoiceResource(row),
    { action, requestedFields: INVOICE_READ_FIELDS },
  );
  if (decision.decision !== "ALLOW") return null;
  return project({
    id: row.id,
    status: row.status,
    currency: row.currency,
    totalMinor: row.total_minor.toString(),
    allocatedMinor: row.allocated_minor.toString(),
  }, decision.readableFields ?? []);
}

export async function listAuthorizedInvoices(
  context: AuthorizedRequestContext,
  limit: number,
  database: PrismaClient = getPrismaClient(),
) {
  const rows = await withCommercialTenantTransaction(
    context,
    async (transaction) => transaction.$queryRawUnsafe<InvoiceRow[]>(
      `SELECT id, resource_id, owner_organization_id, status, row_version,
              currency, total_minor, allocated_minor
       FROM commercial.invoices
       WHERE owner_organization_id = $1::uuid
         AND archived_at IS NULL
       ORDER BY created_at DESC, id ASC
       LIMIT $2::int`,
      context.tenant.organizationId,
      limit,
    ),
    database,
  );
  return rows.flatMap((row) => {
    const summary = authorizedInvoiceSummary(context, row, "list");
    return summary ? [summary] : [];
  });
}

export async function getAuthorizedInvoice(
  context: AuthorizedRequestContext,
  invoiceId: string,
  database: PrismaClient = getPrismaClient(),
) {
  const row = await withCommercialTenantTransaction(
    context,
    async (transaction) => {
      const rows = await transaction.$queryRawUnsafe<InvoiceRow[]>(
        `SELECT id, resource_id, owner_organization_id, status, row_version,
                currency, total_minor, allocated_minor
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
  return row ? authorizedInvoiceSummary(context, row, "view") : null;
}

type PaymentRow = {
  readonly id: string;
  readonly owner_organization_id: string;
  readonly status: string;
  readonly currency: string;
  readonly amount_minor: bigint;
  readonly provider: string;
  readonly updated_at: Date;
};

const PAYMENT_READ_FIELDS = ["id", "status", "currency", "amountMinor", "provider"] as const;

function paymentSummary(
  context: AuthorizedRequestContext,
  row: PaymentRow,
  action: "list" | "view",
) {
  const currency = row.currency.trim();
  const evidence = /^[A-Z]{3}$/u.test(currency) && row.amount_minor >= BigInt(0);
  const aligned = context.membership.organizationId === row.owner_organization_id
    && context.membership.membershipId === context.tenant.membershipId;
  const decision = evaluateAuthorization(
    context,
    "payment.view",
    {
      resourceId: row.id,
      resourceType: "payment",
      ownerOrganizationId: row.owner_organization_id,
      clientOrganizationId: null,
      visibility: "INTERNAL",
      sensitivity: "FINANCIAL",
      lifecycleState: row.status,
      version: row.updated_at.toISOString(),
    },
    {
      action,
      requestedFields: [...PAYMENT_READ_FIELDS],
      workflowSatisfied: evidence,
      financialEvidencePresent: evidence,
      separationOfDutySatisfied: aligned,
    },
  );
  if (decision.decision !== "ALLOW") return null;
  return project({
    id: row.id,
    status: row.status,
    currency,
    amountMinor: row.amount_minor.toString(),
    provider: row.provider,
  }, decision.readableFields ?? []);
}

export async function listAuthorizedPayments(
  context: AuthorizedRequestContext,
  limit: number,
  database: PrismaClient = getPrismaClient(),
) {
  const rows = await withCommercialTenantTransaction(
    context,
    async (transaction) => transaction.$queryRawUnsafe<PaymentRow[]>(
      `SELECT id, owner_organization_id, status, currency, amount_minor, provider, updated_at
         FROM commercial.payments
        WHERE owner_organization_id = $1::uuid
        ORDER BY created_at DESC, id ASC
        LIMIT $2::int`,
      context.tenant.organizationId,
      limit,
    ),
    database,
  );
  return rows.flatMap((row) => {
    const summary = paymentSummary(context, row, "list");
    return summary ? [summary] : [];
  });
}

export async function getAuthorizedPayment(
  context: AuthorizedRequestContext,
  paymentId: string,
  database: PrismaClient = getPrismaClient(),
) {
  const row = await withCommercialTenantTransaction(
    context,
    async (transaction) => {
      const rows = await transaction.$queryRawUnsafe<PaymentRow[]>(
        `SELECT payment.id, payment.owner_organization_id, payment.status,
                payment.currency, payment.amount_minor, payment.provider, payment.updated_at
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
  return row ? paymentSummary(context, row, "view") : null;
}
