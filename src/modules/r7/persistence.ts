import "server-only";

import type { PrismaClient } from "@/generated/prisma/client";
import type { TenantScopedRequestContext } from "@/modules/foundation/request-context";
import {
  newCommercialId,
  withCommercialTenantTransaction,
} from "@/modules/commercial/persistence";
import { assembleProposalVersion, type ProposalLineInput } from "./proposals";

export async function insertProduct(
  context: TenantScopedRequestContext,
  input: {
    key: string;
    name: string;
    currency: string;
    unitAmountMinor: bigint;
  },
  database: PrismaClient,
) {
  const id = newCommercialId();
  await withCommercialTenantTransaction(
    context,
    async (tx) => {
      await tx.$executeRawUnsafe(
        `INSERT INTO commercial.products (
           id, owner_organization_id, key, name, currency, unit_amount_minor, status
         ) VALUES ($1::uuid, $2::uuid, $3, $4, $5, $6::bigint, 'ACTIVE')`,
        id,
        context.tenant.organizationId,
        input.key,
        input.name,
        input.currency,
        input.unitAmountMinor.toString(),
      );
    },
    database,
  );
  return { id };
}

export async function insertDraftProposal(
  context: TenantScopedRequestContext,
  input: {
    dealId: string;
    currency: string;
    lines: ProposalLineInput[];
  },
  database: PrismaClient,
) {
  const assembled = assembleProposalVersion("DRAFT", input.currency, input.lines);
  if (assembled.kind !== "ok") {
    return assembled;
  }

  const proposalId = newCommercialId();
  const versionId = newCommercialId();
  const resourceId = newCommercialId();

  await withCommercialTenantTransaction(
    context,
    async (tx) => {
      await tx.$executeRawUnsafe(
        `INSERT INTO commercial.proposals (
           id, resource_id, owner_organization_id, deal_id, status, current_version, currency
         ) VALUES ($1::uuid, $2::uuid, $3::uuid, $4::uuid, 'DRAFT', 1, $5)`,
        proposalId,
        resourceId,
        context.tenant.organizationId,
        input.dealId,
        input.currency,
      );
      await tx.$executeRawUnsafe(
        `INSERT INTO commercial.proposal_versions (
           id, owner_organization_id, proposal_id, version, status, immutable,
           currency, subtotal_minor, tax_minor, total_minor
         ) VALUES ($1::uuid, $2::uuid, $3::uuid, 1, 'DRAFT', false, $4, $5::bigint, $6::bigint, $7::bigint)`,
        versionId,
        context.tenant.organizationId,
        proposalId,
        input.currency,
        assembled.value.subtotalMinor.toString(),
        assembled.value.taxMinor.toString(),
        assembled.value.totalMinor.toString(),
      );
      for (const [index, line] of assembled.value.lines.entries()) {
        await tx.$executeRawUnsafe(
          `INSERT INTO commercial.proposal_lines (
             id, owner_organization_id, proposal_version_id, description,
             quantity, unit_amount_minor, line_total_minor, position
           ) VALUES ($1::uuid, $2::uuid, $3::uuid, $4, $5::int, $6::bigint, $7::bigint, $8::int)`,
          newCommercialId(),
          context.tenant.organizationId,
          versionId,
          line.description,
          line.quantity,
          line.unitAmountMinor.toString(),
          line.lineTotalMinor.toString(),
          index + 1,
        );
      }
    },
    database,
  );

  return {
    kind: "ok" as const,
    value: {
      proposalId,
      versionId,
      totalMinor: assembled.value.totalMinor,
    },
  };
}

export async function countTenantProposals(
  context: TenantScopedRequestContext,
  database: PrismaClient,
) {
  return withCommercialTenantTransaction(
    context,
    async (tx) => {
      const rows = await tx.$queryRawUnsafe<Array<{ count: bigint }>>(
        `SELECT count(*)::bigint AS count FROM commercial.proposals`,
      );
      return Number(rows[0]?.count ?? 0);
    },
    database,
  );
}
