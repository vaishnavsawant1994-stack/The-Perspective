import "server-only";

import { createHash, randomUUID } from "node:crypto";
import type { PrismaClient } from "@/generated/prisma/client";
import type { AuthorizedRequestContext } from "@/modules/foundation/request-context";
import {
  withClientAcceptanceTransaction,
} from "@/modules/commercial/persistence";
import { getPrismaClient } from "@/modules/persistence/client";
import { loadClientProposalAcceptanceResource } from "./resources";

export interface AcceptProposalInput {
  readonly proposalId: string;
  readonly expectedVersionId: string;
  readonly expectedVersion: number;
  readonly expectedRowVersion: number;
  readonly idempotencyKey: string;
}

export interface AcceptedProposal {
  readonly proposalId: string;
  readonly versionId: string;
  readonly version: number;
  readonly status: "ACCEPTED";
  readonly acceptedAt: string;
  readonly replayed: boolean;
}

type Result = { readonly kind: "ok"; readonly value: AcceptedProposal } | {
  readonly kind: "error"; readonly code: string;
};

class Failure extends Error {
  constructor(readonly code: string) { super(code); }
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/iu;
const IDEMPOTENCY_KEY = /^[A-Za-z0-9._:-]{8,128}$/u;

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
    case "P2004": case "23514": case "22023": case "22P02": return { kind: "error", code: "INVALID" };
    case "42501": return { kind: "error", code: "CLIENT_REQUIRED" };
    default: return undefined;
  }
}

function validateInput(input: AcceptProposalInput) {
  return UUID.test(input.proposalId) && UUID.test(input.expectedVersionId) &&
    Number.isSafeInteger(input.expectedVersion) && input.expectedVersion > 0 &&
    Number.isSafeInteger(input.expectedRowVersion) && input.expectedRowVersion > 0 &&
    IDEMPOTENCY_KEY.test(input.idempotencyKey);
}

function canonicalIdempotencyKey(context: AuthorizedRequestContext, key: string) {
  return `r7:proposal-accept:${context.tenant.organizationId}:${key}`;
}

export async function acceptProposal(
  context: AuthorizedRequestContext,
  input: AcceptProposalInput,
  database: PrismaClient = getPrismaClient(),
): Promise<Result> {
  if (
    context.authentication !== "authenticated" || context.tenant.surface !== "CLIENT" ||
    context.membership.surface !== "CLIENT" ||
    context.tenant.organizationId !== context.membership.organizationId ||
    context.tenant.membershipId !== context.membership.membershipId
  ) return { kind: "error", code: "CLIENT_REQUIRED" };
  if (!validateInput(input)) return { kind: "error", code: "INVALID" };

  const idempotencyKey = canonicalIdempotencyKey(context, input.idempotencyKey.trim());
  const requestHash = createHash("sha256").update(JSON.stringify({
    proposalId: input.proposalId,
    expectedVersionId: input.expectedVersionId,
    expectedVersion: input.expectedVersion,
    expectedRowVersion: input.expectedRowVersion,
    actorUserId: context.identity.userId,
    actorMembershipId: context.membership.membershipId,
    clientOrganizationId: context.tenant.organizationId,
  })).digest("hex");
  const afterHash = createHash("sha256").update(JSON.stringify({
    proposalId: input.proposalId,
    proposalVersionId: input.expectedVersionId,
    version: input.expectedVersion,
    status: "ACCEPTED",
    actorUserId: context.identity.userId,
    actorMembershipId: context.membership.membershipId,
    clientOrganizationId: context.tenant.organizationId,
  })).digest("hex");

  const canonical = await loadClientProposalAcceptanceResource(context, input.proposalId, database);
  if (!canonical) return { kind: "error", code: "NOT_FOUND" };
  const ownerOrganizationId = canonical.authorizationResource.ownerOrganizationId;
  if (!ownerOrganizationId) return { kind: "error", code: "NOT_FOUND" };

  const attempt = () => withClientAcceptanceTransaction(context, ownerOrganizationId, async (transaction): Promise<AcceptedProposal> => {
    const rows = await transaction.$queryRawUnsafe<Array<{ result: unknown }>>(
      `SELECT platform.complete_r7_proposal_acceptance(
        $1::uuid,$2::uuid,$3::uuid,$4::uuid,$5::uuid,$6::uuid,$7::uuid,$8::uuid,$9::uuid,
        $10::int,$11::int,$12::text,$13::text,$14::text,$15::text
      ) AS result`,
      randomUUID(), randomUUID(), randomUUID(), context.tenant.organizationId,
      ownerOrganizationId, context.identity.userId, context.membership.membershipId,
      input.proposalId, input.expectedVersionId, input.expectedVersion,
      input.expectedRowVersion, context.requestId, idempotencyKey, requestHash, afterHash,
    );
    const result = rows[0]?.result as {
      kind?: string; code?: string; replayed?: boolean; proposalId?: string;
      versionId?: string; version?: number; status?: string; acceptedAt?: Date | string;
    } | undefined;
    if (result?.kind === "error") throw new Failure(result.code ?? "CONFLICT");
    if (result?.kind !== "ok" || result.proposalId !== input.proposalId ||
        result.versionId !== input.expectedVersionId || result.version !== input.expectedVersion ||
        result.status !== "ACCEPTED" || !result.acceptedAt) throw new Failure("CONFLICT");
    const acceptedAt = result.acceptedAt instanceof Date
      ? result.acceptedAt.toISOString()
      : new Date(result.acceptedAt).toISOString();
    if (Number.isNaN(Date.parse(acceptedAt))) throw new Failure("CONFLICT");
    return {
      proposalId: result.proposalId,
      versionId: result.versionId,
      version: result.version,
      status: "ACCEPTED",
      acceptedAt,
      replayed: result.replayed === true,
    };
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
