import { Client } from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { seedIds, stableId } from "../../../prisma/seed/stable-ids";
import { requireDatabaseUrl } from "@/modules/persistence/database-environment";

const client = new Client({
  connectionString: requireDatabaseUrl(process.env),
});

async function beginRuntime(organizationId: string | undefined) {
  await client.query("BEGIN");
  await client.query("SET LOCAL ROLE perspective_runtime");
  await client.query(
    "SELECT set_config('app.organization_id', $1, true), set_config('app.client_organization_id', '', true)",
    [organizationId ?? ""],
  );
}

async function rollback() {
  await client.query("ROLLBACK");
}

async function registerResource(input: {
  id: string;
  type: string;
  title: string;
  visibility?: "INTERNAL" | "CLIENT_SHARED" | "PUBLIC";
  sensitivity?: "STANDARD" | "CONFIDENTIAL" | "PII" | "FINANCIAL" | "SECURITY" | "SECRET";
}) {
  await client.query(
    `SELECT platform.register_r6_resource(
      $1::uuid,
      $2::text,
      $3::text,
      NULL::uuid,
      $4::platform."Visibility",
      $5::platform."Sensitivity"
    )`,
    [
      input.id,
      input.type,
      input.title,
      input.visibility ?? "INTERNAL",
      input.sensitivity ?? "CONFIDENTIAL",
    ],
  );
}

