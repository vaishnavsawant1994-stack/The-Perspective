import { z } from "zod";

import { authorizationProblem } from "@/modules/authorization/http";
import {
  r6Json,
  resolveR6TeamRequest,
  unavailableR6Request,
  invalidR6Request,
} from "@/modules/r6/http";
import { getAuthorizedContact } from "@/modules/r6/queries";

export async function GET(
  request: Request,
  route: { params: Promise<{ contactId: string }> },
) {
  const { contactId } = await route.params;
  if (!z.string().uuid().safeParse(contactId).success) return invalidR6Request();

  const resolved = await resolveR6TeamRequest(request);
  if (resolved.kind === "response") return resolved.response;

  try {
    const contact = await getAuthorizedContact(resolved.context, contactId);
    if (!contact) return authorizationProblem(404, "AUTHZ_NOT_FOUND");
    return r6Json({ contact });
  } catch {
    return unavailableR6Request();
  }
}
