import "server-only";

import type { Prisma } from "@/generated/prisma/client";
import type { VerifiedAuthenticationSession } from "@/modules/authentication/types";
import { getPrismaClient } from "@/modules/persistence/client";

const RUNTIME_ROLE = "perspective_runtime";

export interface TenantResourceEnvelope {
  readonly id: string;
  readonly ownerOrganizationId: string;
  readonly clientOrganizationId: string | null;
  readonly visibility: string;
  readonly title: string;
}

export async function withTenantResourceContext<T>(
  session: VerifiedAuthenticationSession,
  operation: (transaction: Prisma.TransactionClient) => Promise<T>,
  database = getPrismaClient(),
) {
  return database.$transaction(async (transaction) => {
    await transaction.$executeRawUnsafe(`SET LOCAL ROLE ${RUNTIME_ROLE}`);

    const ownerOrganizationId =
      session.surface === "TEAM" ? session.organizationId : "";
    const clientOrganizationId =
      session.surface === "CLIENT" ? session.organizationId : "";

    await transaction.$queryRaw`
      SELECT
        set_config('app.organization_id', ${ownerOrganizationId}, true),
        set_config('app.client_organization_id', ${clientOrganizationId}, true)
    `;

    return operation(transaction);
  });
}

export async function listVisibleResourceEnvelopes(
  session: VerifiedAuthenticationSession,
  database = getPrismaClient(),
) {
  return withTenantResourceContext(
    session,
    (transaction) =>
      transaction.$queryRaw<TenantResourceEnvelope[]>`
        SELECT
          id,
          owner_organization_id AS "ownerOrganizationId",
          client_organization_id AS "clientOrganizationId",
          visibility::text AS visibility,
          title
        FROM platform.resources
        ORDER BY id
      `,
    database,
  );
}
