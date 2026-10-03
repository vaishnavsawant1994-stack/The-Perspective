import "server-only";

import { createHash, randomUUID } from "node:crypto";

import { Prisma, type PrismaClient } from "@/generated/prisma/client";
import { hashOpaqueToken } from "@/modules/authentication/crypto/tokens";
import { withCommercialTenantTransaction, type CommercialContext } from "@/modules/commercial/persistence";
import type { AuthorizedRequestContext } from "@/modules/foundation/request-context";
import { getPrismaClient } from "@/modules/persistence/client";

export type R12Failure =
  | "TEAM_REQUIRED"
  | "CLIENT_REQUIRED"
  | "MEMBER_REQUIRED"
  | "INVALID"
  | "NOT_FOUND"
  | "STALE_WRITE"
  | "INELIGIBLE"
  | "CONFLICT"
  | "IDEMPOTENCY_CONFLICT";

export type R12Result =
  | { readonly kind: "ok"; readonly value: Record<string, unknown> & { readonly replayed: boolean } }
  | { readonly kind: "error"; readonly code: R12Failure };

const KEY = /^[A-Za-z0-9._:-]{8,128}$/u;
const FORBIDDEN = ["token", "organizationId", "entitled", "premium", "amount", "currency", "price", "health", "notes", "views", "membershipId", "subscriptionId"];

function databaseCode(value: unknown) {
  if (!value || typeof value !== "object") return "";
  const error = value as { code?: unknown; meta?: { driverAdapterError?: { cause?: { originalCode?: unknown } } } };
  return String(error.meta?.driverAdapterError?.cause?.originalCode ?? error.code ?? "");
}

function readJson(value: unknown): Record<string, unknown> {
  const parsed: unknown = typeof value === "string" ? JSON.parse(value) : value;
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return { kind: "error", code: "INVALID" };
  return parsed as Record<string, unknown>;
}

function hash(value: Record<string, unknown>) {
  return createHash("sha256").update(JSON.stringify(value)).digest("hex");
}

function asResult(value: Record<string, unknown>): R12Result {
  if (value.kind === "error") return { kind: "error", code: String(value.code) as R12Failure };
  return { kind: "ok", value: { ...value, replayed: value.code === "REPLAY" } };
}

