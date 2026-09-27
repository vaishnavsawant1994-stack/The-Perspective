import { z } from "zod";

import {
  parseAuthenticationJson,
  requireSameOrigin,
} from "@/modules/authentication/http/request-security";
import {
  authorizeTrustedHttpOperation,
  authorizationProblem,
} from "@/modules/authorization/http";
import { createDeal } from "@/modules/commercial/core";
import {
  invalidR6Request,
  parseR6ListRequest,
  r6CommandError,
  r6Json,
  resolveR6TeamRequest,
  unavailableR6Request,
} from "@/modules/r6/http";
import { listAuthorizedDeals } from "@/modules/r6/queries";
import { buildProspectiveR6Resource } from "@/modules/r6/resources";

const moneySchema = z.union([
  z.string().regex(/^\d+$/u),
  z.number().int().nonnegative().safe(),
]).nullable().optional();

const createDealSchema = z.object({
  pipelineId: z.string().uuid(),
  companyId: z.string().uuid(),
  primaryContactId: z.string().uuid().nullable().optional(),
  amountMinor: moneySchema,
  currency: z.string().trim().regex(/^[A-Z]{3}$/u).nullable().optional(),
  probability: z.number().min(0).max(1).nullable().optional(),
  expectedCloseDate: z.string().datetime({ offset: true }).nullable().optional(),
}).strict();

export async function GET(request: Request) {
  const query = parseR6ListRequest(request);
  if (!query) return invalidR6Request();

  const resolved = await resolveR6TeamRequest(request);
  if (resolved.kind === "response") return resolved.response;

  try {
    return r6Json(await listAuthorizedDeals(resolved.context, query.limit));
  } catch {
    return unavailableR6Request();
  }
}

export async function POST(request: Request) {
  if (!requireSameOrigin(request)) {
    return authorizationProblem(403, "AUTHZ_DENIED");
  }
  const input = await parseAuthenticationJson(request, createDealSchema);
  if (!input) return invalidR6Request();

  const resolved = await resolveR6TeamRequest(request);
  if (resolved.kind === "response") return resolved.response;

  const requestedFields = [
    // pipelineId is browser-supplied and therefore must be evaluated against
    // the canonical field policy rather than silently treated as trusted.
    "pipelineId",
    "companyId",
    ...(input.primaryContactId !== undefined ? ["primaryContactId"] : []),
    ...(input.amountMinor !== undefined ? ["amountMinor"] : []),
    ...(input.currency !== undefined ? ["currency"] : []),
    ...(input.probability !== undefined ? ["probability"] : []),
    ...(input.expectedCloseDate !== undefined ? ["expectedCloseDate"] : []),
  ];
  const authorization = await authorizeTrustedHttpOperation({
    context: resolved.context,
    permissionKey: "deal.edit",
    resource: buildProspectiveR6Resource(
      resolved.context,
      "deal",
      "FINANCIAL",
      "ACTIVE",
    ),
    command: { action: "create", requestedFields },
  });
  if (authorization.kind === "response") return authorization.response;

  const result = await createDeal(resolved.context, {
    pipelineId: input.pipelineId,
    companyId: input.companyId,
    primaryContactId: input.primaryContactId,
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
  return r6Json({ deal: result.value }, 201);
}
