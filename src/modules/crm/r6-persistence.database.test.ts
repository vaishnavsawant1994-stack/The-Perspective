import { randomUUID } from "node:crypto";

import { Client } from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { seedIds } from "../../../prisma/seed/stable-ids";
import { requireDatabaseUrl } from "@/modules/persistence/database-environment";

const client = new Client({
  connectionString: requireDatabaseUrl(process.env),
});

async function beginForOrganization(organizationId: string) {
  await client.query("BEGIN");
  await client.query(
    "SELECT set_config('app.organization_id', $1, true), set_config('app.client_organization_id', '', true)",
    [organizationId],
  );
}

async function rollback() {
  await client.query("ROLLBACK");
}

async function createResource(input: {
  id: string;
  organizationId: string;
  resourceType: string;
  title: string;
  sensitivity?: "STANDARD" | "CONFIDENTIAL" | "PII" | "FINANCIAL" | "SECURITY";
}) {
  await client.query(
    `INSERT INTO platform.resources
      (id, resource_type, title, owner_organization_id, visibility, sensitivity, created_at)
     VALUES ($1, $2, $3, $4, 'INTERNAL', $5::platform."Sensitivity", CURRENT_TIMESTAMP)`,
    [
      input.id,
      input.resourceType,
      input.title,
      input.organizationId,
      input.sensitivity ?? "STANDARD",
    ],
  );
}

