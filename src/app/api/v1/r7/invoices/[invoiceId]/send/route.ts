import { z } from "zod";

import { parseAuthenticationJson, requireSameOrigin } from "@/modules/authentication/http/request-security";
import { authorizeTrustedHttpOperation, authorizationProblem } from "@/modules/authorization/http";
import { invalidR7Request, r7CommandError, r7Json, resolveR7TeamRequest, unavailableR7Request } from "@/modules/r7/http";
import { sendInvoice } from "@/modules/r7/invoice-send";
import { loadR7InvoiceCommandSubject } from "@/modules/r7/resources";

const uuid = z.string().uuid();
const sendSchema = z.object({
  expectedRowVersion: z.number().int().positive(),
}).strict();
const IDEMPOTENCY_KEY = /^[A-Za-z0-9._:-]{8,128}$/u;
const DELIVERABLE = new Set(["FINALIZED", "PARTIALLY_PAID", "PAID"]);

/** invoice.send only. Delivery intent does not mutate money, status, or source. */
export async function POST(
  request: Request,
  route: { params: Promise<{ invoiceId: string }> },
) {
  if (!requireSameOrigin(request)) return authorizationProblem(403, "AUTHZ_DENIED");
  const idempotencyKey = request.headers.get("idempotency-key")?.trim();
  if (!idempotencyKey || !IDEMPOTENCY_KEY.test(idempotencyKey)) return invalidR7Request();
  const input = await parseAuthenticationJson(request, sendSchema);
  if (!input) return invalidR7Request();
  const { invoiceId } = await route.params;
  if (!uuid.safeParse(invoiceId).success) return invalidR7Request();

  const resolved = await resolveR7TeamRequest(request);
  if (resolved.kind === "response") return resolved.response;

  try {
    const subject = await loadR7InvoiceCommandSubject(resolved.context, invoiceId);
    if (!subject) return authorizationProblem(404, "AUTHZ_NOT_FOUND");
    const exactVersionMatches = subject.resource.version === input.expectedRowVersion;
    const lifecycleCanSend = DELIVERABLE.has(subject.resource.lifecycleState ?? "");
    const authorization = await authorizeTrustedHttpOperation({
      context: resolved.context,
      permissionKey: "invoice.send",
      resource: subject.resource,
      command: {
        action: "send",
        requestedFields: [],
        workflowSatisfied: lifecycleCanSend,
        exactVersionMatches,
        optimisticConcurrencySatisfied: exactVersionMatches,
      },
      concealResource: true,
    });
    if (authorization.kind === "response") return authorization.response;
    if (!lifecycleCanSend) return r7CommandError("INELIGIBLE");
    if (!exactVersionMatches) return r7CommandError("STALE_WRITE");

    const result = await sendInvoice(resolved.context, {
      invoiceId,
      expectedRowVersion: input.expectedRowVersion,
      idempotencyKey,
    });
    if (result.kind === "error") {
      return result.code === "NOT_FOUND"
        ? authorizationProblem(404, "AUTHZ_NOT_FOUND")
        : r7CommandError(result.code);
    }
    return r7Json(
      { invoice: result.value, delivery: "QUEUED" },
      result.value.replayed ? 200 : 202,
    );
  } catch {
    return unavailableR7Request();
  }
}
