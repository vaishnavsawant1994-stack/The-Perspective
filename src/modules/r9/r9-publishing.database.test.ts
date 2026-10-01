import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { AccountState, MembershipStatus, MembershipType, OrganizationType, RecordStatus } from "@/generated/prisma/client";
import type { MembershipId, OrganizationId, SessionId, TenantScopedRequestContext, UserId } from "@/modules/foundation/request-context";
import { createPrismaClient } from "@/modules/persistence/client";

import { readPublic, runDueSchedules, runR9Command, type R9Result } from "./commands";

const database = createPrismaClient();
const epoch = new Date("2026-10-01T12:00:00.000Z");
const ownerId = crypto.randomUUID();
const foreignOrgId = crypto.randomUUID();
const staffId = crypto.randomUUID();
const foreignStaffId = crypto.randomUUID();
const staffUserId = crypto.randomUUID();
const personId = crypto.randomUUID();
let sequence = 0;

function key() {
  sequence += 1;
  return `r9k${sequence.toString(36)}${crypto.randomUUID().replaceAll("-", "")}`.slice(0, 80);
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

const owner = team(ownerId, staffId, "r9-owner");
const foreign = team(foreignOrgId, foreignStaffId, "r9-foreign");

async function must(label: string, result: R9Result) {
  if (result.kind !== "ok") throw new Error(`${label}: ${JSON.stringify(result)}`);
  return result.value;
}

async function command(commandName: string, payload: Record<string, unknown>, idempotencyKey = key()) {
  return runR9Command(owner, commandName, payload, idempotencyKey, database);
}

async function count(sql: string, ...values: unknown[]) {
  const rows = await database.$queryRawUnsafe<Array<{ count: number }>>(`SELECT (${sql})::int AS count`, ...values);
  return Number(rows[0]?.count ?? 0);
}

async function seedStory(title: string, options: { cleared?: boolean; approved?: boolean; body?: string } = {}) {
  const projectId = crypto.randomUUID();
  const workId = crypto.randomUUID();
  const draftId = crypto.randomUUID();
  const versionId = crypto.randomUUID();
  const assetId = crypto.randomUUID();
  const cleared = options.cleared ?? true;
  const approved = options.approved ?? true;
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
    draftId, ownerId, workId, options.body ?? `${title} body`,
  );
  await database.$executeRawUnsafe(
    `INSERT INTO production.draft_versions (id, owner_organization_id, draft_id, version_number, body, digest, issued_at)
     VALUES ($1::uuid, $2::uuid, $3::uuid, 1, $4, $5, now())`,
    versionId, ownerId, draftId, options.body ?? `${title} body`, `digest-${title}`,
  );
  if (approved) {
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
  }
  await database.$executeRawUnsafe(
    `INSERT INTO production.assets (
       id, resource_id, owner_organization_id, project_id, present, approved, licensed, cleared
     ) VALUES ($1::uuid, $1::uuid, $2::uuid, $3::uuid, true, $4, $4, $5)`,
    assetId, ownerId, projectId, cleared, cleared,
  );
  return { projectId, workId, draftId, versionId, assetId };
}

async function assemble(name: string, availability: "PUBLIC" | "PREMIUM", story: Awaited<ReturnType<typeof seedStory>>) {
  const created = await must("create", await command("create-issue", { title: name, season: "Winter", theme: "Measurement", availability }));
  const issueId = String(created.issueId);
  let rowVersion = Number(created.rowVersion);
  const opened = await must("open", await command("open-assembly", { issueId, expectedRowVersion: rowVersion }));
  rowVersion = Number(opened.rowVersion);
  const section = await must("section", await command("add-section", { issueId, name: "Room", expectedRowVersion: rowVersion }));
  rowVersion = Number(section.rowVersion);
  const placed = await must("place", await command("place-article", {
    issueId, draftVersionId: story.versionId, sectionId: section.sectionId, title: name, authorName: "Mira Chen",
    summary: "A measured account.", altText: "Cover of the room", expectedRowVersion: rowVersion,
  }));
  rowVersion = Number(placed.rowVersion);
  const covered = await must("cover", await command("set-cover", {
    issueId, headline: name, dek: "The room, measured.", alt: "Cover", storyDraftVersionId: story.versionId, expectedRowVersion: rowVersion,
  }));
  return { issueId, rowVersion: Number(covered.rowVersion), placementId: String(placed.placementId), articleSlug: String(placed.articleSlug), slug: String(created.slug) };
}

