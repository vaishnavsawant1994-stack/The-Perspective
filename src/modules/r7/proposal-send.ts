import "server-only";

import { createHash, randomUUID } from "node:crypto";
import type { Prisma, PrismaClient } from "@/generated/prisma/client";
import type { CommercialContext } from "@/modules/commercial/persistence";
import { withCommercialTenantTransaction } from "@/modules/commercial/persistence";
import { getPrismaClient } from "@/modules/persistence/client";
import { canTransitionProposal, type R7ProposalState } from "./lifecycle";

export interface SendProposalInput {
  readonly proposalId: string;
  readonly expectedVersionId: string;
  readonly expectedVersion: number;
  readonly expectedRowVersion: number;
  readonly idempotencyKey: string;
}

export interface SentProposal {
  readonly id: string;
  readonly versionId: string;
  readonly version: number;
  readonly rowVersion: number;
  readonly status: "SENT";
  readonly currency: string;
  readonly totalMinor: string;
  readonly sentAt: string;
}

type Result = { readonly kind: "ok"; readonly value: SentProposal } | {
  readonly kind: "error"; readonly code: string;
};

class Failure extends Error {
  constructor(readonly code: string) { super(code); }
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/iu;
const IDEMPOTENCY_KEY = /^[A-Za-z0-9._:-]{8,128}$/u;
const MAX_BIGINT = BigInt("9223372036854775807");

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

function requestHash(input: SendProposalInput) {
  return createHash("sha256").update(JSON.stringify({
    proposalId: input.proposalId,
    expectedVersionId: input.expectedVersionId,
    expectedVersion: input.expectedVersion,
    expectedRowVersion: input.expectedRowVersion,
  })).digest("hex");
}

function canonicalIdempotencyKey(context: CommercialContext, key: string) {
  return `r7:proposal-send:${context.tenant.organizationId}:${key}`;
}

async function claim(
  tx: Prisma.TransactionClient,
  key: string,
  hash: string,
) {
  const rows = await tx.$queryRawUnsafe<Array<{ status: string }>>(
    `SELECT platform.claim_r7_proposal_send($1::uuid,$2::text,$3::text,$4::timestamptz) AS status`,
    randomUUID(), key, hash, new Date(Date.now() + 86400000),
  );
  return rows[0]?.status ?? "IN_PROGRESS";
}

async function replay(
  tx: Prisma.TransactionClient,
  key: string,
): Promise<SentProposal> {
  const rows = await tx.$queryRawUnsafe<Array<{
    proposal_id: string | null; version_id: string | null; version: number | null;
    row_version: number | null; currency: string | null; total_minor: string | null;
    sent_at: Date | null;
  }>>(
    `SELECT proposal_id, version_id, version, row_version, currency, total_minor, sent_at
       FROM platform.read_r7_proposal_send_replay($1::text)`,
    key,
  );
  const row = rows[0];
  if (!row?.proposal_id || !row.version_id || !row.version || !row.row_version ||
      !row.currency || row.total_minor === null || !row.sent_at) {
    throw new Failure("CONFLICT");
  }
  return {
    id: row.proposal_id,
    versionId: row.version_id,
    version: row.version,
    rowVersion: row.row_version,
    status: "SENT",
    currency: row.currency.trim(),
    totalMinor: row.total_minor,
    sentAt: row.sent_at.toISOString(),
  };
}

function validateInput(input: SendProposalInput) {
  return UUID.test(input.proposalId) && UUID.test(input.expectedVersionId) &&
    Number.isSafeInteger(input.expectedVersion) && input.expectedVersion > 0 &&
    Number.isSafeInteger(input.expectedRowVersion) && input.expectedRowVersion > 0 &&
    IDEMPOTENCY_KEY.test(input.idempotencyKey);
}

export async function sendProposal(
  context: CommercialContext,
  input: SendProposalInput,
  database: PrismaClient = getPrismaClient(),
): Promise<Result> {
  if (
    context.authentication !== "authenticated" || context.tenant.surface !== "TEAM" ||
    context.membership.surface !== "TEAM" ||
    context.tenant.organizationId !== context.membership.organizationId ||
    context.tenant.membershipId !== context.membership.membershipId
  ) return { kind: "error", code: "TEAM_REQUIRED" };
  if (!validateInput(input)) return { kind: "error", code: "INVALID" };

  const key = canonicalIdempotencyKey(context, input.idempotencyKey.trim());
  const hash = requestHash(input);
  const attempt = () => withCommercialTenantTransaction(context, async (tx) => {
      const claimStatus = await claim(tx, key, hash);
      if (claimStatus === "MISMATCH") throw new Failure("IDEMPOTENCY_CONFLICT");
      if (claimStatus === "REPLAY") return replay(tx, key);
      if (claimStatus !== "CLAIMED") throw new Failure("CONFLICT");

      const rows = await tx.$queryRawUnsafe<Array<{
        id: string; resource_id: string; owner_organization_id: string;
        status: R7ProposalState; current_version: number; row_version: number;
        proposal_currency: string; deal_currency: string; canonical_class: string;
        account_id: string; proposal_version_id: string; version: number;
        version_status: string; immutable: boolean; version_currency: string;
        subtotal_minor: bigint; tax_minor: bigint; total_minor: bigint;
        created_by_membership_id: string | null;
      }>>(
        `SELECT proposal.id, proposal.resource_id, proposal.owner_organization_id,
                proposal.status, proposal.current_version, proposal.row_version,
                proposal.currency AS proposal_currency, deal.currency AS deal_currency,
                stage.canonical_class, account.id AS account_id,
                version.id AS proposal_version_id, version.version,
                version.status AS version_status, version.immutable,
                version.currency AS version_currency, version.subtotal_minor,
                version.tax_minor, version.total_minor, proposal.created_by_membership_id
           FROM commercial.proposals AS proposal
           JOIN commercial.deals AS deal
             ON deal.id = proposal.deal_id
            AND deal.owner_organization_id = proposal.owner_organization_id
            AND deal.archived_at IS NULL
           JOIN commercial.deal_stages AS stage
             ON stage.id = deal.stage_id AND stage.pipeline_id = deal.pipeline_id
            AND stage.owner_organization_id = deal.owner_organization_id
           JOIN commercial.client_accounts AS account
             ON account.id = proposal.client_account_id
            AND account.owner_organization_id = proposal.owner_organization_id
            AND account.archived_at IS NULL
           JOIN commercial.proposal_versions AS version
             ON version.proposal_id = proposal.id
            AND version.owner_organization_id = proposal.owner_organization_id
            AND version.version = proposal.current_version
          WHERE proposal.id = $1::uuid
            AND proposal.owner_organization_id = $2::uuid
            AND proposal.archived_at IS NULL
          FOR UPDATE OF proposal, deal, version
          FOR SHARE OF stage, account`,
        input.proposalId, context.tenant.organizationId,
      );
      const proposal = rows[0];
      if (!proposal) throw new Failure("NOT_FOUND");
      if (proposal.status !== "DRAFT" && proposal.status !== "READY") {
        throw new Failure("TRANSITION_DENIED");
      }
      if (proposal.row_version !== input.expectedRowVersion ||
          proposal.current_version !== input.expectedVersion ||
          proposal.proposal_version_id !== input.expectedVersionId ||
          proposal.version !== input.expectedVersion) throw new Failure("STALE_WRITE");
      if (proposal.version_status !== proposal.status || proposal.immutable) {
        throw new Failure("PROPOSAL_IMMUTABLE");
      }
      if (proposal.canonical_class !== "PROPOSAL_PREPARATION" ||
          proposal.proposal_currency.trim() !== proposal.deal_currency.trim() ||
          proposal.version_currency.trim() !== proposal.proposal_currency.trim()) {
        throw new Failure("INVALID");
      }
      if (proposal.status === "DRAFT" && !canTransitionProposal("DRAFT", "READY")) {
        throw new Failure("TRANSITION_DENIED");
      }
      if (!canTransitionProposal("READY", "SENT")) throw new Failure("TRANSITION_DENIED");

      const lines = await tx.$queryRawUnsafe<Array<{
        description: string; quantity: number; unit_amount_minor: bigint;
        line_total_minor: bigint; position: number;
      }>>(
        `SELECT description, quantity, unit_amount_minor, line_total_minor, position
           FROM commercial.proposal_lines
          WHERE proposal_version_id = $1::uuid AND owner_organization_id = $2::uuid
          ORDER BY position FOR UPDATE`,
        proposal.proposal_version_id, context.tenant.organizationId,
      );
      if (lines.length === 0 || lines.some((line, index) =>
        !line.description.trim() || line.quantity < 1 || line.unit_amount_minor < BigInt(0) ||
        line.line_total_minor !== line.unit_amount_minor * BigInt(line.quantity) ||
        line.line_total_minor > MAX_BIGINT || line.position !== index + 1
      )) throw new Failure("INVALID");
      const subtotal = lines.reduce((total, line) => total + line.line_total_minor, BigInt(0));
      if (subtotal > MAX_BIGINT || proposal.tax_minor > MAX_BIGINT ||
          subtotal + proposal.tax_minor > MAX_BIGINT ||
          proposal.subtotal_minor !== subtotal ||
          proposal.total_minor !== subtotal + proposal.tax_minor) throw new Failure("INVALID");

      const sentAt = new Date();
      if (proposal.status === "DRAFT") {
        const versionReady = await tx.$executeRawUnsafe(
          `UPDATE commercial.proposal_versions
              SET status = 'READY'
            WHERE id = $1::uuid AND proposal_id = $2::uuid
              AND owner_organization_id = $3::uuid AND version = $4::int
              AND status = 'DRAFT' AND immutable = FALSE AND issued_at IS NULL`,
          proposal.proposal_version_id, proposal.id,
          context.tenant.organizationId, input.expectedVersion,
        );
        if (versionReady !== 1) throw new Failure("STALE_WRITE");
        const proposalReady = await tx.$executeRawUnsafe(
          `UPDATE commercial.proposals
              SET status = 'READY', updated_at = $1::timestamptz
            WHERE id = $2::uuid AND owner_organization_id = $3::uuid
              AND status = 'DRAFT' AND current_version = $4::int
              AND row_version = $5::int AND archived_at IS NULL`,
          sentAt, proposal.id, context.tenant.organizationId,
          input.expectedVersion, input.expectedRowVersion,
        );
        if (proposalReady !== 1) throw new Failure("STALE_WRITE");
      }

      // Readiness and the final send edge are server-owned and atomic.
      const versionChanged = await tx.$executeRawUnsafe(
        `UPDATE commercial.proposal_versions
            SET status = 'SENT', immutable = TRUE, issued_at = $1::timestamptz
          WHERE id = $2::uuid AND proposal_id = $3::uuid
            AND owner_organization_id = $4::uuid AND version = $5::int
            AND status = 'READY' AND immutable = FALSE AND issued_at IS NULL`,
        sentAt, proposal.proposal_version_id, proposal.id,
        context.tenant.organizationId, input.expectedVersion,
      );
      if (versionChanged !== 1) throw new Failure("STALE_WRITE");
      const proposalChanged = await tx.$executeRawUnsafe(
        `UPDATE commercial.proposals
            SET status = 'SENT', row_version = row_version + 1, updated_at = $1::timestamptz
          WHERE id = $2::uuid AND owner_organization_id = $3::uuid
            AND status = 'READY' AND current_version = $4::int
            AND row_version = $5::int AND archived_at IS NULL`,
        sentAt, proposal.id, context.tenant.organizationId,
        input.expectedVersion, input.expectedRowVersion,
      );
      if (proposalChanged !== 1) throw new Failure("STALE_WRITE");

      const result: SentProposal = {
        id: proposal.id,
        versionId: proposal.proposal_version_id,
        version: proposal.version,
        rowVersion: input.expectedRowVersion + 1,
        status: "SENT",
        currency: proposal.proposal_currency.trim(),
        totalMinor: proposal.total_minor.toString(),
        sentAt: sentAt.toISOString(),
      };
      const afterHash = createHash("sha256").update(JSON.stringify(result)).digest("hex");
      const diff = {
        proposalSend: {
          proposalId: proposal.id,
          proposalVersionId: proposal.proposal_version_id,
          version: proposal.version,
          previousState: proposal.status,
          validatedReadyState: "READY",
          state: "SENT",
          rowVersion: result.rowVersion,
          currency: result.currency,
          totalMinor: result.totalMinor,
          sentAt: result.sentAt,
          payloadHash: hash,
        },
      };
      await tx.$queryRawUnsafe(
        `SELECT platform.complete_r7_proposal_send(
          $1::uuid,$2::uuid,$3::uuid,$4::uuid,$5::uuid,$6::uuid,$7::uuid,
          $8::int,$9::int,$10::text,$11::text,$12::jsonb,$13::text,
          $14::text,$15::text,$16::timestamptz
        )`,
        randomUUID(), context.tenant.organizationId, proposal.resource_id,
        proposal.id, proposal.proposal_version_id, context.identity.userId,
        context.membership.membershipId, proposal.version, result.rowVersion,
        context.requestId, afterHash, JSON.stringify(diff), key, result.currency,
        result.totalMinor, sentAt,
      );
      return result;
  }, database);
  try {
    return { kind: "ok", value: await attempt() };
  } catch (cause) {
    if (["P2034", "40001", "P2002", "23505"].includes(databaseCode(cause))) {
      try {
        return { kind: "ok", value: await attempt() };
      } catch (retryCause) {
        return mapError(retryCause) ?? Promise.reject(retryCause);
      }
    }
    return mapError(cause) ?? Promise.reject(cause);
  }
}
