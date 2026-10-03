import { r13Invalid } from "@/modules/r13/http";
import { changeIntegration, declareIntegration, listIntegrations, readSettings, updateSettings } from "@/modules/r13/routes";

type Context = { params: Promise<{ path: string[] }> };

async function dispatch(request: Request, path: string[]) {
  const [a, b, c] = path;
  if (request.method === "GET" && a === "settings" && !b) return readSettings(request);
  if (request.method === "POST" && a === "settings" && !b) return updateSettings(request);
  if (request.method === "GET" && a === "integrations" && !b) return listIntegrations(request);
  if (request.method === "POST" && a === "integrations" && !b) return declareIntegration(request);
  if (request.method === "POST" && a === "integrations" && b && c === "disable") return changeIntegration(request, b, "disable");
  if (request.method === "POST" && a === "integrations" && b && c === "verify") return changeIntegration(request, b, "verify");
  return r13Invalid();
}

export function GET(request: Request, context: Context) {
  return context.params.then((params) => dispatch(request, params.path));
}

export function POST(request: Request, context: Context) {
  return context.params.then((params) => dispatch(request, params.path));
}