async function createCompany(input: {
  id: string;
  resourceId: string;
  organizationId: string;
  name: string;
}) {
  await client.query(
    `INSERT INTO crm.companies
      (id, resource_id, owner_organization_id, visibility, sensitivity, name,
       row_version, created_at, updated_at)
     VALUES ($1, $2, $3, 'INTERNAL', 'STANDARD', $4, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
    [input.id, input.resourceId, input.organizationId, input.name],
  );
}

beforeAll(async () => {
  await client.connect();
});

afterAll(async () => {
  await client.end();
});

describe("R6 PostgreSQL persistence attacks", () => {
  it("fails closed with no tenant claim", async () => {
    await client.query("BEGIN");
    try {
      await client.query("SET LOCAL ROLE perspective_runtime");
      await client.query(
        "SELECT set_config('app.organization_id', '', true), set_config('app.client_organization_id', '', true)",
      );
      const result = await client.query<{ count: string }>(
        "SELECT count(*) FROM crm.companies",
      );
      expect(result.rows[0]?.count).toBe("0");
    } finally {
      await rollback();
    }
  });

  it("shows only the selected owner organization even with direct UUID knowledge", async () => {
    const platformCompanyId = randomUUID();
    const platformResourceId = randomUUID();
    const foreignCompanyId = randomUUID();
    const foreignResourceId = randomUUID();

    await beginForOrganization(seedIds.organization.platform);
    try {
      await createResource({
        id: platformResourceId,
        organizationId: seedIds.organization.platform,
        resourceType: "company",
        title: "Platform Company",
      });
      await createCompany({
        id: platformCompanyId,
        resourceId: platformResourceId,
        organizationId: seedIds.organization.platform,
        name: "Platform Company",
      });

      await client.query(
        "SELECT set_config('app.organization_id', $1, true)",
        [seedIds.organization.asteria],
      );
      await createResource({
        id: foreignResourceId,
        organizationId: seedIds.organization.asteria,
        resourceType: "company",
        title: "Foreign Company",
      });
      await createCompany({
        id: foreignCompanyId,
        resourceId: foreignResourceId,
        organizationId: seedIds.organization.asteria,
        name: "Foreign Company",
      });

      await client.query(
        "SELECT set_config('app.organization_id', $1, true)",
        [seedIds.organization.platform],
      );
      await client.query("SET LOCAL ROLE perspective_runtime");

      const visible = await client.query<{ id: string }>(
        "SELECT id FROM crm.companies ORDER BY id",
      );
      expect(visible.rows.map(({ id }) => id)).toEqual([platformCompanyId]);

      const directForeign = await client.query<{ id: string }>(
        "SELECT id FROM crm.companies WHERE id = $1",
        [foreignCompanyId],
      );
      expect(directForeign.rows).toEqual([]);
    } finally {
      await rollback();
    }
  });

  it("denies cross-tenant direct UUID UPDATE with no residue", async () => {
    const foreignCompanyId = randomUUID();
    const foreignResourceId = randomUUID();

    await beginForOrganization(seedIds.organization.asteria);
    try {
      await createResource({
        id: foreignResourceId,
        organizationId: seedIds.organization.asteria,
        resourceType: "company",
        title: "Foreign Mutable Company",
      });
      await createCompany({
        id: foreignCompanyId,
        resourceId: foreignResourceId,
        organizationId: seedIds.organization.asteria,
        name: "Before",
      });

      await client.query(
        "SELECT set_config('app.organization_id', $1, true)",
        [seedIds.organization.platform],
      );
      await client.query("SET LOCAL ROLE perspective_runtime");

      const attacked = await client.query(
        "UPDATE crm.companies SET name = 'Tampered' WHERE id = $1",
        [foreignCompanyId],
      );
      expect(attacked.rowCount).toBe(0);

      await client.query("RESET ROLE");
      await client.query(
        "SELECT set_config('app.organization_id', $1, true)",
        [seedIds.organization.asteria],
      );
      const after = await client.query<{ name: string }>(
        "SELECT name FROM crm.companies WHERE id = $1",
        [foreignCompanyId],
      );
      expect(after.rows).toEqual([{ name: "Before" }]);
    } finally {
      await rollback();
    }
  });

  it("rejects a foreign-parent reference even when the child owner claim is valid", async () => {
    const foreignCompanyId = randomUUID();
    const foreignCompanyResourceId = randomUUID();
    const contactId = randomUUID();
    const contactResourceId = randomUUID();

    await beginForOrganization(seedIds.organization.asteria);
    try {
      await createResource({
        id: foreignCompanyResourceId,
        organizationId: seedIds.organization.asteria,
        resourceType: "company",
        title: "Foreign Parent",
      });
      await createCompany({
        id: foreignCompanyId,
        resourceId: foreignCompanyResourceId,
        organizationId: seedIds.organization.asteria,
        name: "Foreign Parent",
      });

      await client.query(
        "SELECT set_config('app.organization_id', $1, true)",
        [seedIds.organization.platform],
      );
      await createResource({
        id: contactResourceId,
        organizationId: seedIds.organization.platform,
        resourceType: "contact",
        title: "Cross Tenant Contact Attack",
        sensitivity: "PII",
      });

      await client.query("SET LOCAL ROLE perspective_runtime");
      await expect(
        client.query(
          `INSERT INTO crm.contacts
            (id, resource_id, owner_organization_id, visibility, sensitivity,
             company_id, row_version, created_at, updated_at)
           VALUES ($1, $2, $3, 'INTERNAL', 'PII', $4, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
          [
            contactId,
            contactResourceId,
            seedIds.organization.platform,
            foreignCompanyId,
          ],
        ),
      ).rejects.toMatchObject({ code: "23503" });
    } finally {
      await rollback();
    }
  });

  it("rejects a mismatched resource type before domain persistence", async () => {
    const wrongResourceId = randomUUID();

    await beginForOrganization(seedIds.organization.platform);
    try {
      await createResource({
        id: wrongResourceId,
        organizationId: seedIds.organization.platform,
        resourceType: "lead",
        title: "Wrong Type",
        sensitivity: "CONFIDENTIAL",
      });
      await client.query("SET LOCAL ROLE perspective_runtime");

      await expect(
        client.query(
          `INSERT INTO crm.companies
            (id, resource_id, owner_organization_id, visibility, sensitivity,
             name, row_version, created_at, updated_at)
           VALUES ($1, $2, $3, 'INTERNAL', 'STANDARD', 'Wrong Type', 1,
                   CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
          [randomUUID(), wrongResourceId, seedIds.organization.platform],
        ),
      ).rejects.toMatchObject({ code: "23514" });
    } finally {
      await rollback();
    }
  });

  it("keeps D15 template mutation locked outside reviewed import mode", async () => {
    const templateId = randomUUID();
    const templateResourceId = randomUUID();

    await beginForOrganization(seedIds.organization.platform);
    try {
      await createResource({
        id: templateResourceId,
        organizationId: seedIds.organization.platform,
        resourceType: "message-template",
        title: "Approved Reference Template",
      });

      await client.query(
        "SELECT set_config('app.r6_template_import', 'on', true)",
      );
      await client.query(
        `INSERT INTO comms.message_templates
          (id, resource_id, owner_organization_id, visibility, sensitivity,
           name, channel, status, row_version, created_at, updated_at)
         VALUES ($1, $2, $3, 'INTERNAL', 'STANDARD', 'Approved', 'EMAIL',
                 'APPROVED', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
        [templateId, templateResourceId, seedIds.organization.platform],
      );

      await client.query(
        "SELECT set_config('app.r6_template_import', '', true)",
      );

      await client.query("SAVEPOINT r6_template_runtime_denial");

      await expect(
        client.query(
          "UPDATE comms.message_templates SET name = 'Runtime Edit' WHERE id = $1",
          [templateId],
        ),
      ).rejects.toMatchObject({ code: "55000" });

      await client.query("ROLLBACK TO SAVEPOINT r6_template_runtime_denial");

      const after = await client.query<{ name: string }>(
        "SELECT name FROM comms.message_templates WHERE id = $1",
        [templateId],
      );
      expect(after.rows).toEqual([{ name: "Approved" }]);
    } finally {
      await rollback();
    }
  });

  it("rejects post-PROPOSAL_PREPARATION deal-stage truth in R6", async () => {
    const pipelineId = randomUUID();
    const pipelineResourceId = randomUUID();

    await beginForOrganization(seedIds.organization.platform);
    try {
      await createResource({
        id: pipelineResourceId,
        organizationId: seedIds.organization.platform,
        resourceType: "deal-pipeline",
        title: "R6 Pipeline",
        sensitivity: "CONFIDENTIAL",
      });
      await client.query("SET LOCAL ROLE perspective_runtime");
      await client.query(
        `INSERT INTO commercial.deal_pipelines
          (id, resource_id, owner_organization_id, visibility, sensitivity,
           name, version, active, row_version, created_at, updated_at)
         VALUES ($1, $2, $3, 'INTERNAL', 'CONFIDENTIAL', 'R6 Pipeline',
                 1, true, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
        [pipelineId, pipelineResourceId, seedIds.organization.platform],
      );

      await expect(
        client.query(
          `INSERT INTO commercial.deal_stages
            (id, owner_organization_id, pipeline_id, pipeline_version, key, name,
             position, canonical_class, created_at)
           VALUES ($1, $2, $3, 1, 'proposal-sent', 'Proposal Sent', 6,
                   'PROPOSAL_SENT', CURRENT_TIMESTAMP)`,
          [randomUUID(), seedIds.organization.platform, pipelineId],
        ),
      ).rejects.toMatchObject({ code: "23514" });
    } finally {
      await rollback();
    }
  });
});
