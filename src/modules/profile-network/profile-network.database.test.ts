import { Client } from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { requireDatabaseUrl } from "@/modules/persistence/database-environment";

const client = new Client({ connectionString: requireDatabaseUrl(process.env) });
const source = JSON.stringify([{ label: "Published organization source", url: "https://example.org/about", capturedAt: "2026-11-18T00:00:00Z" }]);

beforeAll(async () => { await client.connect(); });
afterAll(async () => { await client.end(); });

describe("V1.1 PN-01 PostgreSQL publication and privilege boundaries", () => {
  it("does not allow unapproved or unsourced profiles to be published", async () => {
    await client.query("BEGIN");
    try {
      const id = crypto.randomUUID();
      const versionId = crypto.randomUUID();
      await client.query("INSERT INTO profiles.company_profiles (id,slug) VALUES ($1,$2)", [id, `pn01-unapproved-${id.slice(0,8)}`]);
      await client.query(
        "INSERT INTO profiles.company_versions (id,company_profile_id,version,name,summary,sources) VALUES ($1,$2,1,$3,$4,$5::jsonb)",
        [versionId,id,"Unapproved Test Company","This is a private synthetic test profile, not public.",source],
      );
      await expect(client.query(
        "UPDATE profiles.company_profiles SET state='PUBLISHED',published_version_id=$1 WHERE id=$2",
        [versionId,id],
      )).rejects.toMatchObject({ code: "23514" });
    } finally {
      await client.query("ROLLBACK");
    }
  });

  it("exposes only approved current versions, never private drafts or other companies", async () => {
    await client.query("BEGIN");
    try {
      const publishedId = crypto.randomUUID();
      const approvedId = crypto.randomUUID();
      const draftId = crypto.randomUUID();
      const crossVersionId = crypto.randomUUID();
      const slug = `pn01-published-${publishedId.slice(0,8)}`;
      await client.query(
        "INSERT INTO profiles.company_profiles (id,slug) VALUES ($1,$2),($3,$4)",
        [publishedId,slug,draftId,`pn01-draft-${draftId.slice(0,8)}`],
      );
      await client.query(
        "INSERT INTO profiles.company_versions (id,company_profile_id,version,name,summary,sources,approved_at) VALUES ($1,$2,1,$3,$4,$5::jsonb,now()),($6,$7,1,$8,$9,$5::jsonb,now())",
        [approvedId,publishedId,"Synthetic Published Profile","Approved synthetic editorial text for isolated database testing.",source,crossVersionId,draftId,"Other Organization","A completely separate synthetic company should not appear."],
      );
      await expect(client.query(
        "UPDATE profiles.company_profiles SET state='PUBLISHED', published_version_id=$1 WHERE id=$2",
        [crossVersionId,publishedId],
      )).rejects.toMatchObject({ code: "23514" });
    } finally {
      await client.query("ROLLBACK");
    }
  });

  it("publishes exactly the approved projection but refuses direct table reads", async () => {
    await client.query("BEGIN");
    try {
      const id = crypto.randomUUID();
      const versionId = crypto.randomUUID();
      const slug = `pn01-visible-${id.slice(0,8)}`;
      await client.query("INSERT INTO profiles.company_profiles (id,slug) VALUES ($1,$2)", [id,slug]);
      await client.query(
        "INSERT INTO profiles.company_versions (id,company_profile_id,version,name,summary,industry,sources,approved_at) VALUES ($1,$2,1,$3,$4,$5,$6::jsonb,now())",
        [versionId,id,"Published Synthetic Company","A public projection stored only for the duration of this rollback test.","Technology",source],
      );
      await client.query("UPDATE profiles.company_profiles SET state='PUBLISHED',published_version_id=$1 WHERE id=$2", [versionId,id]);
      await client.query("SET LOCAL ROLE perspective_public");
      const profile = await client.query<{ result: Record<string,unknown> }>("SELECT profiles.pn01_public_company($1::text) AS result", [slug]);
      expect(profile.rows[0].result).toMatchObject({ slug, name: "Published Synthetic Company", disclosureKind: "NONE" });
      expect(JSON.stringify(profile.rows[0].result)).not.toContain("organizationId");
      const listed = await client.query<{ result: Array<{slug:string}> }>("SELECT profiles.pn01_public_directory($1::text) AS result", ["Synthetic Company"]);
      expect(listed.rows[0].result.some((row) => row.slug === slug)).toBe(true);
      const missing = await client.query<{ result: unknown }>("SELECT profiles.pn01_public_company($1::text) AS result", ["pn01-unknown-slug"]);
      expect(missing.rows[0].result).toBeNull();
    } finally {
      await client.query("ROLLBACK");
    }
  });

  it("does not grant the public role direct access to private editorial tables", async () => {
    await client.query("BEGIN");
    try {
      await client.query("SET LOCAL ROLE perspective_public");
      await expect(client.query("SELECT * FROM profiles.company_versions LIMIT 1")).rejects.toMatchObject({ code: "42501" });
    } finally {
      await client.query("ROLLBACK");
    }
  });

  it("prevents mutation of immutable profile versions", async () => {
    await client.query("BEGIN");
    try {
      const id = crypto.randomUUID();
      const versionId = crypto.randomUUID();
      await client.query("INSERT INTO profiles.company_profiles (id,slug) VALUES ($1,$2)", [id,`pn01-immutable-${id.slice(0,8)}`]);
      await client.query(
        "INSERT INTO profiles.company_versions (id,company_profile_id,version,name,summary) VALUES ($1,$2,1,$3,$4)",
        [versionId,id,"Immutable Snapshot","Synthetic immutable editorial snapshot for the isolated test."],
      );
      await expect(client.query(
        "UPDATE profiles.company_versions SET name='Edited' WHERE id=$1",
        [versionId],
      )).rejects.toMatchObject({ code: "23514" });
    } finally {
      await client.query("ROLLBACK");
    }
  });
});
