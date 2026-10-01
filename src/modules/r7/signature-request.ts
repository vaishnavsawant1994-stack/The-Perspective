import "server-only";

import { createHash, randomUUID } from "node:crypto";

import type { PrismaClient } from "@/generated/prisma/client";
import {
  withCommercialTenantTransaction,
  type CommercialContext,
} from "@/modules/commercial/persistence";

import {
  resolveOutboundSignatureProvider,
  SignatureProviderAmbiguousError,
  type OutboundSignatureRequest,
  type SignatureProviderAdapter,
} from "./signatures";

export interface RequestContractSignatureInput {
  readonly contractId: string;
  readonly expectedVersionId: string;
  readonly expectedVersion: number;
  readonly expectedRowVersion: number;
  readonly expectedDocumentSha256: string;
  readonly idempotencyKey: string;
}

export interface RequestedContractSignature {
  readonly signatureRequestId: string;
  readonly contractId: string;
  readonly contractVersionId: string;
  readonly provider: string;
  readonly providerRequestId: string;
  readonly contractStatus: "OUT_FOR_SIGNATURE";
  readonly replayed: boolean;
}

export type SignatureRequestFailure =
  | "TEAM_REQUIRED"
  | "INVALID"
  | "NOT_FOUND"
  | "STALE_WRITE"
  | "CORRELATION_DENIED"
  | "INELIGIBLE"
  | "CONFLICT"
  | "IDEMPOTENCY_CONFLICT"
  | "PROVIDER_UNAVAILABLE"
  | "PROVIDER_AMBIGUOUS"
  | "PROVIDER_FAILED";

export type SignatureRequestCommandResult =
  | { readonly kind: "ok"; readonly value: RequestedContractSignature }
  | { readonly kind: "error"; readonly code: SignatureRequestFailure };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/iu;
const IDEMPOTENCY_KEY = /^[A-Za-z0-9._:-]{8,128}$/u;
const SHA256 = /^[0-9a-f]{64}$/u;
const PROVIDER = /^[a-z0-9][a-z0-9._-]{0,99}$/u;
const PROVIDER_REQUEST_ID = /^[A-Za-z0-9._:-]{1,200}$/u;

