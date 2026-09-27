import { z } from "zod";

import { parseAuthenticationJson } from "@/modules/authentication/http/request-security";
import {
  authorizeR6Operation,
  r6DomainResponse,
  r6MutationOriginProblem,
  resolveR6TeamRequest,
} from "@/modules/authorization/r6-http";
import { createContact } from "@/modules/crm/core";

const schema = z.object({
  companyId: z.string().uuid().nullable().optional(),
  personId: z.string().uuid().nullable().optional(),
  title: z.string().trim().max(160).nullable().optional(),
  relationshipState: z.string().trim().max(80).nullable().optional(),
  preferredChannel: z.string().trim().max(80).nullable().optional(),
  emailOriginal: z.string().trim().email().max(320).nullable().optional(),
  emailNormalized: z.string().trim().email().max(320).nullable().optional(),
  phoneNormalized: z.string().trim().max(40).nullable().optional(),
}).strict();

export async function POST(request: Request) {
  const originProblem = r6MutationOriginProblem(request);
  if (originProblem) return originProblem;

  const input = await parseAuthenticationJson(request, schema);
  if (!input) return new Response(null, { status: 400 });

  const resolved = await resolveR6TeamRequest(request);
  if (resolved.kind === "response") return resolved.response;

  const authorization = await authorizeR6Operation({
    context: resolved.context,
    permissionKey: "contact.edit",
    resourceType: "contact",
    action: "create",
    requestedFields: Object.keys(input),
  });
  if (authorization.kind === "response") return authorization.response;

  return r6DomainResponse(await createContact(resolved.context, input), 201);
}
