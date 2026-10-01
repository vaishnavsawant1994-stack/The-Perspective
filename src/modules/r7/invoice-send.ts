import "server-only";

import { createHash, randomUUID } from "node:crypto";

import type { PrismaClient } from "@/generated/prisma/client";
import {
  withCommercialTenantTransaction,
  type CommercialContext,
} from "@/modules/commercial/persistence";

export interface SendInvoiceInput {
  readonly invoiceId: string;
  readonly expectedRowVersion: number;
  readonly idempotencyKey: string;
}

export interface SentInvoice {
  readonly invoiceId: string;
  readonly status: string;
  readonly currency: string;
  readonly totalMinor: string;
  readonly rowVersion: number;
  readonly delivery: "QUEUED";
  readonly replayed: boolean;
}

export type SendInvoiceResult =
  | { readonly kind: "ok"; readonly value: SentInvoice }
  | { readonly kind: "error"; readonly code: "TEAM_REQUIRED" | "INVALID" | "NOT_FOUND" | "STALE_WRITE" | "INELIGIBLE" | "IDEMPOTENCY_CONFLICT" | "CONFLICT" };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/iu;
const IDEMPOTENCY_KEY = /^[A-Za-z0-9._:-]{8,128}$/u;

function team(context: CommercialContext) {
  return context.authentication === "authenticated"
    && context.tenant.surface === "TEAM"
    && context.membership.surface === "TEAM"
    && context.tenant.organizationId === context.membership.organizationId
    && context.tenant.membershipId === context.membership.membershipId;
}

function read(value: unknown, replayed: boolean): SendInvoiceResult {
  const parsed: unknown = typeof value === "string" ? JSON.parse(value) : value;
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    return { kind: "error", code: "INVALID" };
  }
  const record = parsed as Record<string, unknown>;
  if (record.kind === "error" && typeof record.code === "string") {
    return { kind: "error", code: record.code as "NOT_FOUND" };
  }
  if (
    record.kind === "ok"
    && typeof record.invoiceId === "string"
    && typeof record.status === "string"
    && typeof record.currency === "string"
    && typeof record.totalMinor === "string"
    && typeof record.rowVersion === "number"
  ) {
    return {
      kind: "ok",
      value: {
        invoiceId: record.invoiceId,
        status: record.status,
        currency: record.currency,
        totalMinor: record.totalMinor,
        rowVersion: record.rowVersion,
        delivery: "QUEUED",
        replayed,
      },
    };
  }
  return { kind: "error", code: "INVALID" };
}

/**
 * Queues delivery of an already finalized invoice. It does not change money,
 * status, source, or row version, and it does not send email itself.
 */
export async function sendInvoice(
  context: CommercialContext,
  input: SendInvoiceInput,
  database?: PrismaClient,
): Promise<SendInvoiceResult> {
  if (!team(context)) return { kind: "error", code: "TEAM_REQUIRED" };
  if (
    !UUID.test(input.invoiceId)
    || !Number.isSafeInteger(input.expectedRowVersion)
    || input.expectedRowVersion < 1
    || !IDEMPOTENCY_KEY.test(input.idempotencyKey)
  ) {
    return { kind: "error", code: "INVALID" };
  }
  const key = `r7:invoice-send:${context.tenant.organizationId.toLowerCase()}:${input.idempotencyKey.trim()}`;
  const requestHash = createHash("sha256").update(JSON.stringify({
    expectedRowVersion: input.expectedRowVersion,
    invoiceId: input.invoiceId,
  })).digest("hex");
  try {
    return await withCommercialTenantTransaction(context, async (transaction) => {
      const rows = await transaction.$queryRawUnsafe<Array<{ result: unknown }>>(
        `SELECT platform.send_r7_invoice(
           $1::uuid, $2::uuid, $3::uuid, $4::uuid, $5::int, $6::text, $7::text, $8::text
         ) AS result`,
        randomUUID(),
        randomUUID(),
        randomUUID(),
        input.invoiceId,
        input.expectedRowVersion,
        key,
        requestHash,
        context.requestId,
      );
      const parsed: unknown = typeof rows[0]?.result === "string"
        ? JSON.parse(rows[0].result)
        : rows[0]?.result;
      const code = parsed && typeof parsed === "object" && !Array.isArray(parsed)
        ? (parsed as { code?: unknown }).code
        : undefined;
      return read(rows[0]?.result, code === "REPLAY");
    }, database);
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message.includes("invalid R7 invoice send")) return { kind: "error", code: "INVALID" };
    throw error;
  }
}
