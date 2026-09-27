import { z } from "zod";

import {
  parseAuthenticationJson,
  requireSameOrigin,
} from "@/modules/authentication/http/request-security";
import {
  authorizeTrustedHttpOperation,
  authorizationProblem,
} from "@/modules/authorization/http";
import {
  addLeadListMember,
  removeLeadListMember,
} from "@/modules/crm/core";
import {
  invalidR6Request,
  r6CommandError,
  r6Json,
  resolveR6TeamRequest,
} from "@/modules/r6/http";
import { loadR6LeadListResource } from "@/modules/r6/resources";

const schema = z.object({
  leadId: z.string().uuid(),
}).strict();

async function command(
  request: Request,
  route: { params: Promise<{ leadListId: string }> },
  action: "add" | "remove",
) {
  if (!requireSameOrigin(request)) {
    return authorizationProblem(403, "AUTHZ_DENIED");
  }

  const input = await parseAuthenticationJson(request, schema);
  if (!input) return invalidR6Request();

  const resolved = await resolveR6TeamRequest(request);
  if (resolved.kind === "response") return resolved.response;

  const { leadListId } = await route.params;
  if (!z.string().uuid().safeParse(leadListId).success) {
    return invalidR6Request();
  }

  const resource = await loadR6LeadListResource(
    resolved.context,
    leadListId,
  );
  if (!resource) return authorizationProblem(404, "AUTHZ_NOT_FOUND");

  const authorization = await authorizeTrustedHttpOperation({
    context: resolved.context,
    permissionKey: "lead.list.manage",
    resource,
    command: {
      action,
      requestedFields: Object.keys(input),
    },
    concealResource: true,
  });
  if (authorization.kind === "response") return authorization.response;

  const result =
    action === "add"
      ? await addLeadListMember(resolved.context, {
          leadListId,
          leadId: input.leadId,
        })
      : await removeLeadListMember(resolved.context, {
          leadListId,
          leadId: input.leadId,
        });

  if (result.kind === "error") return r6CommandError(result.code);
  return r6Json({ membership: result.value });
}

export async function POST(
  request: Request,
  route: { params: Promise<{ leadListId: string }> },
) {
  return command(request, route, "add");
}

export async function DELETE(
  request: Request,
  route: { params: Promise<{ leadListId: string }> },
) {
  return command(request, route, "remove");
}
