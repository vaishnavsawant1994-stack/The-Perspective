import { z } from "zod";

import {
  parseAuthenticationJson,
  requireSameOrigin,
} from "@/modules/authentication/http/request-security";
import {
  authorizeTrustedHttpOperation,
  authorizationProblem,
} from "@/modules/authorization/http";
import { createCampaign } from "@/modules/comms/core";
import {
  invalidR6Request,
  parseR6ListRequest,
  r6CommandError,
  r6Json,
  resolveR6TeamRequest,
  unavailableR6Request,
} from "@/modules/r6/http";
import { listAuthorizedCampaigns } from "@/modules/r6/queries";
import { buildProspectiveR6Resource } from "@/modules/r6/resources";

const createCampaignSchema = z.object({
  name: z.string().trim().min(2).max(160),
  leadListId: z.string().uuid(),
  sequenceId: z.string().uuid(),
  sendingAccountId: z.string().uuid(),
  schedule: z.record(z.string(), z.unknown()).optional(),
}).strict();

export async function GET(request: Request) {
  const query = parseR6ListRequest(request);
  if (!query) return invalidR6Request();

  const resolved = await resolveR6TeamRequest(request);
  if (resolved.kind === "response") return resolved.response;

  try {
    return r6Json(await listAuthorizedCampaigns(resolved.context, query.limit));
  } catch {
    return unavailableR6Request();
  }
}

export async function POST(request: Request) {
  if (!requireSameOrigin(request)) {
    return authorizationProblem(403, "AUTHZ_DENIED");
  }
  const input = await parseAuthenticationJson(request, createCampaignSchema);
  if (!input) return invalidR6Request();

  const resolved = await resolveR6TeamRequest(request);
  if (resolved.kind === "response") return resolved.response;

  const authorization = await authorizeTrustedHttpOperation({
    context: resolved.context,
    permissionKey: "campaign.manage",
    resource: buildProspectiveR6Resource(
      resolved.context,
      "outreach-campaign",
      "CONFIDENTIAL",
      "DRAFT",
    ),
    command: {
      action: "create",
      requestedFields: [
        "name",
        "leadListId",
        "sequenceId",
        "sendingAccountId",
        "schedule",
      ],
    },
  });
  if (authorization.kind === "response") return authorization.response;

  const result = await createCampaign(resolved.context, input);
  if (result.kind === "error") return r6CommandError(result.code);
  return r6Json({ campaign: result.value }, 201);
}
