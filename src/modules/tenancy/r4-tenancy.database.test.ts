import { Client } from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { seedIds } from "../../../prisma/seed/stable-ids";
import type { VerifiedAuthenticationSession } from "@/modules/authentication/types";
import { createPrismaClient } from "@/modules/persistence/client";
import { requireDatabaseUrl } from "@/modules/persistence/database-environment";
import { listVisibleResourceEnvelopes } from "./resource-context";

const database = createPrismaClient();
const administrativeClient = new Client({
  connectionString: requireDatabaseUrl(process.env),
});

function selectedSession(
  surface: "TEAM" | "CLIENT",
  membershipId: string,
  organizationId: string,
): VerifiedAuthenticationSession {
  const issuedAt = new Date("2026-09-26T12:00:00.000Z");
  return {
    contextState: "selected",
    sessionId: `r4-${surface.toLowerCase()}-${membershipId}`,
    userAccountId: `r4-user-${membershipId}`,
    membershipId,
    organizationId,
    surface,
    issuedAt,
    expiresAt: new Date(issuedAt.getTime() + 60 * 60_000),
    authenticationMethod: "test",
  };
}

beforeAll(async () => {
  await administrativeClient.connect();
});

afterAll(async () => {
  await Promise.all([
    database.$disconnect(),
    administrativeClient.end(),
  ]);
});

describe("R4 PostgreSQL tenant isolation", () => {
  it("installs a non-login non-bypass restricted runtime role", async () => {
    const role = await administrativeClient.query<{
      rolcanlogin: boolean;
      rolsuper: boolean;
      rolcreatedb: boolean;
      rolcreaterole: boolean;
      rolinherit: boolean;
      rolreplication: boolean;
      rolbypassrls: boolean;
    }>(`
      SELECT
        rolcanlogin,
        rolsuper,
        rolcreatedb,
        rolcreaterole,
        rolinherit,
        rolreplication,
        rolbypassrls
      FROM pg_roles
      WHERE rolname = 'perspective_runtime'
    `);

    expect(role.rows).toEqual([
      {
        rolcanlogin: false,
        rolsuper: false,
        rolcreatedb: false,
        rolcreaterole: false,
        rolinherit: false,
        rolreplication: false,
        rolbypassrls: false,
      },
    ]);

    const privileges = await administrativeClient.query<{
      can_select: boolean;
      can_insert: boolean;
      can_update: boolean;
      can_delete: boolean;
      can_truncate: boolean;
    }>(`
      SELECT
        has_table_privilege('perspective_runtime', 'platform.resources', 'SELECT') AS can_select,
        has_table_privilege('perspective_runtime', 'platform.resources', 'INSERT') AS can_insert,
        has_table_privilege('perspective_runtime', 'platform.resources', 'UPDATE') AS can_update,
        has_table_privilege('perspective_runtime', 'platform.resources', 'DELETE') AS can_delete,
        has_table_privilege('perspective_runtime', 'platform.resources', 'TRUNCATE') AS can_truncate
    `);

    expect(privileges.rows[0]).toEqual({
      can_select: true,
      can_insert: false,
      can_update: false,
      can_delete: false,
      can_truncate: false,
    });
  });

  it("fails closed with no transaction-local tenant claims", async () => {
    await administrativeClient.query("BEGIN");
    try {
      await administrativeClient.query("SET LOCAL ROLE perspective_runtime");
      const result = await administrativeClient.query<{ count: string }>(
        "SELECT count(*) FROM platform.resources",
      );
      expect(result.rows[0]?.count).toBe("0");
    } finally {
      await administrativeClient.query("ROLLBACK");
    }
  });

  it("allows the selected Team organization to read only its owner resource envelope", async () => {
    const rows = await listVisibleResourceEnvelopes(
      selectedSession(
        "TEAM",
        seedIds.membership.operator,
        seedIds.organization.platform,
      ),
      database,
    );

    expect(rows.map(({ id }) => id).sort()).toEqual(
      Object.values(seedIds.resource).sort(),
    );
  });

  it("isolates Client contexts to their own CLIENT_SHARED resource envelope", async () => {
    const asteria = await listVisibleResourceEnvelopes(
      selectedSession(
        "CLIENT",
        seedIds.membership.asteriaAdmin,
        seedIds.organization.asteria,
      ),
      database,
    );
    const northstar = await listVisibleResourceEnvelopes(
      selectedSession(
        "CLIENT",
        seedIds.membership.northstarAdmin,
        seedIds.organization.northstar,
      ),
      database,
    );

    expect(asteria).toEqual([
      expect.objectContaining({
        id: seedIds.resource.asteriaShared,
        clientOrganizationId: seedIds.organization.asteria,
        visibility: "CLIENT_SHARED",
      }),
    ]);
    expect(asteria.map(({ id }) => id)).not.toContain(
      seedIds.resource.asteriaInternal,
    );
    expect(asteria.map(({ id }) => id)).not.toContain(
      seedIds.resource.northstarShared,
    );

    expect(northstar).toEqual([
      expect.objectContaining({
        id: seedIds.resource.northstarShared,
        clientOrganizationId: seedIds.organization.northstar,
        visibility: "CLIENT_SHARED",
      }),
    ]);
    expect(northstar.map(({ id }) => id)).not.toContain(
      seedIds.resource.asteriaShared,
    );
  });

  it("forces RLS on the resource envelope", async () => {
    const result = await administrativeClient.query<{
      relrowsecurity: boolean;
      relforcerowsecurity: boolean;
    }>(`
      SELECT relrowsecurity, relforcerowsecurity
      FROM pg_class
      WHERE oid = 'platform.resources'::regclass
    `);

    expect(result.rows[0]).toEqual({
      relrowsecurity: true,
      relforcerowsecurity: true,
    });
  });
});
