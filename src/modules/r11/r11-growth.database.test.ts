import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { AccountState, MembershipStatus, MembershipType, OrganizationType, RecordStatus } from "@/generated/prisma/client";
import type { MembershipId, OrganizationId, SessionId, TenantScopedRequestContext, UserId } from "@/modules/foundation/request-context";
import { createPrismaClient } from "@/modules/persistence/client";
import { runR9Command, type R9Result } from "@/modules/r9/commands";

import { observePublic, runR11Command, runReindex, runRule, type R11Result } from "./commands";

const database = createPrismaClient();
const epoch = new Date("2026-10-02T12:00:00.000Z");
const ownerId = crypto.randomUUID();
const foreignOrgId = crypto.randomUUID();
const staffId = crypto.randomUUID();
const approverId = crypto.randomUUID();
const foreignStaffId = crypto.randomUUID();
const staffUserId = crypto.randomUUID();
let sequence = 0;

function key() {
  sequence += 1;
  return `r11k${sequence.toString(36)}${crypto.randomUUID().replaceAll("-", "")}`.slice(0, 80);
}

function team(organizationId: string, membershipId: string, requestId: string): TenantScopedRequestContext {
  return {
    authentication: "authenticated",
    scope: "tenant",
    requestId,
    identity: { userId: staffUserId as UserId },
    session: {
      sessionId: requestId as SessionId,
      issuedAt: epoch,
      expiresAt: new Date(epoch.getTime() + 60 * 60 * 1000),
      authenticationMethod: "password",
    },
    membership: { membershipId: membershipId as MembershipId, organizationId: organizationId as OrganizationId, surface: "TEAM" },
    tenant: { membershipId: membershipId as MembershipId, organizationId: organizationId as OrganizationId, surface: "TEAM" },
  };
}

const owner = team(ownerId, staffId, "r11-owner");
const approver = team(ownerId, approverId, "r11-approver");
const foreign = team(foreignOrgId, foreignStaffId, "r11-foreign");

async function must(label: string, result: R11Result | R9Result) {
  if (result.kind !== "ok") throw new Error(`${label}: ${JSON.stringify(result)}`);
  return result.value;
}

function command(name: string, payload: Record<string, unknown>, idempotencyKey = key(), context = owner) {
  return runR11Command(context, name, payload, idempotencyKey, database);
}

function r9(name: string, payload: Record<string, unknown>, idempotencyKey = key()) {
  return runR9Command(owner, name, payload, idempotencyKey, database);
}

async function seedStory(title: string) {
  const projectId = crypto.randomUUID();
  const workId = crypto.randomUUID();
  const draftId = crypto.randomUUID();
  const versionId = crypto.randomUUID();
  const assetId = crypto.randomUUID();
  await database.$executeRawUnsafe(
    `INSERT INTO platform.resources (id, resource_type, title, owner_organization_id, visibility, sensitivity)
     VALUES ($1::uuid, 'production-project', $2, $3::uuid, 'INTERNAL', 'STANDARD'),
            ($4::uuid, 'asset', $2, $3::uuid, 'INTERNAL', 'STANDARD'),
            ($5::uuid, 'editorial-work', $2, $3::uuid, 'INTERNAL', 'STANDARD')`,
    projectId, title, ownerId, assetId, workId,
  );
  await database.$executeRawUnsafe(
    `INSERT INTO production.projects (
       id, resource_id, owner_organization_id, proposal_id, proposal_version_id, client_account_id,
       client_organization_id, title, state
     ) VALUES ($1::uuid, $1::uuid, $2::uuid, $1::uuid, $1::uuid, $1::uuid, $1::uuid, $3, 'PUBLICATION_READY')`,
    projectId, ownerId, title,
  );
  await database.$executeRawUnsafe(
    `INSERT INTO production.editorial_works (id, resource_id, owner_organization_id, project_id)
     VALUES ($1::uuid, $1::uuid, $2::uuid, $3::uuid)`,
    workId, ownerId, projectId,
  );
  await database.$executeRawUnsafe(
    `INSERT INTO production.drafts (id, owner_organization_id, work_id, body) VALUES ($1::uuid, $2::uuid, $3::uuid, $4)`,
    draftId, ownerId, workId, `${title} body`,
  );
  await database.$executeRawUnsafe(
    `INSERT INTO production.draft_versions (id, owner_organization_id, draft_id, version_number, body, digest, issued_at)
     VALUES ($1::uuid, $2::uuid, $3::uuid, 1, $4, $5, now())`,
    versionId, ownerId, draftId, `${title} body`, `digest-${title}`,
  );
  await database.$executeRawUnsafe(
    `INSERT INTO production.editorial_approvals (id, owner_organization_id, draft_version_id, actor_membership_id, approved_at)
     VALUES ($1::uuid, $2::uuid, $3::uuid, $4::uuid, now())`,
    crypto.randomUUID(), ownerId, versionId, staffId,
  );
  await database.$executeRawUnsafe(
    `INSERT INTO production.client_approvals (
       id, owner_organization_id, draft_version_id, actor_membership_id, client_organization_id, decision, decided_at
     ) VALUES ($1::uuid, $2::uuid, $3::uuid, $4::uuid, $2::uuid, 'APPROVED', now())`,
    crypto.randomUUID(), ownerId, versionId, staffId,
  );
  await database.$executeRawUnsafe(
    `INSERT INTO production.assets (
       id, resource_id, owner_organization_id, project_id, present, approved, licensed, cleared
     ) VALUES ($1::uuid, $1::uuid, $2::uuid, $3::uuid, true, true, true, true)`,
    assetId, ownerId, projectId,
  );
  return { versionId, assetId };
}