async function runtime<T>(database: PrismaClient, operation: (transaction: Prisma.TransactionClient) => Promise<T>) {
  return database.$transaction(async (transaction) => {
    await transaction.$executeRawUnsafe(`SET LOCAL ROLE perspective_runtime`);
    return operation(transaction);
  }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
}

function team(context: CommercialContext) {
  return context.authentication === "authenticated"
    && context.tenant.surface === "TEAM"
    && context.membership.surface === "TEAM"
    && context.tenant.organizationId === context.membership.organizationId
    && context.tenant.membershipId === context.membership.membershipId;
}

function client(context: AuthorizedRequestContext) {
  return context.authentication === "authenticated"
    && context.tenant.surface === "CLIENT"
    && context.membership.surface === "CLIENT"
    && context.tenant.organizationId === context.membership.organizationId
    && context.tenant.membershipId === context.membership.membershipId;
}

export async function runR12Team(
  context: CommercialContext,
  command: "invite" | "revoke",
  payload: Record<string, unknown>,
  idempotencyKey: string,
  database: PrismaClient = getPrismaClient(),
): Promise<R12Result & { readonly token?: string }> {
  if (!team(context)) return { kind: "error", code: "TEAM_REQUIRED" };
  if (!KEY.test(idempotencyKey) || FORBIDDEN.some((field) => Object.prototype.hasOwnProperty.call(payload, field))) {
    return { kind: "error", code: "INVALID" };
  }
  const token = command === "invite" ? randomUUID().replaceAll("-", "") + randomUUID().replaceAll("-", "") : undefined;
  const stored = command === "invite" ? { ...payload, tokenHash: hashOpaqueToken(token ?? "") } : payload;
  const key = `r12:${command}:${context.tenant.organizationId.toLowerCase()}:${idempotencyKey.trim()}`;
  const requestHash = hash(stored);
  try {
    const result = await withCommercialTenantTransaction(context, async (transaction) => {
      const rows = await transaction.$queryRawUnsafe<Array<{ result: unknown }>>(
        `SELECT portal.r12_team($1::text, $2::uuid, $3::jsonb, $4::uuid, $5::uuid, $6::text, $7::text, $8::text) AS result`,
        command, context.membership.membershipId, JSON.stringify(stored), randomUUID(), randomUUID(), key, requestHash, context.requestId,
      );
      return readJson(rows[0]?.result);
    }, database);
    const value = asResult(result);
    if (value.kind === "ok" && token && !value.value.replayed) return { ...value, token };
    return value;
  } catch (error) {
    const code = databaseCode(error);
    if (code === "42501") return { kind: "error", code: "TEAM_REQUIRED" };
    if (["22023", "22P02"].includes(code)) return { kind: "error", code: "INVALID" };
    throw error;
  }
}

export async function readR12Client(
  context: AuthorizedRequestContext,
  command: string,
  payload: Record<string, unknown> = {},
  database: PrismaClient = getPrismaClient(),
): Promise<R12Result> {
  if (!client(context)) return { kind: "error", code: "CLIENT_REQUIRED" };
  if (FORBIDDEN.some((field) => Object.prototype.hasOwnProperty.call(payload, field))) return { kind: "error", code: "INVALID" };
  try {
    const result = await runtime(database, async (transaction) => {
      const rows = await transaction.$queryRawUnsafe<Array<{ result: unknown }>>(
        `SELECT portal.r12_client_read($1::uuid, $2::text, $3::jsonb) AS result`,
        context.membership.membershipId, command, JSON.stringify(payload),
      );
      return readJson(rows[0]?.result);
    });
    return asResult(result);
  } catch (error) {
    const code = databaseCode(error);
    if (["22023", "22P02"].includes(code)) return { kind: "error", code: "INVALID" };
    throw error;
  }
}

export async function runR12Client(
  context: AuthorizedRequestContext,
  command: "accept" | "decide",
  payload: Record<string, unknown>,
  idempotencyKey: string,
  database: PrismaClient = getPrismaClient(),
): Promise<R12Result> {
  if (!client(context)) return { kind: "error", code: "CLIENT_REQUIRED" };
  const presented = command === "accept" && typeof payload.token === "string" ? payload.token : undefined;
  const stored = presented ? { tokenHash: hashOpaqueToken(presented) } : payload;
  if (!KEY.test(idempotencyKey) || (command === "accept" && !presented) || FORBIDDEN.some((field) => Object.prototype.hasOwnProperty.call(stored, field))) {
    return { kind: "error", code: "INVALID" };
  }
  const requestHash = hash(stored);
  try {
    let last: Record<string, unknown> = { kind: "error", code: "CONFLICT" };
    for (let attempt = 1; attempt <= 3; attempt += 1) {
      try {
        const result = await runtime(database, async (transaction) => {
          const rows = await transaction.$queryRawUnsafe<Array<{ result: unknown }>>(
            `SELECT portal.r12_client($1::uuid, $2::text, $3::jsonb, $4::uuid, $5::uuid, $6::text, $7::text, $8::text) AS result`,
            context.membership.membershipId, command, JSON.stringify(stored), randomUUID(), randomUUID(), idempotencyKey.trim(), requestHash, context.requestId,
          );
          return readJson(rows[0]?.result);
        });
        if (result.kind === "error" && result.code === "CONFLICT" && attempt < 3) {
          last = result;
          continue;
        }
        return asResult(result);
      } catch (error) {
        const code = databaseCode(error);
        if (["40001", "40P01"].includes(code) && attempt < 3) continue;
        if (code === "42501") return { kind: "error", code: "CLIENT_REQUIRED" };
        if (["22023", "22P02"].includes(code)) return { kind: "error", code: "INVALID" };
        throw error;
      }
    }
    return asResult(last);
  } catch (error) {
    const code = databaseCode(error);
    if (["22023", "22P02"].includes(code)) return { kind: "error", code: "INVALID" };
    throw error;
  }
}

export async function readR12Member(userId: string, command: string, payload: Record<string, unknown> = {}, database: PrismaClient = getPrismaClient()): Promise<R12Result> {
  try {
    const result = await runtime(database, async (transaction) => {
      await transaction.$queryRaw`SELECT set_config('app.user_id', ${userId}, true)`;
      const rows = await transaction.$queryRawUnsafe<Array<{ result: unknown }>>(
        `SELECT portal.r12_member_read($1::uuid, $2::text, $3::jsonb) AS result`,
        userId, command, JSON.stringify(payload),
      );
      return readJson(rows[0]?.result);
    });
    return asResult(result);
  } catch (error) {
    const code = databaseCode(error);
    if (["22023", "22P02"].includes(code)) return { kind: "error", code: "NOT_FOUND" };
    throw error;
  }
}

export async function runR12Member(
  userId: string,
  command: "rename" | "checkout" | "cancel",
  payload: Record<string, unknown>,
  idempotencyKey: string,
  requestId: string,
  database: PrismaClient = getPrismaClient(),
): Promise<R12Result> {
  if (!KEY.test(idempotencyKey) || FORBIDDEN.some((field) => Object.prototype.hasOwnProperty.call(payload, field))) {
    return { kind: "error", code: "INVALID" };
  }
  const requestHash = hash(payload);
  try {
    const result = await runtime(database, async (transaction) => {
      await transaction.$queryRaw`SELECT set_config('app.user_id', ${userId}, true)`;
      const rows = await transaction.$queryRawUnsafe<Array<{ result: unknown }>>(
        `SELECT portal.r12_member($1::uuid, $2::text, $3::jsonb, $4::uuid, $5::uuid, $6::text, $7::text, $8::text) AS result`,
        userId, command, JSON.stringify(payload), randomUUID(), randomUUID(), idempotencyKey.trim(), requestHash, requestId,
      );
      return readJson(rows[0]?.result);
    });
    return asResult(result);
  } catch (error) {
    const code = databaseCode(error);
    if (["22023", "22P02"].includes(code)) return { kind: "error", code: "INVALID" };
    throw error;
  }
}

export async function runR12Worker(
  command: "open-offer" | "grant" | "revoke",
  payload: Record<string, unknown>,
  idempotencyKey: string,
  database: PrismaClient = getPrismaClient(),
): Promise<R12Result> {
  if (!KEY.test(idempotencyKey) || payload.entitled !== undefined || payload.premium !== undefined || payload.price !== undefined) {
    return { kind: "error", code: "INVALID" };
  }
  const key = `r12:${command}:${idempotencyKey.trim()}`;
  const requestHash = hash(payload);
  try {
    const result = await runtime(database, async (transaction) => {
      const rows = await transaction.$queryRawUnsafe<Array<{ result: unknown }>>(
        `SELECT portal.r12_worker($1::text, $2::jsonb, $3::uuid, $4::uuid, $5::text, $6::text, $7::text) AS result`,
        command, JSON.stringify(payload), randomUUID(), randomUUID(), key, requestHash, `r12-${command}`,
      );
      return readJson(rows[0]?.result);
    });
    return asResult(result);
  } catch (error) {
    const code = databaseCode(error);
    if (["22023", "22P02"].includes(code)) return { kind: "error", code: "INVALID" };
    throw error;
  }
}
