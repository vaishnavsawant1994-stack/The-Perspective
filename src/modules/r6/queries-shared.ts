import "server-only";

import type { PrismaClient } from "@/generated/prisma/client";
import type { AuthorizedRequestContext } from "@/modules/foundation/request-context";
import { evaluateAuthorization } from "@/modules/authorization/policy";
import type { AuthorizationResourceContext } from "@/modules/authorization/types";
import { getPrismaClient } from "@/modules/persistence/client";

export const OVERFETCH_FACTOR = 4;

export function projectR6ReadableFields<T extends Readonly<Record<string, unknown>>>(
  value: T,
  readableFields: readonly string[],
) {
  const allowed = new Set(readableFields);
  return Object.fromEntries(
    Object.entries(value).filter(([field]) => allowed.has(field)),
  ) as Partial<T>;
}

export function authorizedReadableFields(
  context: AuthorizedRequestContext,
  permissionKey:
    | "lead.view"
    | "company.view"
    | "contact.view"
    | "lead.discover"
    | "campaign.view"
    | "emailaccount.manage"
    | "sequence.manage"
    | "inbox.view"
    | "reply.view"
    | "message.read"
    | "meeting.view"
    | "deal.view"
    | "client.view"
    | "deal.manage"
    | "client.contact.manage",
  resource: AuthorizationResourceContext,
  requestedFields: readonly string[],
  action: "list" | "view" | "discover" | "manage" | "update" = "list",
) {
  const decision = evaluateAuthorization(context, permissionKey, resource, {
    action,
    requestedFields,
  });
  return decision.decision === "ALLOW" ? decision.readableFields ?? [] : undefined;
}

export function commonResource(input: {
  readonly resourceId: string;
  readonly resourceType: string;
  readonly ownerOrganizationId: string;
  readonly departmentId: string | null;
  readonly ownerMembershipId: string | null;
  readonly visibility: string;
  readonly sensitivity: string;
  readonly lifecycleState: string;
  readonly version: number;
}): AuthorizationResourceContext {
  return {
    resourceId: input.resourceId,
    resourceType: input.resourceType,
    ownerOrganizationId: input.ownerOrganizationId,
    departmentId: input.departmentId,
    ownerMembershipId: input.ownerMembershipId,
    visibility: input.visibility as AuthorizationResourceContext["visibility"],
    sensitivity: input.sensitivity as AuthorizationResourceContext["sensitivity"],
    lifecycleState: input.lifecycleState,
    version: input.version,
  };
}
