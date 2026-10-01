import {
  addSection,
  addShelfItem,
  addSponsored,
  archiveIssue,
  attachAsset,
  cancelSchedule,
  createIssue,
  createShelf,
  designApproval,
  issueDetail,
  issueList,
  markReady,
  openAssembly,
  placeArticle,
  prepareIssue,
  prepareStory,
  publicArticle,
  publicIssue,
  publicPremium,
  publicSearch,
  publicShelf,
  publicShelves,
  publicSitemap,
  publication,
  publishIssue,
  removePlacement,
  reorderPlacement,
  reopenIssue,
  scheduleIssue,
  schedules,
  setCover,
  snapshot,
  sponsoredRights,
} from "@/modules/r9/routes";
import { r9Invalid } from "@/modules/r9/http";

type Context = { params: Promise<{ path: string[] }> };

function query(request: Request) {
  return new URL(request.url).searchParams.get("q") ?? "";
}

async function dispatch(request: Request, path: string[]) {
  const [a, b, c] = path;
  if (request.method === "GET" && a === "publication" && !b) return publication(request);
  if (request.method === "GET" && a === "issues" && !b) return issueList(request);
  if (request.method === "POST" && a === "issues" && !b) return createIssue(request);
  if (request.method === "GET" && a === "issues" && b && !c) return issueDetail(request, b);
  if (request.method === "GET" && a === "issues" && c === "schedules") return schedules(request, b);
  if (request.method === "GET" && a === "issues" && c === "snapshot") return snapshot(request, b);
  if (request.method === "POST" && a === "issues" && c === "open-assembly") return openAssembly(request, b);
  if (request.method === "POST" && a === "issues" && c === "sections") return addSection(request, b);
  if (request.method === "POST" && a === "issues" && c === "placements") return placeArticle(request, b);
  if (request.method === "POST" && a === "issues" && c === "cover") return setCover(request, b);
  if (request.method === "POST" && a === "issues" && c === "design-approval") return designApproval(request, b);
  if (request.method === "POST" && a === "issues" && c === "prepare") return prepareIssue(request, b);
  if (request.method === "POST" && a === "issues" && c === "ready") return markReady(request, b);
  if (request.method === "POST" && a === "issues" && c === "reopen") return reopenIssue(request, b);
  if (request.method === "POST" && a === "issues" && c === "schedule") return scheduleIssue(request, b);
  if (request.method === "POST" && a === "issues" && path[3] === "cancel" && c === "schedule") return cancelSchedule(request, b);
  if (request.method === "POST" && a === "issues" && c === "publish") return publishIssue(request, b);
  if (request.method === "POST" && a === "issues" && c === "archive") return archiveIssue(request, b);
  if (request.method === "POST" && a === "issues" && c === "sponsored-placements") return addSponsored(request, b);
  if (request.method === "POST" && a === "placements" && c === "remove") return removePlacement(request, b);
  if (request.method === "POST" && a === "placements" && c === "reorder") return reorderPlacement(request, b);
  if (request.method === "POST" && a === "placements" && c === "assets") return attachAsset(request, b);
  if (request.method === "POST" && a === "sponsored-placements" && c === "rights") return sponsoredRights(request, b);
  if (request.method === "POST" && a === "draft-versions" && c === "prepare") return prepareStory(request, b);
  if (request.method === "POST" && a === "shelves" && !b) return createShelf(request);
  if (request.method === "POST" && a === "shelves" && c === "items") return addShelfItem(request, b);
  if (request.method === "GET" && a === "public" && b === "issues" && c) return publicIssue(c);
  if (request.method === "GET" && a === "public" && b === "articles" && c) return publicArticle(c);
  if (request.method === "GET" && a === "public" && b === "search" && !c) return publicSearch(query(request));
  if (request.method === "GET" && a === "public" && b === "premium" && !c) return publicPremium();
  if (request.method === "GET" && a === "public" && b === "sitemap" && !c) return publicSitemap();
  if (request.method === "GET" && a === "public" && b === "shelves" && !c) return publicShelves();
  if (request.method === "GET" && a === "public" && b === "shelves" && c) return publicShelf(c);
  return r9Invalid();
}

export async function GET(request: Request, context: Context) {
  const { path } = await context.params;
  return dispatch(request, path);
}

export async function POST(request: Request, context: Context) {
  const { path } = await context.params;
  return dispatch(request, path);
}
