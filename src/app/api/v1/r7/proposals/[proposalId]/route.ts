import { z } from "zod";

import { authorizationProblem } from "@/modules/authorization/http";
import {
  invalidR7Request,
  r7Json,
  resolveR7TeamRequest,
  unavailableR7Request,
} from "@/modules/r7/http";
import { getAuthorizedProposal } from "@/modules/r7/queries";

export async function GET(
  request: Request,
  route: { params: Promise<{ proposalId: string }> },
) {
  const resolved = await resolveR7TeamRequest(request);
  if (resolved.kind === "response") return resolved.response;

  const { proposalId } = await route.params;
  if (!z.string().uuid().safeParse(proposalId).success) return invalidR7Request();

  try {
    const proposal = await getAuthorizedProposal(resolved.context, proposalId);
    if (!proposal) return authorizationProblem(404, "AUTHZ_NOT_FOUND");
    return r7Json(proposal);
  } catch {
    return unavailableR7Request();
  }
}
