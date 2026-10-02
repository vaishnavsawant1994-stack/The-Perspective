import {
  addAgenda,
  addGuest,
  addItem,
  addParticipant,
  addTarget,
  archiveEpisode,
  archiveVideo,
  campaignDetail,
  campaignList,
  cancelEvent,
  cancelRegistration,
  closeCampaign,
  closeEvent,
  createCampaign,
  createEpisode,
  createEvent,
  createShow,
  createVideo,
  editEpisode,
  editVideo,
  eventList,
  launchCampaign,
  openEvent,
  prepareVideo,
  recordRegistration,
  returnEpisode,
  returnVideo,
  reviewEpisode,
  reviewVideo,
  scheduleEpisode,
  scheduleEvent,
  scheduleVideo,
  showList,
  videoList,
} from "@/modules/r10/routes";
import { publicDelivery, r10Invalid } from "@/modules/r10/http";

type Context = { params: Promise<{ path: string[] }> };

async function dispatch(request: Request, path: string[]) {
  const [a, b, c] = path;
  if (request.method === "GET" && a === "shows" && !b) return showList(request);
  if (request.method === "POST" && a === "shows" && !b) return createShow(request);
  if (request.method === "POST" && a === "episodes" && !b) return createEpisode(request);
  if (request.method === "POST" && a === "episodes" && c === "edit") return editEpisode(request, b);
  if (request.method === "POST" && a === "episodes" && c === "guests") return addGuest(request, b);
  if (request.method === "POST" && a === "episodes" && c === "review") return reviewEpisode(request, b);
  if (request.method === "POST" && a === "episodes" && c === "return") return returnEpisode(request, b);
  if (request.method === "POST" && a === "episodes" && c === "schedule") return scheduleEpisode(request, b);
  if (request.method === "POST" && a === "episodes" && c === "archive") return archiveEpisode(request, b);
  if (request.method === "GET" && a === "videos" && !b) return videoList(request);
  if (request.method === "POST" && a === "videos" && !b) return createVideo(request);
  if (request.method === "POST" && a === "videos" && c === "edit") return editVideo(request, b);
  if (request.method === "POST" && a === "videos" && c === "review") return reviewVideo(request, b);
  if (request.method === "POST" && a === "videos" && c === "return") return returnVideo(request, b);
  if (request.method === "POST" && a === "videos" && c === "schedule") return scheduleVideo(request, b);
  if (request.method === "POST" && a === "videos" && c === "prepare") return prepareVideo(request, b);
  if (request.method === "POST" && a === "videos" && c === "archive") return archiveVideo(request, b);
  if (request.method === "GET" && a === "events" && !b) return eventList(request);
  if (request.method === "POST" && a === "events" && !b) return createEvent(request);
  if (request.method === "POST" && a === "events" && c === "schedule") return scheduleEvent(request, b);
  if (request.method === "POST" && a === "events" && c === "open") return openEvent(request, b);
  if (request.method === "POST" && a === "events" && c === "close") return closeEvent(request, b);
  if (request.method === "POST" && a === "events" && c === "cancel") return cancelEvent(request, b);
  if (request.method === "POST" && a === "events" && c === "agenda") return addAgenda(request, b);
  if (request.method === "POST" && a === "events" && c === "participants") return addParticipant(request, b);
  if (request.method === "POST" && a === "events" && c === "registrations") return recordRegistration(request, b);
  if (request.method === "POST" && a === "registrations" && c === "cancel") return cancelRegistration(request, b);
  if (request.method === "GET" && a === "campaigns" && !b) return campaignList(request);
  if (request.method === "GET" && a === "campaigns" && b && !c) return campaignDetail(request, b);
  if (request.method === "POST" && a === "campaigns" && !b) return createCampaign(request);
  if (request.method === "POST" && a === "campaigns" && c === "targets") return addTarget(request, b);
  if (request.method === "POST" && a === "campaigns" && c === "items") return addItem(request, b);
  if (request.method === "POST" && a === "campaigns" && c === "launch") return launchCampaign(request, b);
  if (request.method === "POST" && a === "campaigns" && c === "close") return closeCampaign(request, b);
  if (request.method === "GET" && a === "public" && b === "deliveries" && c) return publicDelivery(c);
  return r10Invalid();
}

async function route(request: Request, context: Context) {
  const { path } = await context.params;
  return dispatch(request, path);
}

export const GET = route;
export const POST = route;
