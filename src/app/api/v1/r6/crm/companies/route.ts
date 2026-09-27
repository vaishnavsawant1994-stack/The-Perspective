import { z } from "zod";

import { authorizeTrustedHttpOperation } from "@/modules/authorization/http";
import { createCompany } from "@/modules/crm/core";
import { resolveR6Mutation, r6DomainResult } from "@/modules/r6-api/http";

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
  const resolved = await resolveR6Mutation(request, schema);
  if (resolved.kind === "response") return resolved.response;

  const authorization = await authorizeTrustedHttpOperation({
    context: resolved.context,
    permissionKey: "company.edit",
    resource: {
      resourceType: "company",
      ownerOrganizationId: resolved.context.tenant.organizationId,
    },
    command: {
      action: "create",
      requestedFields: Object.keys(resolved.input),
    },
  });
  if (authorization.kind === "response") return authorization.response;

  return r6DomainResult(await createCompany(resolved.context, resolved.input));
}
