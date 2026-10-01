import { z } from "zod";

import { parseAuthenticationJson, requireSameOrigin } from "@/modules/authentication/http/request-security";
import { authorizeTrustedHttpOperation, authorizationProblem } from "@/modules/authorization/http";
import { createDraftProposal } from "@/modules/r7/commands";
import { parseR7ListRequest, invalidR7Request, unavailableR7Request, r7Json, resolveR7TeamRequest, r7CommandError } from "@/modules/r7/http";
import { listAuthorizedProposals } from "@/modules/r7/queries";
import { buildProspectiveR7ProposalResource } from "@/modules/r7/resources";

const createProposalSchema = z.object({
  dealId: z.string().uuid(),
  currency: z.string().trim().regex(/^[A-Z]{3}$/u),
  lines: z.array(z.object({
    description: z.string().trim().min(1).max(500),
    quantity: z.number().int().min(1).max(2147483647),
    unitAmountMinor: z.string().regex(/^(0|[1-9][0-9]{0,18})$/u),
  }).strict()).min(1).max(100),
}).strict();

export async function GET(request: Request) {
  const query = parseR7ListRequest(request);
  if (!query) return invalidR7Request();

  const resolved = await resolveR7TeamRequest(request);
  if (resolved.kind === "response") return resolved.response;

  try {
    const proposals = await listAuthorizedProposals(resolved.context, query.limit);
    return r7Json({ proposals });
  } catch {
    return unavailableR7Request();
  }
}


export async function POST(request: Request) {
  if (!requireSameOrigin(request)) {
    return authorizationProblem(403, "AUTHZ_DENIED");
  }

  const input = await parseAuthenticationJson(request, createProposalSchema);
  const idempotencyKey = request.headers.get("idempotency-key")?.trim();
  if (
    !input ||
    !idempotencyKey ||
    idempotencyKey.length < 8 ||
    idempotencyKey.length > 128 ||
    !/^[A-Za-z0-9._:-]+$/u.test(idempotencyKey)
  ) {
    return invalidR7Request();
  }

  const resolved = await resolveR7TeamRequest(request);
  if (resolved.kind === "response") return resolved.response;

  const resource = buildProspectiveR7ProposalResource(resolved.context);
  if (!resource) return authorizationProblem(403, "AUTHZ_DENIED");

  const authorization = await authorizeTrustedHttpOperation({
    context: resolved.context,
    permissionKey: "proposal.edit",
    resource,
    command: {
      action: "create",
      requestedFields: ["dealId", "currency", "description", "quantity", "unitAmountMinor"],
    },
  });
  if (authorization.kind === "response") return authorization.response;

  try {
    const result = await createDraftProposal(resolved.context, {
      dealId: input.dealId,
      currency: input.currency,
      lines: input.lines.map((line) => ({
        ...line,
        unitAmountMinor: BigInt(line.unitAmountMinor),
      })),
      idempotencyKey,
    });
    if (result.kind === "error") return r7CommandError(result.code);
    return r7Json({ proposal: result.value }, 201);
  } catch {
    return unavailableR7Request();
  }
}
