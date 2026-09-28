import "server-only";

import { randomUUID } from "node:crypto";

import { Prisma, type PrismaClient } from "@/generated/prisma/client";
import type {
  AuthorizedRequestContext,
  TenantScopedRequestContext,
} from "@/modules/foundation/request-context";
import { getPrismaClient } from "@/modules/persistence/client";

export type CommsTransaction = Prisma.TransactionClient;
type CommsContext = TenantScopedRequestContext | AuthorizedRequestContext;

const RUNTIME_ROLE = "perspective_runtime";

export class CommsTenantBoundaryError extends Error {
  readonly code = "TEAM_REQUIRED";

  constructor() {
    super("R6 communications commands require a selected Team tenant context.");
  }
}

export function newCommsId() {
  return randomUUID();
}

export async function withCommsTenantTransaction<T>(
  context: CommsContext,
  operation: (transaction: CommsTransaction) => Promise<T>,
  database: PrismaClient = getPrismaClient(),
) {
  if (context.tenant.surface !== "TEAM") throw new CommsTenantBoundaryError();

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

export async function registerCommsResource(
  transaction: CommsTransaction,
  input: {
    readonly id: string;
    readonly type:
      | "sending-account"
      | "outreach-campaign"
      | "sequence"
      | "conversation"
      | "meeting";
    readonly title: string;
    readonly sensitivity: "STANDARD" | "CONFIDENTIAL" | "PII" | "SECURITY";
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
