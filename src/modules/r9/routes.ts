import "server-only";

import { z } from "zod";

import { authorizationProblem } from "@/modules/authorization/http";
import { withCommercialTenantTransaction } from "@/modules/commercial/persistence";
import type { AuthorizedRequestContext } from "@/modules/foundation/request-context";

import { publicRead, r9Invalid, runWorker, teamCommand, teamFileVersion, teamRead } from "./http";

const uuid = z.string().uuid();
const title = z.string().trim().min(1).max(200);
const row = z.number().int().positive();
const text = z.string().trim().min(1).max(400);

async function rows(context: AuthorizedRequestContext, sql: string, values: readonly unknown[] = []) {
  return withCommercialTenantTransaction(context, async (transaction) => {
    return transaction.$queryRawUnsafe<Array<Record<string, unknown>>>(sql, ...values);
  });
}

function missing() {
  return authorizationProblem(404, "AUTHZ_NOT_FOUND");
}

export function publication(request: Request) {
  return teamRead(request, "magazine.view", "publication", "view", async (context) => {
    const found = await rows(context, `SELECT id, title, slug, row_version AS "rowVersion" FROM production.publications LIMIT 1`);
    return found[0] ?? missing();
  });
}

export function issueList(request: Request) {
  return teamRead(request, "magazine.dashboard.view", "issue", "list", (context) =>
    rows(context, `SELECT id, title, slug, state, availability, edition_number AS "editionNumber", row_version AS "rowVersion" FROM production.issues ORDER BY created_at DESC LIMIT 100`),
  );
}

export function issueDetail(request: Request, issueId: string) {
  if (!z.string().uuid().safeParse(issueId).success) return r9Invalid();
  return teamRead(request, "magazine.view", "issue", "view", async (context) => {
    const found = await rows(context, `SELECT id, title, slug, state, availability, season, theme, edition_number AS "editionNumber", row_version AS "rowVersion" FROM production.issues WHERE id = $1::uuid`, [issueId]);
    return found[0] ?? missing();
  });
}

export function schedules(request: Request, issueId: string) {
  if (!z.string().uuid().safeParse(issueId).success) return r9Invalid();
  return teamRead(request, "publish.queue.view", "schedule", "view", (context) =>
    rows(context, `SELECT id, status, run_at AS "runAt", row_version AS "rowVersion" FROM production.issue_schedules WHERE issue_id = $1::uuid ORDER BY created_at`, [issueId]),
  );
}

export function snapshot(request: Request, issueId: string) {
  if (!z.string().uuid().safeParse(issueId).success) return r9Invalid();
  return teamRead(request, "publish.dashboard.view", "snapshot", "view", async (context) => {
    const found = await rows(context, `SELECT id, edition_number AS "editionNumber", actor_membership_id AS "actorMembershipId", published_at AS "publishedAt" FROM production.publication_snapshots WHERE issue_id = $1::uuid`, [issueId]);
    return found[0] ?? missing();
  });
}

export function createIssue(request: Request) {
  return teamCommand(request, "design.layout.manage", "issue", "create", "create-issue", z.object({
    title, season: text, theme: text, availability: z.enum(["PUBLIC", "PREMIUM"]),
  }).strict());
}

export function openAssembly(request: Request, issueId: string) {
  return teamCommand(request, "design.layout.manage", "issue", "open", "open-assembly", z.object({ expectedRowVersion: row }).strict().transform((value) => ({ ...value, issueId })));
}

export function addSection(request: Request, issueId: string) {
  return teamCommand(request, "design.layout.manage", "issue", "section", "add-section", z.object({ name: text, expectedRowVersion: row }).strict().transform((value) => ({ ...value, issueId })));
}

export function placeArticle(request: Request, issueId: string) {
  return teamCommand(request, "design.layout.manage", "placement", "place", "place-article", z.object({
    draftVersionId: uuid, sectionId: uuid, title, authorName: text, summary: text, altText: text, expectedRowVersion: row,
  }).strict().transform((value) => ({ ...value, issueId })));
}

export function removePlacement(request: Request, placementId: string) {
  return teamCommand(request, "design.layout.manage", "placement", "remove", "remove-placement", z.object({ expectedRowVersion: row }).strict().transform((value) => ({ ...value, placementId })));
}

export function reorderPlacement(request: Request, placementId: string) {
  return teamCommand(request, "design.layout.manage", "placement", "reorder", "reorder-placement", z.object({
    direction: z.enum(["UP", "DOWN"]), expectedRowVersion: row,
  }).strict().transform((value) => ({ ...value, placementId })));
}

