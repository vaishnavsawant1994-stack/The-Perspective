import { Client } from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { requireDatabaseUrl } from "@/modules/persistence/database-environment";

const client = new Client({ connectionString: requireDatabaseUrl(process.env) });

beforeAll(async () => { await client.connect(); });
afterAll(async () => { await client.end(); });

function id() { return crypto.randomUUID(); }
function key() { return `pn03-${id()}`; }

describe("V1.1 PN-03 team-only editorial command lifecycle", () => {
  it("requires platform staff, an independent reviewer and source-backed immutable approval", async () => {
    const org = id(), clientOrg = id();
    const personA = id(), personB = id(), personClient = id();
    const userA = id(), userB = id(), userClient = id();
    const author = id(), reviewer = id(), clientMember = id();
    const slug = `pn03-test-${id().slice(0,8)}`;
    const payload = {
      name: "Synthetic Review Organization",
      summary: "The following data exists only inside this rolled-back database test transaction.",
      disclosureKind: "NONE",
      sources: [{ label: "Source for test", url: "https://example.org/source", capturedAt: "2026-11-18T13:00:00Z" }],
    };
    await client.query("BEGIN");
    try {
      await client.query(
        "INSERT INTO iam.organizations(id,organization_type,legal_name,display_name,slug,status,updated_at) VALUES ($1,'PLATFORM',$2,$2,$3,'ACTIVE',now()),($4,'CLIENT',$5,$5,$6,'ACTIVE',now())",
        [org,"V11 Test Platform",`pn03-org-${org.slice(0,8)}`,clientOrg,"V11 Test Client",`pn03-client-${clientOrg.slice(0,8)}`],
      );
      await client.query(
        "INSERT INTO iam.people(id,display_name,updated_at) VALUES ($1,'V11 Author',now()),($2,'V11 Reviewer',now()),($3,'V11 Client',now())",
        [personA,personB,personClient],
      );
      await client.query(
        "INSERT INTO iam.user_accounts(id,person_id,account_state,updated_at) VALUES ($1,$2,'ACTIVE',now()),($3,$4,'ACTIVE',now()),($5,$6,'ACTIVE',now())",
        [userA,personA,userB,personB,userClient,personClient],
      );
      await client.query(
        "INSERT INTO iam.organization_memberships(id,organization_id,user_account_id,membership_type,status,joined_at,updated_at) VALUES ($1,$2,$3,'STAFF','ACTIVE',now(),now()),($4,$2,$5,'STAFF','ACTIVE',now(),now()),($6,$7,$8,'STAFF','ACTIVE',now(),now())",
        [author,org,userA,reviewer,userB,clientMember,clientOrg,userClient],
      );
      await client.query("SET LOCAL ROLE perspective_runtime");
      await client.query("SELECT set_config('app.organization_id',$1,true)",[org]);
      const failClient = await client.query<{ result: { kind:string; code:string } }>(
        "SELECT profiles.pn03_submit($1::uuid,'COMPANY',$2::text,$3::jsonb,$4::text) AS result",
        [clientMember,slug,JSON.stringify(payload),key()],
      );
      expect(failClient.rows[0].result).toMatchObject({kind:"error",code:"TEAM_REQUIRED"});
      const created = await client.query<{ result: { kind:string; submissionId:string; state:string } }>(
        "SELECT profiles.pn03_submit($1::uuid,'COMPANY',$2::text,$3::jsonb,$4::text) AS result",
        [author,slug,JSON.stringify(payload),key()],
      );
      expect(created.rows[0].result).toMatchObject({kind:"ok",state:"SUBMITTED"});
      const submissionId = created.rows[0].result.submissionId;
      const selfReview = await client.query<{ result: { kind:string; code:string } }>(
        "SELECT profiles.pn03_review($1::uuid,$2::uuid,'APPROVE',$3::text,$4::text) AS result",
        [author,submissionId,"Self approval not permitted",key()],
      );
      expect(selfReview.rows[0].result).toMatchObject({kind:"error",code:"SEPARATION_REQUIRED"});
      const reviewed = await client.query<{ result: { kind:string; state:string; approvedVersionId:string } }>(
        "SELECT profiles.pn03_review($1::uuid,$2::uuid,'APPROVE',$3::text,$4::text) AS result",
        [reviewer,submissionId,"Source checks and editorial basis independently reviewed",key()],
      );
      expect(reviewed.rows[0].result).toMatchObject({kind:"ok",state:"APPROVED"});
      expect(reviewed.rows[0].result.approvedVersionId).toBeTruthy();
      const selfPublish = await client.query<{ result: {kind:string;code:string} }>(
        "SELECT profiles.pn03_publish($1::uuid,$2::uuid,'PUBLISH',$3::text,$4::text) AS result",
        [author,submissionId,"Original submitter cannot publish",key()],
      );
      expect(selfPublish.rows[0].result).toMatchObject({kind:"error",code:"SEPARATION_REQUIRED"});
      const published = await client.query<{ result: {kind:string;state:string} }>(
        "SELECT profiles.pn03_publish($1::uuid,$2::uuid,'PUBLISH',$3::text,$4::text) AS result",
        [reviewer,submissionId,"Publish after independent editorial review",key()],
      );
      expect(published.rows[0].result).toMatchObject({kind:"ok",state:"PUBLISHED"});
      const queue = await client.query<{ result: Array<{submissionId:string;state:string}> }>(
        "SELECT profiles.pn03_team_queue($1::uuid) AS result",[reviewer],
      );
      expect(queue.rows[0].result).toEqual(expect.arrayContaining([expect.objectContaining({submissionId,state:"APPROVED"})]));
      const withdrawn = await client.query<{result: {kind:string;state:string}}>(
        "SELECT profiles.pn03_publish($1::uuid,$2::uuid,'WITHDRAW',$3::text,$4::text) AS result",
        [reviewer,submissionId,"Remove public profile after an editorial review",key()],
      );
      expect(withdrawn.rows[0].result).toMatchObject({kind:"ok",state:"WITHDRAWN"});
    } finally {
      await client.query("ROLLBACK");
    }
  });
});
