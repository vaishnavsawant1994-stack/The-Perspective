import "server-only";

import { createHash, randomUUID } from "node:crypto";
import type { PrismaClient } from "@/generated/prisma/client";
import type { CommercialContext } from "@/modules/commercial/persistence";
import { withCommercialTenantTransaction } from "@/modules/commercial/persistence";
import { getPrismaClient } from "@/modules/persistence/client";
import { assembleProposalVersion, type ProposalLineInput } from "./proposals";

export interface ProposalEditInput {
  readonly proposalId: string;
  readonly expectedVersionId: string;
  readonly expectedVersion: number;
  readonly expectedRowVersion: number;
  readonly currency: string;
  /** Full ordered values for the existing lines; structure is never changed. */
  readonly lines: readonly ProposalLineInput[];
}

export interface EditedProposal {
  readonly id: string;
  readonly versionId: string;
  readonly version: number;
  readonly rowVersion: number;
  readonly status: "DRAFT" | "READY";
  readonly currency: string;
  readonly totalMinor: string;
  readonly lineCount: number;
}

type Result = { readonly kind: "ok"; readonly value: EditedProposal } | {
  readonly kind: "error"; readonly code: string;
};

class Failure extends Error {
  constructor(readonly code: string) { super(code); }
}

const MAX_BIGINT = BigInt("9223372036854775807");
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/iu;

function databaseCode(value: unknown) {
  if (!value || typeof value !== "object") return "";
  const error = value as {
    code?: unknown;
    meta?: { driverAdapterError?: { cause?: { originalCode?: unknown } } };
  };
  return String(error.meta?.driverAdapterError?.cause?.originalCode ?? error.code ?? "");
}

function mapError(value: unknown): Result | undefined {
  if (value instanceof Failure) return { kind: "error", code: value.code };
  switch (databaseCode(value)) {
    case "P2034": case "40001": return { kind: "error", code: "STALE_WRITE" };
    case "P2002": case "23505": return { kind: "error", code: "CONFLICT" };
    case "P2004": case "23514": case "22023": case "22P02": case "22003":
      return { kind: "error", code: "INVALID" };
    case "42501": return { kind: "error", code: "TEAM_REQUIRED" };
    default: return undefined;
  }
}

function validateInput(input: ProposalEditInput) {
  return UUID.test(input.proposalId) && UUID.test(input.expectedVersionId) &&
    Number.isSafeInteger(input.expectedVersion) && input.expectedVersion > 0 &&
    Number.isSafeInteger(input.expectedRowVersion) && input.expectedRowVersion > 0 &&
    /^[A-Z]{3}$/u.test(input.currency) && input.lines.length >= 1 && input.lines.length <= 100 &&
    input.lines.every((line) => line.description.trim().length > 0 &&
      line.description.trim().length <= 500 && Number.isInteger(line.quantity) &&
      line.quantity >= 1 && line.quantity <= 2147483647 &&
      line.unitAmountMinor >= BigInt(0) && line.unitAmountMinor <= MAX_BIGINT);
}

