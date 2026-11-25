import { Client } from "pg";
import { createHash } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { requireDatabaseUrl } from "@/modules/persistence/database-environment";

const client = new Client({ connectionString: requireDatabaseUrl(process.env) });
beforeAll(async () => { await client.connect(); });
afterAll(async () => { await client.end(); });

describe("V1.1 PN-04 request intake safeguards", () => {
  it("purges only expired requests for an active platform staff actor", async () => {
    const platformId=crypto.randomUUID();
    const personId=crypto.randomUUID();
    const accountId=crypto.randomUUID();
    const actorId=crypto.randomUUID();
    const expiredId=crypto.randomUUID();
    const retainedId=crypto.randomUUID();
    const slug=`pn04-purge-${platformId.slice(0,8)}`;
    const rateKey=createHash("sha256").update(platformId).digest("hex");

    await client.query("BEGIN");
    try {
      await client.query(
        "INSERT INTO iam.organizations(id,organization_type,legal_name,display_name,slug,updated_at) VALUES($1,'PLATFORM',$2,$2,$3,now())",
        [platformId,"PN-04 purge test platform",slug],
      );
      await client.query(
        "INSERT INTO iam.people(id,display_name,updated_at) VALUES($1,$2,now())",
        [personId,"PN-04 purge test staff"],
      );
      await client.query(
        "INSERT INTO iam.user_accounts(id,person_id,account_state,updated_at) VALUES($1,$2,'ACTIVE',now())",
        [accountId,personId],
      );
      await client.query(
        "INSERT INTO iam.organization_memberships(id,organization_id,user_account_id,membership_type,status,joined_at,updated_at) VALUES($1,$2,$3,'STAFF','ACTIVE',now(),now())",
        [actorId,platformId,accountId],
      );
      await client.query(
        `INSERT INTO profiles.profile_requests(id,request_kind,subject_kind,subject_slug,description,rate_key,expires_at)
         VALUES($1,'CORRECTION','COMPANY','synthetic-company','A test-only expired correction request that should be purged.',$3,now()-interval '1 second'),
               ($2,'CORRECTION','COMPANY','synthetic-company','A test-only unexpired correction request that must remain.',$3,now()+interval '1 day')`,
        [expiredId,retainedId,rateKey],
      );

      await client.query("SET LOCAL ROLE perspective_public");
      await client.query("SAVEPOINT pn04_public_cannot_purge");
      await expect(client.query("SELECT profiles.pn04_purge_expired($1::uuid)",[actorId]))
        .rejects.toMatchObject({code:"42501"});
      await client.query("ROLLBACK TO SAVEPOINT pn04_public_cannot_purge");
      await client.query("RESET ROLE");

      await client.query("SET LOCAL ROLE perspective_runtime");
      await client.query("SELECT set_config('app.organization_id',$1,true)",[platformId]);
      await client.query("SAVEPOINT pn04_invalid_actor");
      await expect(client.query("SELECT profiles.pn04_purge_expired($1::uuid)",[crypto.randomUUID()]))
        .rejects.toMatchObject({code:"42501"});
      await client.query("ROLLBACK TO SAVEPOINT pn04_invalid_actor");
      const purged=await client.query<{deleted:number}>(
        "SELECT profiles.pn04_purge_expired($1::uuid) AS deleted",[actorId],
      );
      expect(purged.rows[0].deleted).toBe(1);
      await client.query("RESET ROLE");
      const retained=await client.query<{id:string}>(
        "SELECT id FROM profiles.profile_requests WHERE id=$1",[retainedId],
      );
      const expired=await client.query<{id:string}>(
        "SELECT id FROM profiles.profile_requests WHERE id=$1",[expiredId],
      );
      expect(retained.rows).toHaveLength(1);
      expect(expired.rows).toHaveLength(0);
    } finally {
      await client.query("ROLLBACK");
    }
  });

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

  it("keeps the per-IP daily cap atomic when submissions race", async () => {
    const id=crypto.randomUUID();
    const versionId=crypto.randomUUID();
    const slug=`pn04-race-${id.slice(0,8)}`;
    const rateKey=createHash("sha256").update(id).digest("hex");
    const source=JSON.stringify([{label:"Published organization source",url:"https://example.org/about",capturedAt:"2026-11-24T00:00:00Z"}]);
    const workerCount=10;
    const workers=await Promise.all(Array.from({length:workerCount},async()=>{
      const worker=new Client({connectionString:requireDatabaseUrl(process.env)});
      await worker.connect();
      await worker.query("BEGIN");
      await worker.query("SET LOCAL ROLE perspective_public");
      await worker.query("SELECT set_config('app.organization_id','',true)");
      return worker;
    }));

    try {
      await client.query("INSERT INTO profiles.company_profiles(id,slug) VALUES($1,$2)",[id,slug]);
      await client.query(
        "INSERT INTO profiles.company_versions(id,company_profile_id,version,name,summary,sources,approved_at) VALUES($1,$2,1,$3,$4,$5::jsonb,now())",
        [versionId,id,"Concurrent Synthetic Profile","A source-backed synthetic profile for rate-limit concurrency testing.",source],
      );
      await client.query("UPDATE profiles.company_profiles SET state='PUBLISHED',published_version_id=$1 WHERE id=$2",[versionId,id]);
      await client.query("COMMIT");

      // Widen the count-before-insert race window so this regression test fails
      // deterministically if the transaction-scoped advisory lock is removed.
      await client.query(`CREATE FUNCTION profiles.pn04_test_delay_insert() RETURNS trigger
        LANGUAGE plpgsql AS $delay$ BEGIN PERFORM pg_sleep(0.75); RETURN NEW; END $delay$`);
      await client.query(`CREATE TRIGGER pn04_test_delay_insert BEFORE INSERT ON profiles.profile_requests
        FOR EACH ROW EXECUTE FUNCTION profiles.pn04_test_delay_insert()`);

      const outcomes=await Promise.all(workers.map(async(worker,index)=>{
        try {
          const result=await worker.query<{result:string|null}>(
            "SELECT profiles.pn04_public_submit($1::text,'COMPANY',$2::text,$3::text,$4::text,NULL,$5::text,'') AS result",
            ["CORRECTION",slug,`A concurrent synthetic correction request ${index} that exceeds the daily cap safely.`,"https://example.org/about",rateKey],
          );
          await worker.query("COMMIT");
          return result.rows[0].result;
        } catch(error) {
          await worker.query("ROLLBACK");
          throw error;
        }
      }));

      expect(outcomes.filter(Boolean)).toHaveLength(3);
      const stored=await client.query<{count:string}>(
        "SELECT count(*)::text AS count FROM profiles.profile_requests WHERE rate_key=$1",
        [rateKey],
      );
      expect(stored.rows[0].count).toBe("3");
    } finally {
      for(const worker of workers){
        await worker.query("ROLLBACK").catch(()=>undefined);
        await worker.end();
      }
      await client.query("DROP TRIGGER IF EXISTS pn04_test_delay_insert ON profiles.profile_requests");
      await client.query("DROP FUNCTION IF EXISTS profiles.pn04_test_delay_insert()");
      await client.query("DELETE FROM profiles.profile_requests WHERE rate_key=$1",[rateKey]);
      await client.query("BEGIN");
      await client.query("SET LOCAL session_replication_role=replica");
      await client.query("DELETE FROM profiles.company_versions WHERE company_profile_id=$1",[id]);
      await client.query("DELETE FROM profiles.company_profiles WHERE id=$1",[id]);
      await client.query("COMMIT");
    }
  });
});
