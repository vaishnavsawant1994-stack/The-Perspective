import { z } from "zod";

import { parseAuthenticationJson, requireSameOrigin } from "@/modules/authentication/http/request-security";
import { authorizeTrustedHttpOperation, authorizationProblem } from "@/modules/authorization/http";
import { createInvoiceDraft } from "@/modules/r7/invoice-draft";
import {
  invalidR7Request,
  parseR7ListRequest,
  r7CommandError,
  r7Json,
  resolveR7TeamRequest,
  unavailableR7Request,
} from "@/modules/r7/http";
import { listAuthorizedInvoices } from "@/modules/r7/queries";
import { buildProspectiveR7InvoiceResource } from "@/modules/r7/resources";

const createInvoiceSchema = z.object({
  contractId: z.string().uuid(),
  expectedContractVersionId: z.string().uuid(),
  expectedContractVersion: z.number().int().positive(),
}).strict();

const IDEMPOTENCY_KEY = /^[A-Za-z0-9._:-]{8,128}$/u;

export async function GET(request: Request) {
  const query = parseR7ListRequest(request);
  if (!query) return invalidR7Request();
  const resolved = await resolveR7TeamRequest(request);
  if (resolved.kind === "response") return resolved.response;
  try {
    const invoices = await listAuthorizedInvoices(resolved.context, query.limit);
    return r7Json({ invoices });
  } catch {
    return unavailableR7Request();
  }
}

export async function POST(request: Request) {
  if (!requireSameOrigin(request)) return authorizationProblem(403, "AUTHZ_DENIED");
  const idempotencyKey = request.headers.get("idempotency-key")?.trim();
  if (!idempotencyKey || !IDEMPOTENCY_KEY.test(idempotencyKey)) return invalidR7Request();
  const input = await parseAuthenticationJson(request, createInvoiceSchema);
  if (!input) return invalidR7Request();

  const resolved = await resolveR7TeamRequest(request);
  if (resolved.kind === "response") return resolved.response;
  const resource = buildProspectiveR7InvoiceResource(resolved.context);
  if (!resource) return authorizationProblem(403, "AUTHZ_DENIED");

  const authorization = await authorizeTrustedHttpOperation({
    context: resolved.context,
    permissionKey: "invoice.edit",
    resource,
    command: {
      action: "create",
      requestedFields: ["contractId", "expectedContractVersionId", "expectedContractVersion"],
    },
  });
  if (authorization.kind === "response") return authorization.response;

  try {
    const result = await createInvoiceDraft(resolved.context, {
      contractId: input.contractId,
      expectedContractVersionId: input.expectedContractVersionId,
      expectedContractVersion: input.expectedContractVersion,
      idempotencyKey,
    });
    if (result.kind === "error") {
      return result.code === "NOT_FOUND"
        ? authorizationProblem(404, "AUTHZ_NOT_FOUND")
        : r7CommandError(result.code);
    }
    return r7Json({ invoice: result.value }, result.value.replayed ? 200 : 201);
  } catch {
    return unavailableR7Request();
  }
}
