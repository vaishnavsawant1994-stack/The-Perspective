import "server-only";

import { createHash, randomUUID } from "node:crypto";

import type { PrismaClient } from "@/generated/prisma/client";
import {
  withCommercialTenantTransaction,
  type CommercialContext,
} from "@/modules/commercial/persistence";

export interface CreateInvoiceDraftInput {
  readonly contractId: string;
  readonly expectedContractVersionId: string;
  readonly expectedContractVersion: number;
  readonly idempotencyKey: string;
}

export interface IssueInvoiceInput {
  readonly invoiceId: string;
  readonly expectedRowVersion: number;
  readonly idempotencyKey: string;
}

export interface InvoiceDraftRecord {
  readonly invoiceId: string;
  readonly contractId: string;
  readonly contractVersionId: string;
  readonly status: string;
  readonly currency: string;
  readonly subtotalMinor: string;
  readonly taxMinor: string;
  readonly totalMinor: string;
  readonly rowVersion: number;
  readonly lineCount: number;
  readonly replayed: boolean;
}

export interface IssuedInvoiceRecord {
  readonly invoiceId: string;
  readonly status: "FINALIZED";
  readonly totalMinor: string;
  readonly rowVersion: number;
  readonly replayed: boolean;
}

export type InvoiceCommandFailure =
  | "TEAM_REQUIRED"
  | "INVALID"
  | "NOT_FOUND"
  | "STALE_WRITE"
  | "CORRELATION_DENIED"
  | "INELIGIBLE"
  | "CONFLICT"
  | "IDEMPOTENCY_CONFLICT";

export type InvoiceDraftResult =
  | { readonly kind: "ok"; readonly value: InvoiceDraftRecord }
  | { readonly kind: "error"; readonly code: InvoiceCommandFailure };

export type IssueInvoiceResult =
  | { readonly kind: "ok"; readonly value: IssuedInvoiceRecord }
  | { readonly kind: "error"; readonly code: InvoiceCommandFailure };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/iu;
const IDEMPOTENCY_KEY = /^[A-Za-z0-9._:-]{8,128}$/u;

class Failure extends Error {
  constructor(readonly code: InvoiceCommandFailure) {
    super(code);
  }
}

function databaseCode(value: unknown) {
  if (!value || typeof value !== "object") return "";
  const error = value as {
    code?: unknown;
    meta?: { driverAdapterError?: { cause?: { originalCode?: unknown } } };
  };
  return String(error.meta?.driverAdapterError?.cause?.originalCode ?? error.code ?? "");
}

function retryable(value: unknown) {
  return ["P2034", "40001", "40P01"].includes(databaseCode(value));
}

function mapError(value: unknown): { kind: "error"; code: InvoiceCommandFailure } | undefined {
  if (value instanceof Failure) return { kind: "error", code: value.code };
  switch (databaseCode(value)) {
    case "P2034": case "40001": case "40P01":
      return { kind: "error", code: "CONFLICT" };
    case "22023": case "22P02": case "23514": case "22003":
      return { kind: "error", code: "INVALID" };
    case "42501":
      return { kind: "error", code: "TEAM_REQUIRED" };
    default:
      return undefined;
  }
}

function teamContext(context: CommercialContext) {
  return context.authentication === "authenticated"
    && context.tenant.surface === "TEAM"
    && context.membership.surface === "TEAM"
    && context.tenant.organizationId === context.membership.organizationId
    && context.tenant.membershipId === context.membership.membershipId;
}

function readJson(value: unknown): Record<string, unknown> {
  const parsed: unknown = typeof value === "string" ? JSON.parse(value) : value;
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Failure("INVALID");
  }
  return parsed as Record<string, unknown>;
}

async function call(
  context: CommercialContext,
  database: PrismaClient | undefined,
  sql: string,
  values: readonly unknown[],
) {
  let conflict: Record<string, unknown> | undefined;
  for (let attemptNumber = 1; attemptNumber <= 3; attemptNumber += 1) {
    try {
      const result = await withCommercialTenantTransaction(context, async (transaction) => {
        const rows = await transaction.$queryRawUnsafe<Array<{ result: unknown }>>(sql, ...values);
        return readJson(rows[0]?.result);
      }, database);
      if (result.kind === "error" && result.code === "CONFLICT" && attemptNumber < 3) {
        conflict = result;
        continue;
      }
      return result;
    } catch (error) {
      if (!retryable(error) || attemptNumber === 3) throw error;
    }
  }
  return conflict ?? { kind: "error", code: "CONFLICT" };
}

function hash(value: Record<string, unknown>) {
  return createHash("sha256").update(JSON.stringify(value)).digest("hex");
}

