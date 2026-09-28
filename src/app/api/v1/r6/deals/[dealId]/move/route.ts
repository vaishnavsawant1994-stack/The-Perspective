import { z } from "zod";

import {
  parseAuthenticationJson,
  requireSameOrigin,
} from "@/modules/authentication/http/request-security";
import {
  authorizeTrustedHttpOperation,
  authorizationProblem,
} from "@/modules/authorization/http";
import { moveDeal } from "@/modules/commercial/core";
import {
  invalidR6Request,
  r6CommandError,
  r6Json,
  resolveR6TeamRequest,
} from "@/modules/r6/http";
import { loadR6DealResource } from "@/modules/r6/resources";

const schema = z.object({
  toStageId: z.string().uuid(),
  expectedRowVersion: z.number().int().positive(),
  reason: z.string().trim().min(3).max(500).nullable().optional(),
}).strict();

export async function POST(
  request: Request,
  route: { params: Promise<{ dealId: string }> },
) {
  if (!requireSameOrigin(request)) {
    return authorizationProblem(403, "AUTHZ_DENIED");
  }
  const input = await parseAuthenticationJson(request, schema);
  if (!input) return invalidR6Request();

  const resolved = await resolveR6TeamRequest(request);
  if (resolved.kind === "response") return resolved.response;
  const { dealId } = await route.params;
  if (!z.string().uuid().safeParse(dealId).success) return invalidR6Request();

  const resource = await loadR6DealResource(resolved.context, dealId);
  if (!resource) return authorizationProblem(404, "AUTHZ_NOT_FOUND");

  const authorization = await authorizeTrustedHttpOperation({
    context: resolved.context,
    permissionKey: "deal.move",
    resource,
    command: {
      action: "move-stage",
      requestedFields: [],
      workflowSatisfied: true,
    },
    concealResource: true,
  });
  if (authorization.kind === "response") return authorization.response;

  const result = await moveDeal(resolved.context, { dealId, ...input });
  if (result.kind === "error") return r6CommandError(result.code);
  return r6Json({ transition: result.value });
}
