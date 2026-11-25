import { Client } from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { requireDatabaseUrl } from "@/modules/persistence/database-environment";

const client = new Client({ connectionString: requireDatabaseUrl(process.env) });
const sources = JSON.stringify([{ label: "Public professional source", url: "https://example.org/bio", capturedAt: "2026-11-18T13:00:00Z" }]);

beforeAll(async () => { await client.connect(); });
afterAll(async () => { await client.end(); });

describe("V1.1 PN-02 PostgreSQL public identities", () => {
  it("rejects public publication without an approved sourced version", async () => {
    await client.query("BEGIN");
    try {
      const id = crypto.randomUUID();
      const version = crypto.randomUUID();
      await client.query("INSERT INTO profiles.person_profiles (id,slug,kind) VALUES ($1,$2,'EDITOR')", [id,`pn02-editor-${id.slice(0,8)}`]);
      await client.query(
        "INSERT INTO profiles.person_versions (id,person_profile_id,version,name,summary,sources) VALUES ($1,$2,1,$3,$4,$5::jsonb)",
        [version,id,"Unapproved Editor","A private synthetic editor profile used in the database test.",sources],
      );
      await expect(client.query("UPDATE profiles.person_profiles SET state='PUBLISHED',published_version_id=$1 WHERE id=$2", [version,id]))
        .rejects.toMatchObject({ code: "23514" });
    } finally {
      await client.query("ROLLBACK");
    }
  });

  it("returns only the requested kind and its approved snapshot", async () => {
    await client.query("BEGIN");
    try {
      const id = crypto.randomUUID();
      const version = crypto.randomUUID();
      const slug = `pn02-professional-${id.slice(0,8)}`;
      await client.query("INSERT INTO profiles.person_profiles (id,slug,kind) VALUES ($1,$2,'PROFESSIONAL')", [id,slug]);
      await client.query(
        "INSERT INTO profiles.person_versions (id,person_profile_id,version,name,summary,sources,approved_at) VALUES ($1,$2,1,$3,$4,$5::jsonb,now())",
        [version,id,"Professional Test Subject","Source-backed professional identity for isolated test only.",sources],
      );
      await client.query("UPDATE profiles.person_profiles SET state='PUBLISHED',published_version_id=$1 WHERE id=$2", [version,id]);
      await client.query("SET LOCAL ROLE perspective_public");
      const good = await client.query<{ result: Record<string,unknown> }>(
        "SELECT profiles.pn02_public_person('PROFESSIONAL',$1::text) AS result", [slug],
      );
      expect(good.rows[0].result).toMatchObject({ slug, kind: "PROFESSIONAL", name: "Professional Test Subject" });
      expect(JSON.stringify(good.rows[0].result)).not.toMatch(/email|personId|crm|contact|ownerOrganizationId/iu);
      const wrongKind = await client.query<{ result: unknown }>(
        "SELECT profiles.pn02_public_person('EDITOR',$1::text) AS result", [slug],
      );
      expect(wrongKind.rows[0].result).toBeNull();
      const directory = await client.query<{ result: Array<{slug: string}> }>(
        "SELECT profiles.pn02_public_person_directory('PROFESSIONAL',$1::text) AS result", ["Professional Test"],
      );
      expect(directory.rows[0].result.some((row) => row.slug === slug)).toBe(true);
      const otherDirectory = await client.query<{ result: Array<{slug: string}> }>(
        "SELECT profiles.pn02_public_person_directory('EDITOR',$1::text) AS result", ["Professional Test"],
      );
      expect(otherDirectory.rows[0].result.some((row) => row.slug === slug)).toBe(false);
      const relationships = await client.query<{ result: unknown[] }>(
        "SELECT profiles.pn02_public_relationships('PROFESSIONAL',$1::text) AS result", [slug],
      );
      expect(relationships.rows[0].result).toEqual([]);
    } finally {
      await client.query("ROLLBACK");
    }
  });

  it("does not grant public readers direct access to person records", async () => {
    await client.query("BEGIN");
    try {
      await client.query("SET LOCAL ROLE perspective_public");
      await expect(client.query("SELECT id FROM profiles.person_versions LIMIT 1"))
        .rejects.toMatchObject({ code: "42501" });
    } finally {
      await client.query("ROLLBACK");
    }
  });

  it("prevents rewriting an approved version", async () => {
    await client.query("BEGIN");
    try {
      const id = crypto.randomUUID();
      const v = crypto.randomUUID();
      await client.query("INSERT INTO profiles.person_profiles (id,slug,kind) VALUES ($1,$2,'EDITOR')", [id,`pn02-immutable-${id.slice(0,8)}`]);
      await client.query(
        "INSERT INTO profiles.person_versions (id,person_profile_id,version,name,summary,sources,approved_at) VALUES ($1,$2,1,$3,$4,$5::jsonb,now())",
        [v,id,"Editor Test Snapshot","A reviewed editor version should be immutable once saved.",sources],
      );
      await expect(client.query("UPDATE profiles.person_versions SET name='Modified' WHERE id=$1", [v]))
        .rejects.toMatchObject({ code: "23514" });
    } finally {
      await client.query("ROLLBACK");
    }
  });
});