function draftRecord(record: Record<string, unknown>, replayed: boolean): InvoiceDraftRecord {
  if (
    typeof record.invoiceId !== "string"
    || typeof record.contractId !== "string"
    || typeof record.contractVersionId !== "string"
    || typeof record.status !== "string"
    || typeof record.currency !== "string"
    || typeof record.subtotalMinor !== "string"
    || typeof record.taxMinor !== "string"
    || typeof record.totalMinor !== "string"
    || typeof record.rowVersion !== "number"
    || typeof record.lineCount !== "number"
  ) {
    throw new Failure("INVALID");
  }
  return {
    invoiceId: record.invoiceId,
    contractId: record.contractId,
    contractVersionId: record.contractVersionId,
    status: record.status,
    currency: record.currency,
    subtotalMinor: record.subtotalMinor,
    taxMinor: record.taxMinor,
    totalMinor: record.totalMinor,
    rowVersion: record.rowVersion,
    lineCount: record.lineCount,
    replayed,
  };
}

/**
 * Creates one draft invoice from an exact SIGNED ContractVersion.
 * Totals, currency, lines, and the source are server-owned. Proposal-direct
 * and source-less creation are not commands.
 */
export async function createInvoiceDraft(
  context: CommercialContext,
  input: CreateInvoiceDraftInput,
  database?: PrismaClient,
): Promise<InvoiceDraftResult> {
  if (!teamContext(context)) return { kind: "error", code: "TEAM_REQUIRED" };
  if (
    !UUID.test(input.contractId)
    || !UUID.test(input.expectedContractVersionId)
    || !Number.isSafeInteger(input.expectedContractVersion)
    || input.expectedContractVersion < 1
    || !IDEMPOTENCY_KEY.test(input.idempotencyKey)
  ) {
    return { kind: "error", code: "INVALID" };
  }
  const key = `r7:invoice-draft:${context.tenant.organizationId.toLowerCase()}:${input.idempotencyKey.trim()}`;
  const requestHash = hash({
    contractId: input.contractId,
    expectedContractVersion: input.expectedContractVersion,
    expectedContractVersionId: input.expectedContractVersionId,
  });
  try {
    const result = await call(
      context,
      database,
      `SELECT platform.create_r7_invoice_draft(
         $1::uuid, $2::uuid, $3::uuid, $4::uuid, $5::int, $6::text, $7::text, $8::text
       ) AS result`,
      [
        randomUUID(),
        randomUUID(),
        input.contractId,
        input.expectedContractVersionId,
        input.expectedContractVersion,
        key,
        requestHash,
        context.requestId,
      ],
    );
    if (result.kind === "error") {
      return { kind: "error", code: String(result.code) as InvoiceCommandFailure };
    }
    if (result.code !== "CREATED" && result.code !== "REPLAY") {
      return { kind: "error", code: "INVALID" };
    }
    return { kind: "ok", value: draftRecord(result, result.code === "REPLAY") };
  } catch (error) {
    return mapError(error) ?? Promise.reject(error);
  }
}

/**
 * Finalizes one server-authored draft. This is invoice.issue.
 * It does not add invoice.finalize and does not change money or lines.
 */
export async function issueInvoice(
  context: CommercialContext,
  input: IssueInvoiceInput,
  database?: PrismaClient,
): Promise<IssueInvoiceResult> {
  if (!teamContext(context)) return { kind: "error", code: "TEAM_REQUIRED" };
  if (
    !UUID.test(input.invoiceId)
    || !Number.isSafeInteger(input.expectedRowVersion)
    || input.expectedRowVersion < 1
    || !IDEMPOTENCY_KEY.test(input.idempotencyKey)
  ) {
    return { kind: "error", code: "INVALID" };
  }
  const key = `r7:invoice-issue:${context.tenant.organizationId.toLowerCase()}:${input.idempotencyKey.trim()}`;
  const requestHash = hash({
    expectedRowVersion: input.expectedRowVersion,
    invoiceId: input.invoiceId,
  });
  try {
    const result = await call(
      context,
      database,
      `SELECT platform.issue_r7_invoice(
         $1::uuid, $2::uuid, $3::int, $4::text, $5::text, $6::text
       ) AS result`,
      [randomUUID(), input.invoiceId, input.expectedRowVersion, key, requestHash, context.requestId],
    );
    if (result.kind === "error") {
      return { kind: "error", code: String(result.code) as InvoiceCommandFailure };
    }
    if (
      (result.code !== "ISSUED" && result.code !== "REPLAY")
      || result.status !== "FINALIZED"
      || typeof result.invoiceId !== "string"
      || typeof result.totalMinor !== "string"
      || typeof result.rowVersion !== "number"
    ) {
      return { kind: "error", code: "INVALID" };
    }
    return {
      kind: "ok",
      value: {
        invoiceId: result.invoiceId,
        status: "FINALIZED",
        totalMinor: result.totalMinor,
        rowVersion: result.rowVersion,
        replayed: result.code === "REPLAY",
      },
    };
  } catch (error) {
    return mapError(error) ?? Promise.reject(error);
  }
}
