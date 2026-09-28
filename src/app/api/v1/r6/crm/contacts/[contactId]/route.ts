import { z } from "zod";

import {
  parseAuthenticationJson,
  requireSameOrigin,
} from "@/modules/authentication/http/request-security";
import {
  authorizeTrustedHttpOperation,
  authorizationProblem,
} from "@/modules/authorization/http";
import { updateContact } from "@/modules/crm/core";
import {
  r6CommandError,
  r6Json,
  resolveR6TeamRequest,
  unavailableR6Request,
  invalidR6Request,
} from "@/modules/r6/http";
import { getAuthorizedContact } from "@/modules/r6/queries";
import { loadR6ContactResource } from "@/modules/r6/resources";

const updateSchema = z.object({
  expectedRowVersion: z.number().int().positive(),
  companyId: z.string().uuid().nullable().optional(),
  title: z.string().trim().max(160).nullable().optional(),
  relationshipState: z.string().trim().max(80).nullable().optional(),
  preferredChannel: z.string().trim().max(80).nullable().optional(),
}).strict().refine(
  (value) => [
    value.companyId,
    value.title,
    value.relationshipState,
    value.preferredChannel,
  ].some((field) => field !== undefined),
  { message: "At least one mutable contact field is required." },
);

export async function GET(
  request: Request,
  route: { params: Promise<{ contactId: string }> },
) {
  const { contactId } = await route.params;
  if (!z.string().uuid().safeParse(contactId).success) return invalidR6Request();

  const resolved = await resolveR6TeamRequest(request);
  if (resolved.kind === "response") return resolved.response;

  try {
    const contact = await getAuthorizedContact(resolved.context, contactId);
    if (!contact) return authorizationProblem(404, "AUTHZ_NOT_FOUND");
    return r6Json({ contact });
  } catch {
    return unavailableR6Request();
  }
}

export async function PATCH(
  request: Request,
  route: { params: Promise<{ contactId: string }> },
) {
  if (!requireSameOrigin(request)) {
    return authorizationProblem(403, "AUTHZ_DENIED");
  }

  const input = await parseAuthenticationJson(request, updateSchema);
  if (!input) return invalidR6Request();

  const resolved = await resolveR6TeamRequest(request);
  if (resolved.kind === "response") return resolved.response;

  const { contactId } = await route.params;
  if (!z.string().uuid().safeParse(contactId).success) return invalidR6Request();

  const resource = await loadR6ContactResource(resolved.context, contactId);
  if (!resource) return authorizationProblem(404, "AUTHZ_NOT_FOUND");

  const requestedFields = ([
    "companyId",
    "title",
    "relationshipState",
    "preferredChannel",
  ] as const).filter((field) => input[field] !== undefined);

  const authorization = await authorizeTrustedHttpOperation({
    context: resolved.context,
    permissionKey: "contact.edit",
    resource,
    command: {
      action: "update",
      requestedFields,
    },
    concealResource: true,
  });
  if (authorization.kind === "response") return authorization.response;

  const result = await updateContact(resolved.context, {
    contactId,
    ...input,
  });
  if (result.kind === "error") return r6CommandError(result.code);
  return r6Json({ contact: result.value });
}