async function publishIssue(name: string) {
  const story = await seedStory(name);
  const created = await must("issue", await r9("create-issue", { title: name, season: "Winter", theme: "Growth", availability: "PUBLIC" }));
  const opened = await must("open", await r9("open-assembly", { issueId: created.issueId, expectedRowVersion: Number(created.rowVersion) }));
  const section = await must("section", await r9("add-section", { issueId: created.issueId, name: "Desk", expectedRowVersion: Number(opened.rowVersion) }));
  const placed = await must("place", await r9("place-article", {
    issueId: created.issueId, sectionId: section.sectionId, draftVersionId: story.versionId, title: name,
    authorName: "Mira Chen", summary: "Measured later.", altText: "Cover", expectedRowVersion: Number(section.rowVersion),
  }));
  const covered = await must("cover", await r9("set-cover", {
    issueId: created.issueId, headline: name, dek: "Live.", alt: "Cover", storyDraftVersionId: story.versionId, expectedRowVersion: Number(placed.rowVersion),
  }));
  await must("asset", await r9("attach-asset", { placementId: placed.placementId, assetId: story.assetId, expectedRowVersion: Number(covered.rowVersion) }));
  await must("story", await r9("prepare-story", { versionId: story.versionId }));
  const row = await database.$queryRawUnsafe<Array<{ row_version: number }>>(`SELECT row_version FROM production.issues WHERE id = $1::uuid`, created.issueId);
  const prepared = await must("prepare", await r9("prepare-issue", { issueId: created.issueId, expectedRowVersion: Number(row[0]?.row_version) }));
  const ready = await must("ready", await r9("mark-ready", { issueId: created.issueId, expectedRowVersion: Number(prepared.rowVersion) }));
  await must("publish", await r9("publish-issue", { issueId: created.issueId, expectedRowVersion: Number(ready.rowVersion) }));
  return { issueId: String(created.issueId), slug: String(created.slug) };
}

