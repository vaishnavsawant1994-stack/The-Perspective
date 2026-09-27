import "server-only";

import { NextResponse } from "next/server";

import { requireSameOrigin } from "@/modules/authentication/http/request-security";
import {
  authorizeTrustedHttpOperation,
  authorizationProblem,
  resolveAuthorizedHttpRequest,
} from "@/modules/authorization/http";
import {
  getR6FieldPolicy,
  type R6ActivePermissionKey,
  type R6AuthorizationResourceType,
} from "@/modules/authorization/r6-policy";
import type { AuthorizedRequestContext } from "@/modules/foundation/request-context";

type DomainResult<T> =
  | { readonly kind: "ok"; readonly value: T }
  | { readonly kind: "error"; readonly code: string };

export function r6MutationOriginProblem(request: Request) {
  return requireSameOrigin(request)
    ? undefined
    : authorizationProblem(403, "AUTHZ_DENIED");
}

export async function resolveR6TeamRequest(request: Request) {
  return resolveAuthorizedHttpRequest(request, "TEAM");
}

export async function authorizeR6Operation(input: {
  readonly context: AuthorizedRequestContext;
  readonly permissionKey: R6ActivePermissionKey;
  readonly resourceType: R6AuthorizationResourceType;
  readonly action: string;
  readonly resourceId?: string;
  readonly requestedFields?: readonly string[];
  readonly workflowSatisfied?: boolean;
  readonly reason?: string;
  readonly exactVersionMatches?: boolean;
  readonly optimisticConcurrencySatisfied?: boolean;
  readonly concealResource?: boolean;
}) {
  const fieldPolicy = getR6FieldPolicy(input.resourceType);
  if (!fieldPolicy) {
    return {
      kind: "response" as const,
      response: authorizationProblem(403, "AUTHZ_DENIED"),
    };
  }

  return authorizeTrustedHttpOperation({
    context: input.context,
    permissionKey: input.permissionKey,
    resource: {
      resourceId: input.resourceId,
      resourceType: input.resourceType,
      ownerOrganizationId: input.context.tenant.organizationId,
    },
    command: {
      action: input.action,
      requestedFields: input.requestedFields,
      fieldPolicy,
      workflowSatisfied: input.workflowSatisfied,
      reason: input.reason,
      exactVersionMatches: input.exactVersionMatches,
      optimisticConcurrencySatisfied: input.optimisticConcurrencySatisfied,
    },
    concealResource: input.concealResource,
  });
}

export function r6DomainResponse<T>(
  result: DomainResult<T>,
  successStatus = 200,
) {
  if (result.kind === "ok") {
    return NextResponse.json(
      { data: result.value },
      {
        status: successStatus,
        headers: { "Cache-Control": "no-store" },
      },
    );
  }

  const status =
    result.code === "NOT_FOUND"
      ? 404
      : result.code === "CONFLICT" ||
          result.code === "STALE_WRITE" ||
          result.code === "IDEMPOTENCY_CONFLICT"
        ? 409
        : result.code === "TEAM_REQUIRED"
          ? 403
          : 422;

  return NextResponse.json(
    {
      type: "about:blank",
      title: status === 404 ? "Resource not available." : "Operation rejected.",
      status,
      code: "R6_OPERATION_REJECTED",
    },
    {
      status,
      headers: {
        "Cache-Control": "no-store",
        "Content-Type": "application/problem+json",
      },
    },
  );
}
