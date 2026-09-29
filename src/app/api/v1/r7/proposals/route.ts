import { parseR7ListRequest, invalidR7Request, unavailableR7Request, r7Json, resolveR7TeamRequest } from "@/modules/r7/http";
import { listAuthorizedProposals } from "@/modules/r7/queries";

export async function GET(request: Request) {
  const query = parseR7ListRequest(request);
  if (!query) return invalidR7Request();

  const resolved = await resolveR7TeamRequest(request);
  if (resolved.kind === "response") return resolved.response;

  try {
    const proposals = await listAuthorizedProposals(resolved.context, query.limit);
    return r7Json({ proposals });
  } catch {
    return unavailableR7Request();
  }
}
