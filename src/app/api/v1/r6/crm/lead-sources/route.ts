import { z } from "zod";

import {
  parseAuthenticationJson,
  requireSameOrigin,
} from "@/modules/authentication/http/request-security";
import {
  authorizeTrustedHttpOperation,
  authorizationProblem,
} from "@/modules/authorization/http";
import { createLeadSource } from "@/modules/crm/core";
import {
  invalidR6Request,
  parseR6ListRequest,
  r6CommandError,
  r6Json,
  resolveR6TeamRequest,
  unavailableR6Request,
} from "@/modules/r6/http";
import { listDiscoverableLeadSources } from "@/modules/r6/queries";
import { buildProspectiveR6Resource } from "@/modules/r6/resources";

const schema = z.object({
  sourceType: z.string().trim().min(1).max(80),
  name: z.string().trim().min(1).max(200),
  baseUrl: z.string().trim().url().max(2048).nullable().optional(),
  complianceNotes: z.string().trim().max(4000).nullable().optional(),
  configuration: z.record(z.string(), z.unknown()).optional(),
}).strict();

export async function GET(request: Request) {
  const query = parseR6ListRequest(request);
  if (!query) return invalidR6Request();

  const resolved = await resolveR6TeamRequest(request);
  if (resolved.kind === "response") return resolved.response;

  try {
    return r6Json(
      await listDiscoverableLeadSources(resolved.context, query.limit),
    );
  } catch {
    return unavailableR6Request();
  }
}

export async function POST(request: Request) {
  if (!requireSameOrigin(request)) {
    return authorizationProblem(403, "AUTHZ_DENIED");
  }

  const input = await parseAuthenticationJson(request, schema);
  if (!input) return invalidR6Request();

  const resolved = await resolveR6TeamRequest(request);
  if (resolved.kind === "response") return resolved.response;

  const authorization = await authorizeTrustedHttpOperation({
    context: resolved.context,
    permissionKey: "source.manage",
    resource: buildProspectiveR6Resource(
      resolved.context,
      "lead-source",
      "CONFIDENTIAL",
      "ACTIVE",
    ),
    command: {
      action: "create",
      requestedFields: Object.keys(input),
    },
  });
  if (authorization.kind === "response") return authorization.response;

  const result = await createLeadSource(resolved.context, input);
  if (result.kind === "error") return r6CommandError(result.code);
  return r6Json({ leadSource: result.value }, 201);
}
