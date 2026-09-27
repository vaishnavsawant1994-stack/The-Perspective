import { z } from "zod";

import {
  parseAuthenticationJson,
  requireSameOrigin,
} from "@/modules/authentication/http/request-security";
import {
  authorizeTrustedHttpOperation,
  authorizationProblem,
} from "@/modules/authorization/http";
import { createLead } from "@/modules/crm/core";
import {
  invalidR6Request,
  parseR6ListRequest,
  r6CommandError,
  r6Json,
  resolveR6TeamRequest,
  unavailableR6Request,
} from "@/modules/r6/http";
import { listAuthorizedLeads } from "@/modules/r6/queries";
import { buildProspectiveR6Resource } from "@/modules/r6/resources";

const createLeadSchema = z.object({
  companyId: z.string().uuid().nullable().optional(),
  contactId: z.string().uuid().nullable().optional(),
  leadSourceId: z.string().uuid().nullable().optional(),
}).strict().refine(
  (value) => Boolean(value.companyId || value.contactId || value.leadSourceId),
  { message: "A trusted CRM linkage is required." },
);

export async function GET(request: Request) {
  const query = parseR6ListRequest(request);
  if (!query) return invalidR6Request();

  const resolved = await resolveR6TeamRequest(request);
  if (resolved.kind === "response") return resolved.response;

  try {
    return r6Json(await listAuthorizedLeads(resolved.context, query.limit));
  } catch {
    return unavailableR6Request();
  }
}

export async function POST(request: Request) {
  if (!requireSameOrigin(request)) {
    return authorizationProblem(403, "AUTHZ_DENIED");
  }
  const input = await parseAuthenticationJson(request, createLeadSchema);
  if (!input) return invalidR6Request();

  const resolved = await resolveR6TeamRequest(request);
  if (resolved.kind === "response") return resolved.response;

  const authorization = await authorizeTrustedHttpOperation({
    context: resolved.context,
    permissionKey: "lead.edit",
    resource: buildProspectiveR6Resource(
      resolved.context,
      "lead",
      "CONFIDENTIAL",
      "NEW",
    ),
    command: { action: "create", requestedFields: Object.keys(input) },
  });
  if (authorization.kind === "response") return authorization.response;

  const result = await createLead(resolved.context, input);
  if (result.kind === "error") return r6CommandError(result.code);
  return r6Json({ lead: result.value }, 201);
}
