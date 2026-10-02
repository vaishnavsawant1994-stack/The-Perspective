import "server-only";

import { z } from "zod";

import { authorizationProblem } from "@/modules/authorization/http";
import { withCommercialTenantTransaction } from "@/modules/commercial/persistence";
import type { AuthorizedRequestContext } from "@/modules/foundation/request-context";

import { r10Invalid, teamCommand, teamRead } from "./http";

const uuid = z.string().uuid();
const title = z.string().trim().min(1).max(200);
const row = z.number().int().positive();
const version = z.object({ expectedRowVersion: row }).strict();

function rows(context: AuthorizedRequestContext, sql: string) {
  return withCommercialTenantTransaction(context, (transaction) =>
    transaction.$queryRawUnsafe<Array<Record<string, unknown>>>(sql),
  );
}

function id(value: string) {
  return z.string().uuid().safeParse(value).success;
}

export function showList(request: Request) {
  return teamRead(request, "podcast.dashboard.view", "podcast-show", "list", (context) =>
    rows(context, `SELECT id, title, slug, state, row_version AS "rowVersion" FROM media.podcast_shows ORDER BY created_at DESC LIMIT 100`));
}

export function createShow(request: Request) {
  return teamCommand(request, "podcast.episode.edit", "podcast-show", "create", "create-show", z.object({ title }).strict());
}

export function createEpisode(request: Request) {
  return teamCommand(request, "podcast.episode.edit", "podcast-episode", "create", "create-episode", z.object({ showId: uuid, title }).strict());
}

export function editEpisode(request: Request, episodeId: string) {
  if (!id(episodeId)) return r10Invalid();
  return teamCommand(request, "podcast.episode.edit", "podcast-episode", "edit", "edit-episode", z.object({ title, expectedRowVersion: row }).strict().transform((value) => ({ ...value, episodeId })));
}

export function addGuest(request: Request, episodeId: string) {
  if (!id(episodeId)) return r10Invalid();
  return teamCommand(request, "podcast.guest.manage", "podcast-guest", "guest", "add-guest", z.object({ name: title, role: title, expectedRowVersion: row }).strict().transform((value) => ({ ...value, episodeId })));
}

export function reviewEpisode(request: Request, episodeId: string) {
  if (!id(episodeId)) return r10Invalid();
  return teamCommand(request, "podcast.review", "podcast-episode", "review", "review-episode", version.transform((value) => ({ ...value, episodeId })));
}

export function returnEpisode(request: Request, episodeId: string) {
  if (!id(episodeId)) return r10Invalid();
  return teamCommand(request, "podcast.review", "podcast-episode", "return", "return-episode", version.transform((value) => ({ ...value, episodeId })));
}

export function scheduleEpisode(request: Request, episodeId: string) {
  if (!id(episodeId)) return r10Invalid();
  return teamCommand(request, "podcast.schedule.manage", "podcast-episode", "schedule", "schedule-episode", z.object({ runAt: z.string().datetime(), expectedRowVersion: row }).strict().transform((value) => ({ ...value, episodeId })));
}

export function archiveEpisode(request: Request, episodeId: string) {
  if (!id(episodeId)) return r10Invalid();
  return teamCommand(request, "podcast.schedule.manage", "podcast-episode", "archive", "archive-episode", version.transform((value) => ({ ...value, episodeId })));
}

export function videoList(request: Request) {
  return teamRead(request, "video.dashboard.view", "video-project", "list", (context) =>
    rows(context, `SELECT id, title, slug, state, row_version AS "rowVersion" FROM media.video_projects ORDER BY created_at DESC LIMIT 100`));
}

export function createVideo(request: Request) {
  return teamCommand(request, "video.edit", "video-project", "create", "create-video", z.object({ title }).strict());
}

export function editVideo(request: Request, videoId: string) {
  if (!id(videoId)) return r10Invalid();
  return teamCommand(request, "video.edit", "video-project", "edit", "edit-video", z.object({ title, expectedRowVersion: row }).strict().transform((value) => ({ ...value, videoId })));
}

export function reviewVideo(request: Request, videoId: string) {
  if (!id(videoId)) return r10Invalid();
  return teamCommand(request, "video.review", "video-project", "review", "review-video", version.transform((value) => ({ ...value, videoId })));
}

export function returnVideo(request: Request, videoId: string) {
  if (!id(videoId)) return r10Invalid();
  return teamCommand(request, "video.review", "video-project", "return", "return-video", version.transform((value) => ({ ...value, videoId })));
}

export function scheduleVideo(request: Request, videoId: string) {
  if (!id(videoId)) return r10Invalid();
  return teamCommand(request, "video.schedule.manage", "video-project", "schedule", "schedule-video", z.object({ runAt: z.string().datetime(), expectedRowVersion: row }).strict().transform((value) => ({ ...value, videoId })));
}

export function prepareVideo(request: Request, videoId: string) {
  if (!id(videoId)) return r10Invalid();
  return teamCommand(request, "video.publish.prepare", "video-project", "prepare", "prepare-video", version.transform((value) => ({ ...value, videoId })));
}

export function archiveVideo(request: Request, videoId: string) {
  if (!id(videoId)) return r10Invalid();
  return teamCommand(request, "video.schedule.manage", "video-project", "archive", "archive-video", version.transform((value) => ({ ...value, videoId })));
}

