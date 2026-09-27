import { z } from "zod";

import { parseAuthenticationJson } from "@/modules/authentication/http/request-security";
import {
  authorizeR6Operation,
  r6DomainResponse,
  r6MutationOriginProblem,
  resolveR6TeamRequest,
} from "@/modules/authorization/r6-http";
import { createCompany } from "@/modules/crm/core";

const schema = z.object({
  name: z.string().trim().min(1).max(200),
  legalName: z.string().trim().max(200).nullable().optional(),
  domain: z.string().trim().max(253).nullable().optional(),
  website: z.string().trim().url().max(2048).nullable().optional(),
  industry: z.string().trim().max(120).nullable().optional(),
  sizeBand: z.string().trim().max(80).nullable().optional(),
  revenueBand: z.string().trim().max(80).nullable().optional(),
  country: z.string().trim().max(120).nullable().optional(),
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
    permissionKey: "company.edit",
    resourceType: "company",
    action: "create",
    requestedFields: Object.keys(input),
  });
  if (authorization.kind === "response") return authorization.response;

  return r6DomainResponse(await createCompany(resolved.context, input), 201);
}
