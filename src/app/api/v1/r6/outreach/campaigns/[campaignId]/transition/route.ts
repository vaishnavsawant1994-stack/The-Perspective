import { z } from "zod";

import {
  parseAuthenticationJson,
  requireSameOrigin,
} from "@/modules/authentication/http/request-security";
import {
  authorizeTrustedHttpOperation,
  authorizationProblem,
} from "@/modules/authorization/http";
import type { CanonicalPermissionKey } from "@/modules/authorization/registry";
import { transitionCampaign } from "@/modules/comms/core";
import {
  invalidR6Request,
  r6CommandError,
  r6Json,
  resolveR6TeamRequest,
} from "@/modules/r6/http";
import { loadR6CampaignResource } from "@/modules/r6/resources";
import {
  r6MfaSatisfied,
  r6RecentAuthenticationSatisfied,
} from "@/modules/r6/security";

const schema = z.object({
  to: z.enum(["READY", "APPROVED", "SCHEDULED", "PAUSED", "CANCELLED"]),
  expectedRowVersion: z.number().int().positive(),
  reason: z.string().trim().min(3).max(500).nullable().optional(),
}).strict();

const mapping: Record<
  "READY" | "APPROVED" | "SCHEDULED" | "PAUSED" | "CANCELLED",
  { permissionKey: CanonicalPermissionKey; action: string; critical: boolean }
> = {
  READY: { permissionKey: "outreach.prepare", action: "submit", critical: false },
  APPROVED: { permissionKey: "outreach.launch", action: "approve", critical: true },
  SCHEDULED: { permissionKey: "outreach.launch", action: "schedule", critical: true },
  PAUSED: { permissionKey: "campaign.manage", action: "pause", critical: false },
  CANCELLED: { permissionKey: "campaign.manage", action: "cancel", critical: false },
};

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

  const policy = mapping[input.to];
  const now = new Date();
  const authorization = await authorizeTrustedHttpOperation({
    context: resolved.context,
    permissionKey: policy.permissionKey,
    resource,
    command: {
      action: policy.action,
      requestedFields: [],
      workflowSatisfied: true,
      reason: policy.critical ? input.reason ?? undefined : undefined,
      recentAuthenticationSatisfied:
        !policy.critical || r6RecentAuthenticationSatisfied(resolved.context.session, now),
      mfaSatisfied:
        !policy.critical || r6MfaSatisfied(resolved.context.session, now),
      exactVersionMatches:
        !policy.critical || resource.version === input.expectedRowVersion,
    },
    concealResource: true,
  });
  if (authorization.kind === "response") return authorization.response;

  const result = await transitionCampaign(resolved.context, {
    campaignId,
    to: input.to,
    expectedRowVersion: input.expectedRowVersion,
  });
  if (result.kind === "error") return r6CommandError(result.code);
  return r6Json({ transition: result.value });
}
