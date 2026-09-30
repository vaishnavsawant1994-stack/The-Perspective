import "server-only";

import { randomUUID } from "node:crypto";

import type { PrismaClient } from "@/generated/prisma/client";
import type { TenantScopedRequestContext } from "@/modules/foundation/request-context";
import { withCommercialTenantTransaction } from "@/modules/commercial/persistence";

import {
  isVerifiedSignatureEvent,
  type SignatureEventType,
  type VerifiedSignatureEvent,
} from "./signatures";

export const SIGNATURE_RECONCILIATION_OUTCOMES = [
  "SIGNED",
  "SIGNER_RECORDED",
  "VOIDED",
  "EXPIRED",
  "REPLAY",
  "IGNORED_TERMINAL",
] as const;

export type SignatureReconciliationOutcome =
  (typeof SIGNATURE_RECONCILIATION_OUTCOMES)[number];

export type SignatureReconciliationFailure =
  | "UNVERIFIED_EVENT"
  | "NOT_FOUND"
  | "CORRELATION_DENIED"
  | "SIGNER_DENIED"
  | "INELIGIBLE"
  | "INVALID_EVENT"
  | "EVIDENCE_CONFLICT"
  | "AUTHORITY_DENIED";

export type SignatureReconciliationResult =
  | {
      readonly kind: "ok";
      readonly code: SignatureReconciliationOutcome;
      readonly priorCode?: SignatureReconciliationOutcome;
      readonly signatureRequestId: string;
      readonly contractId: string;
      readonly contractVersionId: string;
      readonly contractStatus: string;
    }
  | { readonly kind: "error"; readonly code: SignatureReconciliationFailure };

export interface ReconciliationSnapshot {
  readonly request: {
    readonly id: string;
    readonly ownerOrganizationId: string;
    readonly contractId: string;
    readonly contractVersionId: string;
    readonly provider: string;
    readonly providerRequestId: string;
    readonly documentSha256: string;
    readonly status: string;
  } | null;
  readonly version: {
    readonly id: string;
    readonly ownerOrganizationId: string;
    readonly contractId: string;
    readonly status: string;
    readonly documentSha256: string;
  } | null;
  readonly requiredSignerKeys: readonly string[];
  readonly knownSignerKeys: readonly string[];
  readonly completedSignerKeys: readonly string[];
  readonly existingEvent: {
    readonly ownerOrganizationId: string;
    readonly eventHash: string;
    readonly outcome: SignatureReconciliationOutcome;
  } | null;
}

const TERMINAL = new Set(["SIGNED", "VOID", "EXPIRED"]);

/**
 * Decision table for one verified event against canonical server state.
 * PostgreSQL `platform.reconcile_r7_signature_event` is the durable authority
 * and must return the same codes. This function does not write.
 */
export function decideSignatureReconciliation(input: {
  readonly ownerOrganizationId: string;
  readonly eventHash: string;
  readonly provider: string;
  readonly providerRequestId: string;
  readonly contractVersionId: string;
  readonly documentSha256: string;
  readonly eventType: string;
  readonly signerKey: string | null;
  readonly snapshot: ReconciliationSnapshot;
}): SignatureReconciliationResult {
  const existing = input.snapshot.existingEvent;
  if (existing) {
    if (
      existing.ownerOrganizationId !== input.ownerOrganizationId ||
      existing.eventHash !== input.eventHash
    ) {
      return { kind: "error", code: "EVIDENCE_CONFLICT" };
    }
    return {
      kind: "ok",
      code: "REPLAY",
      priorCode: existing.outcome,
      signatureRequestId: input.snapshot.request?.id ?? "",
      contractId: input.snapshot.request?.contractId ?? "",
      contractVersionId: input.snapshot.version?.id ?? input.contractVersionId,
      contractStatus: input.snapshot.version?.status ?? "",
    };
  }

  if (
    input.eventType !== "SIGNER_COMPLETED" &&
    input.eventType !== "REQUEST_VOIDED" &&
    input.eventType !== "REQUEST_EXPIRED"
  ) {
    return { kind: "error", code: "INVALID_EVENT" };
  }

  const request = input.snapshot.request;
  if (
    !request ||
    request.ownerOrganizationId !== input.ownerOrganizationId ||
    request.provider !== input.provider ||
    request.providerRequestId !== input.providerRequestId
  ) {
    return { kind: "error", code: "NOT_FOUND" };
  }

  const version = input.snapshot.version;
  if (
    !version ||
    version.ownerOrganizationId !== input.ownerOrganizationId ||
    version.id !== input.contractVersionId ||
    version.contractId !== request.contractId ||
    request.contractVersionId !== input.contractVersionId ||
    version.documentSha256 !== request.documentSha256 ||
    request.documentSha256 !== input.documentSha256
  ) {
    return { kind: "error", code: "CORRELATION_DENIED" };
  }

  if (TERMINAL.has(version.status)) {
    return ok("IGNORED_TERMINAL", request, version.status);
  }
  if (version.status !== "OUT_FOR_SIGNATURE") {
    return { kind: "error", code: "INELIGIBLE" };
  }

  if (input.eventType === "REQUEST_VOIDED") return ok("VOIDED", request, "VOID");
  if (input.eventType === "REQUEST_EXPIRED") {
    return ok("EXPIRED", request, "EXPIRED");
  }

  if (!input.signerKey || !input.snapshot.knownSignerKeys.includes(input.signerKey)) {
    return { kind: "error", code: "SIGNER_DENIED" };
  }
  if (input.snapshot.requiredSignerKeys.length === 0) {
    return { kind: "error", code: "INELIGIBLE" };
  }

  const completed = new Set(input.snapshot.completedSignerKeys);
  completed.add(input.signerKey);
  const finished = input.snapshot.requiredSignerKeys.every((key) => completed.has(key));
  return ok(finished ? "SIGNED" : "SIGNER_RECORDED", request, finished ? "SIGNED" : version.status);
}