export function eventList(request: Request) {
  return teamRead(request, "event.dashboard.view", "event", "list", (context) =>
    rows(context, `SELECT id, title, slug, state, row_version AS "rowVersion" FROM media.events ORDER BY created_at DESC LIMIT 100`));
}

export function createEvent(request: Request) {
  return teamCommand(request, "event.manage", "event", "create", "create-event", z.object({ title, startsAt: z.string().datetime() }).strict());
}

export function scheduleEvent(request: Request, eventId: string) {
  if (!id(eventId)) return r10Invalid();
  return teamCommand(request, "event.manage", "event", "schedule", "schedule-event", version.transform((value) => ({ ...value, eventId })));
}

export function openEvent(request: Request, eventId: string) {
  if (!id(eventId)) return r10Invalid();
  return teamCommand(request, "event.manage", "event", "open", "open-event", version.transform((value) => ({ ...value, eventId })));
}

export function closeEvent(request: Request, eventId: string) {
  if (!id(eventId)) return r10Invalid();
  return teamCommand(request, "event.manage", "event", "close", "close-event", version.transform((value) => ({ ...value, eventId })));
}

export function cancelEvent(request: Request, eventId: string) {
  if (!id(eventId)) return r10Invalid();
  return teamCommand(request, "event.manage", "event", "cancel", "cancel-event", version.transform((value) => ({ ...value, eventId })));
}

export function addAgenda(request: Request, eventId: string) {
  if (!id(eventId)) return r10Invalid();
  return teamCommand(request, "event.agenda.manage", "event-agenda", "agenda", "add-agenda", z.object({ title, expectedRowVersion: row }).strict().transform((value) => ({ ...value, eventId })));
}

export function addParticipant(request: Request, eventId: string) {
  if (!id(eventId)) return r10Invalid();
  return teamCommand(request, "event.participant.manage", "event-participant", "participant", "add-participant", z.object({ name: title, kind: z.enum(["SPEAKER", "PARTNER"]), expectedRowVersion: row }).strict().transform((value) => ({ ...value, eventId })));
}

export function recordRegistration(request: Request, eventId: string) {
  if (!id(eventId)) return r10Invalid();
  return teamCommand(request, "event.registration.manage", "event-registration", "record", "record-registration", z.object({ name: title, expectedRowVersion: row }).strict().transform((value) => ({ ...value, eventId })));
}

export function cancelRegistration(request: Request, registrationId: string) {
  if (!id(registrationId)) return r10Invalid();
  return teamCommand(request, "event.registration.manage", "event-registration", "cancel", "cancel-registration", z.object({}).strict().transform(() => ({ registrationId })));
}

export function campaignList(request: Request) {
  return teamRead(request, "distribution.dashboard.view", "distribution-campaign", "list", (context) =>
    rows(context, `SELECT id, name, state, row_version AS "rowVersion" FROM distribution.campaigns ORDER BY created_at DESC LIMIT 100`));
}

export function campaignDetail(request: Request, campaignId: string) {
  if (!id(campaignId)) return r10Invalid();
  return teamRead(request, "distribution.campaign.view", "distribution-campaign", "view", async (context) => {
    const found = await withCommercialTenantTransaction(context, (transaction) =>
      transaction.$queryRawUnsafe<Array<Record<string, unknown>>>(
        `SELECT id, name, state, row_version AS "rowVersion" FROM distribution.campaigns WHERE id = $1::uuid`,
        campaignId,
      ));
    return found[0] ?? authorizationProblem(404, "AUTHZ_NOT_FOUND");
  });
}

export function createCampaign(request: Request) {
  return teamCommand(request, "distribution.campaign.manage", "distribution-campaign", "create", "create-campaign", z.object({ name: title }).strict());
}

export function addTarget(request: Request, campaignId: string) {
  if (!id(campaignId)) return r10Invalid();
  return teamCommand(request, "distribution.campaign.manage", "distribution-target", "target", "add-target", z.object({
    channel: z.enum(["SITE", "EXTERNAL"]), label: title, expectedRowVersion: row,
  }).strict().transform((value) => ({ ...value, campaignId })));
}

export function addItem(request: Request, campaignId: string) {
  if (!id(campaignId)) return r10Invalid();
  return teamCommand(request, "distribution.campaign.manage", "distribution-item", "item", "add-item", z.object({
    sourceKind: z.enum(["ISSUE", "PODCAST_EPISODE", "VIDEO_PROJECT", "EVENT"]), sourceId: uuid, expectedRowVersion: row,
  }).strict().transform((value) => ({ ...value, campaignId })));
}

export function launchCampaign(request: Request, campaignId: string) {
  if (!id(campaignId)) return r10Invalid();
  return teamCommand(request, "distribution.launch", "distribution-campaign", "launch", "launch-campaign", version.transform((value) => ({ ...value, campaignId })), { reason: true, session: true });
}

export function closeCampaign(request: Request, campaignId: string) {
  if (!id(campaignId)) return r10Invalid();
  return teamCommand(request, "distribution.campaign.manage", "distribution-campaign", "close", "close-campaign", version.transform((value) => ({ ...value, campaignId })));
}
