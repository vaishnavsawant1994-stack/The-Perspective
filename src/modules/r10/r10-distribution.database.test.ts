import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { AccountState, MembershipStatus, MembershipType, OrganizationType, RecordStatus } from "@/generated/prisma/client";
import type { MembershipId, OrganizationId, SessionId, TenantScopedRequestContext, UserId } from "@/modules/foundation/request-context";
import { createPrismaClient } from "@/modules/persistence/client";
import { runR9Command, type R9Result } from "@/modules/r9/commands";

import { readPublicDelivery, runR10Command, runReconcile, type R10Result } from "./commands";

const database = createPrismaClient();
const epoch = new Date("2026-10-02T12:00:00.000Z");
const ownerId = crypto.randomUUID();
const foreignOrgId = crypto.randomUUID();
const staffId = crypto.randomUUID();
const foreignStaffId = crypto.randomUUID();
const staffUserId = crypto.randomUUID();
let sequence = 0;

function key() {
  sequence += 1;
  return `r10k${sequence.toString(36)}${crypto.randomUUID().replaceAll("-", "")}`.slice(0, 80);
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

const owner = team(ownerId, staffId, "r10-owner");
const foreign = team(foreignOrgId, foreignStaffId, "r10-foreign");

async function must(label: string, result: R10Result | R9Result) {
  if (result.kind !== "ok") throw new Error(`${label}: ${JSON.stringify(result)}`);
  return result.value;
}

function command(name: string, payload: Record<string, unknown>, idempotencyKey = key()) {
  return runR10Command(owner, name, payload, idempotencyKey, database);
}

function r9(name: string, payload: Record<string, unknown>, idempotencyKey = key()) {
  return runR9Command(owner, name, payload, idempotencyKey, database);
}

async function count(sql: string, ...values: unknown[]) {
  const rows = await database.$queryRawUnsafe<Array<{ count: number }>>(`SELECT (${sql})::int AS count`, ...values);
  return Number(rows[0]?.count ?? 0);
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
  return { projectId, versionId, assetId };
}

async function publishIssue(name: string) {
  const story = await seedStory(name);
  const created = await must("issue", await r9("create-issue", { title: name, season: "Winter", theme: "Distribution", availability: "PUBLIC" }));
  const opened = await must("open", await r9("open-assembly", { issueId: created.issueId, expectedRowVersion: Number(created.rowVersion) }));
  const section = await must("section", await r9("add-section", { issueId: created.issueId, name: "Desk", expectedRowVersion: Number(opened.rowVersion) }));
  const placed = await must("place", await r9("place-article", {
    issueId: created.issueId, sectionId: section.sectionId, draftVersionId: story.versionId, title: name,
    authorName: "Mira Chen", summary: "Distributed later.", altText: "Cover", expectedRowVersion: Number(section.rowVersion),
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
  return { issueId: String(created.issueId), slug: String(created.slug), projectId: story.projectId };
}

describe("R10 media and distribution persistence", () => {
  beforeAll(async () => {
    const present = await database.$queryRawUnsafe<Array<{ exists: boolean }>>(
      `SELECT to_regprocedure('media.r10_execute(text,uuid,jsonb,uuid,uuid,text,text,text)') IS NOT NULL AS exists`,
    );
    expect(present[0]?.exists).toBe(true);
    const role = await database.$queryRawUnsafe<Array<{ super: boolean; bypass: boolean }>>(
      `SELECT rolsuper AS super, rolbypassrls AS bypass FROM pg_roles WHERE rolname = 'perspective_runtime'`,
    );
    expect(role[0]).toMatchObject({ super: false, bypass: false });
    await database.organization.createMany({ data: [
      { id: ownerId, organizationType: OrganizationType.PLATFORM, legalName: "R10 Owner", displayName: "R10 Owner", slug: `r10-owner-${ownerId.slice(0, 8)}`, status: RecordStatus.ACTIVE },
      { id: foreignOrgId, organizationType: OrganizationType.PLATFORM, legalName: "R10 Foreign", displayName: "R10 Foreign", slug: `r10-foreign-${foreignOrgId.slice(0, 8)}`, status: RecordStatus.ACTIVE },
    ] });
    const staffPerson = crypto.randomUUID();
    const foreignPerson = crypto.randomUUID();
    await database.person.createMany({ data: [
      { id: staffPerson, displayName: "R10 Staff" },
      { id: foreignPerson, displayName: "R10 Foreign" },
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

  it("hides rows without a tenant and refuses a runtime insert", async () => {
    const show = await must("show", await command("create-show", { title: "UNPUBLISHED-R10-SECRET" }));
    const hidden = await database.$transaction(async (tx) => {
      await tx.$executeRawUnsafe("SET LOCAL ROLE perspective_runtime");
      await tx.$queryRaw`SELECT set_config('app.organization_id', '', true)`;
      return tx.$queryRawUnsafe<Array<{ count: number }>>(`SELECT count(*)::int AS count FROM media.podcast_shows WHERE id = $1::uuid`, show.showId);
    });
    expect(hidden[0]?.count).toBe(0);
    await expect(database.$transaction(async (tx) => {
      await tx.$executeRawUnsafe("SET LOCAL ROLE perspective_runtime");
      await tx.$queryRaw`SELECT set_config('app.organization_id', ${ownerId}, true)`;
      await tx.$executeRawUnsafe(
        `INSERT INTO media.podcast_shows (id, resource_id, owner_organization_id, slug, title, state)
         VALUES ($1::uuid, $1::uuid, $2::uuid, 'illegal', 'Illegal', 'SHOW_ACTIVE')`,
        crypto.randomUUID(), ownerId,
      );
    })).rejects.toThrow();
    expect(await readPublicDelivery(String(show.slug), database)).toBeNull();
    const stolen = await runR10Command(foreign, "create-episode", { showId: show.showId, title: "Stolen" }, key(), database);
    expect(stolen).toMatchObject({ kind: "error", code: "NOT_FOUND" });
  });

  it("moves a podcast episode only through the frozen states", async () => {
    const show = await must("show", await command("create-show", { title: `Field Notes ${key()}` }));
    const episode = await must("episode", await command("create-episode", { showId: show.showId, title: "The first hour" }));
    const skipped = await command("schedule-episode", { episodeId: episode.episodeId, runAt: new Date(Date.now() + 3600_000).toISOString(), expectedRowVersion: 1 });
    expect(skipped).toMatchObject({ kind: "error", code: "INELIGIBLE" });
    const reviewed = await must("review", await command("review-episode", { episodeId: episode.episodeId, expectedRowVersion: 1 }));
    const guest = await must("guest", await command("add-guest", { episodeId: episode.episodeId, name: "Ada", role: "Host", expectedRowVersion: Number(reviewed.rowVersion) }));
    const scheduled = await must("schedule", await command("schedule-episode", {
      episodeId: episode.episodeId, runAt: new Date(Date.now() + 3600_000).toISOString(), expectedRowVersion: Number(guest.rowVersion),
    }));
    expect(scheduled.state).toBe("EPISODE_SCHEDULED");
    const stale = await command("archive-episode", { episodeId: episode.episodeId, expectedRowVersion: 1 });
    expect(stale).toMatchObject({ kind: "error", code: "STALE_WRITE" });
  });

  it("prepares a video with a server digest and refuses a browser digest", async () => {
    const video = await must("video", await command("create-video", { title: `Cut ${key()}` }));
    const reviewed = await must("review", await command("review-video", { videoId: video.videoId, expectedRowVersion: 1 }));
    const scheduled = await must("schedule", await command("schedule-video", {
      videoId: video.videoId, runAt: new Date(Date.now() + 3600_000).toISOString(), expectedRowVersion: Number(reviewed.rowVersion),
    }));
    const forged = await command("prepare-video", { videoId: video.videoId, expectedRowVersion: Number(scheduled.rowVersion), digest: "browser" });
    expect(forged).toMatchObject({ kind: "error", code: "INVALID" });
    const prepared = await must("prepare", await command("prepare-video", { videoId: video.videoId, expectedRowVersion: Number(scheduled.rowVersion) }));
    expect(prepared.state).toBe("VIDEO_PREPARED");
    expect(String(prepared.digest).length).toBeGreaterThan(10);
    const again = await command("prepare-video", { videoId: video.videoId, expectedRowVersion: Number(prepared.rowVersion) });
    expect(again).toMatchObject({ kind: "error", code: "INELIGIBLE" });
  });

  it("records a registration only while the event is open", async () => {
    const event = await must("event", await command("create-event", { title: `Summit ${key()}`, startsAt: new Date(Date.now() + 86_400_000).toISOString() }));
    const tooSoon = await command("record-registration", { eventId: event.eventId, name: "Early", expectedRowVersion: 1 });
    expect(tooSoon).toMatchObject({ kind: "error", code: "INELIGIBLE" });
    const scheduled = await must("schedule", await command("schedule-event", { eventId: event.eventId, expectedRowVersion: 1 }));
    const opened = await must("open", await command("open-event", { eventId: event.eventId, expectedRowVersion: Number(scheduled.rowVersion) }));
    await must("agenda", await command("add-agenda", { eventId: event.eventId, title: "Opening", expectedRowVersion: Number(opened.rowVersion) }));
    const row = await database.$queryRawUnsafe<Array<{ row_version: number }>>(`SELECT row_version FROM media.events WHERE id = $1::uuid`, event.eventId);
    const recorded = await must("register", await command("record-registration", { eventId: event.eventId, name: "Nia", expectedRowVersion: Number(row[0]?.row_version) }));
    const cancelled = await must("cancel", await command("cancel-registration", { registrationId: recorded.registrationId }));
    expect(cancelled.state).toBe("CANCELLED");
  });

  it("verifies one site delivery, rejects an external provider, and replays the launch", async () => {
    const issue = await publishIssue(`Measured Dispatch ${key()}`);
    const draft = await must("draft issue", await r9("create-issue", { title: `Draft ${key()}`, season: "Winter", theme: "No", availability: "PUBLIC" }));
    const campaign = await must("campaign", await command("create-campaign", { name: "Site only" }));
    const targeted = await must("target", await command("add-target", { campaignId: campaign.campaignId, channel: "SITE", label: "the-perspective", expectedRowVersion: 1 }));
    expect(targeted.trusted).toBe(true);
    const withDraft = await must("draft item", await command("add-item", {
      campaignId: campaign.campaignId, sourceKind: "ISSUE", sourceId: draft.issueId, expectedRowVersion: Number(targeted.rowVersion),
    }));
    const blocked = await command("launch-campaign", { campaignId: campaign.campaignId, expectedRowVersion: Number(withDraft.rowVersion) });
    expect(blocked).toMatchObject({ kind: "error", code: "INELIGIBLE" });
    expect(await count(`SELECT count(*) FROM distribution.delivery_evidence WHERE owner_organization_id = $1::uuid`, ownerId)).toBe(0);

    const live = await must("live campaign", await command("create-campaign", { name: "Live room" }));
    const site = await must("site", await command("add-target", { campaignId: live.campaignId, channel: "SITE", label: "the-perspective", expectedRowVersion: 1 }));
    const item = await must("item", await command("add-item", {
      campaignId: live.campaignId, sourceKind: "ISSUE", sourceId: issue.issueId, expectedRowVersion: Number(site.rowVersion),
    }));
    const launchKey = key();
    const launched = await must("launch", await command("launch-campaign", { campaignId: live.campaignId, expectedRowVersion: Number(item.rowVersion) }, launchKey));
    const replay = await must("replay", await command("launch-campaign", { campaignId: live.campaignId, expectedRowVersion: Number(item.rowVersion) }, launchKey));
    expect(replay.replayed).toBe(true);
    expect(replay.state).toBe("CAMPAIGN_LAUNCHED");
    const changed = await command("launch-campaign", { campaignId: live.campaignId, expectedRowVersion: Number(launched.rowVersion) }, launchKey);
    expect(changed).toMatchObject({ kind: "error", code: "IDEMPOTENCY_CONFLICT" });
    expect(await count(`SELECT count(*) FROM distribution.delivery_evidence e JOIN distribution.campaign_items i ON i.id = e.item_id WHERE i.campaign_id = $1::uuid`, live.campaignId)).toBe(1);
    const delivery = await readPublicDelivery(issue.slug, database) as { url: string };
    expect(delivery.url).toBe(`/magazine/read/${issue.slug}`);
    const project = await database.$queryRawUnsafe<Array<{ state: string }>>(`SELECT state FROM production.projects WHERE id = $1::uuid`, issue.projectId);
    expect(project[0]?.state).toBe("PUBLICATION_READY");
    const resting = await database.$queryRawUnsafe<Array<{ state: string }>>(`SELECT state FROM distribution.campaigns WHERE id = $1::uuid`, live.campaignId);
    expect(resting[0]?.state).toBe("CAMPAIGN_LAUNCHED");

    const external = await must("external campaign", await command("create-campaign", { name: "Partner" }));
    const outside = await must("outside", await command("add-target", { campaignId: external.campaignId, channel: "EXTERNAL", label: "partner-net", expectedRowVersion: 1 }));
    expect(outside.trusted).toBe(false);
    await must("external item", await command("add-item", {
      campaignId: external.campaignId, sourceKind: "ISSUE", sourceId: issue.issueId, expectedRowVersion: Number(outside.rowVersion),
    }));
    const row = await database.$queryRawUnsafe<Array<{ row_version: number }>>(`SELECT row_version FROM distribution.campaigns WHERE id = $1::uuid`, external.campaignId);
    const refused = await command("launch-campaign", { campaignId: external.campaignId, expectedRowVersion: Number(row[0]?.row_version) });
    expect(refused).toMatchObject({ kind: "error", code: "PROVIDER_UNCONFIGURED" });
    expect(await count(`SELECT count(*) FROM distribution.delivery_evidence e JOIN distribution.campaign_items i ON i.id = e.item_id WHERE i.campaign_id = $1::uuid`, external.campaignId)).toBe(0);
    const reconciled = await runReconcile(database);
    expect(reconciled).toMatchObject({ forged: 0, mutated: false });
    const stillDraft = await database.$queryRawUnsafe<Array<{ state: string }>>(`SELECT state FROM distribution.campaigns WHERE id = $1::uuid`, external.campaignId);
    expect(stillDraft[0]?.state).toBe("CAMPAIGN_DRAFT");
  });

  it("lets two sessions launch one campaign once", async () => {
    const issue = await publishIssue(`Concurrent ${key()}`);
    const campaign = await must("campaign", await command("create-campaign", { name: "Race" }));
    const site = await must("site", await command("add-target", { campaignId: campaign.campaignId, channel: "SITE", label: "the-perspective", expectedRowVersion: 1 }));
    const item = await must("item", await command("add-item", {
      campaignId: campaign.campaignId, sourceKind: "ISSUE", sourceId: issue.issueId, expectedRowVersion: Number(site.rowVersion),
    }));
    const payload = { campaignId: campaign.campaignId, expectedRowVersion: Number(item.rowVersion) };
    const [left, right] = await Promise.all([
      runR10Command(owner, "launch-campaign", payload, key(), database),
      runR10Command(owner, "launch-campaign", payload, key(), database),
    ]);
    expect([left, right].filter((result) => result.kind === "ok").length).toBeGreaterThan(0);
    expect(await count(`SELECT count(*) FROM distribution.delivery_evidence e JOIN distribution.campaign_items i ON i.id = e.item_id WHERE i.campaign_id = $1::uuid`, campaign.campaignId)).toBe(1);
  });

  it("rolls back when the audit row cannot be written", async () => {
    const issue = await publishIssue(`Rollback ${key()}`);
    const campaign = await must("campaign", await command("create-campaign", { name: "Rollback" }));
    const site = await must("site", await command("add-target", { campaignId: campaign.campaignId, channel: "SITE", label: "the-perspective", expectedRowVersion: 1 }));
    const item = await must("item", await command("add-item", {
      campaignId: campaign.campaignId, sourceKind: "ISSUE", sourceId: issue.issueId, expectedRowVersion: Number(site.rowVersion),
    }));
    const idempotencyKey = key();
    const storedKey = `r10:launch-campaign:${ownerId}:${idempotencyKey}`;
    await database.$executeRawUnsafe(
      `INSERT INTO audit.audit_events (
         id, owner_organization_id, actor_type, actor_user_id, actor_membership_id, action, request_id, idempotency_key, occurred_at
       ) VALUES ($1::uuid, $2::uuid, 'USER', $3::uuid, $4::uuid, 'r10.launch-campaign', 'preexisting', $5, now())`,
      crypto.randomUUID(), ownerId, staffUserId, staffId, storedKey,
    );
    const failed = await command("launch-campaign", { campaignId: campaign.campaignId, expectedRowVersion: Number(item.rowVersion) }, idempotencyKey);
    expect(failed.kind).toBe("error");
    const state = await database.$queryRawUnsafe<Array<{ state: string }>>(`SELECT state FROM distribution.campaigns WHERE id = $1::uuid`, campaign.campaignId);
    expect(state[0]?.state).toBe("CAMPAIGN_DRAFT");
    expect(await count(`SELECT count(*) FROM distribution.delivery_evidence e JOIN distribution.campaign_items i ON i.id = e.item_id WHERE i.campaign_id = $1::uuid`, campaign.campaignId)).toBe(0);
  });
});