function ok(
  code: SignatureReconciliationOutcome,
  request: NonNullable<ReconciliationSnapshot["request"]>,
  contractStatus: string,
): SignatureReconciliationResult {
  return {
    kind: "ok",
    code,
    signatureRequestId: request.id,
    contractId: request.contractId,
    contractVersionId: request.contractVersionId,
    contractStatus,
  };
}

function readResult(value: unknown): SignatureReconciliationResult {
  const parsed: unknown = typeof value === "string" ? JSON.parse(value) : value;
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    return { kind: "error", code: "INVALID_EVENT" };
  }
  const record = parsed as Record<string, unknown>;
  if (record.kind === "error" && typeof record.code === "string") {
    return { kind: "error", code: record.code as SignatureReconciliationFailure };
  }
  if (record.kind === "ok" && typeof record.code === "string") {
    return {
      kind: "ok",
      code: record.code as SignatureReconciliationOutcome,
      priorCode:
        typeof record.priorCode === "string"
          ? (record.priorCode as SignatureReconciliationOutcome)
          : undefined,
      signatureRequestId: String(record.signatureRequestId ?? ""),
      contractId: String(record.contractId ?? ""),
      contractVersionId: String(record.contractVersionId ?? ""),
      contractStatus: String(record.contractStatus ?? ""),
    };
  }
  return { kind: "error", code: "INVALID_EVENT" };
}

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

function failureFromError(error: unknown): SignatureReconciliationFailure | undefined {
  const message = errorText(error);
  if (message.includes("evidence conflict")) return "EVIDENCE_CONFLICT";
  if (message.includes("invalid R7 signature reconciliation")) return "AUTHORITY_DENIED";
  return undefined;
}

function retryableConflict(error: unknown): boolean {
  const code = databaseCode(error);
  const message = errorText(error);
  return code === "40001"
    || code === "P2034"
    || code === "40P01"
    || message.includes("could not serialize access")
    || message.includes("deadlock detected");
}

/**
 * Persists one adapter-verified event. Unbranded provider or browser payloads
 * are refused before any database call. SIGNED is produced only by the
 * server-owned SQL reconciliation function.
 */
export async function reconcileVerifiedSignatureEvent(
  context: TenantScopedRequestContext,
  event: VerifiedSignatureEvent | SignatureEventType | unknown,
  database?: PrismaClient,
): Promise<SignatureReconciliationResult> {
  if (!isVerifiedSignatureEvent(event)) {
    return { kind: "error", code: "UNVERIFIED_EVENT" };
  }

  let lastError: unknown;
  for (let attempt = 1; attempt <= 5; attempt += 1) {
    try {
      return await withCommercialTenantTransaction(
        context,
        async (transaction) => {
          const rows = await transaction.$queryRawUnsafe<Array<{ result: unknown }>>(
            `SELECT platform.reconcile_r7_signature_event(
               $1::uuid, $2::uuid, $3::text, $4::text, $5::text, $6::uuid, $7::char(64),
               $8::text, $9::text, $10::timestamptz, $11::jsonb, $12::timestamptz, $13::timestamptz
             ) AS result`,
            randomUUID(),
            randomUUID(),
            event.provider,
            event.providerEventId,
            event.providerRequestId,
            event.contractVersionId,
            event.documentSha256,
            event.eventType,
            event.signerKey,
            event.providerOccurredAt,
            JSON.stringify(event.normalizedEvidence),
            event.receivedAt,
            event.receivedAt,
          );
          return readResult(rows[0]?.result);
        },
        database,
      );
    } catch (error) {
      lastError = error;
      const code = failureFromError(error);
      if (code === "AUTHORITY_DENIED") return { kind: "error", code };
      // A serializable snapshot can misread an in-flight exact replay as an
      // evidence conflict. One fresh transaction distinguishes that from a
      // committed hash mismatch, which conflicts again.
      if (code === "EVIDENCE_CONFLICT") {
        if (attempt >= 2) return { kind: "error", code };
        continue;
      }
      if (!retryableConflict(error) || attempt === 5) break;
    }
  }
  const code = failureFromError(lastError);
  if (code) return { kind: "error", code };
  throw lastError;
}
