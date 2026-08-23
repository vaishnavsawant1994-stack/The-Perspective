import { Client } from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { seedIds, stableId } from "../../../prisma/seed/stable-ids";
import { requireDatabaseUrl } from "./database-environment";

const validationRole = "perspective_r2_validation";
const client = new Client({ connectionString: requireDatabaseUrl(process.env) });

async function expectImmutableRejection(statement: string) {
  await client.query("BEGIN");

  try {
    await expect(client.query(statement)).rejects.toMatchObject({ code: "55000" });
  } finally {
    await client.query("ROLLBACK");
  }
}

async function visibleResources(
  organizationId: string | undefined,
  clientOrganizationId: string | undefined,
) {
  await client.query("BEGIN");

  try {
    await client.query(`SET LOCAL ROLE ${validationRole}`);
    await client.query(
      "SELECT set_config('app.organization_id', $1, true), set_config('app.client_organization_id', $2, true)",
      [organizationId ?? "", clientOrganizationId ?? ""],
    );
    const result = await client.query<{
      id: string;
      title: string;
      client_organization_id: string | null;
      visibility: string;
    }>(
      'SELECT id, title, client_organization_id, visibility::text FROM platform.resources ORDER BY id',
    );
    return result.rows;
  } finally {
    await client.query("ROLLBACK");
  }
}

beforeAll(async () => {
  await client.connect();
  await client.query(`
    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = '${validationRole}') THEN
        CREATE ROLE ${validationRole} NOLOGIN;
      END IF;
    END
    $$;
    GRANT USAGE ON SCHEMA platform TO ${validationRole};
    GRANT SELECT ON platform.resources TO ${validationRole};
  `);
});

afterAll(async () => {
  await client.end();
});

describe("R2 PostgreSQL foundation", () => {
  it("contains only the approved foundation namespaces with required tables", async () => {
    const result = await client.query<{ table_schema: string; table_name: string }>(
      `SELECT table_schema, table_name
       FROM information_schema.tables
       WHERE table_schema IN ('iam', 'platform', 'audit')
       ORDER BY table_schema, table_name`,
    );

    expect(new Set(result.rows.map(({ table_schema }) => table_schema))).toEqual(
      new Set(["iam", "platform", "audit"]),
    );
    expect(result.rows).toEqual(
      expect.arrayContaining([
        { table_schema: "iam", table_name: "organizations" },
        { table_schema: "iam", table_name: "organization_memberships" },
        { table_schema: "platform", table_name: "resources" },
        { table_schema: "platform", table_name: "outbox_events" },
        { table_schema: "audit", table_name: "audit_events" },
      ]),
    );
  });

  it("enforces client-shared resource isolation through RLS", async () => {
    const noContext = await visibleResources(undefined, undefined);
    const asteria = await visibleResources(
      undefined,
      seedIds.organization.asteria,
    );
    const northstar = await visibleResources(
      undefined,
      seedIds.organization.northstar,
    );

    expect(noContext).toEqual([]);
    expect(asteria).toHaveLength(1);
    expect(asteria[0]).toMatchObject({
      id: seedIds.resource.asteriaShared,
      title: "May 2026 Leadership Report",
      client_organization_id: seedIds.organization.asteria,
      visibility: "CLIENT_SHARED",
    });
    expect(northstar).toHaveLength(1);
    expect(northstar[0]).toMatchObject({
      id: seedIds.resource.northstarShared,
      title: "May 2026 Leadership Report",
      client_organization_id: seedIds.organization.northstar,
      visibility: "CLIENT_SHARED",
    });
  });

  it("allows the owning platform organization to see its resource envelope", async () => {
    const rows = await visibleResources(
      seedIds.organization.platform,
      undefined,
    );
    expect(rows.map(({ id }) => id).sort()).toEqual(
      Object.values(seedIds.resource).sort(),
    );
  });

  it("preserves retry lineage and original attempt evidence", async () => {
    const runs = await client.query<{
      id: string;
      root_run_id: string | null;
      parent_run_id: string | null;
      execution_number: number;
    }>(
      `SELECT id, root_run_id, parent_run_id, execution_number
       FROM platform.automation_runs
       WHERE id = ANY($1::uuid[])
       ORDER BY execution_number`,
      [[seedIds.automationRunOriginal, seedIds.automationRunRetry]],
    );

    expect(runs.rows).toEqual([
      {
        id: seedIds.automationRunOriginal,
        root_run_id: null,
        parent_run_id: null,
        execution_number: 1,
      },
      {
        id: seedIds.automationRunRetry,
        root_run_id: seedIds.automationRunOriginal,
        parent_run_id: seedIds.automationRunOriginal,
        execution_number: 2,
      },
    ]);
  });

  it.each([
    `UPDATE audit.audit_events SET reason = 'tampered' WHERE id = '${seedIds.auditEvent}'`,
    `DELETE FROM audit.audit_events WHERE id = '${seedIds.auditEvent}'`,
    `UPDATE platform.outbox_delivery_attempts SET error_code = 'tampered' WHERE id = '${seedIds.outboxAttempt1}'`,
    `DELETE FROM platform.automation_step_attempts WHERE id = '${seedIds.automationAttemptOriginal}'`,
    `UPDATE platform.incident_events SET summary = 'tampered' WHERE id = '${seedIds.incidentEventOpened}'`,
    `DELETE FROM platform.reconciliation_findings WHERE id = '${seedIds.reconciliationFinding}'`,
  ])("rejects immutable evidence mutation: %s", async (statement) => {
    await expectImmutableRejection(statement);
  });

  it("enforces idempotency uniqueness inside owner and scope", async () => {
    await client.query("BEGIN");

    try {
      await expect(
        client.query(
          `INSERT INTO platform.idempotency_receipts
           (id, owner_organization_id, scope, idempotency_key, request_hash, state, created_at, expires_at)
           VALUES ($1, $2, 'r2.seed', 'r2-seed-baseline-v1', 'different', 'STARTED', $3, $4)`,
          [
            stableId("idempotency:duplicate-test"),
            seedIds.organization.platform,
            new Date("2026-01-15T10:00:00.000Z"),
            new Date("2026-01-16T10:00:00.000Z"),
          ],
        ),
      ).rejects.toMatchObject({ code: "23505" });
    } finally {
      await client.query("ROLLBACK");
    }
  });

  it("retains the deterministic R2 seed records as later stages add data", async () => {
    const result = await client.query<{
      organizations: string;
      memberships: string;
      resources: string;
      audit_events: string;
    }>(`
      SELECT
        (SELECT count(*) FROM iam.organizations WHERE id = ANY($1::uuid[])) AS organizations,
        (SELECT count(*) FROM iam.organization_memberships WHERE id = ANY($2::uuid[])) AS memberships,
        (SELECT count(*) FROM platform.resources WHERE id = ANY($3::uuid[])) AS resources,
        (SELECT count(*) FROM audit.audit_events WHERE id = $4::uuid) AS audit_events
    `, [
      Object.values(seedIds.organization),
      Object.values(seedIds.membership),
      Object.values(seedIds.resource),
      seedIds.auditEvent,
    ]);

    expect(result.rows[0]).toEqual({
      organizations: "3",
      memberships: "3",
      resources: "3",
      audit_events: "1",
    });
  });
});
