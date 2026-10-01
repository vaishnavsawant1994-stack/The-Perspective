import { z } from "zod";

import { authorizeTrustedHttpOperation, authorizationProblem } from "@/modules/authorization/http";
import { parseAuthenticationJson, requireSameOrigin } from "@/modules/authentication/http/request-security";
import { acceptProposal } from "@/modules/r7/proposal-acceptance";
import { invalidR7Request, r7CommandError, r7Json, resolveR7ClientRequest, unavailableR7Request } from "@/modules/r7/http";
import { loadClientProposalAcceptanceResource } from "@/modules/r7/resources";

const uuid = z.string().uuid();
const acceptSchema = z.object({
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
  const input = await parseAuthenticationJson(request, acceptSchema);
  if (!input) return invalidR7Request();

  const { proposalId } = await route.params;
  if (!uuid.safeParse(proposalId).success) return invalidR7Request();
  const resolved = await resolveR7ClientRequest(request);
  if (resolved.kind === "response") return resolved.response;

  try {
    const resource = await loadClientProposalAcceptanceResource(resolved.context, proposalId);
    if (!resource) return authorizationProblem(404, "AUTHZ_NOT_FOUND");
    const exactVersionMatches = resource.proposalVersionId === input.expectedVersionId &&
      resource.currentVersion === input.expectedVersion;
    const optimisticConcurrencySatisfied = resource.rowVersion === input.expectedRowVersion;
    const workflowSatisfied = ["SENT", "VIEWED", "ACCEPTED"].includes(
      resource.authorizationResource.lifecycleState ?? "",
    );
    const authorization = await authorizeTrustedHttpOperation({
      context: resolved.context,
      permissionKey: "proposal.accept",
      resource: resource.authorizationResource,
      command: {
        action: "accept",
        requestedFields: [],
        workflowSatisfied,
        clientSafeProjection: true,
        exactVersionMatches,
        optimisticConcurrencySatisfied,
        separationOfDutySatisfied: resource.separationOfDutySatisfied,
      },
      concealResource: true,
    });
    if (authorization.kind === "response") return authorization.response;
    if (!exactVersionMatches || !optimisticConcurrencySatisfied) return r7CommandError("STALE_WRITE");
    if (!workflowSatisfied) return r7CommandError("TRANSITION_DENIED");

    const result = await acceptProposal(resolved.context, {
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
    return r7Json({ acceptance: result.value });
  } catch {
    return unavailableR7Request();
  }
}
