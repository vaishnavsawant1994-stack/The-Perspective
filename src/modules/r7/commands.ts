import "server-only";

import { createHash, randomUUID } from "node:crypto";
import { AuditActorType, Prisma, type PrismaClient } from "@/generated/prisma/client";
import type { CommercialContext } from "@/modules/commercial/persistence";
import { newCommercialId, withCommercialTenantTransaction } from "@/modules/commercial/persistence";
import { getPrismaClient } from "@/modules/persistence/client";
import { assembleProposalVersion, type ProposalLineInput } from "./proposals";

type Input = {
  readonly dealId: string;
  readonly currency: string;
  readonly lines: ProposalLineInput[];
  readonly idempotencyKey: string;
};
export type CreatedDraftProposal = {
  readonly id: string;
  readonly versionId: string;
  readonly version: 1;
  readonly status: "DRAFT";
  readonly currency: string;
  readonly totalMinor: string;
};
type Result = { readonly kind: "ok"; readonly value: CreatedDraftProposal } | {
  readonly kind: "error"; readonly code: string;
};
class Failure extends Error {
  constructor(readonly code: string) { super(code); }
}
const MAX_BIGINT = BigInt("9223372036854775807");

function hashInput(input: Input) {
  return createHash("sha256").update(JSON.stringify({
    dealId: input.dealId,
    currency: input.currency,
    lines: input.lines.map((line) => ({
      description: line.description,
      quantity: line.quantity,
      unitAmountMinor: line.unitAmountMinor.toString(),
    })),
  })).digest("hex");
}
function dbCode(value: unknown) {
  if (!value || typeof value !== "object") return "";
  const error = value as { code?: unknown; meta?: { driverAdapterError?: { cause?: { originalCode?: unknown } } } };
  return String(error.meta?.driverAdapterError?.cause?.originalCode ?? error.code ?? "");
}
function mapError(value: unknown): Result | undefined {
  if (value instanceof Failure) return { kind: "error", code: value.code };
  switch (dbCode(value)) {
    case "P2002": case "P2034": case "40001": case "23505":
      return { kind: "error", code: "CONFLICT" };
    case "P2003": case "P2004": case "23503": case "23514": case "22023": case "22P02": case "22003":
      return { kind: "error", code: "INVALID" };
    case "42501":
      return { kind: "error", code: "TEAM_REQUIRED" };
    default: return undefined;
  }
}
function auditKey(context: CommercialContext, key: string) {
  return `r7:proposal-create:${context.tenant.organizationId}:${key}`;
}
async function claim(tx: Prisma.TransactionClient, key: string, hash: string) {
  const rows = await tx.$queryRawUnsafe<Array<{ status: string }>>(
    `SELECT platform.claim_r7_proposal_create($1::uuid,$2::text,$3::text,$4::timestamptz) AS status`,
    newCommercialId(), key, hash, new Date(Date.now() + 86400000),
  );
  return rows[0]?.status ?? "IN_PROGRESS";
}
async function complete(tx: Prisma.TransactionClient, key: string, hash: string, responseHash: string) {
  await tx.$queryRawUnsafe(
    `SELECT platform.complete_r7_proposal_create($1::text,$2::text,$3::text)`,
    key, hash, responseHash,
  );
}
async function replay(tx: Prisma.TransactionClient, context: CommercialContext, key: string): Promise<CreatedDraftProposal> {
  const rows = await tx.$queryRawUnsafe<Array<{
    proposal_id: string | null; version_id: string | null; version: number | null;
    currency: string | null; total_minor: string | null;
  }>>(
    `SELECT proposal_id, version_id, version, currency, total_minor
       FROM platform.read_r7_proposal_create_replay($1::text)`,
    key,
  );
  const row = rows[0];
  if (!row?.proposal_id || !row.version_id || row.version !== 1 || !row.currency || !row.total_minor) {
    throw new Failure("CONFLICT");
  }
  return { id: row.proposal_id, versionId: row.version_id, version: 1, status: "DRAFT",
    currency: row.currency.trim(), totalMinor: row.total_minor };
}
async function perform(
  tx: Prisma.TransactionClient, context: CommercialContext, input: Input,
  assembled: Extract<ReturnType<typeof assembleProposalVersion>, { kind: "ok" }>,
  hash: string, key: string,
): Promise<CreatedDraftProposal> {
  const claimStatus = await claim(tx, input.idempotencyKey, hash);
  if (claimStatus === "MISMATCH") throw new Failure("IDEMPOTENCY_CONFLICT");
  if (claimStatus === "REPLAY") return replay(tx, context, key);
  if (claimStatus !== "CLAIMED") throw new Failure("CONFLICT");

  const deals = await tx.$queryRawUnsafe<Array<{
    deal_id: string; deal_currency: string | null; client_account_id: string;
  }>>(
    `SELECT deal.id AS deal_id, deal.currency AS deal_currency, account.id AS client_account_id
       FROM commercial.deals AS deal
       JOIN commercial.deal_stages AS stage
         ON stage.id=deal.stage_id AND stage.pipeline_id=deal.pipeline_id
        AND stage.owner_organization_id=deal.owner_organization_id
       JOIN commercial.client_accounts AS account
         ON account.owner_organization_id=deal.owner_organization_id
        AND account.client_organization_id=deal.client_organization_id
        AND account.archived_at IS NULL
      WHERE deal.id=$1::uuid AND deal.owner_organization_id=$2::uuid
        AND deal.archived_at IS NULL AND deal.client_organization_id IS NOT NULL
        AND stage.canonical_class='PROPOSAL_PREPARATION'
      FOR SHARE OF deal, stage, account`,
    input.dealId, context.tenant.organizationId,
  );
  const deal = deals[0];
  if (!deal) throw new Failure("NOT_FOUND");
  if ((deal.deal_currency ?? "").trim() !== input.currency) throw new Failure("INVALID");

  const proposalId = newCommercialId();
  const resourceId = newCommercialId();
  const versionId = newCommercialId();
  const ownerId = context.tenant.organizationId;
  const now = new Date();
  await tx.$executeRawUnsafe(
    `INSERT INTO commercial.proposals
      (id,resource_id,owner_organization_id,deal_id,client_account_id,status,current_version,currency,row_version,created_by_membership_id,created_at,updated_at)
     VALUES ($1::uuid,$2::uuid,$3::uuid,$4::uuid,$5::uuid,'DRAFT',1,$6::char(3),1,$7::uuid,$8::timestamptz,$8::timestamptz)`,
    proposalId, resourceId, ownerId, deal.deal_id, deal.client_account_id,
    input.currency, context.membership.membershipId, now,
  );
  await tx.$executeRawUnsafe(
    `INSERT INTO commercial.proposal_versions
      (id,owner_organization_id,proposal_id,version,status,immutable,currency,subtotal_minor,tax_minor,total_minor,created_at)
     VALUES ($1::uuid,$2::uuid,$3::uuid,1,'DRAFT',false,$4::char(3),$5::bigint,$6::bigint,$7::bigint,$8::timestamptz)`,
    versionId, ownerId, proposalId, input.currency,
    assembled.value.subtotalMinor, assembled.value.taxMinor, assembled.value.totalMinor, now,
  );
  for (const [index, line] of assembled.value.lines.entries()) {
    await tx.$executeRawUnsafe(
      `INSERT INTO commercial.proposal_lines
        (id,owner_organization_id,proposal_version_id,description,quantity,unit_amount_minor,line_total_minor,position)
       VALUES ($1::uuid,$2::uuid,$3::uuid,$4::text,$5::int,$6::bigint,$7::bigint,$8::int)`,
      newCommercialId(), ownerId, versionId, line.description, line.quantity,
      line.unitAmountMinor, line.lineTotalMinor, index + 1,
    );
  }

  const value: CreatedDraftProposal = {
    id: proposalId, versionId, version: 1, status: "DRAFT",
    currency: input.currency, totalMinor: assembled.value.totalMinor.toString(),
  };
  const responseHash = createHash("sha256").update(JSON.stringify(value)).digest("hex");
  const auditDiff = {
    proposalCreate: {
      proposalId, versionId, version: 1, currency: input.currency,
      totalMinor: assembled.value.totalMinor.toString(),
      dealId: deal.deal_id, clientAccountId: deal.client_account_id,
    },
  } satisfies Prisma.InputJsonObject;
  await tx.$queryRawUnsafe(
    `SELECT platform.append_r7_proposal_create_audit(
      $1::uuid,$2::uuid,$3::uuid,$4::text,$5::text,$6::text,$7::jsonb,$8::text,$9::timestamptz
    )`,
    randomUUID(),
    ownerId,
    context.identity.userId,
    context.membership.membershipId,
    context.requestId,
    responseHash,
    JSON.stringify(auditDiff),
    key,
    now,
  );
  await complete(tx, input.idempotencyKey, hash, responseHash);
  return value;
}
export async function createDraftProposal(
  context: CommercialContext, input: Input, database: PrismaClient = getPrismaClient(),
): Promise<Result> {
  if (
    context.authentication !== "authenticated" ||
    context.tenant.surface !== "TEAM" || context.membership.surface !== "TEAM" ||
    context.tenant.organizationId !== context.membership.organizationId ||
    context.tenant.membershipId !== context.membership.membershipId
  ) return { kind: "error", code: "TEAM_REQUIRED" };
  if (
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/iu.test(input.dealId) ||
    !/^[A-Z]{3}$/u.test(input.currency) ||
    !/^[A-Za-z0-9._:-]{8,128}$/u.test(input.idempotencyKey) ||
    input.lines.length < 1 || input.lines.length > 100 ||
    input.lines.some((line) =>
      !line.description.trim() || line.description.trim().length > 500 ||
      !Number.isInteger(line.quantity) || line.quantity < 1 || line.quantity > 2147483647 ||
      line.unitAmountMinor < BigInt(0) || line.unitAmountMinor > MAX_BIGINT
    )
  ) return { kind: "error", code: "INVALID" };

  const normalized: Input = {
    ...input, currency: input.currency.trim(), idempotencyKey: input.idempotencyKey.trim(),
    lines: input.lines.map((line) => ({ ...line, description: line.description.trim() })),
  };
  const assembled = assembleProposalVersion("DRAFT", normalized.currency, normalized.lines);
  if (assembled.kind !== "ok") return { kind: "error", code: assembled.code };
  if (assembled.value.totalMinor > MAX_BIGINT) return { kind: "error", code: "INVALID" };

  const hash = hashInput(normalized);
  const key = auditKey(context, normalized.idempotencyKey);
  const attempt = () => withCommercialTenantTransaction(
    context,
    (tx) => perform(tx, context, normalized, assembled, hash, key),
    database,
  );
  try {
    return { kind: "ok", value: await attempt() };
  } catch (cause) {
    const known = mapError(cause);
    if (known?.kind === "error" && known.code === "CONFLICT") {
      try { return { kind: "ok", value: await attempt() }; }
      catch (retryCause) { return mapError(retryCause) ?? Promise.reject(retryCause); }
    }
    return known ?? Promise.reject(cause);
  }
}
