import { z } from "zod";

import { authorizationProblem } from "@/modules/authorization/http";
import {
  invalidR7Request,
  r7Json,
  resolveR7TeamRequest,
  unavailableR7Request,
} from "@/modules/r7/http";
import { getAuthorizedInvoice } from "@/modules/r7/queries";

export async function GET(
  request: Request,
  route: { params: Promise<{ invoiceId: string }> },
) {
  const resolved = await resolveR7TeamRequest(request);
  if (resolved.kind === "response") return resolved.response;
  const { invoiceId } = await route.params;
  if (!z.string().uuid().safeParse(invoiceId).success) return invalidR7Request();
  try {
    const invoice = await getAuthorizedInvoice(resolved.context, invoiceId);
    if (!invoice) return authorizationProblem(404, "AUTHZ_NOT_FOUND");
    return r7Json({ invoice });
  } catch {
    return unavailableR7Request();
  }
}
