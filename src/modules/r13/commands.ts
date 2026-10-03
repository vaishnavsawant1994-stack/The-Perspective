import "server-only";

import { createHash, randomUUID } from "node:crypto";

import type { PrismaClient } from "@/generated/prisma/client";
import { withCommercialTenantTransaction, type CommercialContext } from "@/modules/commercial/persistence";
import { getPrismaClient } from "@/modules/persistence/client";

export type R13Failure =
  | "TEAM_REQUIRED"
  | "INVALID"
  | "NOT_FOUND"
  | "STALE_WRITE"
  | "INELIGIBLE"
  | "CONFLICT"
  | "IDEMPOTENCY_CONFLICT";

export type R13Result =
  | { readonly kind: "ok"; readonly value: Record<string, unknown> & { readonly replayed: boolean } }
  | { readonly kind: "error"; readonly code: R13Failure };

const KEY = /^[A-Za-z0-9._:-]{8,128}$/u;
const FORBIDDEN = [
  "organizationId", "isAdmin", "isOwner", "role", "permissions", "verified", "status",
  "secret", "token", "apiKey", "webhookSecret", "password", "delivered", "ready", "state",
];

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
  const ordered = Object.keys(value).sort().reduce<Record<string, unknown>>((accumulator, key) => {
    accumulator[key] = value[key];
    return accumulator;
  }, {});
  return createHash("sha256").update(JSON.stringify(ordered)).digest("hex");
}

function asResult(value: Record<string, unknown>): R13Result {
  if (value.kind === "error") return { kind: "error", code: String(value.code) as R13Failure };
  return { kind: "ok", value: { ...value, replayed: value.code === "REPLAY" } };
}

function team(context: CommercialContext) {
  return context.authentication === "authenticated"
    && context.tenant.surface === "TEAM"
    && context.membership.surface === "TEAM"
    && context.tenant.organizationId === context.membership.organizationId
    && context.tenant.membershipId === context.membership.membershipId;
}

export async function readR13(
  context: CommercialContext,
  command: "settings" | "integrations",
  database: PrismaClient = getPrismaClient(),
): Promise<R13Result> {
  if (!team(context)) return { kind: "error", code: "TEAM_REQUIRED" };
  try {
    const result = await withCommercialTenantTransaction(context, async (transaction) => {
      const rows = await transaction.$queryRawUnsafe<Array<{ result: unknown }>>(
        `SELECT ops.r13_read($1::uuid, $2::text) AS result`,
        context.membership.membershipId, command,
      );
      return readJson(rows[0]?.result);
    }, database);
    return asResult(result);
  } catch (error) {
    const code = databaseCode(error);
    if (["22023", "22P02"].includes(code)) return { kind: "error", code: "INVALID" };
    throw error;
  }
}

export async function runR13(
  context: CommercialContext,
  command: "update-settings" | "declare" | "disable" | "verify",
  payload: Record<string, unknown>,
  idempotencyKey: string,
  database: PrismaClient = getPrismaClient(),
): Promise<R13Result> {
  if (!team(context)) return { kind: "error", code: "TEAM_REQUIRED" };
  if (!KEY.test(idempotencyKey) || FORBIDDEN.some((field) => Object.prototype.hasOwnProperty.call(payload, field))) {
    return { kind: "error", code: "INVALID" };
  }
  const key = `r13:${command}:${context.tenant.organizationId.toLowerCase()}:${idempotencyKey.trim()}`;
  const requestHash = hash(payload);
  let last: Record<string, unknown> = { kind: "error", code: "CONFLICT" };
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const result = await withCommercialTenantTransaction(context, async (transaction) => {
        const rows = await transaction.$queryRawUnsafe<Array<{ result: unknown }>>(
          `SELECT ops.r13_command($1::text, $2::uuid, $3::jsonb, $4::uuid, $5::uuid, $6::text, $7::text, $8::text) AS result`,
          command, context.membership.membershipId, JSON.stringify(payload), randomUUID(), randomUUID(), key, requestHash, context.requestId,
        );
        return readJson(rows[0]?.result);
      }, database);
      if (result.kind === "error" && result.code === "CONFLICT" && attempt < 3) {
        last = result;
        continue;
      }
      return asResult(result);
    } catch (error) {
      const code = databaseCode(error);
      if (["40001", "40P01"].includes(code) && attempt < 3) continue;
      if (code === "42501") return { kind: "error", code: "TEAM_REQUIRED" };
      if (["22023", "22P02"].includes(code)) return { kind: "error", code: "INVALID" };
      throw error;
    }
  }
  return asResult(last);
}
