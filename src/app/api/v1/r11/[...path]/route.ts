import {
  actSignal,
  analyticsList,
  approveReport,
  createReport,
  createRule,
  openRenewal,
  openUpsell,
  reportList,
  reviewSignal,
  ruleList,
  setRule,
  signalList,
} from "@/modules/r11/routes";
import { publicMeta, publicObservation, publicSearch, r11Invalid } from "@/modules/r11/http";

type Context = { params: Promise<{ path: string[] }> };

async function dispatch(request: Request, path: string[]) {
  const [a, b, c] = path;
  if (request.method === "GET" && a === "analytics" && !b) return analyticsList(request);
  if (request.method === "GET" && a === "reports" && !b) return reportList(request);
  if (request.method === "POST" && a === "reports" && !b) return createReport(request);
  if (request.method === "POST" && a === "reports" && c === "approve") return approveReport(request, b ?? "");
  if (request.method === "GET" && a === "signals" && !b) return signalList(request);
  if (request.method === "POST" && a === "signals" && b === "renewals" && !c) return openRenewal(request);
  if (request.method === "POST" && a === "signals" && b === "upsells" && !c) return openUpsell(request);
  if (request.method === "POST" && a === "signals" && c === "review") return reviewSignal(request, b ?? "");
  if (request.method === "POST" && a === "signals" && c === "act") return actSignal(request, b ?? "");
  if (request.method === "GET" && a === "rules" && !b) return ruleList(request);
  if (request.method === "POST" && a === "rules" && !b) return createRule(request);
  if (request.method === "POST" && a === "rules" && c === "state") return setRule(request, b ?? "");
  if (request.method === "POST" && a === "public" && b === "observations" && !c) return publicObservation(request);
  if (request.method === "GET" && a === "public" && b === "meta" && c) return publicMeta(c);
  if (request.method === "GET" && a === "public" && b === "search" && !c) return publicSearch(request);
  return r11Invalid();
}

export function GET(request: Request, context: Context) {
  return context.params.then((params) => dispatch(request, params.path));
}

export function POST(request: Request, context: Context) {
  return context.params.then((params) => dispatch(request, params.path));
}
