import { z } from "zod";

import { authorizationProblem } from "@/modules/authorization/http";
import {
  r6Json,
  resolveR6TeamRequest,
  unavailableR6Request,
  invalidR6Request,
} from "@/modules/r6/http";
import { getAuthorizedCompany } from "@/modules/r6/queries";

export async function GET(
  request: Request,
  route: { params: Promise<{ companyId: string }> },
) {
  const { companyId } = await route.params;
  if (!z.string().uuid().safeParse(companyId).success) return invalidR6Request();

  const resolved = await resolveR6TeamRequest(request);
  if (resolved.kind === "response") return resolved.response;

  try {
    const company = await getAuthorizedCompany(resolved.context, companyId);
    if (!company) return authorizationProblem(404, "AUTHZ_NOT_FOUND");
    return r6Json({ company });
  } catch {
    return unavailableR6Request();
  }
}
