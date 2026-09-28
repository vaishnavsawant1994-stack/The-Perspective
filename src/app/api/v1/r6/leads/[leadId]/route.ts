import { z } from "zod";

import {
  parseAuthenticationJson,
  requireSameOrigin,
} from "@/modules/authentication/http/request-security";
import {
  authorizeTrustedHttpOperation,
  authorizationProblem,
} from "@/modules/authorization/http";
import { updateLead } from "@/modules/crm/core";
import {
  r6CommandError,
  r6Json,
  resolveR6TeamRequest,
  unavailableR6Request,
  invalidR6Request,
} from "@/modules/r6/http";
import { getAuthorizedLead } from "@/modules/r6/queries";
import { loadR6LeadResource } from "@/modules/r6/resources";

const updateSchema = z.object({
  expectedRowVersion: z.number().int().positive(),
  companyId: z.string().uuid().nullable().optional(),
  contactId: z.string().uuid().nullable().optional(),
  leadSourceId: z.string().uuid().nullable().optional(),
}).strict().refine(
  (value) => [
    value.companyId,
    value.contactId,
    value.leadSourceId,
  ].some((field) => field !== undefined),
  { message: "At least one mutable lead field is required." },
);

export async function GET(
  request: Request,
  route: { params: Promise<{ leadId: string }> },
) {
  const { leadId } = await route.params;
  if (!z.string().uuid().safeParse(leadId).success) return invalidR6Request();

  const resolved = await resolveR6TeamRequest(request);
  if (resolved.kind === "response") return resolved.response;

  try {
    const lead = await getAuthorizedLead(resolved.context, leadId);
    if (!lead) return authorizationProblem(404, "AUTHZ_NOT_FOUND");
    return r6Json({ lead });
  } catch {
    return unavailableR6Request();
  }
}

export async function PATCH(
  request: Request,
  route: { params: Promise<{ leadId: string }> },
) {
  if (!requireSameOrigin(request)) {
    return authorizationProblem(403, "AUTHZ_DENIED");
  }

  const input = await parseAuthenticationJson(request, updateSchema);
  if (!input) return invalidR6Request();

  const resolved = await resolveR6TeamRequest(request);
  if (resolved.kind === "response") return resolved.response;

  const { leadId } = await route.params;
  if (!z.string().uuid().safeParse(leadId).success) return invalidR6Request();

  const resource = await loadR6LeadResource(resolved.context, leadId);
  if (!resource) return authorizationProblem(404, "AUTHZ_NOT_FOUND");

  const requestedFields = ([
    "companyId",
    "contactId",
    "leadSourceId",
  ] as const).filter((field) => input[field] !== undefined);

  const authorization = await authorizeTrustedHttpOperation({
    context: resolved.context,
    permissionKey: "lead.edit",
    resource,
    command: {
      action: "update",
      requestedFields,
    },
    concealResource: true,
  });
  if (authorization.kind === "response") return authorization.response;

  const result = await updateLead(resolved.context, {
    leadId,
    ...input,
  });
  if (result.kind === "error") return r6CommandError(result.code);
  return r6Json({ lead: result.value });
}
