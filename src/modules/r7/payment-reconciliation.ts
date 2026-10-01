import "server-only";

import { randomUUID } from "node:crypto";

import type { PrismaClient } from "@/generated/prisma/client";
import type { TenantScopedRequestContext } from "@/modules/foundation/request-context";
import { withCommercialTenantTransaction } from "@/modules/commercial/persistence";

import { isVerifiedPaymentEvent, type VerifiedPaymentEvent } from "./payments";

export const PAYMENT_RECONCILIATION_OUTCOMES = [
  "ALLOCATED",
  "PAID",
  "RECORDED",
  "REPLAY",
] as const;

export type PaymentReconciliationOutcome = (typeof PAYMENT_RECONCILIATION_OUTCOMES)[number];

export type PaymentReconciliationFailure =
  | "UNVERIFIED_EVENT"
  | "NOT_FOUND"
  | "CORRELATION_DENIED"
  | "INELIGIBLE"
  | "OVER_ALLOCATION"
  | "INVALID_EVENT"
  | "EVIDENCE_CONFLICT"
  | "AUTHORITY_DENIED";

export type PaymentReconciliationResult =
  | {
      readonly kind: "ok";
      readonly code: PaymentReconciliationOutcome;
      readonly paymentId: string;
      readonly invoiceId: string;
      readonly paymentStatus: string;
      readonly invoiceStatus: string;
      readonly allocatedMinor: string;
    }
  | { readonly kind: "error"; readonly code: PaymentReconciliationFailure };

function databaseCode(value: unknown): string {
  const seen = new Set<unknown>();
  let current: unknown = value;
  while (current && typeof current === "object" && !seen.has(current)) {
    seen.add(current);
    const error = current as {
      code?: unknown;
      cause?: unknown;
      meta?: { driverAdapterError?: { cause?: { originalCode?: unknown; code?: unknown } } };
    };
    const original = error.meta?.driverAdapterError?.cause?.originalCode
      ?? error.meta?.driverAdapterError?.cause?.code
      ?? error.code;
    if (typeof original === "string" && original.length > 0) return original;
    current = error.cause;
  }
  return "";
}

function errorText(value: unknown): string {
  const seen = new Set<unknown>();
  const chunks: string[] = [];
  let current: unknown = value;
  while (current && typeof current === "object" && !seen.has(current) && chunks.length < 8) {
    seen.add(current);
    const error = current as { message?: unknown; cause?: unknown; meta?: unknown };
    if (typeof error.message === "string") chunks.push(error.message);
    if (error.meta !== undefined) chunks.push(JSON.stringify(error.meta));
    current = error.cause;
  }
  return chunks.join("\n");
}

function failureFromError(error: unknown): PaymentReconciliationFailure | undefined {
  const message = errorText(error);
  if (message.includes("evidence conflict")) return "EVIDENCE_CONFLICT";
  if (message.includes("invalid R7 payment reconciliation")) return "AUTHORITY_DENIED";
  return undefined;
}

function retryable(error: unknown) {
  const code = databaseCode(error);
  const message = errorText(error);
  return code === "40001"
    || code === "P2034"
    || code === "40P01"
    || message.includes("could not serialize access")
    || message.includes("deadlock detected");
}

function readResult(value: unknown): PaymentReconciliationResult {
  const parsed: unknown = typeof value === "string" ? JSON.parse(value) : value;
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    return { kind: "error", code: "INVALID_EVENT" };
  }
  const record = parsed as Record<string, unknown>;
  if (record.kind === "error" && typeof record.code === "string") {
    return { kind: "error", code: record.code as PaymentReconciliationFailure };
  }
  if (
    record.kind === "ok"
    && typeof record.code === "string"
    && typeof record.paymentId === "string"
    && typeof record.invoiceId === "string"
    && typeof record.paymentStatus === "string"
    && typeof record.invoiceStatus === "string"
    && typeof record.allocatedMinor === "string"
  ) {
    return {
      kind: "ok",
      code: record.code as PaymentReconciliationOutcome,
      paymentId: record.paymentId,
      invoiceId: record.invoiceId,
      paymentStatus: record.paymentStatus,
      invoiceStatus: record.invoiceStatus,
      allocatedMinor: record.allocatedMinor,
    };
  }
  return { kind: "error", code: "INVALID_EVENT" };
}

/**
 * Applies one adapter-verified payment event. Unbranded provider or browser
 * payloads are refused before any database call. SUCCEEDED, invoice allocation,
 * and ledger entries are produced only by the server-owned SQL function.
 */
export async function reconcileVerifiedPaymentEvent(
  context: TenantScopedRequestContext,
  event: VerifiedPaymentEvent | unknown,
  database?: PrismaClient,
): Promise<PaymentReconciliationResult> {
  if (!isVerifiedPaymentEvent(event)) {
    return { kind: "error", code: "UNVERIFIED_EVENT" };
  }

  let lastError: unknown;
  for (let attempt = 1; attempt <= 5; attempt += 1) {
    try {
      return await withCommercialTenantTransaction(
        context,
        async (transaction) => {
          const rows = await transaction.$queryRawUnsafe<Array<{ result: unknown }>>(
            `SELECT platform.reconcile_r7_payment_event(
               $1::uuid, $2::uuid, $3::uuid, $4::text, $5::text, $6::uuid, $7::text,
               $8::bigint, $9::text, $10::jsonb, $11::timestamptz
             ) AS result`,
            randomUUID(),
            randomUUID(),
            randomUUID(),
            event.provider,
            event.providerEventId,
            event.invoiceId,
            event.currency,
            event.amountMinor,
            event.eventType,
            JSON.stringify(event.normalizedEvidence),
            event.providerOccurredAt,
          );
          return readResult(rows[0]?.result);
        },
        database,
      );
    } catch (error) {
      lastError = error;
      const code = failureFromError(error);
      if (code === "AUTHORITY_DENIED") return { kind: "error", code };
      if (code === "EVIDENCE_CONFLICT") {
        if (attempt >= 2) return { kind: "error", code };
        continue;
      }
      if (!retryable(error) || attempt === 5) break;
    }
  }
  const code = failureFromError(lastError);
  if (code) return { kind: "error", code };
  throw lastError;
}