export async function editDraftProposal(
  context: CommercialContext,
  input: ProposalEditInput,
  database: PrismaClient = getPrismaClient(),
): Promise<Result> {
  if (
    context.authentication !== "authenticated" || context.tenant.surface !== "TEAM" ||
    context.membership.surface !== "TEAM" ||
    context.tenant.organizationId !== context.membership.organizationId ||
    context.tenant.membershipId !== context.membership.membershipId
  ) return { kind: "error", code: "TEAM_REQUIRED" };
  if (!validateInput(input)) return { kind: "error", code: "INVALID" };

  const normalized: ProposalEditInput = {
    ...input,
    currency: input.currency.trim(),
    lines: input.lines.map((line) => ({
      description: line.description.trim(),
      quantity: line.quantity,
      unitAmountMinor: line.unitAmountMinor,
    })),
  };
  const hash = createHash("sha256").update(JSON.stringify({
    proposalId: normalized.proposalId,
    expectedVersionId: normalized.expectedVersionId,
    expectedVersion: normalized.expectedVersion,
    expectedRowVersion: normalized.expectedRowVersion,
    currency: normalized.currency,
    lines: normalized.lines.map((line) => ({
      description: line.description,
      quantity: line.quantity,
      unitAmountMinor: line.unitAmountMinor.toString(),
    })),
  })).digest("hex");

  try {
    const value = await withCommercialTenantTransaction(context, async (tx) => {
      const proposals = await tx.$queryRawUnsafe<Array<{
        id: string; resource_id: string; owner_organization_id: string;
        status: "DRAFT" | "READY" | string; current_version: number;
        row_version: number; deal_currency: string | null;
      }>>(
        `SELECT proposal.id, proposal.resource_id, proposal.owner_organization_id,
                proposal.status, proposal.current_version, proposal.row_version,
                deal.currency AS deal_currency
           FROM commercial.proposals AS proposal
           JOIN commercial.deals AS deal
             ON deal.id = proposal.deal_id
            AND deal.owner_organization_id = proposal.owner_organization_id
          WHERE proposal.id = $1::uuid
            AND proposal.owner_organization_id = $2::uuid
            AND proposal.archived_at IS NULL
          FOR UPDATE OF proposal, deal`,
        normalized.proposalId,
        context.tenant.organizationId,
      );
      const proposal = proposals[0];
      if (!proposal) throw new Failure("NOT_FOUND");
      if (proposal.status !== "DRAFT" && proposal.status !== "READY") {
        throw new Failure("PROPOSAL_IMMUTABLE");
      }
      if (proposal.row_version !== normalized.expectedRowVersion ||
          proposal.current_version !== normalized.expectedVersion) {
        throw new Failure("STALE_WRITE");
      }

      const versions = await tx.$queryRawUnsafe<Array<{
        id: string; version: number; status: string; immutable: boolean;
        currency: string; tax_minor: bigint;
      }>>(
        `SELECT id, version, status, immutable, currency, tax_minor
           FROM commercial.proposal_versions
          WHERE id = $1::uuid AND proposal_id = $2::uuid
            AND owner_organization_id = $3::uuid
          FOR UPDATE`,
        normalized.expectedVersionId,
        proposal.id,
        context.tenant.organizationId,
      );
      const version = versions[0];
      if (!version || version.version !== normalized.expectedVersion ||
          version.status !== proposal.status || version.immutable) {
        throw new Failure("STALE_WRITE");
      }
      if ((proposal.deal_currency ?? "").trim() !== normalized.currency) {
        throw new Failure("INVALID");
      }

      const rows = await tx.$queryRawUnsafe<Array<{
        id: string; position: number; description: string; quantity: number;
        unit_amount_minor: bigint;
      }>>(
        `SELECT id, position, description, quantity, unit_amount_minor
           FROM commercial.proposal_lines
          WHERE proposal_version_id = $1::uuid
            AND owner_organization_id = $2::uuid
          ORDER BY position ASC
          FOR UPDATE`,
        version.id,
        context.tenant.organizationId,
      );
      if (rows.length !== normalized.lines.length) throw new Failure("LINE_STRUCTURE_MISMATCH");

      const assembled = assembleProposalVersion(version.status as "DRAFT" | "READY", normalized.currency, [...normalized.lines], version.tax_minor);
      if (assembled.kind !== "ok" || assembled.value.totalMinor > MAX_BIGINT) {
        throw new Failure("INVALID");
      }

      for (const [index, line] of assembled.value.lines.entries()) {
        const existing = rows[index];
        if (!existing) throw new Failure("LINE_STRUCTURE_MISMATCH");
        const changed = await tx.$executeRawUnsafe(
          `UPDATE commercial.proposal_lines
              SET description = $1::text, quantity = $2::int,
                  unit_amount_minor = $3::bigint, line_total_minor = $4::bigint
            WHERE id = $5::uuid AND owner_organization_id = $6::uuid
              AND proposal_version_id = $7::uuid AND position = $8::int`,
          line.description, line.quantity, line.unitAmountMinor, line.lineTotalMinor,
          existing.id, context.tenant.organizationId, version.id, existing.position,
        );
        if (changed !== 1) throw new Failure("STALE_WRITE");
      }

      const now = new Date();
      const updatedVersion = await tx.$executeRawUnsafe(
        `UPDATE commercial.proposal_versions
            SET currency = $1::char(3), subtotal_minor = $2::bigint,
                total_minor = $3::bigint
          WHERE id = $4::uuid AND proposal_id = $5::uuid
            AND owner_organization_id = $6::uuid AND version = $7::int
            AND immutable IS FALSE AND status IN ('DRAFT', 'READY')`,
        normalized.currency, assembled.value.subtotalMinor,
        assembled.value.totalMinor, version.id, proposal.id,
        context.tenant.organizationId, normalized.expectedVersion,
      );
      if (updatedVersion !== 1) throw new Failure("PROPOSAL_IMMUTABLE");
      const updated = await tx.$executeRawUnsafe(
        `UPDATE commercial.proposals
            SET currency = $1::char(3), row_version = row_version + 1,
                updated_at = $2::timestamptz
          WHERE id = $3::uuid AND owner_organization_id = $4::uuid
            AND row_version = $5::int AND current_version = $6::int
            AND status IN ('DRAFT', 'READY') AND archived_at IS NULL`,
        normalized.currency, now, proposal.id, context.tenant.organizationId,
        normalized.expectedRowVersion, normalized.expectedVersion,
      );
      if (updated !== 1) throw new Failure("STALE_WRITE");

      const result: EditedProposal = {
        id: proposal.id,
        versionId: version.id,
        version: version.version,
        rowVersion: normalized.expectedRowVersion + 1,
        status: proposal.status,
        currency: normalized.currency,
        totalMinor: assembled.value.totalMinor.toString(),
        lineCount: rows.length,
      };
      const afterHash = createHash("sha256").update(JSON.stringify(result)).digest("hex");
      const diff = {
        proposalEdit: {
          proposalId: proposal.id,
          proposalVersionId: version.id,
          version: version.version,
          rowVersion: normalized.expectedRowVersion + 1,
          beforeCurrency: version.currency.trim(),
          afterCurrency: normalized.currency,
          beforeTotalMinor: String(rows.reduce((sum, line) => sum + line.unit_amount_minor * BigInt(line.quantity), BigInt(0)) + version.tax_minor),
          afterTotalMinor: assembled.value.totalMinor.toString(),
          lineCount: rows.length,
          payloadHash: hash,
        },
      };
      await tx.$queryRawUnsafe(
        `SELECT platform.append_r7_proposal_edit_audit(
          $1::uuid,$2::uuid,$3::uuid,$4::uuid,$5::uuid,$6::text,$7::text,$8::jsonb,$9::text,$10::timestamptz
        )`,
        randomUUID(), context.tenant.organizationId, proposal.resource_id,
        context.identity.userId, context.membership.membershipId,
        context.requestId, afterHash, JSON.stringify(diff),
        `r7:proposal-edit:${proposal.id}:${normalized.expectedRowVersion + 1}`, now,
      );
      return result;
    }, database);
    return { kind: "ok", value };
  } catch (cause) {
    return mapError(cause) ?? Promise.reject(cause);
  }
}