async function insertLead(input: {
  id: string;
  resourceId: string;
  ownerOrganizationId: string;
}) {
  await client.query(
    `INSERT INTO crm.leads (
      id,
      resource_id,
      owner_organization_id,
      visibility,
      sensitivity,
      lifecycle_state,
      row_version,
      created_at,
      updated_at
    )
    VALUES ($1, $2, $3, 'INTERNAL', 'CONFIDENTIAL', 'NEW', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
    [input.id, input.resourceId, input.ownerOrganizationId],
  );
}

beforeAll(async () => {
  await client.connect();
});

afterAll(async () => {
  await client.end();
});

describe("R6 PostgreSQL CRM/commercial foundation", () => {
  it("preserves the restricted R4 runtime role and excludes R7 tables", async () => {
    const role = await client.query<{
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

    const excluded = await client.query<{
      proposals: string | null;
      contracts: string | null;
      invoices: string | null;
      payments: string | null;
    }>(`
      SELECT
        to_regclass('commercial.proposals')::text AS proposals,
        to_regclass('commercial.contracts')::text AS contracts,
        to_regclass('commercial.invoices')::text AS invoices,
        to_regclass('commercial.payments')::text AS payments
    `);

    expect(excluded.rows[0]).toEqual({
      proposals: null,
      contracts: null,
      invoices: null,
      payments: null,
    });
  });

  it("fails closed with no tenant claim", async () => {
    await beginRuntime(undefined);

    try {
      const result = await client.query<{ count: string }>(
        "SELECT count(*) FROM crm.leads",
      );
      expect(result.rows[0]?.count).toBe("0");
    } finally {
      await rollback();
    }
  });

  it("creates an R6 resource only through the constrained helper and isolates the lead to the selected tenant", async () => {
    const resourceId = stableId("r6:resource:lead:tenant-proof");
    const leadId = stableId("r6:lead:tenant-proof");

    await beginRuntime(seedIds.organization.platform);

    try {
      await registerResource({
        id: resourceId,
        type: "lead",
        title: "R6 Tenant Proof Lead",
      });
      await insertLead({
        id: leadId,
        resourceId,
        ownerOrganizationId: seedIds.organization.platform,
      });

      const own = await client.query<{ id: string }>(
        "SELECT id FROM crm.leads WHERE id = $1",
        [leadId],
      );
      expect(own.rows).toEqual([{ id: leadId }]);

      await client.query(
        "SELECT set_config('app.organization_id', $1, true)",
        [seedIds.organization.northstar],
      );

      const foreign = await client.query<{ id: string }>(
        "SELECT id FROM crm.leads WHERE id = $1",
        [leadId],
      );
      expect(foreign.rows).toEqual([]);
    } finally {
      await rollback();
    }
  });

  it("does not weaken the R4 direct platform.resources mutation lock", async () => {
    await beginRuntime(seedIds.organization.platform);

    try {
      await expect(
        client.query(
          `INSERT INTO platform.resources (
            id,
            resource_type,
            title,
            owner_organization_id,
            visibility,
            sensitivity,
            created_at
          )
          VALUES ($1, 'lead', 'Direct resource attack', $2, 'INTERNAL', 'CONFIDENTIAL', CURRENT_TIMESTAMP)`,
          [
            stableId("r6:resource:direct-platform-insert-attack"),
            seedIds.organization.platform,
          ],
        ),
      ).rejects.toMatchObject({ code: "42501" });
    } finally {
      await rollback();
    }
  });

  it("denies a caller-supplied foreign tenant on R6 INSERT", async () => {
    await beginRuntime(seedIds.organization.platform);

    try {
      await expect(
        client.query(
          `INSERT INTO crm.leads (
            id,
            resource_id,
            owner_organization_id,
            visibility,
            sensitivity,
            lifecycle_state,
            row_version,
            created_at,
            updated_at
          )
          VALUES ($1, $2, $3, 'INTERNAL', 'CONFIDENTIAL', 'NEW', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
          [
            stableId("r6:lead:foreign-owner-insert-attack"),
            stableId("r6:resource:foreign-owner-insert-attack"),
            seedIds.organization.northstar,
          ],
        ),
      ).rejects.toMatchObject({ code: "42501" });
    } finally {
      await rollback();
    }
  });

  it("rejects a resource envelope owned by another tenant even when RLS allows the attempted row tenant", async () => {
    const resourceId = stableId("r6:resource:envelope-mismatch");
    const leadId = stableId("r6:lead:envelope-mismatch");

    await beginRuntime(seedIds.organization.platform);

    try {
      await registerResource({
        id: resourceId,
        type: "lead",
        title: "Envelope mismatch source",
      });

      await client.query(
        "SELECT set_config('app.organization_id', $1, true)",
        [seedIds.organization.northstar],
      );

      await expect(
        insertLead({
          id: leadId,
          resourceId,
          ownerOrganizationId: seedIds.organization.northstar,
        }),
      ).rejects.toMatchObject({ code: "23503" });
    } finally {
      await rollback();
    }
  });

  it("rejects a cross-tenant child relationship through the redundant owner discriminator", async () => {
    const resourceId = stableId("r6:resource:lead:child-tenant-proof");
    const leadId = stableId("r6:lead:child-tenant-proof");
    const scoreId = stableId("r6:lead-score:child-tenant-attack");

    await beginRuntime(seedIds.organization.platform);

    try {
      await registerResource({
        id: resourceId,
        type: "lead",
        title: "Child tenant proof lead",
      });
      await insertLead({
        id: leadId,
        resourceId,
        ownerOrganizationId: seedIds.organization.platform,
      });

      await client.query(
        "SELECT set_config('app.organization_id', $1, true)",
        [seedIds.organization.northstar],
      );

      await expect(
        client.query(
          `INSERT INTO crm.lead_scores (
            id,
            owner_organization_id,
            lead_id,
            model_version,
            score,
            components,
            calculated_at,
            created_at
          )
          VALUES ($1, $2, $3, 'attack-v1', 50, '{}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
          [scoreId, seedIds.organization.northstar, leadId],
        ),
      ).rejects.toMatchObject({ code: "23503" });
    } finally {
      await rollback();
    }
  });

  it("keeps D15 message-template storage read-only for the runtime role", async () => {
    const resourceId = stableId("r6:resource:template:d15");
    const templateId = stableId("r6:template:d15");

    await client.query("BEGIN");

    try {
      await client.query(
        "SELECT set_config('app.organization_id', $1, true), set_config('app.client_organization_id', '', true)",
        [seedIds.organization.platform],
      );

      await client.query(
        `INSERT INTO platform.resources (
          id,
          resource_type,
          title,
          owner_organization_id,
          visibility,
          sensitivity,
          created_at
        )
        VALUES ($1, 'message-template', 'D15 immutable template', $2, 'INTERNAL', 'STANDARD', CURRENT_TIMESTAMP)`,
        [resourceId, seedIds.organization.platform],
      );

      await client.query(
        "SELECT set_config('app.r6_template_import', 'on', true)",
      );

      await client.query(
        `INSERT INTO comms.message_templates (
          id,
          resource_id,
          owner_organization_id,
          visibility,
          sensitivity,
          name,
          channel,
          status,
          row_version,
          created_at,
          updated_at
        )
        VALUES ($1, $2, $3, 'INTERNAL', 'STANDARD', 'D15 baseline', 'EMAIL', 'APPROVED', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
        [templateId, resourceId, seedIds.organization.platform],
      );

      await client.query(
        "SELECT set_config('app.r6_template_import', '', true)",
      );
      await client.query("SET LOCAL ROLE perspective_runtime");

      await expect(
        client.query(
          "UPDATE comms.message_templates SET name = 'mutated' WHERE id = $1",
          [templateId],
        ),
      ).rejects.toMatchObject({ code: "42501" });
    } finally {
      await rollback();
    }
  });

  it("keeps immutable R6 evidence immutable even for the migration owner", async () => {
    const resourceId = stableId("r6:resource:lead:immutable-evidence");
    const leadId = stableId("r6:lead:immutable-evidence");
    const scoreId = stableId("r6:lead-score:immutable-evidence");

    await beginRuntime(seedIds.organization.platform);

    try {
      await registerResource({
        id: resourceId,
        type: "lead",
        title: "Immutable evidence lead",
      });
      await insertLead({
        id: leadId,
        resourceId,
        ownerOrganizationId: seedIds.organization.platform,
      });

      await client.query(
        `INSERT INTO crm.lead_scores (
          id,
          owner_organization_id,
          lead_id,
          model_version,
          score,
          components,
          calculated_at,
          created_at
        )
        VALUES ($1, $2, $3, 'immutable-v1', 75, '{}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
        [scoreId, seedIds.organization.platform, leadId],
      );

      await client.query("RESET ROLE");

      await expect(
        client.query(
          "UPDATE crm.lead_scores SET score = 1 WHERE id = $1",
          [scoreId],
        ),
      ).rejects.toMatchObject({ code: "55000" });
    } finally {
      await rollback();
    }
  });
});
