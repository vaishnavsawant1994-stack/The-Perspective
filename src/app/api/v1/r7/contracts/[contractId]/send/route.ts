import { z } from "zod";

import { authorizeTrustedHttpOperation, authorizationProblem } from "@/modules/authorization/http";
import { parseAuthenticationJson, requireSameOrigin } from "@/modules/authentication/http/request-security";
import { invalidR7Request, r7CommandError, r7Json, resolveR7TeamRequest, unavailableR7Request } from "@/modules/r7/http";
import { loadR7ContractResource } from "@/modules/r7/resources";
import { requestContractSignature } from "@/modules/r7/signature-request";

const uuid = z.string().uuid();
const sendSchema = z.object({
  expectedVersionId: uuid,
  expectedVersion: z.number().int().positive(),
  expectedRowVersion: z.number().int().positive(),
  expectedDocumentSha256: z.string().regex(/^[0-9a-f]{64}$/u),
}).strict();

export async function POST(
  request: Request,
  route: { params: Promise<{ contractId: string }> },
) {
  if (!requireSameOrigin(request)) return authorizationProblem(403, "AUTHZ_DENIED");
  const idempotencyKey = request.headers.get("idempotency-key")?.trim();
  if (!idempotencyKey || idempotencyKey.length < 8 || idempotencyKey.length > 128 ||
      !/^[A-Za-z0-9._:-]+$/u.test(idempotencyKey)) return invalidR7Request();
  const input = await parseAuthenticationJson(request, sendSchema);
  if (!input) return invalidR7Request();

  const { contractId } = await route.params;
  if (!uuid.safeParse(contractId).success) return invalidR7Request();
  const resolved = await resolveR7TeamRequest(request);
  if (resolved.kind === "response") return resolved.response;

  try {
    const resource = await loadR7ContractResource(resolved.context, contractId);
    if (!resource) return authorizationProblem(404, "AUTHZ_NOT_FOUND");
    const lifecycleCanSend = resource.lifecycleState === "READY_FOR_SIGNATURE"
      || resource.lifecycleState === "OUT_FOR_SIGNATURE";
    const exactVersionMatches = resource.version === input.expectedRowVersion;
    const authorization = await authorizeTrustedHttpOperation({
      context: resolved.context,
      permissionKey: "contract.send",
      resource,
      command: {
        action: "send",
        workflowSatisfied: lifecycleCanSend,
        exactVersionMatches,
        optimisticConcurrencySatisfied: exactVersionMatches,
      },
      concealResource: true,
    });
    if (authorization.kind === "response") return authorization.response;
    if (!exactVersionMatches) return r7CommandError("STALE_WRITE");
    if (!lifecycleCanSend) return r7CommandError("TRANSITION_DENIED");

    const result = await requestContractSignature(resolved.context, {
      contractId,
      expectedVersionId: input.expectedVersionId,
      expectedVersion: input.expectedVersion,
      expectedRowVersion: input.expectedRowVersion,
      expectedDocumentSha256: input.expectedDocumentSha256,
      idempotencyKey,
    });
    if (result.kind === "error") {
      return result.code === "NOT_FOUND"
        ? authorizationProblem(404, "AUTHZ_NOT_FOUND")
        : r7CommandError(result.code);
    }
    return r7Json({ signatureRequest: result.value, delivery: "REQUESTED" }, 202);
  } catch {
    return unavailableR7Request();
  }
}
