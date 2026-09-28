import { z } from "zod";

import {
  parseAuthenticationJson,
  requireSameOrigin,
} from "@/modules/authentication/http/request-security";
import {
  authorizeTrustedHttpOperation,
  authorizationProblem,
} from "@/modules/authorization/http";
import {
  invalidR6Request,
  r6CommandError,
  r6Json,
  resolveR6TeamRequest,
} from "@/modules/r6/http";
import {
  queueR6CampaignLaunch,
  R6OutboxError,
} from "@/modules/r6/outbox";
import { loadR6CampaignResource } from "@/modules/r6/resources";
import {
  r6MfaSatisfied,
  r6RecentAuthenticationSatisfied,
} from "@/modules/r6/security";

const schema = z.object({
  expectedRowVersion: z.number().int().positive(),
  reason: z.string().trim().min(3).max(500),
  idempotencyKey: z.string().trim().regex(/^[A-Za-z0-9._:-]{8,128}$/u),
}).strict();

export async function POST(
  request: Request,
  route: { params: Promise<{ campaignId: string }> },
) {
  if (!requireSameOrigin(request)) {
    return authorizationProblem(403, "AUTHZ_DENIED");
  }
  const input = await parseAuthenticationJson(request, schema);
  if (!input) return invalidR6Request();

  const resolved = await resolveR6TeamRequest(request);
  if (resolved.kind === "response") return resolved.response;
  const { campaignId } = await route.params;
  if (!z.string().uuid().safeParse(campaignId).success) return invalidR6Request();

  const resource = await loadR6CampaignResource(resolved.context, campaignId);
  if (!resource) return authorizationProblem(404, "AUTHZ_NOT_FOUND");

  const now = new Date();
  const authorization = await authorizeTrustedHttpOperation({
    context: resolved.context,
    permissionKey: "outreach.launch",
    resource,
    command: {
      action: "launch",
      requestedFields: [],
      workflowSatisfied: resource.lifecycleState === "SCHEDULED",
      reason: input.reason,
      recentAuthenticationSatisfied: r6RecentAuthenticationSatisfied(
        resolved.context.session,
        now,
      ),
      mfaSatisfied: r6MfaSatisfied(resolved.context.session, now),
      exactVersionMatches: resource.version === input.expectedRowVersion,
    },
    concealResource: true,
  });
  if (authorization.kind === "response") return authorization.response;

  try {
    const queued = await queueR6CampaignLaunch(resolved.context, resource, {
      campaignId,
      ...input,
    });
    return r6Json({ launch: queued }, queued.replay ? 200 : 202);
  } catch (error) {
    if (error instanceof R6OutboxError) return r6CommandError(error.code);
    throw error;
  }
}
