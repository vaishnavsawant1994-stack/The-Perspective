import { z } from "zod";

import {
  parseAuthenticationJson,
  requireSameOrigin,
} from "@/modules/authentication/http/request-security";
import {
  authorizeTrustedHttpOperation,
  authorizationProblem,
} from "@/modules/authorization/http";
import { updateCompany } from "@/modules/crm/core";
import {
  r6Json,
  resolveR6TeamRequest,
  unavailableR6Request,
  invalidR6Request,
  r6CommandError,
} from "@/modules/r6/http";
import { getAuthorizedCompany } from "@/modules/r6/queries";
import { loadR6CompanyResource } from "@/modules/r6/resources";

const updateSchema = z.object({
  expectedRowVersion: z.number().int().positive(),
  name: z.string().trim().min(1).max(200).optional(),
  legalName: z.string().trim().max(200).nullable().optional(),
  domain: z.string().trim().max(253).nullable().optional(),
  website: z.string().trim().url().max(2048).nullable().optional(),
  industry: z.string().trim().max(120).nullable().optional(),
  sizeBand: z.string().trim().max(80).nullable().optional(),
  revenueBand: z.string().trim().max(80).nullable().optional(),
  country: z.string().trim().max(120).nullable().optional(),
}).strict().refine(
  (value) => [
    value.name,
    value.legalName,
    value.domain,
    value.website,
    value.industry,
    value.sizeBand,
    value.revenueBand,
    value.country,
  ].some((field) => field !== undefined),
  { message: "At least one mutable company field is required." },
);

export async function GET(
  request: Request,
  route: { params: Promise<{ companyId: string }> },
) {
  const { companyId } = await route.params;
  if (!z.string().uuid().safeParse(companyId).success) return invalidR6Request();

  const resolved = await resolveR6TeamRequest(request);
  if (resolved.kind === "response") return resolved.response;

  try {
    const company = await getAuthorizedCompany(resolved.context, companyId);
    if (!company) return authorizationProblem(404, "AUTHZ_NOT_FOUND");
    return r6Json({ company });
  } catch {
    return unavailableR6Request();
  }
}

export async function PATCH(
  request: Request,
  route: { params: Promise<{ companyId: string }> },
) {
  if (!requireSameOrigin(request)) {
    return authorizationProblem(403, "AUTHZ_DENIED");
  }

  const input = await parseAuthenticationJson(request, updateSchema);
  if (!input) return invalidR6Request();

  const resolved = await resolveR6TeamRequest(request);
  if (resolved.kind === "response") return resolved.response;

  const { companyId } = await route.params;
  if (!z.string().uuid().safeParse(companyId).success) return invalidR6Request();

  const resource = await loadR6CompanyResource(resolved.context, companyId);
  if (!resource) return authorizationProblem(404, "AUTHZ_NOT_FOUND");

  const requestedFields = ([
    "name",
    "legalName",
    "domain",
    "website",
    "industry",
    "sizeBand",
    "revenueBand",
    "country",
  ] as const).filter((field) => input[field] !== undefined);

  const authorization = await authorizeTrustedHttpOperation({
    context: resolved.context,
    permissionKey: "company.edit",
    resource,
    command: {
      action: "update",
      requestedFields,
    },
    concealResource: true,
  });
  if (authorization.kind === "response") return authorization.response;

  const result = await updateCompany(resolved.context, {
    companyId,
    ...input,
  });
  if (result.kind === "error") return r6CommandError(result.code);
  return r6Json({ company: result.value });
}
