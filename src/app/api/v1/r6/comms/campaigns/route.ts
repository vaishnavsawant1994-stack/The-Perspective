import { z } from "zod";

import { authorizeTrustedHttpOperation } from "@/modules/authorization/http";
import { createCampaign } from "@/modules/comms/core";
import { resolveR6Mutation, r6DomainResult } from "@/modules/r6-api/http";

const schema = z.object({
  name: z.string().trim().min(1).max(200),
  leadListId: z.string().uuid(),
  sequenceId: z.string().uuid(),
  sendingAccountId: z.string().uuid(),
  schedule: z.record(z.string(), z.unknown()).optional(),
}).strict();

export async function POST(request: Request) {
  const resolved = await resolveR6Mutation(request, schema);
  if (resolved.kind === "response") return resolved.response;

  const authorization = await authorizeTrustedHttpOperation({
    context: resolved.context,
    permissionKey: "campaign.manage",
    resource: {
      resourceType: "outreach-campaign",
      ownerOrganizationId: resolved.context.tenant.organizationId,
    },
    command: {
      action: "create",
      requestedFields: Object.keys(resolved.input),
    },
  });
  if (authorization.kind === "response") return authorization.response;

  return r6DomainResult(await createCampaign(resolved.context, resolved.input));
}
