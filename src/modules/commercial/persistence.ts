import "server-only";

import { randomUUID } from "node:crypto";

import { Prisma, type PrismaClient } from "@/generated/prisma/client";
import type {
  AuthorizedRequestContext,
  TenantScopedRequestContext,
} from "@/modules/foundation/request-context";
import { getPrismaClient } from "@/modules/persistence/client";

export type CommercialTransaction = Prisma.TransactionClient;
export type CommercialContext =
  | TenantScopedRequestContext
  | AuthorizedRequestContext;

const RUNTIME_ROLE = "perspective_runtime";

export class CommercialTenantBoundaryError extends Error {
  readonly code = "TEAM_REQUIRED";

  constructor() {
    super("R6 commercial commands require a selected Team tenant context.");
  }
}

export class ClientAcceptanceBoundaryError extends Error {
  readonly code = "CLIENT_REQUIRED";

  constructor() {
    super("R7 proposal acceptance requires an authenticated selected CLIENT membership.");
  }
}

export function newCommercialId() {
  return randomUUID();
}

export async function withCommercialTenantTransaction<T>(
  context: CommercialContext,
  operation: (transaction: CommercialTransaction) => Promise<T>,
  database: PrismaClient = getPrismaClient(),
) {
  if (context.tenant.surface !== "TEAM") {
    throw new CommercialTenantBoundaryError();
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

/**
 * Runs only the customer-owned acceptance command under the selected CLIENT
 * database context. The SECURITY DEFINER acceptance function revalidates the
 * membership and proposal relationship while holding the transaction locks.
 */
export async function withClientAcceptanceTransaction<T>(
  context: AuthorizedRequestContext,
  ownerOrganizationId: string,
  operation: (transaction: CommercialTransaction) => Promise<T>,
  database: PrismaClient = getPrismaClient(),
) {
  if (
    context.authentication !== "authenticated" ||
    context.tenant.surface !== "CLIENT" ||
    context.membership.surface !== "CLIENT" ||
    context.membership.membershipId !== context.tenant.membershipId ||
    context.membership.organizationId !== context.tenant.organizationId ||
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/iu.test(ownerOrganizationId)
  ) {
    throw new ClientAcceptanceBoundaryError();
  }

  return database.$transaction(
    async (transaction) => {
      await transaction.$executeRawUnsafe(`SET LOCAL ROLE ${RUNTIME_ROLE}`);
      await transaction.$queryRaw`
        SELECT
          set_config('app.organization_id', ${ownerOrganizationId}, true),
          set_config('app.client_organization_id', ${context.tenant.organizationId}, true)
      `;
      return operation(transaction);
    },
    { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
  );
}

export async function registerCommercialResource(
  transaction: CommercialTransaction,
  input: {
    readonly id: string;
    readonly type: "deal-pipeline" | "deal" | "client-account";
    readonly title: string;
    readonly clientOrganizationId?: string | null;
    readonly sensitivity: "CONFIDENTIAL" | "FINANCIAL";
  },
) {
  await transaction.$queryRawUnsafe(
    `SELECT platform.register_r6_resource(
       $1::uuid,
       $2::text,
       $3::text,
       $4::uuid,
       'INTERNAL'::platform."Visibility",
       $5::platform."Sensitivity"
     )`,
    input.id,
    input.type,
    input.title,
    input.clientOrganizationId ?? null,
    input.sensitivity,
  );
}

export async function updateCommercialResource(
  transaction: CommercialTransaction,
  input: {
    readonly id: string;
    readonly title: string;
    readonly clientOrganizationId?: string | null;
    readonly sensitivity: "CONFIDENTIAL" | "FINANCIAL";
    readonly archivedAt?: Date | null;
  },
) {
  await transaction.$queryRawUnsafe(
    `SELECT platform.update_r6_resource(
       $1::uuid,
       $2::text,
       $3::uuid,
       'INTERNAL'::platform."Visibility",
       $4::platform."Sensitivity",
       $5::timestamptz
     )`,
    input.id,
    input.title,
    input.clientOrganizationId ?? null,
    input.sensitivity,
    input.archivedAt ?? null,
  );
}
