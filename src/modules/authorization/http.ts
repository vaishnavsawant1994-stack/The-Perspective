import "server-only";

import { NextResponse } from "next/server";

import {
  getAuthenticationRequestMetadata,
} from "@/modules/authentication/http/request-security";
import { readSessionCookie } from "@/modules/authentication/http/session-cookie";
import { resolveAuthenticationRequestContext } from "@/modules/authentication/request-context";
import type { AuthenticationSurface } from "@/modules/authentication/types";
import type { AuthorizedRequestContext } from "@/modules/foundation/request-context";

import { recordDeniedAuthorizationEvidence } from "./audit";
import { evaluateAuthorization } from "./policy";
import { type CanonicalPermissionKey } from "./registry";
import { resolveAuthorizedRequestContext } from "./resolver";
import type {
  AuthorizationCommandContext,
  AuthorizationDecision,
  AuthorizationResourceContext,
} from "./types";

export interface AuthorizationHttpDependencies {
  readonly resolveAuthenticationContext?: typeof resolveAuthenticationRequestContext;
  readonly resolveAuthorizedContext?: typeof resolveAuthorizedRequestContext;
}

export type AuthorizedHttpRequestResult =
  | {
      readonly kind: "authorized";
      readonly context: AuthorizedRequestContext;
    }
  | {
      readonly kind: "response";
      readonly response: NextResponse;
    };

function problem(status: number, title: string, code: string) {
  return NextResponse.json(
    { type: "about:blank", title, status, code },
    {
      status,
      headers: {
        "Cache-Control": "no-store",
        "Content-Type": "application/problem+json",
      },
    },
  );
}

export function authorizationProblem(
  status: 401 | 403 | 404 | 503,
  code:
    | "AUTHZ_AUTH_REQUIRED"
    | "AUTHZ_TENANT_REQUIRED"
    | "AUTHZ_DENIED"
    | "AUTHZ_NOT_FOUND"
    | "AUTHZ_UNAVAILABLE",
) {
  switch (status) {
    case 401:
      return problem(status, "Authentication required.", code);
    case 404:
      return problem(status, "Resource not available.", code);
    case 503:
      return problem(status, "Authorization is unavailable.", code);
    default:
      return problem(status, "Request denied.", code);
  }
}

/**
 * Resolves the existing R3/R4 request context and promotes it to R5 authority
 * using current database state. It does not accept browser-supplied tenant,
 * role, permission or scope claims.
 */
export async function resolveAuthorizedHttpRequest(
  request: Request,
  surface: AuthenticationSurface,
  dependencies: AuthorizationHttpDependencies = {},
): Promise<AuthorizedHttpRequestResult> {
  const metadata = getAuthenticationRequestMetadata(request);
  const resolveAuthenticationContext =
    dependencies.resolveAuthenticationContext ??
    resolveAuthenticationRequestContext;
  const resolveAuthorizedContext =
    dependencies.resolveAuthorizedContext ?? resolveAuthorizedRequestContext;

  try {
    const context = await resolveAuthenticationContext(
      metadata.correlationId,
      readSessionCookie(request),
      surface,
    );

    if (context.authentication !== "authenticated") {
      return {
        kind: "response",
        response: authorizationProblem(401, "AUTHZ_AUTH_REQUIRED"),
      };
    }

    if (context.scope === "identity-only") {
      return {
        kind: "response",
        response: authorizationProblem(403, "AUTHZ_TENANT_REQUIRED"),
      };
    }

    if (context.tenant.surface !== surface) {
      return {
        kind: "response",
        response: authorizationProblem(403, "AUTHZ_DENIED"),
      };
    }

    if (context.scope === "authorized") {
      return { kind: "authorized", context };
    }

    const resolved = await resolveAuthorizedContext(context);
    if (resolved.kind !== "authorized") {
      return {
        kind: "response",
        response: authorizationProblem(403, "AUTHZ_DENIED"),
      };
    }

    return {
      kind: "authorized",
      context: resolved.context,
    };
  } catch {
    return {
      kind: "response",
      response: authorizationProblem(503, "AUTHZ_UNAVAILABLE"),
    };
  }
}

export interface AuthorizationDecisionHttpOptions {
  /**
   * Use for object-level operations where revealing whether a target exists
   * would enable IDOR/resource enumeration.
   */
  readonly concealResource?: boolean;
}

export function authorizationDecisionProblem(
  decision: AuthorizationDecision<CanonicalPermissionKey>,
  options: AuthorizationDecisionHttpOptions = {},
) {
  if (decision.decision === "ALLOW") return undefined;

  if (
    options.concealResource &&
    [
      "PERMISSION_MISSING",
      "PERMISSION_DENIED",
      "SCOPE_DENIED",
      "RESOURCE_DENIED",
      "FIELD_DENIED",
      "CLIENT_PROJECTION_DENIED",
      "WORKFLOW_DENIED",
      "SEPARATION_OF_DUTY_DENIED",
      "OBLIGATION_REQUIRED",
      "POLICY_INVALID",
    ].includes(decision.reasonCode)
  ) {
    return authorizationProblem(404, "AUTHZ_NOT_FOUND");
  }

  return authorizationProblem(403, "AUTHZ_DENIED");
}

export async function authorizeTrustedHttpOperation(input: {
  readonly context: AuthorizedRequestContext;
  readonly permissionKey: CanonicalPermissionKey;
  readonly resource?: AuthorizationResourceContext;
  readonly command: AuthorizationCommandContext;
  readonly concealResource?: boolean;
}): Promise<
  | {
      readonly kind: "allowed";
      readonly decision: AuthorizationDecision<CanonicalPermissionKey> & {
        readonly decision: "ALLOW";
      };
    }
  | {
      readonly kind: "response";
      readonly decision: AuthorizationDecision<CanonicalPermissionKey> & {
        readonly decision: "DENY";
      };
      readonly response: NextResponse;
    }
> {
  const decision = evaluateAuthorization(
    input.context,
    input.permissionKey,
    input.resource,
    input.command,
  );

  if (decision.decision === "ALLOW") {
    return {
      kind: "allowed",
      decision,
    };
  }

  await recordDeniedAuthorizationEvidence(
    input.context,
    decision,
    input.resource,
    input.command,
  );

  return {
    kind: "response",
    decision,
    response:
      authorizationDecisionProblem(decision, {
        concealResource: input.concealResource,
      }) ?? authorizationProblem(403, "AUTHZ_DENIED"),
  };
}
