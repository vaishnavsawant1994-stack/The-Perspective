import "server-only";

import { randomUUID } from "node:crypto";

import { Prisma, type PrismaClient } from "@/generated/prisma/client";
import type { AuthorizedRequestContext, TenantScopedRequestContext } from "@/modules/foundation/request-context";
import { getPrismaClient } from "@/modules/persistence/client";

export type CrmTransaction = Prisma.TransactionClient;

const RUNTIME_ROLE = "perspective_runtime";

export class CrmTenantBoundaryError extends Error {
  readonly code = "TEAM_REQUIRED";

  constructor() {
    super("R6 CRM commands require a selected Team tenant context.");
  }
}

export function newCrmId() {
  return randomUUID();
}

export async function withCrmTenantTransaction<T>(
  context: TenantScopedRequestContext | AuthorizedRequestContext,
  operation: (transaction: CrmTransaction) => Promise<T>,
  database: PrismaClient = getPrismaClient(),
) {
  if (context.tenant.surface !== "TEAM") {
    throw new CrmTenantBoundaryError();
  }

  return database.$transaction(
    async (transaction) => {
      await transaction.$executeRawUnsafe(`SET LOCAL ROLE ${RUNTIME_ROLE}`);
      await transaction.$queryRaw`
        SELECT
          set_config('app.organization_id', ${context.tenant.organizationId}, true),
          set_config('app.client_organization_id', '', true)
      `;
      return operation(transaction);
    },
    { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
  );
}

export type R6ResourceType =
  | "lead-source"
  | "extraction-job"
  | "enrichment-job"
  | "company"
  | "contact"
  | "lead"
  | "lead-list"
  | "qualification"
  | "duplicate-candidate"
  | "suppression-entry";

export async function registerCrmResource(
  transaction: CrmTransaction,
  input: {
    readonly id: string;
    readonly type: R6ResourceType;
    readonly title: string;
    readonly sensitivity: "STANDARD" | "CONFIDENTIAL" | "PII";
  },
) {
  await transaction.$queryRawUnsafe(
    `SELECT platform.register_r6_resource(
       $1::uuid,
       $2::text,
       $3::text,
       NULL::uuid,
       'INTERNAL'::platform."Visibility",
       $4::platform."Sensitivity"
     )`,
    input.id,
    input.type,
    input.title,
    input.sensitivity,
  );
}
