import { z } from "zod";

import { authorizationProblem } from "@/modules/authorization/http";
import {
  invalidR7Request,
  r7Json,
  resolveR7TeamRequest,
  unavailableR7Request,
} from "@/modules/r7/http";
import { getAuthorizedPayment } from "@/modules/r7/queries";

export async function GET(
  request: Request,
  route: { params: Promise<{ paymentId: string }> },
) {
  const resolved = await resolveR7TeamRequest(request);
  if (resolved.kind === "response") return resolved.response;
  const { paymentId } = await route.params;
  if (!z.string().uuid().safeParse(paymentId).success) return invalidR7Request();
  try {
    const payment = await getAuthorizedPayment(resolved.context, paymentId);
    if (!payment) return authorizationProblem(404, "AUTHZ_NOT_FOUND");
    return r7Json({ payment });
  } catch {
    return unavailableR7Request();
  }
}