class Failure extends Error {
  constructor(readonly code: SignatureRequestFailure) {
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

function mapError(value: unknown): SignatureRequestCommandResult | undefined {
  if (value instanceof Failure) return { kind: "error", code: value.code };
  switch (databaseCode(value)) {
    case "P2034": case "40001": case "40P01":
      return { kind: "error", code: "CONFLICT" };
    case "22023": case "22P02": case "23514":
      return { kind: "error", code: "INVALID" };
    case "42501":
      return { kind: "error", code: "TEAM_REQUIRED" };
    default:
      return undefined;
  }
}

function validateInput(input: RequestContractSignatureInput) {
  return UUID.test(input.contractId) &&
    UUID.test(input.expectedVersionId) &&
    Number.isSafeInteger(input.expectedVersion) && input.expectedVersion > 0 &&
    Number.isSafeInteger(input.expectedRowVersion) && input.expectedRowVersion > 0 &&
    SHA256.test(input.expectedDocumentSha256) &&
    IDEMPOTENCY_KEY.test(input.idempotencyKey);
}

function requestHash(input: RequestContractSignatureInput) {
  return createHash("sha256").update(JSON.stringify({
    contractId: input.contractId,
    expectedDocumentSha256: input.expectedDocumentSha256,
    expectedRowVersion: input.expectedRowVersion,
    expectedVersion: input.expectedVersion,
    expectedVersionId: input.expectedVersionId,
  })).digest("hex");
}

function canonicalKey(context: CommercialContext, key: string) {
  return `r7:signature-request:${context.tenant.organizationId.toLowerCase()}:${key.trim()}`;
}

function readJson(value: unknown): Record<string, unknown> {
  const parsed: unknown = typeof value === "string" ? JSON.parse(value) : value;
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Failure("INVALID");
  }
  return parsed as Record<string, unknown>;
}

function signerKeys(value: unknown) {
  const parsed: unknown = typeof value === "string" ? JSON.parse(value) : value;
  if (!Array.isArray(parsed) || parsed.some((item) => typeof item !== "string" || item.length === 0)) {
    throw new Failure("INVALID");
  }
  return parsed as string[];
}

async function call(
  context: CommercialContext,
  database: PrismaClient | undefined,
  sql: string,
  values: readonly unknown[],
) {
  return withCommercialTenantTransaction(context, async (transaction) => {
    const rows = await transaction.$queryRawUnsafe<Array<{ result: unknown }>>(sql, ...values);
    return readJson(rows[0]?.result);
  }, database);
}

async function attempt<T>(operation: () => Promise<T>) {
  let last: unknown;
  for (let attemptNumber = 1; attemptNumber <= 3; attemptNumber += 1) {
    try {
      return await operation();
    } catch (error) {
      last = error;
      if (!retryable(error) || attemptNumber === 3) throw error;
    }
  }
  throw last;
}

function sent(
  record: Record<string, unknown>,
  provider: string,
  replayed: boolean,
): RequestedContractSignature {
  const providerRequestId = String(record.providerRequestId ?? "");
  if (
    typeof record.signatureRequestId !== "string" ||
    typeof record.contractId !== "string" ||
    typeof record.contractVersionId !== "string" ||
    !PROVIDER_REQUEST_ID.test(providerRequestId)
  ) {
    throw new Failure("INVALID");
  }
  return {
    signatureRequestId: record.signatureRequestId,
    contractId: record.contractId,
    contractVersionId: record.contractVersionId,
    provider,
    providerRequestId,
    contractStatus: "OUT_FOR_SIGNATURE",
    replayed,
  };
}

/**
 * Requests an external signature for one exact READY_FOR_SIGNATURE version.
 * The default provider resolver trusts nobody. Browser input cannot choose
 * the provider, the signer set, or SIGNED.
 */
export async function requestContractSignature(
  context: CommercialContext,
  input: RequestContractSignatureInput,
  database?: PrismaClient,
  adapter: SignatureProviderAdapter | undefined = resolveOutboundSignatureProvider(),
): Promise<SignatureRequestCommandResult> {
  if (
    context.authentication !== "authenticated" ||
    context.tenant.surface !== "TEAM" ||
    context.membership.surface !== "TEAM" ||
    context.tenant.organizationId !== context.membership.organizationId ||
    context.tenant.membershipId !== context.membership.membershipId
  ) {
    return { kind: "error", code: "TEAM_REQUIRED" };
  }
  if (!validateInput(input)) return { kind: "error", code: "INVALID" };
  if (!adapter?.submitSignatureRequest || !PROVIDER.test(adapter.provider)) {
    return { kind: "error", code: "PROVIDER_UNAVAILABLE" };
  }

  const key = canonicalKey(context, input.idempotencyKey);
  const hash = requestHash(input);
  const provider = adapter.provider;

  try {
    const reserved = await (async () => {
      let conflict: Record<string, unknown> | undefined;
      for (let attemptNumber = 1; attemptNumber <= 3; attemptNumber += 1) {
        try {
          const result = await call(
            context,
            database,
            `SELECT platform.reserve_r7_signature_request(
               $1::uuid, $2::uuid, $3::uuid, $4::uuid, $5::int, $6::int, $7::text,
               $8::text, $9::text, $10::text, $11::text
             ) AS result`,
            [
              randomUUID(),
              randomUUID(),
              input.contractId,
              input.expectedVersionId,
              input.expectedVersion,
              input.expectedRowVersion,
              input.expectedDocumentSha256,
              provider,
              key,
              hash,
              context.requestId,
            ],
          );
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
    })();

    if (reserved.kind === "error") {
      return { kind: "error", code: String(reserved.code) as SignatureRequestFailure };
    }
    if (reserved.code === "REPLAY") return { kind: "ok", value: sent(reserved, provider, true) };
    if (reserved.code === "RETRY_COMMIT") {
      return complete(context, database, key, hash, String(reserved.providerRequestId ?? ""), provider, true);
    }
    if (reserved.code !== "RESERVED") return { kind: "error", code: "INVALID" };

    const submissionRequest: OutboundSignatureRequest = {
      contractId: input.contractId,
      contractVersionId: input.expectedVersionId,
      documentSha256: input.expectedDocumentSha256,
      signerKeys: signerKeys(reserved.signerKeys),
      idempotencyKey: key,
    };
    let submission: { providerRequestId: string } | null;
    try {
      submission = await adapter.submitSignatureRequest(submissionRequest);
    } catch (error) {
      if (error instanceof SignatureProviderAmbiguousError) {
        return { kind: "error", code: "PROVIDER_AMBIGUOUS" };
      }
      return { kind: "error", code: "PROVIDER_AMBIGUOUS" };
    }
    if (!submission || !PROVIDER_REQUEST_ID.test(submission.providerRequestId)) {
      await fail(context, database, key, hash);
      return { kind: "error", code: "PROVIDER_FAILED" };
    }
    const recorded = await attempt(() => call(
      context,
      database,
      `SELECT platform.record_r7_signature_provider($1::text, $2::text, $3::text) AS result`,
      [key, hash, submission.providerRequestId],
    ));
    if (recorded.kind === "error") {
      return { kind: "error", code: String(recorded.code) as SignatureRequestFailure };
    }
    return complete(context, database, key, hash, submission.providerRequestId, provider, false);
  } catch (error) {
    return mapError(error) ?? Promise.reject(error);
  }
}

async function complete(
  context: CommercialContext,
  database: PrismaClient | undefined,
  key: string,
  hash: string,
  providerRequestId: string,
  provider: string,
  replayed: boolean,
) {
  const result = await attempt(() => call(
    context,
    database,
    `SELECT platform.complete_r7_signature_request(
       $1::uuid, $2::text, $3::text, $4::text, $5::text
     ) AS result`,
    [randomUUID(), key, hash, providerRequestId, context.requestId],
  ));
  if (result.kind === "error") {
    return { kind: "error" as const, code: String(result.code) as SignatureRequestFailure };
  }
  return {
    kind: "ok" as const,
    value: sent(result, provider, replayed || result.code === "REPLAY"),
  };
}

async function fail(
  context: CommercialContext,
  database: PrismaClient | undefined,
  key: string,
  hash: string,
) {
  await attempt(() => call(
    context,
    database,
    `SELECT platform.fail_r7_signature_request($1::uuid, $2::text, $3::text, $4::text) AS result`,
    [randomUUID(), key, hash, context.requestId],
  ));
}