export function setCover(request: Request, issueId: string) {
  return teamCommand(request, "design.cover.edit", "cover", "cover", "set-cover", z.object({
    headline: title, dek: text, alt: text, storyDraftVersionId: uuid, expectedRowVersion: row,
  }).strict().transform((value) => ({ ...value, issueId })));
}

export function designApproval(request: Request, issueId: string) {
  return teamCommand(request, "design.approve", "issue", "approve", "design-approval", z.object({ expectedRowVersion: row }).strict().transform((value) => ({ ...value, issueId })));
}

export function addSponsored(request: Request, issueId: string) {
  return teamCommand(request, "design.layout.manage", "issue", "sponsor", "add-sponsored", z.object({
    sponsor: text, headline: title, body: z.string().trim().min(1).max(2000), expectedRowVersion: row,
  }).strict().transform((value) => ({ ...value, issueId })));
}

export function sponsoredRights(request: Request, placementId: string) {
  return teamFileVersion(request, z.object({
    flag: z.enum(["present", "approved", "licensed", "cleared"]),
    value: z.boolean(),
    expectedRowVersion: row,
  }).strict().transform((value) => ({ ...value, placementId })));
}

export function attachAsset(request: Request, placementId: string) {
  return teamCommand(request, "design.layout.manage", "placement", "attach", "attach-asset", z.object({
    assetId: uuid, expectedRowVersion: row,
  }).strict().transform((value) => ({ ...value, placementId })));
}

export function prepareStory(request: Request, versionId: string) {
  return teamCommand(request, "magazine.proof.review", "draft-version", "prepare", "prepare-story", z.object({}).strict().transform(() => ({ versionId })));
}

export function prepareIssue(request: Request, issueId: string) {
  return teamCommand(request, "magazine.proof.review", "issue", "prepare", "prepare-issue", z.object({ expectedRowVersion: row }).strict().transform((value) => ({ ...value, issueId })));
}

export function markReady(request: Request, issueId: string) {
  return teamCommand(request, "magazine.proof.review", "issue", "ready", "mark-ready", z.object({ expectedRowVersion: row }).strict().transform((value) => ({ ...value, issueId })));
}

export function reopenIssue(request: Request, issueId: string) {
  return teamCommand(request, "magazine.proof.review", "issue", "reopen", "reopen-issue", z.object({ expectedRowVersion: row }).strict().transform((value) => ({ ...value, issueId })));
}

export function scheduleIssue(request: Request, issueId: string) {
  return teamCommand(request, "publish.schedule", "schedule", "schedule", "schedule-issue", z.object({
    runAt: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?Z$/u), expectedRowVersion: row,
  }).strict().transform((value) => ({ ...value, issueId })));
}

export function cancelSchedule(request: Request, issueId: string) {
  return teamCommand(request, "publish.schedule", "schedule", "cancel", "cancel-schedule", z.object({ expectedRowVersion: row }).strict().transform((value) => ({ ...value, issueId })));
}

export function publishIssue(request: Request, issueId: string) {
  return teamCommand(request, "publication.publish", "issue", "publish", "publish-issue", z.object({ expectedRowVersion: row }).strict().transform((value) => ({ ...value, issueId })), { reason: true, session: true });
}

export function archiveIssue(request: Request, issueId: string) {
  return teamCommand(request, "publication.publish", "issue", "archive", "archive-issue", z.object({ expectedRowVersion: row }).strict().transform((value) => ({ ...value, issueId })), { reason: true, session: true });
}

export function createShelf(request: Request) {
  return teamCommand(request, "design.layout.manage", "shelf", "curate", "create-shelf", z.object({
    name: title, editorPersonId: uuid, principles: z.string().max(2000).default(""), description: z.string().max(2000).default(""),
  }).strict());
}

export function addShelfItem(request: Request, shelfId: string) {
  return teamCommand(request, "design.layout.manage", "shelf", "curate", "add-shelf-item", z.object({
    editorialWorkId: uuid,
  }).strict().transform((value) => ({ ...value, shelfId })));
}

export function publicIssue(slug: string) {
  return publicRead("r9_public_issue", slug);
}

export function publicArticle(slug: string) {
  return publicRead("r9_public_article", slug);
}

export function publicSearch(query: string) {
  return publicRead("r9_public_search", query);
}

export function publicPremium() {
  return publicRead("r9_public_premium", null);
}

export function publicSitemap() {
  return publicRead("r9_public_sitemap", null);
}

export function publicShelves() {
  return publicRead("r9_public_shelves", null);
}

export function publicShelf(slug: string) {
  return publicRead("r9_public_shelf", slug);
}

export function publishDue(request: Request) {
  return runWorker(request);
}
