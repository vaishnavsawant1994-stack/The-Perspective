import { z } from "zod";

import { authorizeTrustedHttpOperation, authorizationProblem } from "@/modules/authorization/http";
import { parseAuthenticationJson, requireSameOrigin } from "@/modules/authentication/http/request-security";
import { editDraftProposal } from "@/modules/r7/proposal-edit";
import { invalidR7Request, r7CommandError, r7Json, resolveR7TeamRequest, unavailableR7Request } from "@/modules/r7/http";
import { loadR7ProposalResource } from "@/modules/r7/resources";

const uuid = z.string().uuid();
const editSchema = z.object({
  expectedVersionId: uuid,
  expectedVersion: z.number().int().positive(),
  expectedRowVersion: z.number().int().positive(),
  currency: z.string().trim().regex(/^[A-Z]{3}$/u),
  lines: z.array(z.object({
    description: z.string().trim().min(1).max(500),
    quantity: z.number().int().min(1).max(2147483647),
    unitAmountMinor: z.string().regex(/^(0|[1-9][0-9]{0,18})$/u),
  }).strict()).min(1).max(100),
}).strict();

export async function POST(
  request: Request,
  route: { params: Promise<{ proposalId: string }> },
) {
  if (!requireSameOrigin(request)) return authorizationProblem(403, "AUTHZ_DENIED");
  const input = await parseAuthenticationJson(request, editSchema);
  if (!input) return invalidR7Request();

  const { proposalId } = await route.params;
  if (!uuid.safeParse(proposalId).success) return invalidR7Request();
  const resolved = await resolveR7TeamRequest(request);
  if (resolved.kind === "response") return resolved.response;

  try {
    const resource = await loadR7ProposalResource(resolved.context, proposalId);
    if (!resource) return authorizationProblem(404, "AUTHZ_NOT_FOUND");
    const authorization = await authorizeTrustedHttpOperation({
      context: resolved.context,
      permissionKey: "proposal.edit",
      resource,
      command: {
        action: "edit",
        requestedFields: ["currency", "description", "quantity", "unitAmountMinor"],
        exactVersionMatches: resource.version === input.expectedRowVersion,
        optimisticConcurrencySatisfied: resource.version === input.expectedRowVersion,
      },
      concealResource: true,
    });
    if (authorization.kind === "response") return authorization.response;
    if (resource.version !== input.expectedRowVersion) {
      return r7CommandError("STALE_WRITE");
    }

    const result = await editDraftProposal(resolved.context, {
      proposalId,
      expectedVersionId: input.expectedVersionId,
      expectedVersion: input.expectedVersion,
      expectedRowVersion: input.expectedRowVersion,
      currency: input.currency,
      lines: input.lines.map((line) => ({
        ...line,
        unitAmountMinor: BigInt(line.unitAmountMinor),
      })),
    });
    if (result.kind === "error") {
      return result.code === "NOT_FOUND"
        ? authorizationProblem(404, "AUTHZ_NOT_FOUND")
        : r7CommandError(result.code);
    }
    return r7Json({ proposal: result.value });
  } catch {
    return unavailableR7Request();
  }
}
