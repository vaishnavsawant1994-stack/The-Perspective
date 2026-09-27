import { z } from "zod";

import {
  parseAuthenticationJson,
  requireSameOrigin,
} from "@/modules/authentication/http/request-security";
import {
  authorizeTrustedHttpOperation,
  authorizationProblem,
} from "@/modules/authorization/http";
import { createCompany } from "@/modules/crm/core";
import {
  invalidR6Request,
  r6CommandError,
  r6Json,
  resolveR6TeamRequest,
} from "@/modules/r6/http";
import { buildProspectiveR6Resource } from "@/modules/r6/resources";

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
  if (!requireSameOrigin(request)) {
    return authorizationProblem(403, "AUTHZ_DENIED");
  }

  const input = await parseAuthenticationJson(request, schema);
  if (!input) return invalidR6Request();

  const resolved = await resolveR6TeamRequest(request);
  if (resolved.kind === "response") return resolved.response;

  const authorization = await authorizeTrustedHttpOperation({
    context: resolved.context,
    permissionKey: "company.edit",
    resource: buildProspectiveR6Resource(
      resolved.context,
      "company",
      "STANDARD",
      "ACTIVE",
    ),
    command: {
      action: "create",
      requestedFields: Object.keys(input),
    },
  });
  if (authorization.kind === "response") return authorization.response;

  const result = await createCompany(resolved.context, input);
  if (result.kind === "error") return r6CommandError(result.code);
  return r6Json({ company: result.value }, 201);
}
