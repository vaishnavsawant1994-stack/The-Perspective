import { z } from "zod";

import {
  parseAuthenticationJson,
  requireSameOrigin,
} from "@/modules/authentication/http/request-security";
import {
  authorizeTrustedHttpOperation,
  authorizationProblem,
} from "@/modules/authorization/http";
import { createContact } from "@/modules/crm/core";
import {
  invalidR6Request,
  parseR6ListRequest,
  r6CommandError,
  r6Json,
  resolveR6TeamRequest,
  unavailableR6Request,
} from "@/modules/r6/http";
import { listAuthorizedContacts } from "@/modules/r6/queries";
import { buildProspectiveR6Resource } from "@/modules/r6/resources";

const schema = z.object({
  companyId: z.string().uuid().nullable().optional(),
  personId: z.string().uuid().nullable().optional(),
  title: z.string().trim().max(160).nullable().optional(),
  relationshipState: z.string().trim().max(80).nullable().optional(),
  preferredChannel: z.string().trim().max(80).nullable().optional(),
}).strict();

export async function GET(request: Request) {
  const query = parseR6ListRequest(request);
  if (!query) return invalidR6Request();

  const resolved = await resolveR6TeamRequest(request);
  if (resolved.kind === "response") return resolved.response;

  try {
    return r6Json(await listAuthorizedContacts(resolved.context, query.limit));
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
    permissionKey: "contact.edit",
    resource: buildProspectiveR6Resource(
      resolved.context,
      "contact",
      "PII",
      "ACTIVE",
    ),
    command: {
      action: "create",
      requestedFields: Object.keys(input),
    },
  });
  if (authorization.kind === "response") return authorization.response;

  const result = await createContact(resolved.context, input);
  if (result.kind === "error") return r6CommandError(result.code);
  return r6Json({ contact: result.value }, 201);
}
