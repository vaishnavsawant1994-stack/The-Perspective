import { z } from "zod";

import { authorizationProblem } from "@/modules/authorization/http";
import {
  r6Json,
  resolveR6TeamRequest,
  unavailableR6Request,
  invalidR6Request,
} from "@/modules/r6/http";
import { getAuthorizedLead } from "@/modules/r6/queries";

export async function GET(
  request: Request,
  route: { params: Promise<{ leadId: string }> },
) {
  const { leadId } = await route.params;
  if (!z.string().uuid().safeParse(leadId).success) return invalidR6Request();

  const resolved = await resolveR6TeamRequest(request);
  if (resolved.kind === "response") return resolved.response;

  try {
    const lead = await getAuthorizedLead(resolved.context, leadId);
    if (!lead) return authorizationProblem(404, "AUTHZ_NOT_FOUND");
    return r6Json({ lead });
  } catch {
    return unavailableR6Request();
  }
}
