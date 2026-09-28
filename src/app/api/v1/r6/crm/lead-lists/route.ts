import { z } from "zod";

import {
  parseAuthenticationJson,
  requireSameOrigin,
} from "@/modules/authentication/http/request-security";
import {
  authorizeTrustedHttpOperation,
  authorizationProblem,
} from "@/modules/authorization/http";
import { createLeadList } from "@/modules/crm/core";
import {
  invalidR6Request,
  r6CommandError,
  r6Json,
  resolveR6TeamRequest,
} from "@/modules/r6/http";
import { buildProspectiveR6Resource } from "@/modules/r6/resources";

const schema = z.object({
  name: z.string().trim().min(1).max(200),
  listType: z.enum(["STATIC", "DYNAMIC"]).optional(),
  filterDefinition: z.record(z.string(), z.unknown()).optional(),
}).strict();

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
    permissionKey: "lead.list.manage",
    resource: buildProspectiveR6Resource(
      resolved.context,
      "lead-list",
      "CONFIDENTIAL",
      "ACTIVE",
    ),
    command: {
      action: "create",
      requestedFields: Object.keys(input),
    },
  });
  if (authorization.kind === "response") return authorization.response;

  const result = await createLeadList(resolved.context, input);
  if (result.kind === "error") return r6CommandError(result.code);
  return r6Json({ leadList: result.value }, 201);
}
