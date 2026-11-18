import { Client } from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { requireDatabaseUrl } from "@/modules/persistence/database-environment";

const client = new Client({ connectionString: requireDatabaseUrl(process.env) });
beforeAll(async () => { await client.connect(); });
afterAll(async () => { await client.end(); });

describe("V1.1 PN-04 request intake safeguards", () => {
  it("keeps claims private and rate limits requests without publishing any change", async () => {
    const id=crypto.randomUUID();
    const v=crypto.randomUUID();
    const slug=`pn04-test-${id.slice(0,8)}`;
    const source=JSON.stringify([{label:"Company source",url:"https://example.org/info",capturedAt:"2026-11-18T13:00:00Z"}]);
    const rateKey="a".repeat(64);
    await client.query("BEGIN");
    try {
      await client.query("INSERT INTO profiles.company_profiles(id,slug) VALUES($1,$2)",[id,slug]);
      await client.query(
        "INSERT INTO profiles.company_versions(id,company_profile_id,version,name,summary,sources,approved_at) VALUES($1,$2,1,$3,$4,$5::jsonb,now())",
        [v,id,"Synthetic Profile Request Company","A published synthetic profile used in rollback-only testing.",source],
      );
      await client.query("UPDATE profiles.company_profiles SET state='PUBLISHED',published_version_id=$1 WHERE id=$2",[v,id]);
      await client.query("SET LOCAL ROLE perspective_public");
      const request=async (kind:string,subject:string,email:string|null,honeypot="",rate=rateKey) => client.query<{result:string|null}>(
        "SELECT profiles.pn04_public_submit($1::text,'COMPANY',$2::text,$3::text,$4::text,$5::text,$6::text,$7::text) AS result",
        [kind,subject,"This source-backed detail needs an independently considered correction.", "https://example.org/info",email,rate,honeypot],
      );
      const badClaim=await request("CLAIM",slug,null);
      expect(badClaim.rows[0].result).toBeNull();
      const first=await request("CORRECTION",slug,null);
      expect(first.rows[0].result).toMatch(/^[0-9a-f-]{36}$/u);
      const claim=await request("CLAIM",slug,"reviewer@example.org");
      expect(claim.rows[0].result).toMatch(/^[0-9a-f-]{36}$/u);
      const third=await request("REMOVAL",slug,null);
      expect(third.rows[0].result).toMatch(/^[0-9a-f-]{36}$/u);
      const fourth=await request("CORRECTION",slug,null);
      expect(fourth.rows[0].result).toBeNull();
      const fake=await request("CORRECTION","never-published-company",null,"","b".repeat(64));
      expect(fake.rows[0].result).toBeNull();
      const spam=await request("CORRECTION",slug,null,"hidden-field-filled","c".repeat(64));
      expect(spam.rows[0].result).toBeNull();
      const profile=await client.query<{result:Record<string,unknown>}>(
        "SELECT profiles.pn01_public_company($1::text) AS result",[slug],
      );
      expect(profile.rows[0].result).toMatchObject({slug,name:"Synthetic Profile Request Company"});
      expect(JSON.stringify(profile.rows[0].result)).not.toContain("reviewer@example.org");
    } finally {
      await client.query("ROLLBACK");
    }
  });

  it("does not permit anonymous direct access to submitted email or request details", async () => {
    await client.query("BEGIN");
    try {
      await client.query("SET LOCAL ROLE perspective_public");
      await expect(client.query("SELECT contact_email FROM profiles.profile_requests LIMIT 1"))
        .rejects.toMatchObject({code:"42501"});
    } finally {
      await client.query("ROLLBACK");
    }
  });
});
