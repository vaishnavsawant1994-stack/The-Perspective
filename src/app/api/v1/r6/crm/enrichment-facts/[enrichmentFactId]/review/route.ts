import { z } from "zod";

import {
  parseAuthenticationJson,
  requireSameOrigin,
} from "@/modules/authentication/http/request-security";
import {
  authorizeTrustedHttpOperation,
  authorizationProblem,
} from "@/modules/authorization/http";
import { reviewEnrichmentFact } from "@/modules/crm/core";
import {
  invalidR6Request,
  r6CommandError,
  r6Json,
  resolveR6TeamRequest,
} from "@/modules/r6/http";
import { loadR6EnrichmentFactResource } from "@/modules/r6/resources";

const schema = z.object({
  decision: z.enum(["ACCEPTED", "REJECTED"]),
  expectedRowVersion: z.number().int().positive(),
}).strict();

const actionByDecision = {
  ACCEPTED: "accept",
  REJECTED: "reject",
} as const;

export async function POST(
  request: Request,
  route: { params: Promise<{ enrichmentFactId: string }> },
) {
  if (!requireSameOrigin(request)) {
    return authorizationProblem(403, "AUTHZ_DENIED");
  }

  const input = await parseAuthenticationJson(request, schema);
  if (!input) return invalidR6Request();

  const resolved = await resolveR6TeamRequest(request);
  if (resolved.kind === "response") return resolved.response;

  const { enrichmentFactId } = await route.params;
  if (!z.string().uuid().safeParse(enrichmentFactId).success) {
    return invalidR6Request();
  }

  const resource = await loadR6EnrichmentFactResource(
    resolved.context,
    enrichmentFactId,
  );
  if (!resource) return authorizationProblem(404, "AUTHZ_NOT_FOUND");

  const authorization = await authorizeTrustedHttpOperation({
    context: resolved.context,
    permissionKey: "lead.enrich",
    resource,
    command: {
      action: actionByDecision[input.decision],
      requestedFields: Object.keys(input),
      workflowSatisfied: resource.lifecycleState === "PENDING",
    },
    concealResource: true,
  });
  if (authorization.kind === "response") return authorization.response;

  const result = await reviewEnrichmentFact(resolved.context, {
    enrichmentFactId,
    ...input,
  });
  if (result.kind === "error") return r6CommandError(result.code);
  return r6Json({ review: result.value });
}