async function commercialPair() {
  const proposalId = crypto.randomUUID();
  const proposalVersionId = crypto.randomUUID();
  const contractId = crypto.randomUUID();
  const clientAccountId = crypto.randomUUID();
  const clientOrganizationId = crypto.randomUUID();
  const resourceId = crypto.randomUUID();
  const createdAudit = crypto.randomUUID();
  await database.organization.create({
    data: { id: clientOrganizationId, organizationType: OrganizationType.CLIENT, legalName: "R11 Client", displayName: "R11 Client", slug: `r11-client-${clientOrganizationId.slice(0, 8)}`, status: RecordStatus.ACTIVE },
  });
  await database.$transaction(async (tx) => {
    await tx.$executeRawUnsafe(`INSERT INTO platform.resources (id, resource_type, title, owner_organization_id, client_organization_id, visibility, sensitivity) VALUES ($1::uuid, 'client-account', 'R11 client', $2::uuid, $3::uuid, 'INTERNAL', 'CONFIDENTIAL')`, resourceId, ownerId, clientOrganizationId);
    await tx.$executeRawUnsafe(`INSERT INTO commercial.client_accounts (id, resource_id, owner_organization_id, client_organization_id, visibility, sensitivity, updated_at) VALUES ($1::uuid, $2::uuid, $3::uuid, $4::uuid, 'INTERNAL', 'CONFIDENTIAL', $5::timestamptz)`, clientAccountId, resourceId, ownerId, clientOrganizationId, epoch);
    await tx.$executeRawUnsafe(`INSERT INTO commercial.proposals (id, resource_id, owner_organization_id, deal_id, client_account_id, status, current_version, currency) VALUES ($1::uuid, $2::uuid, $3::uuid, $4::uuid, $5::uuid, 'ACCEPTED', 1, 'USD')`, proposalId, crypto.randomUUID(), ownerId, crypto.randomUUID(), clientAccountId);
    await tx.$executeRawUnsafe(`INSERT INTO commercial.proposal_versions (id, owner_organization_id, proposal_id, version, status, immutable, currency, subtotal_minor, tax_minor, total_minor) VALUES ($1::uuid, $2::uuid, $3::uuid, 1, 'ACCEPTED', true, 'USD', 100, 0, 100)`, proposalVersionId, ownerId, proposalId);
    await tx.$executeRawUnsafe(`INSERT INTO commercial.proposal_lines (id, owner_organization_id, proposal_version_id, description, quantity, unit_amount_minor, line_total_minor, position) VALUES ($1::uuid, $2::uuid, $3::uuid, 'Signed scope', 2, 50, 100, 1)`, crypto.randomUUID(), ownerId, proposalVersionId);
    await tx.$executeRawUnsafe(`INSERT INTO audit.audit_events (id, owner_organization_id, actor_type, action, request_id, occurred_at) VALUES ($1::uuid, $2::uuid, 'SYSTEM', 'r11.contract.bootstrap', $3::text, $4::timestamptz)`, createdAudit, ownerId, `r11-bootstrap-${contractId}`, epoch);
    await tx.$executeRawUnsafe(`INSERT INTO commercial.contracts (id, resource_id, owner_organization_id, client_account_id, source_proposal_id, source_proposal_version_id, source_proposal_version, status, current_version) VALUES ($1::uuid, $2::uuid, $3::uuid, $4::uuid, $5::uuid, $6::uuid, 1, 'SIGNED', 1)`, contractId, crypto.randomUUID(), ownerId, clientAccountId, proposalId, proposalVersionId);
    await tx.$executeRawUnsafe(`INSERT INTO commercial.contract_versions (id, owner_organization_id, contract_id, version, source_proposal_id, source_proposal_version_id, source_proposal_version, status, immutable, document_snapshot, document_sha256, currency, subtotal_minor, tax_minor, total_minor, created_audit_event_id, issued_at, signed_at) VALUES ($1::uuid, $2::uuid, $3::uuid, 1, $4::uuid, $5::uuid, 1, 'SIGNED', true, '{}'::jsonb, $6::char(64), 'USD', 100, 0, 100, $7::uuid, $8::timestamptz, $8::timestamptz)`, crypto.randomUUID(), ownerId, contractId, proposalId, proposalVersionId, "ab".repeat(32), createdAudit, epoch);
  });
  return { contractId, clientAccountId };
}

