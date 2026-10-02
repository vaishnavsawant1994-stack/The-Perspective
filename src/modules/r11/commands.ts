import "server-only";

import { createHash, randomUUID } from "node:crypto";

import type { PrismaClient } from "@/generated/prisma/client";
import { withCommercialTenantTransaction, type CommercialContext } from "@/modules/commercial/persistence";
import { getPrismaClient } from "@/modules/persistence/client";

export type R11Failure =
  | "TEAM_REQUIRED"
  | "INVALID"
  | "NOT_FOUND"
  | "STALE_WRITE"
  | "INELIGIBLE"
  | "CONFLICT"
  | "IDEMPOTENCY_CONFLICT";

export type R11Result =
  | { readonly kind: "ok"; readonly value: Record<string, unknown> & { readonly replayed: boolean } }
  | { readonly kind: "error"; readonly code: R11Failure };

const KEY = /^[A-Za-z0-9._:-]{8,128}$/u;
const FORBIDDEN = ["views", "count", "conversionRate", "actor", "organizationId", "state", "url", "delivered", "trusted", "digest", "membershipId", "reason"];

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

function team(context: CommercialContext) {
  return context.authentication === "authenticated"
    && context.tenant.surface === "TEAM"
    && context.membership.surface === "TEAM"
    && context.tenant.organizationId === context.membership.organizationId
    && context.tenant.membershipId === context.membership.membershipId;
}

export async function runR11Command(
  context: CommercialContext,
  command: string,
  payload: Record<string, unknown>,
  idempotencyKey: string,
  database?: PrismaClient,
): Promise<R11Result> {
  if (!team(context)) return { kind: "error", code: "TEAM_REQUIRED" };
  if (!KEY.test(idempotencyKey) || !/^[a-z-]{3,40}$/u.test(command)) return { kind: "error", code: "INVALID" };
  if (FORBIDDEN.some((field) => Object.prototype.hasOwnProperty.call(payload, field))) return { kind: "error", code: "INVALID" };
  const key = `r11:${command}:${context.tenant.organizationId.toLowerCase()}:${idempotencyKey.trim()}`;
  const requestHash = hash(payload);
  try {
    let conflict: Record<string, unknown> | undefined;
    for (let attempt = 1; attempt <= 3; attempt += 1) {
      try {
        const result = await withCommercialTenantTransaction(context, async (transaction) => {
          const rows = await transaction.$queryRawUnsafe<Array<{ result: unknown }>>(
            `SELECT growth.r11_execute($1::text, $2::uuid, $3::jsonb, $4::uuid, $5::uuid, $6::text, $7::text, $8::text) AS result`,
            command,
            context.membership.membershipId,
            JSON.stringify(payload),
            randomUUID(),
            randomUUID(),
            key,
            requestHash,
            context.requestId,
          );
          return readJson(rows[0]?.result);
        }, database);
        if (result.kind === "error" && result.code === "CONFLICT" && attempt < 3) {
          conflict = result;
          continue;
        }
        if (result.kind === "error") return { kind: "error", code: String(result.code) as R11Failure };
        return { kind: "ok", value: { ...result, replayed: result.code === "REPLAY" } };
      } catch (error) {
        if (!["P2034", "40001", "40P01"].includes(databaseCode(error)) || attempt === 3) throw error;
      }
    }
    return { kind: "error", code: String(conflict?.code ?? "CONFLICT") as R11Failure };
  } catch (error) {
    const code = databaseCode(error);
    if (["22023", "22P02", "23514", "22003", "22007"].includes(code)) return { kind: "error", code: "INVALID" };
    if (code === "42501") return { kind: "error", code: "TEAM_REQUIRED" };
    if (["P2034", "40001", "40P01"].includes(code)) return { kind: "error", code: "CONFLICT" };
    throw error;
  }
}

async function publicCall(sql: string, values: readonly unknown[], database: PrismaClient) {
  const rows = await database.$queryRawUnsafe<Array<{ result: unknown }>>(sql, ...values);
  const value = rows[0]?.result;
  if (value == null) return null;
  return readJson(value);
}

export async function observePublic(slug: string, dedupe: string, campaignId: string | null, database: PrismaClient = getPrismaClient()) {
  const value = await publicCall(
    `SELECT growth.r11_public_observe($1::text, $2::text, $3::text) AS result`,
    [slug, campaignId ?? "", dedupe],
    database,
  );
  if (!value || value.kind === "error") return value ?? null;
  return value;
}

export async function readPublicMeta(slug: string, database: PrismaClient = getPrismaClient()) {
  const rows = await database.$queryRawUnsafe<Array<{ result: unknown }>>(
    `SELECT growth.r11_public_meta($1::text) AS result`,
    slug,
  );
  return rows[0]?.result ?? null;
}

export async function readPublicSearch(query: string, database: PrismaClient = getPrismaClient()) {
  const rows = await database.$queryRawUnsafe<Array<{ result: unknown }>>(
    `SELECT growth.r11_public_search($1::text) AS result`,
    query,
  );
  const value = rows[0]?.result;
  return Array.isArray(value) ? value : [];
}

export async function runReindex(database: PrismaClient = getPrismaClient()) {
  const rows = await database.$queryRawUnsafe<Array<{ result: unknown }>>(`SELECT growth.r11_reindex() AS result`);
  return readJson(rows[0]?.result);
}

export async function runRule(organizationId: string, ruleId: string, triggerKey: string, database: PrismaClient = getPrismaClient()) {
  const rows = await database.$queryRawUnsafe<Array<{ result: unknown }>>(
    `SELECT growth.r11_run($1::uuid, $2::uuid, $3::text) AS result`,
    organizationId,
    ruleId,
    triggerKey,
  );
  return readJson(rows[0]?.result);
}
