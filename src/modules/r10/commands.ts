import "server-only";

import { createHash, randomUUID } from "node:crypto";

import type { PrismaClient } from "@/generated/prisma/client";
import { withCommercialTenantTransaction, type CommercialContext } from "@/modules/commercial/persistence";
import { getPrismaClient } from "@/modules/persistence/client";

export type R10Failure =
  | "TEAM_REQUIRED"
  | "INVALID"
  | "NOT_FOUND"
  | "STALE_WRITE"
  | "INELIGIBLE"
  | "CONFLICT"
  | "IDEMPOTENCY_CONFLICT"
  | "PROVIDER_UNCONFIGURED";

export type R10Result =
  | { readonly kind: "ok"; readonly value: Record<string, unknown> & { readonly replayed: boolean } }
  | { readonly kind: "error"; readonly code: R10Failure };

const KEY = /^[A-Za-z0-9._:-]{8,128}$/u;
const FORBIDDEN = ["actor", "organizationId", "status", "state", "url", "delivered", "verifier", "trusted", "digest", "ready", "publisher", "membershipId"];

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

export async function runR10Command(
  context: CommercialContext,
  command: string,
  payload: Record<string, unknown>,
  idempotencyKey: string,
  database?: PrismaClient,
): Promise<R10Result> {
  if (!team(context)) return { kind: "error", code: "TEAM_REQUIRED" };
  if (!KEY.test(idempotencyKey) || !/^[a-z-]{3,40}$/u.test(command)) return { kind: "error", code: "INVALID" };
  if (FORBIDDEN.some((field) => Object.prototype.hasOwnProperty.call(payload, field))) return { kind: "error", code: "INVALID" };
  const key = `r10:${command}:${context.tenant.organizationId.toLowerCase()}:${idempotencyKey.trim()}`;
  const requestHash = hash(payload);
  try {
    let conflict: Record<string, unknown> | undefined;
    for (let attempt = 1; attempt <= 3; attempt += 1) {
      try {
        const result = await withCommercialTenantTransaction(context, async (transaction) => {
          const rows = await transaction.$queryRawUnsafe<Array<{ result: unknown }>>(
            `SELECT media.r10_execute($1::text, $2::uuid, $3::jsonb, $4::uuid, $5::uuid, $6::text, $7::text, $8::text) AS result`,
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
        if (result.kind === "error") return { kind: "error", code: String(result.code) as R10Failure };
        return { kind: "ok", value: { ...result, replayed: result.code === "REPLAY" } };
      } catch (error) {
        if (!["P2034", "40001", "40P01"].includes(databaseCode(error)) || attempt === 3) throw error;
      }
    }
    return { kind: "error", code: String(conflict?.code ?? "CONFLICT") as R10Failure };
  } catch (error) {
    const code = databaseCode(error);
    if (["22023", "22P02", "23514", "22003", "22007"].includes(code)) return { kind: "error", code: "INVALID" };
    if (code === "42501") return { kind: "error", code: "TEAM_REQUIRED" };
    if (["P2034", "40001", "40P01"].includes(code)) return { kind: "error", code: "CONFLICT" };
    throw error;
  }
}

export async function readPublicDelivery(slug: string, database: PrismaClient = getPrismaClient()) {
  const rows = await database.$transaction(async (transaction) => {
    await transaction.$executeRawUnsafe("SET LOCAL ROLE perspective_public");
    await transaction.$queryRaw`SELECT set_config('app.organization_id', '', true)`;
    return transaction.$queryRawUnsafe<Array<{ result: unknown }>>(
      `SELECT distribution.r10_public_delivery($1::text) AS result`,
      slug,
    );
  });
  const value = rows[0]?.result;
  if (value === null || value === undefined) return null;
  return typeof value === "string" ? JSON.parse(value) : value;
}

export async function runReconcile(database: PrismaClient = getPrismaClient()) {
  const rows = await database.$transaction(async (transaction) => {
    await transaction.$executeRawUnsafe("SET LOCAL ROLE perspective_runtime");
    await transaction.$queryRaw`SELECT set_config('app.organization_id', '', true)`;
    return transaction.$queryRawUnsafe<Array<{ result: unknown }>>(
      `SELECT distribution.r10_reconcile() AS result`,
    );
  });
  return readJson(rows[0]?.result);
}
