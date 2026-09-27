import { z } from "zod";

import { parseAuthenticationJson } from "@/modules/authentication/http/request-security";
import {
  authorizeR6Operation,
  r6DomainResponse,
  r6MutationOriginProblem,
  resolveR6TeamRequest,
} from "@/modules/authorization/r6-http";
import { createLead } from "@/modules/crm/core";

const schema = z.object({
  companyId: z.string().uuid().nullable().optional(),
  contactId: z.string().uuid().nullable().optional(),
  leadSourceId: z.string().uuid().nullable().optional(),
  sourceRecordKey: z.string().trim().max(255).nullable().optional(),
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
    permissionKey: "lead.edit",
    resourceType: "lead",
    action: "create",
    requestedFields: ["companyId", "contactId", "leadSourceId"],
  });
  if (authorization.kind === "response") return authorization.response;

  return r6DomainResponse(await createLead(resolved.context, input), 201);
}