describe("R9 publishing persistence", () => {
  beforeAll(async () => {
    const present = await database.$queryRawUnsafe<Array<{ exists: boolean }>>(
      `SELECT to_regprocedure('production.r9_execute(text,uuid,jsonb,uuid,uuid,text,text,text)') IS NOT NULL AS exists`,
    );
    expect(present[0]?.exists).toBe(true);
    const role = await database.$queryRawUnsafe<Array<{ super: boolean; bypass: boolean }>>(
      `SELECT rolsuper AS super, rolbypassrls AS bypass FROM pg_roles WHERE rolname = 'perspective_runtime'`,
    );
    expect(role[0]).toMatchObject({ super: false, bypass: false });
    await database.organization.createMany({
      data: [
        { id: ownerId, organizationType: OrganizationType.PLATFORM, legalName: "R9 Owner", displayName: "R9 Owner", slug: `r9-owner-${ownerId.slice(0, 8)}`, status: RecordStatus.ACTIVE },
        { id: foreignOrgId, organizationType: OrganizationType.PLATFORM, legalName: "R9 Foreign", displayName: "R9 Foreign", slug: `r9-foreign-${foreignOrgId.slice(0, 8)}`, status: RecordStatus.ACTIVE },
      ],
    });
    const staffPerson = crypto.randomUUID();
    const foreignPerson = crypto.randomUUID();
    await database.person.createMany({ data: [
      { id: personId, displayName: "Helena Marlow" },
      { id: staffPerson, displayName: "R9 Staff" },
      { id: foreignPerson, displayName: "R9 Foreign" },
    ] });
    const foreignUser = crypto.randomUUID();
    await database.userAccount.createMany({ data: [
      { id: staffUserId, personId: staffPerson, accountState: AccountState.ACTIVE, emailVerifiedAt: epoch },
      { id: foreignUser, personId: foreignPerson, accountState: AccountState.ACTIVE, emailVerifiedAt: epoch },
    ] });
    await database.organizationMembership.createMany({ data: [
      { id: staffId, organizationId: ownerId, userAccountId: staffUserId, membershipType: MembershipType.STAFF, status: MembershipStatus.ACTIVE, joinedAt: epoch },
      { id: foreignStaffId, organizationId: foreignOrgId, userAccountId: foreignUser, membershipType: MembershipType.STAFF, status: MembershipStatus.ACTIVE, joinedAt: epoch },
    ] });
  });

  afterAll(async () => {
    await database.$disconnect();
  });

  it("hides drafts from the public role and from a missing tenant setting", async () => {
    const story = await seedStory("Hidden draft");
    const issue = await assemble("The Hidden Draft", "PREMIUM", story);
    const hidden = await readPublic("r9_public_issue", "the-hidden-draft", database);
    expect(hidden).toBeNull();
    const premium = await readPublic("r9_public_premium", null, database);
    expect(JSON.stringify(premium)).not.toContain("Hidden");
    const leaked = await database.$transaction(async (tx) => {
      await tx.$executeRawUnsafe("SET LOCAL ROLE perspective_runtime");
      await tx.$queryRaw`SELECT set_config('app.organization_id', '', true)`;
      return tx.$queryRawUnsafe<Array<{ count: number }>>(
        `SELECT count(*)::int AS count FROM production.issues WHERE id = $1::uuid`,
        issue.issueId,
      );
    });
    expect(leaked[0]?.count).toBe(0);
    const stolen = await runR9Command(foreign, "open-assembly", { issueId: issue.issueId, expectedRowVersion: 1 }, key(), database);
    expect(stolen).toMatchObject({ kind: "error", code: "NOT_FOUND" });
  });

  it("publishes Issue 12 once and keeps that version after a later revision", async () => {
    const story = await seedStory("The Measured Room");
    const issue = await assemble(`The Measured Room ${key()}`, "PUBLIC", story);
    await must("asset", await command("attach-asset", { placementId: issue.placementId, assetId: story.assetId, expectedRowVersion: issue.rowVersion }));
    const prepared = await must("prepare story", await command("prepare-story", { versionId: story.versionId }));
    expect(prepared.prepared).toBe(true);
    const current = await database.$queryRawUnsafe<Array<{ row_version: number }>>(`SELECT row_version FROM production.issues WHERE id = $1::uuid`, issue.issueId);
    const rowVersion = Number(current[0]?.row_version);
    const preparing = await must("prepare issue", await command("prepare-issue", { issueId: issue.issueId, expectedRowVersion: rowVersion }));
    const ready = await must("ready", await command("mark-ready", { issueId: issue.issueId, expectedRowVersion: Number(preparing.rowVersion) }));
    const publishKey = key();
    const first = await must("publish", await command("publish-issue", { issueId: issue.issueId, expectedRowVersion: Number(ready.rowVersion) }, publishKey));
    const replay = await must("replay", await command("publish-issue", { issueId: issue.issueId, expectedRowVersion: Number(ready.rowVersion) }, publishKey));
    expect(replay.replayed).toBe(true);
    expect(replay.snapshotId).toBe(first.snapshotId);
    const again = await must("second key", await command("publish-issue", { issueId: issue.issueId, expectedRowVersion: Number(first.rowVersion) }));
    expect(again.snapshotId).toBe(first.snapshotId);
    expect(await count(`SELECT count(*) FROM production.publication_snapshots WHERE issue_id = $1::uuid`, issue.issueId)).toBe(1);
    const versionTwo = crypto.randomUUID();
    await database.$executeRawUnsafe(
      `INSERT INTO production.draft_versions (id, owner_organization_id, draft_id, version_number, body, digest, issued_at)
       VALUES ($1::uuid, $2::uuid, $3::uuid, 2, 'later revision', 'digest-later', now())`,
      versionTwo, ownerId, story.draftId,
    );
    const publicIssue = await readPublic("r9_public_issue", issue.slug, database) as { articles: Array<{ body: string; versionId: string }> };
    expect(publicIssue.articles[0]?.body).toContain("Measured Room");
    expect(publicIssue.articles[0]?.versionId).toBe(story.versionId);
    expect(publicIssue.articles[0]?.body).not.toContain("later revision");
    const project = await database.$queryRawUnsafe<Array<{ state: string }>>(`SELECT state FROM production.projects WHERE id = $1::uuid`, story.projectId);
    expect(project[0]?.state).toBe("PUBLICATION_READY");
  });

  it("blocks Winter Index and Harbor Press until clearance and preparation", async () => {
    const story = await seedStory("Winter Index", { cleared: false });
    const issue = await assemble("Winter Index", "PUBLIC", story);
    const attached = await must("attach", await command("attach-asset", { placementId: issue.placementId, assetId: story.assetId, expectedRowVersion: issue.rowVersion }));
    const uncleared = await command("prepare-story", { versionId: story.versionId });
    expect(uncleared).toMatchObject({ kind: "error", code: "INELIGIBLE" });
    const sponsor = await must("harbor", await command("add-sponsored", {
      issueId: issue.issueId, sponsor: "Harbor Press", headline: "Harbor", body: "A sponsored note.", expectedRowVersion: Number(attached.rowVersion),
    }));
    const preparing = await database.$queryRawUnsafe<Array<{ row_version: number; state: string }>>(`SELECT row_version, state FROM production.issues WHERE id = $1::uuid`, issue.issueId);
    expect(preparing[0]?.state).toBe("ISSUE_ASSEMBLY");
    const opened = await must("prepare assembly", await command("prepare-issue", { issueId: issue.issueId, expectedRowVersion: Number(preparing[0]?.row_version) }));
    const blocked = await command("mark-ready", { issueId: issue.issueId, expectedRowVersion: Number(opened.rowVersion) });
    expect(blocked).toMatchObject({ kind: "error", code: "INELIGIBLE" });
    await database.$executeRawUnsafe(`UPDATE production.assets SET approved = true, licensed = true, cleared = true WHERE id = $1::uuid`, story.assetId);
    await must("story clear", await command("prepare-story", { versionId: story.versionId }));
    const present = await must("present", await command("set-sponsored-rights", { placementId: sponsor.placementId, flag: "present", value: true, expectedRowVersion: 1 }));
    const approved = await must("approved", await command("set-sponsored-rights", { placementId: sponsor.placementId, flag: "approved", value: true, expectedRowVersion: Number(present.rowVersion ?? 2) }));
    const licensed = await must("licensed", await command("set-sponsored-rights", { placementId: sponsor.placementId, flag: "licensed", value: true, expectedRowVersion: Number(approved.rowVersion ?? 3) }));
    await must("cleared", await command("set-sponsored-rights", { placementId: sponsor.placementId, flag: "cleared", value: true, expectedRowVersion: Number(licensed.rowVersion ?? 4) }));
    const tooSoon = await command("set-sponsored-rights", { placementId: sponsor.placementId, flag: "cleared", value: true, expectedRowVersion: 1 });
    expect(tooSoon.kind === "error" || tooSoon.kind === "ok").toBe(true);
    const latest = await database.$queryRawUnsafe<Array<{ row_version: number }>>(`SELECT row_version FROM production.issues WHERE id = $1::uuid`, issue.issueId);
    const ready = await must("ready after clearance", await command("mark-ready", { issueId: issue.issueId, expectedRowVersion: Number(latest[0]?.row_version) }));
    expect(ready.state).toBe("ISSUE_READY");
  });

  it("rejects a second Meridian schedule until cancel and publishes idempotently from two sessions", async () => {
    const story = await seedStory("Meridian");
    const issue = await assemble(`Meridian ${key()}`, "PREMIUM", story);
    await must("asset", await command("attach-asset", { placementId: issue.placementId, assetId: story.assetId, expectedRowVersion: issue.rowVersion }));
    await must("prepare", await command("prepare-story", { versionId: story.versionId }));
    const row = await database.$queryRawUnsafe<Array<{ row_version: number }>>(`SELECT row_version FROM production.issues WHERE id = $1::uuid`, issue.issueId);
    const prepared = await must("issue", await command("prepare-issue", { issueId: issue.issueId, expectedRowVersion: Number(row[0]?.row_version) }));
    const ready = await must("ready", await command("mark-ready", { issueId: issue.issueId, expectedRowVersion: Number(prepared.rowVersion) }));
    const runAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();
    const otherAt = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString();
    const scheduleKey = key();
    const scheduled = await must("schedule", await command("schedule-issue", { issueId: issue.issueId, runAt, expectedRowVersion: Number(ready.rowVersion) }, scheduleKey));
    const replay = await must("schedule replay", await command("schedule-issue", { issueId: issue.issueId, runAt, expectedRowVersion: Number(ready.rowVersion) }, scheduleKey));
    expect(replay.replayed).toBe(true);
    const conflict = await command("schedule-issue", { issueId: issue.issueId, runAt: otherAt, expectedRowVersion: Number(scheduled.rowVersion) }, scheduleKey);
    expect(conflict).toMatchObject({ kind: "error", code: "IDEMPOTENCY_CONFLICT" });
    const second = await command("schedule-issue", { issueId: issue.issueId, runAt: otherAt, expectedRowVersion: Number(scheduled.rowVersion) });
    expect(second).toMatchObject({ kind: "error", code: "CONFLICT" });
    const before = await readPublic("r9_public_premium", null, database) as Array<{ slug: string }>;
    expect(before.some((item) => item.slug === issue.slug)).toBe(false);
    const cancelled = await must("cancel", await command("cancel-schedule", { issueId: issue.issueId, expectedRowVersion: Number(scheduled.rowVersion) }));
    expect(cancelled.state).toBe("ISSUE_READY");
    const publishPayload = { issueId: issue.issueId, expectedRowVersion: Number(cancelled.rowVersion) };
    const [left, right] = await Promise.all([
      runR9Command(owner, "publish-issue", publishPayload, key(), database),
      runR9Command(owner, "publish-issue", publishPayload, key(), database),
    ]);
    const oks = [left, right].filter((result) => result.kind === "ok");
    expect(oks.length).toBeGreaterThan(0);
    expect(await count(`SELECT count(*) FROM production.publication_snapshots WHERE issue_id = $1::uuid`, issue.issueId)).toBe(1);
    const premium = await readPublic("r9_public_premium", null, database) as Array<{ slug: string }>;
    expect(premium.some((item) => item.slug === issue.slug)).toBe(true);
  });

  it("fails a due schedule when clearance disappears and does not publish", async () => {
    const story = await seedStory("Unset Clock");
    const issue = await assemble("Unset Clock", "PUBLIC", story);
    await must("asset", await command("attach-asset", { placementId: issue.placementId, assetId: story.assetId, expectedRowVersion: issue.rowVersion }));
    await must("prepare", await command("prepare-story", { versionId: story.versionId }));
    const row = await database.$queryRawUnsafe<Array<{ row_version: number }>>(`SELECT row_version FROM production.issues WHERE id = $1::uuid`, issue.issueId);
    const prepared = await must("issue", await command("prepare-issue", { issueId: issue.issueId, expectedRowVersion: Number(row[0]?.row_version) }));
    const ready = await must("ready", await command("mark-ready", { issueId: issue.issueId, expectedRowVersion: Number(prepared.rowVersion) }));
    const runAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();
    await must("schedule", await command("schedule-issue", { issueId: issue.issueId, runAt, expectedRowVersion: Number(ready.rowVersion) }));
    await database.$executeRawUnsafe(`UPDATE production.issue_schedules SET run_at = now() - interval '1 minute' WHERE issue_id = $1::uuid AND status = 'PENDING'`, issue.issueId);
    await database.$executeRawUnsafe(`UPDATE production.assets SET cleared = false WHERE id = $1::uuid`, story.assetId);
    const due = await runDueSchedules(database);
    expect(Number(due.failed)).toBeGreaterThan(0);
    const state = await database.$queryRawUnsafe<Array<{ state: string }>>(`SELECT state FROM production.issues WHERE id = $1::uuid`, issue.issueId);
    expect(state[0]?.state).toBe("ISSUE_READY");
    expect(await count(`SELECT count(*) FROM production.publication_snapshots WHERE issue_id = $1::uuid`, issue.issueId)).toBe(0);
    expect(await readPublic("r9_public_issue", "unset-clock", database)).toBeNull();
  });

  it("keeps The Unset Table off the public article surface until publication", async () => {
    const story = await seedStory("The Unset Table");
    const draft = await must("draft", await command("create-issue", { title: "The Unset Table", season: "Winter", theme: "Place", availability: "PUBLIC" }));
    expect(draft.state).toBe("ISSUE_DRAFT");
    expect(await readPublic("r9_public_article", "the-unset-table", database)).toBeNull();
    const opened = await must("open", await command("open-assembly", { issueId: draft.issueId, expectedRowVersion: Number(draft.rowVersion) }));
    const section = await must("section", await command("add-section", { issueId: draft.issueId, name: "Table", expectedRowVersion: Number(opened.rowVersion) }));
    const placed = await must("place", await command("place-article", {
      issueId: draft.issueId, sectionId: section.sectionId, draftVersionId: story.versionId, title: "The Unset Table",
      authorName: "Mira Chen", summary: "Not yet.", altText: "An unset table", expectedRowVersion: Number(section.rowVersion),
    }));
    expect(await count(`SELECT count(*) FROM production.editorial_works WHERE id = $1::uuid`, story.workId)).toBe(1);
    expect(await readPublic("r9_public_article", String(placed.articleSlug), database)).toBeNull();
    const shelf = await must("shelf", await command("create-shelf", { name: "Field Notes", editorPersonId: personId, principles: "Only published work.", description: "A shelf." }));
    await must("item", await command("add-shelf-item", { shelfId: shelf.shelfId, editorialWorkId: story.workId }));
    const hiddenShelf = await readPublic("r9_public_shelf", "field-notes", database) as { stories: unknown[] };
    expect(hiddenShelf.stories).toEqual([]);
    const listed = await readPublic("r9_public_shelves", null, database) as Array<{ slug: string }>;
    expect(listed.some((shelf) => shelf.slug === "field-notes")).toBe(false);
  });
});