describe("R11 growth persistence", () => {
  beforeAll(async () => {
    const present = await database.$queryRawUnsafe<Array<{ exists: boolean }>>(
      `SELECT to_regprocedure('growth.r11_execute(text,uuid,jsonb,uuid,uuid,text,text,text)') IS NOT NULL AS exists`,
    );
    expect(present[0]?.exists).toBe(true);
    await database.organization.createMany({ data: [
      { id: ownerId, organizationType: OrganizationType.PLATFORM, legalName: "R11 Owner", displayName: "R11 Owner", slug: `r11-owner-${ownerId.slice(0, 8)}`, status: RecordStatus.ACTIVE },
      { id: foreignOrgId, organizationType: OrganizationType.PLATFORM, legalName: "R11 Foreign", displayName: "R11 Foreign", slug: `r11-foreign-${foreignOrgId.slice(0, 8)}`, status: RecordStatus.ACTIVE },
    ] });
    const staffPerson = crypto.randomUUID();
    const approverPerson = crypto.randomUUID();
    const foreignPerson = crypto.randomUUID();
    const approverUser = crypto.randomUUID();
    const foreignUser = crypto.randomUUID();
    await database.person.createMany({ data: [
      { id: staffPerson, displayName: "R11 Staff" },
      { id: approverPerson, displayName: "R11 Approver" },
      { id: foreignPerson, displayName: "R11 Foreign" },
    ] });
    await database.userAccount.createMany({ data: [
      { id: staffUserId, personId: staffPerson, accountState: AccountState.ACTIVE, emailVerifiedAt: epoch },
      { id: approverUser, personId: approverPerson, accountState: AccountState.ACTIVE, emailVerifiedAt: epoch },
      { id: foreignUser, personId: foreignPerson, accountState: AccountState.ACTIVE, emailVerifiedAt: epoch },
    ] });
    await database.organizationMembership.createMany({ data: [
      { id: staffId, organizationId: ownerId, userAccountId: staffUserId, membershipType: MembershipType.STAFF, status: MembershipStatus.ACTIVE, joinedAt: epoch },
      { id: approverId, organizationId: ownerId, userAccountId: approverUser, membershipType: MembershipType.STAFF, status: MembershipStatus.ACTIVE, joinedAt: epoch },
      { id: foreignStaffId, organizationId: foreignOrgId, userAccountId: foreignUser, membershipType: MembershipType.STAFF, status: MembershipStatus.ACTIVE, joinedAt: epoch },
    ] });
  });

  afterAll(async () => {
    await database.$disconnect();
  });

  it("records one observation, ignores a foreign campaign, and hides the row from another tenant", async () => {
    const issue = await publishIssue(`Measured Growth ${key()}`);
    const draft = await must("draft", await r9("create-issue", { title: `Draft ${key()}`, season: "Winter", theme: "No", availability: "PUBLIC" }));
    const dedupe = key();
    const first = await observePublic(issue.slug, dedupe, crypto.randomUUID(), database);
    expect(first).toMatchObject({ replayed: false, attributed: false });
    const again = await observePublic(issue.slug, dedupe, null, database);
    expect(again).toMatchObject({ replayed: true, observationId: first?.observationId });
    expect(await observePublic(String(draft.slug), key(), null, database)).toBeNull();
    const forged = await command("create-report", { family: "CONTENT", from: epoch.toISOString(), to: epoch.toISOString(), views: 100000 });
    expect(forged).toMatchObject({ kind: "error", code: "INVALID" });
    const hidden = await database.$transaction(async (tx) => {
      await tx.$executeRawUnsafe("SET LOCAL ROLE perspective_runtime");
      await tx.$queryRaw`SELECT set_config('app.organization_id', ${foreignOrgId}, true)`;
      return tx.$queryRawUnsafe<Array<{ count: number }>>(`SELECT count(*)::int AS count FROM growth.observations WHERE slug = $1`, issue.slug);
    });
    expect(hidden[0]?.count).toBe(0);
    await expect(database.$transaction(async (tx) => {
      await tx.$executeRawUnsafe("SET LOCAL ROLE perspective_runtime");
      await tx.$queryRaw`SELECT set_config('app.organization_id', ${ownerId}, true)`;
      await tx.$executeRawUnsafe(
        `INSERT INTO growth.observations (id, owner_organization_id, subject_type, subject_id, slug, dedupe_key) VALUES ($1::uuid, $2::uuid, 'ISSUE', $1::uuid, 'illegal', 'illegalkey')`,
        crypto.randomUUID(), ownerId,
      );
    })).rejects.toThrow();
  });

  it("derives a report, refuses same-actor approval, and replays the idempotency key", async () => {
    const from = epoch.toISOString();
    const to = new Date(epoch.getTime() + 60_000).toISOString();
    const idempotencyKey = key();
    const created = await must("report", await command("create-report", { family: "CONTENT", from, to }, idempotencyKey));
    expect(created.snapshot).toMatchObject({ trust: "INTERNAL_OBSERVATION" });
    const replay = await must("replay", await command("create-report", { family: "CONTENT", from, to }, idempotencyKey));
    expect(replay.replayed).toBe(true);
    const changed = await command("create-report", { family: "GROWTH", from, to }, idempotencyKey);
    expect(changed).toMatchObject({ kind: "error", code: "IDEMPOTENCY_CONFLICT" });
    const self = await command("approve-report", { reportId: created.reportId, expectedRowVersion: 1 });
    expect(self).toMatchObject({ kind: "error", code: "INELIGIBLE" });
    const approved = await must("approve", await command("approve-report", { reportId: created.reportId, expectedRowVersion: 1 }, key(), approver));
    expect(approved.state).toBe("REPORT_APPROVED");
    const stolen = await command("approve-report", { reportId: created.reportId, expectedRowVersion: 2 }, key(), foreign);
    expect(stolen).toMatchObject({ kind: "error", code: "NOT_FOUND" });
  });

  it("opens renewal and upsell signals without mutating commercial rows", async () => {
    const pair = await commercialPair();
    const before = await database.$queryRawUnsafe<Array<{ contract_version: number; account_version: number }>>(
      `SELECT contract.row_version AS contract_version, account.row_version AS account_version
         FROM commercial.contracts AS contract, commercial.client_accounts AS account
        WHERE contract.id = $1::uuid AND account.id = $2::uuid`,
      pair.contractId, pair.clientAccountId,
    );
    const renewal = await must("renewal", await command("open-renewal", { contractId: pair.contractId }));
    const upsell = await must("upsell", await command("open-upsell", { clientAccountId: pair.clientAccountId }));
    expect(renewal.state).toBe("SIGNAL_CANDIDATE");
    const reviewed = await must("review", await command("review-signal", { signalId: renewal.signalId, expectedRowVersion: 1 }));
    const acted = await must("act", await command("act-signal", { signalId: renewal.signalId, expectedRowVersion: Number(reviewed.rowVersion) }));
    expect(acted.state).toBe("SIGNAL_ACTED");
    expect(upsell.kind).toBe("UPSELL");
    const after = await database.$queryRawUnsafe<Array<{ contract_version: number; account_version: number }>>(
      `SELECT contract.row_version AS contract_version, account.row_version AS account_version
         FROM commercial.contracts AS contract, commercial.client_accounts AS account
        WHERE contract.id = $1::uuid AND account.id = $2::uuid`,
      pair.contractId, pair.clientAccountId,
    );
    expect(after[0]).toEqual(before[0]);
    expect(await command("open-renewal", { contractId: crypto.randomUUID() })).toMatchObject({ kind: "error", code: "NOT_FOUND" });
  });

  it("runs one automation effect and does not execute a disabled rule twice", async () => {
    const rule = await must("rule", await command("create-rule", {
      name: "Quiet growth", trigger: "DISTRIBUTION_RECORDED", field: "delivery_count", operator: "GT", threshold: 5,
    }));
    const quietKey = key();
    const skipped = await runRule(ownerId, String(rule.ruleId), quietKey, database);
    expect(skipped).toMatchObject({ result: "CONDITION_FALSE", replayed: false });
    const replay = await runRule(ownerId, String(rule.ruleId), quietKey, database);
    expect(replay).toMatchObject({ result: "CONDITION_FALSE", replayed: true });
    const matched = await must("matched rule", await command("create-rule", {
      name: "Any delivery gap", trigger: "DISTRIBUTION_RECORDED", field: "delivery_count", operator: "EQ", threshold: 0,
    }));
    const trigger = key();
    const executed = await runRule(ownerId, String(matched.ruleId), trigger, database);
    expect(executed).toMatchObject({ result: "EXECUTED", replayed: false });
    const second = await runRule(ownerId, String(matched.ruleId), trigger, database);
    expect(second).toMatchObject({ result: "EXECUTED", replayed: true, signalId: executed.signalId });
    const signals = await database.$queryRawUnsafe<Array<{ count: number }>>(
      `SELECT count(*)::int AS count FROM growth.signals WHERE rule_id = $1::uuid`,
      matched.ruleId,
    );
    expect(signals[0]?.count).toBe(1);
    await must("disable", await command("set-rule", { ruleId: matched.ruleId, enabled: false, expectedRowVersion: 1 }));
    const blocked = await runRule(ownerId, String(matched.ruleId), key(), database);
    expect(blocked).toMatchObject({ kind: "error", code: "INELIGIBLE" });
    expect(await command("create-rule", {
      name: "Bad", trigger: "DISTRIBUTION_RECORDED", field: "delivery_count", operator: "GT", threshold: 1, action: "DROP_TABLE",
    })).toMatchObject({ kind: "error", code: "INVALID" });
  });

  it("indexes a published issue and leaves the draft out", async () => {
    const issue = await publishIssue(`Indexed Growth ${key()}`);
    const draft = await must("draft", await r9("create-issue", { title: `Hidden Draft ${key()}`, season: "Winter", theme: "No", availability: "PUBLIC" }));
    const indexed = await runReindex(database);
    expect(Number(indexed.documents)).toBeGreaterThan(0);
    const rows = await database.$queryRawUnsafe<Array<{ slug: string }>>(
      `SELECT slug FROM growth.search_documents WHERE slug = $1 OR title = $2`,
      issue.slug, draft.title,
    );
    expect(rows.map((row) => row.slug)).toContain(issue.slug);
    expect(rows.map((row) => row.slug)).not.toContain(String(draft.slug));
    const meta = await database.$queryRawUnsafe<Array<{ result: { canonical?: string } | null }>>(
      `SELECT growth.r11_public_meta($1::text) AS result`,
      draft.slug,
    );
    expect(meta[0]?.result).toBeNull();
  });
});
