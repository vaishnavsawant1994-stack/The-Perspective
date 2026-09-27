import { z } from "zod";

import {
  parseAuthenticationJson,
  requireSameOrigin,
} from "@/modules/authentication/http/request-security";
import {
  authorizeTrustedHttpOperation,
  authorizationProblem,
} from "@/modules/authorization/http";
import { updateDealFields } from "@/modules/commercial/core";
import {
  invalidR6Request,
  r6CommandError,
  r6Json,
  resolveR6TeamRequest,
} from "@/modules/r6/http";
import { loadR6DealResource } from "@/modules/r6/resources";

const moneySchema = z.union([
  z.string().regex(/^\d+$/u),
  z.number().int().nonnegative().safe(),
]).nullable().optional();

const schema = z.object({
  expectedRowVersion: z.number().int().positive(),
  amountMinor: moneySchema,
  currency: z.string().trim().regex(/^[A-Z]{3}$/u).nullable().optional(),
  probability: z.number().min(0).max(1).nullable().optional(),
  expectedCloseDate: z.string().datetime({ offset: true }).nullable().optional(),
}).strict().refine(
  (value) =>
    value.amountMinor !== undefined ||
    value.currency !== undefined ||
    value.probability !== undefined ||
    value.expectedCloseDate !== undefined,
  { message: "At least one mutable deal field is required." },
);

export async function PATCH(
  request: Request,
  route: { params: Promise<{ dealId: string }> },
) {
  if (!requireSameOrigin(request)) {
    return authorizationProblem(403, "AUTHZ_DENIED");
  }
  const input = await parseAuthenticationJson(request, schema);
  if (!input) return invalidR6Request();

  const resolved = await resolveR6TeamRequest(request);
  if (resolved.kind === "response") return resolved.response;
  const { dealId } = await route.params;
  if (!z.string().uuid().safeParse(dealId).success) return invalidR6Request();

  const resource = await loadR6DealResource(resolved.context, dealId);
  if (!resource) return authorizationProblem(404, "AUTHZ_NOT_FOUND");

  const requestedFields = ([
    "amountMinor",
    "currency",
    "probability",
    "expectedCloseDate",
  ] as const).filter((field) => input[field] !== undefined);
  const authorization = await authorizeTrustedHttpOperation({
    context: resolved.context,
    permissionKey: "deal.edit",
    resource,
    command: { action: "update", requestedFields },
    concealResource: true,
  });
  if (authorization.kind === "response") return authorization.response;

  const result = await updateDealFields(resolved.context, {
    dealId,
    expectedRowVersion: input.expectedRowVersion,
    amountMinor:
      typeof input.amountMinor === "number"
        ? BigInt(input.amountMinor)
        : input.amountMinor == null
          ? input.amountMinor
          : BigInt(input.amountMinor),
    currency: input.currency,
    probability: input.probability,
    expectedCloseDate:
      input.expectedCloseDate === undefined
        ? undefined
        : input.expectedCloseDate === null
          ? null
          : new Date(input.expectedCloseDate),
  });
  if (result.kind === "error") return r6CommandError(result.code);
  return r6Json({ deal: result.value });
}
