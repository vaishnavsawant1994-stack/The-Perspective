import "server-only";

import { randomUUID } from "node:crypto";

import {
  AuditActorType,
  type Prisma,
  type PrismaClient,
} from "@/generated/prisma/client";
import type { AuthorizedRequestContext } from "@/modules/foundation/request-context";
import { getPrismaClient } from "@/modules/persistence/client";

import { getPermissionDefinition, type CanonicalPermissionKey } from "./registry";
import type {
  AuthorizationCommandContext,
  AuthorizationDecision,
  AuthorizationResourceContext,
} from "./types";

type DatabaseClient = PrismaClient | Prisma.TransactionClient;

export interface AuthorizationTelemetry {
  readonly requestId: string;
  readonly organizationId: string;
  readonly actorUserId: string;
  readonly actorMembershipId: string;
  readonly surface: "TEAM" | "CLIENT";
  readonly permissionKey: CanonicalPermissionKey;
  readonly action: string;
  readonly decision: "ALLOW" | "DENY";
  readonly reasonCode: AuthorizationDecision<CanonicalPermissionKey>["reasonCode"];
  readonly risk: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  readonly effectiveScope?: string;
  readonly resourceType?: string;
  readonly resourceId?: string;
  readonly persisted: boolean;
}

function safeReason(command: AuthorizationCommandContext) {
  const reason = command.reason?.trim();
  if (!reason) return undefined;
  return reason.slice(0, 500);
}

function shouldPersistDeniedDecision(
  decision: AuthorizationDecision<CanonicalPermissionKey>,
) {
  const definition = getPermissionDefinition(decision.permissionKey);

  return (
    definition.risk === "HIGH" ||
    definition.risk === "CRITICAL" ||
    decision.reasonCode === "POLICY_INVALID" ||
    decision.reasonCode === "SEPARATION_OF_DUTY_DENIED"
  );
}

function shouldPersistCompletedAllow(
  decision: AuthorizationDecision<CanonicalPermissionKey>,
) {
  if (decision.decision !== "ALLOW") return false;

  const definition = getPermissionDefinition(decision.permissionKey);

  return (
    definition.risk === "HIGH" ||
    definition.risk === "CRITICAL" ||
    decision.obligations.includes("audit")
  );
}

function telemetryFor(
  context: AuthorizedRequestContext,
  decision: AuthorizationDecision<CanonicalPermissionKey>,
  resource: AuthorizationResourceContext | undefined,
  command: AuthorizationCommandContext,
  persisted: boolean,
): AuthorizationTelemetry {
  return {
    requestId: context.requestId,
    organizationId: context.tenant.organizationId,
    actorUserId: context.identity.userId,
    actorMembershipId: context.membership.membershipId,
    surface: context.tenant.surface,
    permissionKey: decision.permissionKey,
    action: command.action,
    decision: decision.decision,
    reasonCode: decision.reasonCode,
    risk: getPermissionDefinition(decision.permissionKey).risk,
    effectiveScope: decision.effectiveScope,
    resourceType: resource?.resourceType,
    resourceId: resource?.resourceId,
    persisted,
  };
}

async function persistEvidence(
  context: AuthorizedRequestContext,
  decision: AuthorizationDecision<CanonicalPermissionKey>,
  resource: AuthorizationResourceContext | undefined,
  command: AuthorizationCommandContext,
  database: DatabaseClient,
  occurredAt: Date,
  phase: "DENIED" | "COMPLETED",
  persistedResourceId?: string,
) {
  const definition = getPermissionDefinition(decision.permissionKey);

  await database.auditEvent.create({
    data: {
      id: randomUUID(),
      ownerOrganizationId: context.tenant.organizationId,
      targetResourceId: persistedResourceId,
      actorType: AuditActorType.USER,
      actorUserId: context.identity.userId,
      actorMembershipId: context.membership.membershipId,
      action: `authorization.${phase.toLowerCase()}.${decision.permissionKey}`,
      requestId: context.requestId,
      reason: safeReason(command) ?? decision.reasonCode,
      redactedDiff: {
        authorization: {
          phase,
          permissionKey: decision.permissionKey,
          requestedAction: command.action,
          decision: decision.decision,
          reasonCode: decision.reasonCode,
          risk: definition.risk,
          surface: context.tenant.surface,
          effectiveScope: decision.effectiveScope ?? null,
          resourceType: resource?.resourceType ?? null,
          resourceId: resource?.resourceId ?? null,
        },
      } satisfies Prisma.InputJsonObject,
      occurredAt,
    },
  });
}

/**
 * Produces structured telemetry for every deny. HIGH/CRITICAL and policy-integrity
 * denials are additionally persisted as durable audit evidence.
 */
export async function recordDeniedAuthorizationEvidence(
  context: AuthorizedRequestContext,
  decision: AuthorizationDecision<CanonicalPermissionKey>,
  resource: AuthorizationResourceContext | undefined,
  command: AuthorizationCommandContext,
  options: {
    readonly database?: DatabaseClient;
    readonly occurredAt?: Date;
    /**
     * Set only when this is a real platform.Resource id. IAM ids are not valid
     * AuditEvent.targetResourceId foreign keys.
     */
    readonly persistedResourceId?: string;
  } = {},
): Promise<AuthorizationTelemetry> {
  if (decision.decision !== "DENY") {
    throw new Error("Denied authorization evidence requires a DENY decision.");
  }

  const persist = shouldPersistDeniedDecision(decision);

  if (persist) {
    await persistEvidence(
      context,
      decision,
      resource,
      command,
      options.database ?? getPrismaClient(),
      options.occurredAt ?? new Date(),
      "DENIED",
      options.persistedResourceId,
    );
  }

  return telemetryFor(context, decision, resource, command, persist);
}

/**
 * Call only after the protected side effect has committed successfully.
 * This prevents an authorization preflight from being mistaken for action success.
 */
export async function recordCompletedAuthorizedActionEvidence(
  context: AuthorizedRequestContext,
  decision: AuthorizationDecision<CanonicalPermissionKey>,
  resource: AuthorizationResourceContext | undefined,
  command: AuthorizationCommandContext,
  options: {
    readonly database?: DatabaseClient;
    readonly occurredAt?: Date;
    readonly persistedResourceId?: string;
  } = {},
): Promise<AuthorizationTelemetry> {
  if (decision.decision !== "ALLOW") {
    throw new Error("Completed authorization evidence requires an ALLOW decision.");
  }

  const persist = shouldPersistCompletedAllow(decision);

  if (persist) {
    await persistEvidence(
      context,
      decision,
      resource,
      command,
      options.database ?? getPrismaClient(),
      options.occurredAt ?? new Date(),
      "COMPLETED",
      options.persistedResourceId,
    );
  }

  return telemetryFor(context, decision, resource, command, persist);
}
