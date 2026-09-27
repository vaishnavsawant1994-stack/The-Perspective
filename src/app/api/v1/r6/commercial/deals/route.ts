import { z } from "zod";

import { authorizeTrustedHttpOperation } from "@/modules/authorization/http";
import { createDeal } from "@/modules/commercial/core";
import { resolveR6Mutation, r6DomainResult } from "@/modules/r6-api/http";

const schema = z.object({
  pipelineId: z.string().uuid(),
  companyId: z.string().uuid().nullable().optional(),
  primaryContactId: z.string().uuid().nullable().optional(),
  sourceLeadId: z.string().uuid().nullable().optional(),
  amountMinor: z.string().regex(/^\d{1,18}$/u).nullable().optional(),
  currency: z.string().trim().regex(/^[A-Z]{3}$/u).nullable().optional(),
  probability: z.number().int().min(0).max(100).nullable().optional(),
  expectedCloseDate: z.string().datetime({ offset: true }).nullable().optional(),
}).strict();

export async function POST(request: Request) {
  const resolved = await resolveR6Mutation(request, schema);
  if (resolved.kind === "response") return resolved.response;

  const input = {
    ...resolved.input,
    amountMinor: resolved.input.amountMinor == null ? resolved.input.amountMinor : BigInt(resolved.input.amountMinor),
    expectedCloseDate: resolved.input.expectedCloseDate == null ? resolved.input.expectedCloseDate : new Date(resolved.input.expectedCloseDate),
  };

  const authorization = await authorizeTrustedHttpOperation({
    context: resolved.context,
    permissionKey: "deal.edit",
    resource: {
      resourceType: "deal",
      ownerOrganizationId: resolved.context.tenant.organizationId,
    },
    command: {
      action: "create",
      requestedFields: Object.keys(resolved.input),
    },
  });
  if (authorization.kind === "response") return authorization.response;

  return r6DomainResult(await createDeal(resolved.context, input));
}
