import { z } from "zod";

import {
  parseAuthenticationJson,
  requireSameOrigin,
} from "@/modules/authentication/http/request-security";
import {
  authorizeTrustedHttpOperation,
  authorizationProblem,
} from "@/modules/authorization/http";
import { transitionLeadLifecycle } from "@/modules/crm/core";
import { canTransitionLeadLifecycle } from "@/modules/crm/lifecycle";
import type { LeadLifecycleState } from "@/modules/crm/types";
import {
  invalidR6Request,
  r6CommandError,
  r6Json,
  resolveR6TeamRequest,
} from "@/modules/r6/http";
import { loadR6LeadResource } from "@/modules/r6/resources";

const schema = z.object({
  to: z.enum(["QUALIFIED", "NURTURE", "DISQUALIFIED"]),
  expectedRowVersion: z.number().int().positive(),
  reason: z.string().trim().min(3).max(500).nullable().optional(),
}).strict();

const actionByTarget = {
  QUALIFIED: "qualify",
  NURTURE: "nurture",
  DISQUALIFIED: "disqualify",
} as const;

export async function POST(
  request: Request,
  route: { params: Promise<{ leadId: string }> },
) {
  if (!requireSameOrigin(request)) {
    return authorizationProblem(403, "AUTHZ_DENIED");
  }
  const input = await parseAuthenticationJson(request, schema);
  if (!input) return invalidR6Request();

  const resolved = await resolveR6TeamRequest(request);
  if (resolved.kind === "response") return resolved.response;
  const { leadId } = await route.params;
  if (!z.string().uuid().safeParse(leadId).success) return invalidR6Request();

  const resource = await loadR6LeadResource(resolved.context, leadId);
  if (!resource) return authorizationProblem(404, "AUTHZ_NOT_FOUND");

  const authorization = await authorizeTrustedHttpOperation({
    context: resolved.context,
    permissionKey: "lead.qualify",
    resource,
    command: {
      action: actionByTarget[input.to],
      requestedFields: Object.keys(input),
      workflowSatisfied: canTransitionLeadLifecycle(
        resource.lifecycleState as LeadLifecycleState,
        input.to,
      ),
    },
    concealResource: true,
  });
  if (authorization.kind === "response") return authorization.response;

  const result = await transitionLeadLifecycle(resolved.context, {
    leadId,
    ...input,
  });
  if (result.kind === "error") return r6CommandError(result.code);
  return r6Json({ transition: result.value });
}
