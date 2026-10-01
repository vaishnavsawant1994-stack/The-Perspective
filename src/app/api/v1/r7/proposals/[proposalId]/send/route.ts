import { z } from "zod";

import { authorizeTrustedHttpOperation, authorizationProblem } from "@/modules/authorization/http";
import { parseAuthenticationJson, requireSameOrigin } from "@/modules/authentication/http/request-security";
import { sendProposal } from "@/modules/r7/proposal-send";
import { invalidR7Request, r7CommandError, r7Json, resolveR7TeamRequest, unavailableR7Request } from "@/modules/r7/http";
import { loadR7ProposalResource } from "@/modules/r7/resources";

const uuid = z.string().uuid();
const sendSchema = z.object({
  expectedVersionId: uuid,
  expectedVersion: z.number().int().positive(),
  expectedRowVersion: z.number().int().positive(),
}).strict();

export async function POST(
  request: Request,
  route: { params: Promise<{ proposalId: string }> },
) {
  if (!requireSameOrigin(request)) return authorizationProblem(403, "AUTHZ_DENIED");
  const idempotencyKey = request.headers.get("idempotency-key")?.trim();
  if (!idempotencyKey || idempotencyKey.length < 8 || idempotencyKey.length > 128 ||
      !/^[A-Za-z0-9._:-]+$/u.test(idempotencyKey)) return invalidR7Request();
  const input = await parseAuthenticationJson(request, sendSchema);
  if (!input) return invalidR7Request();

  const { proposalId } = await route.params;
  if (!uuid.safeParse(proposalId).success) return invalidR7Request();
  const resolved = await resolveR7TeamRequest(request);
  if (resolved.kind === "response") return resolved.response;

  try {
    const resource = await loadR7ProposalResource(resolved.context, proposalId);
    if (!resource) return authorizationProblem(404, "AUTHZ_NOT_FOUND");
    const lifecycleCanSend = resource.lifecycleState === "DRAFT" || resource.lifecycleState === "READY";
    const exactVersionMatches = resource.version === input.expectedRowVersion;
    const authorization = await authorizeTrustedHttpOperation({
      context: resolved.context,
      permissionKey: "proposal.send",
      resource,
      command: {
        action: "send",
        workflowSatisfied: lifecycleCanSend,
        exactVersionMatches,
        optimisticConcurrencySatisfied: exactVersionMatches,
      },
      concealResource: true,
    });
    if (authorization.kind === "response") return authorization.response;
    if (!exactVersionMatches) return r7CommandError("STALE_WRITE");
    if (!lifecycleCanSend) return r7CommandError("TRANSITION_DENIED");

    const result = await sendProposal(resolved.context, {
      proposalId,
      expectedVersionId: input.expectedVersionId,
      expectedVersion: input.expectedVersion,
      expectedRowVersion: input.expectedRowVersion,
      idempotencyKey,
    });
    if (result.kind === "error") {
      return result.code === "NOT_FOUND"
        ? authorizationProblem(404, "AUTHZ_NOT_FOUND")
        : r7CommandError(result.code);
    }
    return r7Json({ proposal: result.value, delivery: "QUEUED" }, 202);
  } catch {
    return unavailableR7Request();
  }
}
