import {
  invalidR6Request,
  parseR6ListRequest,
  r6Json,
  resolveR6TeamRequest,
  unavailableR6Request,
} from "@/modules/r6/http";
import { listAuthorizedDeals } from "@/modules/r6/queries";

export async function GET(request: Request) {
  const query = parseR6ListRequest(request);
  if (!query) return invalidR6Request();

  const resolved = await resolveR6TeamRequest(request);
  if (resolved.kind === "response") return resolved.response;

  try {
    return r6Json(await listAuthorizedDeals(resolved.context, query.limit));
  } catch {
    return unavailableR6Request();
  }
}
