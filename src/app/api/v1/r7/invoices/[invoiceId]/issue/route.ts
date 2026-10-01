import { z } from "zod";

import { parseAuthenticationJson, requireSameOrigin } from "@/modules/authentication/http/request-security";
import { authorizeTrustedHttpOperation, authorizationProblem } from "@/modules/authorization/http";
import { r6MfaSatisfied, r6RecentAuthenticationSatisfied } from "@/modules/r6/security";
import { invalidR7Request, r7CommandError, r7Json, resolveR7TeamRequest, unavailableR7Request } from "@/modules/r7/http";
import { issueInvoice } from "@/modules/r7/invoice-draft";
import { loadR7InvoiceCommandSubject } from "@/modules/r7/resources";

const uuid = z.string().uuid();
const issueSchema = z.object({
  expectedRowVersion: z.number().int().positive(),
  reason: z.string().trim().min(8).max(500),
}).strict();
const IDEMPOTENCY_KEY = /^[A-Za-z0-9._:-]{8,128}$/u;

/** invoice.issue only. Money, lines, source, and currency stay in the domain command. */
export async function POST(
  request: Request,
  route: { params: Promise<{ invoiceId: string }> },
) {
  if (!requireSameOrigin(request)) return authorizationProblem(403, "AUTHZ_DENIED");
  const idempotencyKey = request.headers.get("idempotency-key")?.trim();
  if (!idempotencyKey || !IDEMPOTENCY_KEY.test(idempotencyKey)) return invalidR7Request();
  const input = await parseAuthenticationJson(request, issueSchema);
  if (!input) return invalidR7Request();
  const { invoiceId } = await route.params;
  if (!uuid.safeParse(invoiceId).success) return invalidR7Request();

  const resolved = await resolveR7TeamRequest(request);
  if (resolved.kind === "response") return resolved.response;

  try {
    const subject = await loadR7InvoiceCommandSubject(resolved.context, invoiceId);
    if (!subject) {
      console.error("invoice.issue gate", { gate: "subject" });
      return authorizationProblem(404, "AUTHZ_NOT_FOUND");
    }
    const now = new Date();
    const exactVersionMatches = subject.resource.version === input.expectedRowVersion;
    const lifecycleCanIssue = subject.resource.lifecycleState === "DRAFT";
    const authorization = await authorizeTrustedHttpOperation({
      context: resolved.context,
      permissionKey: "invoice.issue",
      resource: subject.resource,
      command: {
        action: "issue",
        requestedFields: [],
        workflowSatisfied: lifecycleCanIssue,
        exactVersionMatches,
        optimisticConcurrencySatisfied: exactVersionMatches,
        reason: input.reason,
        recentAuthenticationSatisfied: r6RecentAuthenticationSatisfied(resolved.context.session, now),
        mfaSatisfied: r6MfaSatisfied(resolved.context.session, now),
        financialEvidencePresent: subject.financialEvidencePresent,
        separationOfDutySatisfied: subject.separationOfDutySatisfied,
      },
      concealResource: true,
    });
    if (authorization.kind === "response") {
      console.error("invoice.issue gate", {
        gate: "auth",
        reason: authorization.decision?.reasonCode,
        version: subject.resource.version,
        expected: input.expectedRowVersion,
        evidence: subject.financialEvidencePresent,
        separationOfDuty: subject.separationOfDutySatisfied,
        lifecycle: subject.resource.lifecycleState,
      });
      return authorization.response;
    }
    if (!subject.financialEvidencePresent) return r7CommandError("INELIGIBLE");
    if (!lifecycleCanIssue) return r7CommandError("TRANSITION_DENIED");
    if (!exactVersionMatches) return r7CommandError("STALE_WRITE");

    const result = await issueInvoice(resolved.context, {
      invoiceId,
      expectedRowVersion: input.expectedRowVersion,
      idempotencyKey,
    });
    if (result.kind === "error") {
      console.error("invoice.issue gate", { gate: "domain", code: result.code, expected: input.expectedRowVersion });
      return result.code === "NOT_FOUND"
        ? authorizationProblem(404, "AUTHZ_NOT_FOUND")
        : r7CommandError(result.code);
    }
    return r7Json({ invoice: result.value });
  } catch {
    return unavailableR7Request();
  }
}
