import "server-only";

import { createHash, randomUUID } from "node:crypto";

import {
  AuditActorType,
  MembershipStatus,
  MembershipType,
  PermissionEffect,
  Prisma,
  type PrismaClient,
  RecordStatus,
  RoleScope,
} from "@/generated/prisma/client";
import type {
  AuthorizedRequestContext,
  TenantScopedRequestContext,
} from "@/modules/foundation/request-context";
import { getPrismaClient } from "@/modules/persistence/client";

import {
  recordCompletedAuthorizedActionEvidence,
  recordDeniedAuthorizationEvidence,
} from "./audit";
import {
  assessLaunchRoleAssignment,
  assessRolePermissionSetMutation,
} from "./administration-policy";
import { parseRolePermissionConstraints } from "./constraints";
import { getR5FieldPolicy } from "./fields";
import {
  getLaunchRoleDefinition,
  isLaunchRoleCode,
  PROTECTED_PERMISSION_KEYS,
  ROLE_DELEGATION_CEILINGS,
} from "./launch-roles";
import { evaluateAuthorization } from "./policy";
import {
  getPermissionDefinition,
  isCanonicalPermissionKey,
  type CanonicalPermissionKey,
} from "./registry";
import { resolveAuthorizedRequestContext } from "./resolver";
import type {
  AuthorizationCommandContext,
  AuthorizationDecision,
  AuthorizationResourceContext,
  AuthorizationScope,
  RolePermissionConstraints,
} from "./types";

const SENSITIVE_AUTH_MAX_AGE_MS = 10 * 60 * 1000;
const PROTECTED_PERMISSION_SET = new Set<CanonicalPermissionKey>(
  PROTECTED_PERMISSION_KEYS,
);

export type AuthorizationAdminErrorCode =
  | "DENIED"
  | "NOT_FOUND"
  | "CONFLICT"
  | "INVALID"
  | "SYSTEM_ROLE_IMMUTABLE"
  | "DELEGATION_CEILING"
  | "STALE_WRITE";

export type AuthorizationAdminResult<T> =
  | { readonly kind: "ok"; readonly value: T }
  | {
      readonly kind: "denied";
      readonly code: "DENIED";
      readonly decision: AuthorizationDecision<CanonicalPermissionKey>;
    }
  | {
      readonly kind: "error";
      readonly code: Exclude<AuthorizationAdminErrorCode, "DENIED">;
    };

export interface RolePermissionMutation {
  readonly permissionKey: string;
  readonly effect: "ALLOW" | "DENY";
  readonly constraints?: unknown;
}

export interface CreateCustomRoleInput {
  readonly key: string;
  readonly name: string;
  readonly description?: string | null;
  readonly defaultScope: AuthorizationScope;
  readonly reason: string;
}

export interface UpdateCustomRoleInput {
  readonly name?: string;
  readonly description?: string | null;
  readonly defaultScope?: AuthorizationScope;
  readonly status?: "ACTIVE" | "INACTIVE";
  readonly expectedUpdatedAt: Date;
  readonly reason: string;
}

export interface ReplaceRolePermissionsInput {
  readonly expectedPermissionsHash: string;
  readonly permissions: readonly RolePermissionMutation[];
  readonly reason: string;
}

export interface AssignMembershipRoleInput {
  readonly membershipId: string;
  readonly roleId: string;
  readonly scope: AuthorizationScope;
  readonly validUntil?: Date | null;
  readonly expectedMembershipUpdatedAt: Date;
  readonly reason: string;
}

export interface RevokeMembershipRoleInput {
  readonly membershipRoleId: string;
  readonly expectedCreatedAt: Date;
  readonly reason: string;
}

type RootDatabase = PrismaClient;

function tenantContext(
  context: AuthorizedRequestContext,
): TenantScopedRequestContext {
  return {
    authentication: "authenticated",
    scope: "tenant",
    requestId: context.requestId,
    identity: context.identity,
    session: context.session,
    membership: context.membership,
    tenant: context.tenant,
  };
}

function canonicalJson(value: unknown): string {
  if (value === undefined) return "null";

  if (Array.isArray(value)) {
    return `[${value.map((item) => canonicalJson(item)).join(",")}]`;
  }

  if (value && typeof value === "object" && !(value instanceof Date)) {
    const record = value as Record<string, unknown>;
    return `{${Object.keys(record)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${canonicalJson(record[key])}`)
      .join(",")}}`;
  }

  if (value instanceof Date) return JSON.stringify(value.toISOString());
  return JSON.stringify(value) ?? "null";
}

function fingerprint(value: unknown) {
  return createHash("sha256").update(canonicalJson(value)).digest("hex");
}

export function rolePermissionFingerprint(
  permissions: readonly {
    readonly permissionKey: string;
    readonly effect: string;
    readonly constraints: unknown;
  }[],
) {
  return fingerprint(
    [...permissions]
      .map((permission) => ({
        permissionKey: permission.permissionKey,
        effect: permission.effect,
        constraints: permission.constraints ?? {},
      }))
      .sort((left, right) =>
        left.permissionKey.localeCompare(right.permissionKey),
      ),
  );
}

function sessionControls(context: AuthorizedRequestContext, now: Date) {
  const recentAuthenticationSatisfied =
    now.getTime() - context.session.issuedAt.getTime() <=
    SENSITIVE_AUTH_MAX_AGE_MS;
  const mfaSatisfied = Boolean(
    context.session.mfaVerifiedAt &&
      now.getTime() - context.session.mfaVerifiedAt.getTime() <=
        SENSITIVE_AUTH_MAX_AGE_MS,
  );

  return { recentAuthenticationSatisfied, mfaSatisfied };
}

function actorAdminRole(context: AuthorizedRequestContext) {
  if (context.authorization.roleKeys.includes("R01")) return "R01" as const;
  if (context.authorization.roleKeys.includes("R02")) return "R02" as const;
  return undefined;
}

function canAdministerLaunchRole(
  context: AuthorizedRequestContext,
  roleKey: string,
) {
  const actorRole = actorAdminRole(context);
  if (!actorRole || !isLaunchRoleCode(roleKey)) return false;
  return (
    ROLE_DELEGATION_CEILINGS[actorRole].assignableLaunchRoles as readonly string[]
  ).includes(roleKey);
}

function canMutateCustomPermissions(
  context: AuthorizedRequestContext,
  permissionKeys: readonly CanonicalPermissionKey[],
) {
  const actorRole = actorAdminRole(context);
  if (!actorRole) return false;

  const ceiling = ROLE_DELEGATION_CEILINGS[actorRole];
  if (!ceiling.mayMutateRolePermissions) return false;

  if (
    actorRole === "R02" &&
    permissionKeys.some((permissionKey) =>
      PROTECTED_PERMISSION_SET.has(permissionKey),
    )
  ) {
    return false;
  }

  return true;
}

function adminCommand(
  context: AuthorizedRequestContext,
  now: Date,
  action: string,
  reason: string,
  input: {
    readonly fieldPolicyResource?: Parameters<typeof getR5FieldPolicy>[1];
    readonly requestedFields?: readonly string[];
    readonly delegationCeilingSatisfied: boolean;
    readonly optimisticConcurrencySatisfied: boolean;
  },
): AuthorizationCommandContext {
  const session = sessionControls(context, now);

  return {
    action,
    reason,
    workflowSatisfied: true,
    fieldPolicy: input.fieldPolicyResource
      ? getR5FieldPolicy("TEAM", input.fieldPolicyResource)
      : undefined,
    requestedFields: input.requestedFields,
    delegationCeilingSatisfied: input.delegationCeilingSatisfied,
    optimisticConcurrencySatisfied: input.optimisticConcurrencySatisfied,
    recentAuthenticationSatisfied: session.recentAuthenticationSatisfied,
    mfaSatisfied: session.mfaSatisfied,
    separationOfDutySatisfied: true,
    exactVersionMatches: input.optimisticConcurrencySatisfied,
  };
}

async function persistAdminMutation(
  transaction: Prisma.TransactionClient,
  context: AuthorizedRequestContext,
  input: {
    readonly action: string;
    readonly reason: string;
    readonly resourceId?: string;
    readonly resourceType: string;
    readonly before?: unknown;
    readonly after?: unknown;
  },
  now: Date,
) {
  await transaction.auditEvent.create({
    data: {
      id: randomUUID(),
      ownerOrganizationId: context.tenant.organizationId,
      actorType: AuditActorType.USER,
      actorUserId: context.identity.userId,
      actorMembershipId: context.membership.membershipId,
      action: input.action,
      requestId: context.requestId,
      reason: input.reason.trim().slice(0, 500),
      beforeHash:
        input.before === undefined ? undefined : fingerprint(input.before),
      afterHash:
        input.after === undefined ? undefined : fingerprint(input.after),
      redactedDiff: {
        authorizationAdmin: {
          resourceType: input.resourceType,
          resourceId: input.resourceId ?? null,
          beforePresent: input.before !== undefined,
          afterPresent: input.after !== undefined,
        },
      } satisfies Prisma.InputJsonObject,
      occurredAt: now,
    },
  });
}

async function authorizeInTransaction(
  transaction: Prisma.TransactionClient,
  originalContext: AuthorizedRequestContext,
  permissionKey: CanonicalPermissionKey,
  resource: AuthorizationResourceContext,
  buildCommand: (
    freshContext: AuthorizedRequestContext,
  ) => AuthorizationCommandContext,
  now: Date,
): Promise<
  | {
      readonly kind: "allowed";
      readonly context: AuthorizedRequestContext;
      readonly command: AuthorizationCommandContext;
      readonly decision: AuthorizationDecision<CanonicalPermissionKey> & {
        readonly decision: "ALLOW";
      };
    }
  | {
      readonly kind: "denied";
      readonly decision: AuthorizationDecision<CanonicalPermissionKey>;
    }
> {
  const refreshed = await resolveAuthorizedRequestContext(
    tenantContext(originalContext),
    transaction,
    now,
  );

  if (refreshed.kind !== "authorized") {
    const decision: AuthorizationDecision<CanonicalPermissionKey> = {
      decision: "DENY",
      reasonCode: "MEMBERSHIP_INACTIVE",
      permissionKey,
      obligations: [],
    };
    return { kind: "denied", decision };
  }

  const command = buildCommand(refreshed.context);
  const decision = evaluateAuthorization(
    refreshed.context,
    permissionKey,
    resource,
    command,
  );

  if (decision.decision !== "ALLOW") {
    await recordDeniedAuthorizationEvidence(
      refreshed.context,
      decision,
      resource,
      command,
      { database: transaction, occurredAt: now },
    );
    return { kind: "denied", decision };
  }

  return {
    kind: "allowed",
    context: refreshed.context,
    command,
    decision: decision as AuthorizationDecision<CanonicalPermissionKey> & {
      readonly decision: "ALLOW";
    },
  };
}

function roleResource(
  organizationId: string,
  roleId: string,
): AuthorizationResourceContext {
  return {
    resourceId: roleId,
    resourceType: "role",
    ownerOrganizationId: organizationId,
  };
}

function membershipRoleResource(
  organizationId: string,
  resourceId: string,
  targetMembershipId: string,
): AuthorizationResourceContext {
  return {
    resourceId,
    resourceType: "membership-role",
    ownerOrganizationId: organizationId,
    targetMembershipId,
  };
}

function validCustomTeamScope(scope: AuthorizationScope) {
  return scope !== "CLIENT";
}

function freshRolePermissionCeiling(
  context: AuthorizedRequestContext,
  roleKey: string,
  permissionKeys: readonly string[],
) {
  const policy = assessRolePermissionSetMutation({
    actorRoleKeys: context.authorization.roleKeys,
    targetRoleKey: roleKey,
    targetSurface: "TEAM",
    permissionKeys,
  });
  if (!policy.allowed) return false;

  const canonical = permissionKeys.filter(isCanonicalPermissionKey);
  return (
    canonical.length === permissionKeys.length &&
    canMutateCustomPermissions(context, canonical)
  );
}

function freshMembershipRoleAssignmentCeiling(
  context: AuthorizedRequestContext,
  input: {
    readonly targetMembershipId: string;
    readonly roleKey: string;
    readonly systemRole: boolean;
    readonly defaultScope: string;
    readonly permissionKeys: readonly string[];
    readonly scope: AuthorizationScope;
  },
) {
  if (context.membership.membershipId === input.targetMembershipId) {
    return false;
  }

  if (input.systemRole && isLaunchRoleCode(input.roleKey)) {
    if (input.roleKey === "R17") return false;

    return assessLaunchRoleAssignment({
      actorRoleKeys: context.authorization.roleKeys,
      actorMembershipId: context.membership.membershipId,
      targetMembershipId: input.targetMembershipId,
      targetRoleCode: input.roleKey,
      scope: input.scope,
    }).allowed;
  }

  if (
    input.systemRole ||
    input.defaultScope === "CLIENT" ||
    input.defaultScope !== input.scope
  ) {
    return false;
  }

  return freshRolePermissionCeiling(
    context,
    input.roleKey,
    input.permissionKeys,
  );
}

export async function listAuthorizationRoles(
  context: AuthorizedRequestContext,
  database: RootDatabase = getPrismaClient(),
) {
  return database.role.findMany({
    where: { organizationId: context.tenant.organizationId },
    select: {
      id: true,
      key: true,
      name: true,
      description: true,
      systemRole: true,
      defaultScope: true,
      status: true,
      updatedAt: true,
      _count: { select: { rolePermissions: true, membershipRoles: true } },
    },
    orderBy: [{ systemRole: "desc" }, { key: "asc" }],
  });
}

export async function createCustomAuthorizationRole(
  context: AuthorizedRequestContext,
  input: CreateCustomRoleInput,
  database: RootDatabase = getPrismaClient(),
  now = new Date(),
): Promise<AuthorizationAdminResult<{
  id: string;
  key: string;
  updatedAt: Date;
}>> {
  if (
    !/^custom-[a-z0-9][a-z0-9-]{2,63}$/u.test(input.key) ||
    isLaunchRoleCode(input.key) ||
    !validCustomTeamScope(input.defaultScope)
  ) {
    return { kind: "error", code: "INVALID" };
  }

  return database.$transaction(
    async (transaction) => {
      const resource = roleResource(
        context.tenant.organizationId,
        "new-custom-role",
      );
      const ceiling = Boolean(actorAdminRole(context));
      const command = adminCommand(context, now, "create", input.reason, {
        fieldPolicyResource: "role",
        requestedFields: ["name", "description", "defaultScope"],
        delegationCeilingSatisfied: ceiling,
        optimisticConcurrencySatisfied: true,
      });
      const authorization = await authorizeInTransaction(
        transaction,
        context,
        "role.manage",
        resource,
        command,
        now,
      );
      if (authorization.kind === "denied") {
        return {
          kind: "denied" as const,
          code: "DENIED" as const,
          decision: authorization.decision,
        };
      }

      const existing = await transaction.role.findFirst({
        where: {
          organizationId: context.tenant.organizationId,
          key: input.key,
        },
        select: { id: true },
      });
      if (existing) return { kind: "error" as const, code: "CONFLICT" as const };

      const role = await transaction.role.create({
        data: {
          id: randomUUID(),
          organizationId: context.tenant.organizationId,
          key: input.key,
          name: input.name,
          description: input.description ?? null,
          systemRole: false,
          defaultScope: input.defaultScope as RoleScope,
          status: RecordStatus.ACTIVE,
        },
        select: { id: true, key: true, updatedAt: true },
      });

      await persistAdminMutation(
        transaction,
        authorization.context,
        {
          action: "iam.role.created",
          reason: input.reason,
          resourceId: role.id,
          resourceType: "role",
          after: {
            key: role.key,
            name: input.name,
            defaultScope: input.defaultScope,
          },
        },
        now,
      );
      await recordCompletedAuthorizedActionEvidence(
        authorization.context,
        authorization.decision,
        { ...resource, resourceId: role.id },
        command,
        { database: transaction, occurredAt: now },
      );

      return { kind: "ok" as const, value: role };
    },
    { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
  );
}

export async function updateCustomAuthorizationRole(
  context: AuthorizedRequestContext,
  roleId: string,
  input: UpdateCustomRoleInput,
  database: RootDatabase = getPrismaClient(),
  now = new Date(),
): Promise<AuthorizationAdminResult<{ id: string; updatedAt: Date }>> {
  return database.$transaction(
    async (transaction) => {
      const role = await transaction.role.findFirst({
        where: {
          id: roleId,
          organizationId: context.tenant.organizationId,
        },
        select: {
          id: true,
          key: true,
          name: true,
          description: true,
          defaultScope: true,
          status: true,
          systemRole: true,
          updatedAt: true,
        },
      });
      if (!role) return { kind: "error" as const, code: "NOT_FOUND" as const };
      if (role.systemRole) {
        return {
          kind: "error" as const,
          code: "SYSTEM_ROLE_IMMUTABLE" as const,
        };
      }

      const concurrencyMatches =
        role.updatedAt.getTime() === input.expectedUpdatedAt.getTime();
      const command = adminCommand(context, now, "update", input.reason, {
        fieldPolicyResource: "role",
        requestedFields: [
          ...(input.name !== undefined ? ["name"] : []),
          ...(input.description !== undefined ? ["description"] : []),
          ...(input.defaultScope !== undefined ? ["defaultScope"] : []),
          ...(input.status !== undefined ? ["status"] : []),
        ],
        delegationCeilingSatisfied: Boolean(actorAdminRole(context)),
        optimisticConcurrencySatisfied: concurrencyMatches,
      });
      const resource = roleResource(context.tenant.organizationId, role.id);
      const authorization = await authorizeInTransaction(
        transaction,
        context,
        "role.manage",
        resource,
        command,
        now,
      );
      if (authorization.kind === "denied") {
        return {
          kind: "denied" as const,
          code: "DENIED" as const,
          decision: authorization.decision,
        };
      }
      if (!concurrencyMatches) {
        return { kind: "error" as const, code: "STALE_WRITE" as const };
      }
      if (
        input.defaultScope !== undefined &&
        !validCustomTeamScope(input.defaultScope)
      ) {
        return { kind: "error" as const, code: "INVALID" as const };
      }

      const before = {
        name: role.name,
        description: role.description,
        defaultScope: String(role.defaultScope),
        status: String(role.status),
      };

      const updated = await transaction.role.updateMany({
        where: {
          id: role.id,
          organizationId: context.tenant.organizationId,
          systemRole: false,
          updatedAt: input.expectedUpdatedAt,
        },
        data: {
          ...(input.name !== undefined ? { name: input.name } : {}),
          ...(input.description !== undefined
            ? { description: input.description }
            : {}),
          ...(input.defaultScope !== undefined
            ? { defaultScope: input.defaultScope as RoleScope }
            : {}),
          ...(input.status !== undefined
            ? { status: input.status as RecordStatus }
            : {}),
        },
      });
      if (updated.count !== 1) {
        return { kind: "error" as const, code: "STALE_WRITE" as const };
      }

      const current = await transaction.role.findUniqueOrThrow({
        where: { id: role.id },
        select: { id: true, name: true, description: true, defaultScope: true, status: true, updatedAt: true },
      });

      await persistAdminMutation(
        transaction,
        authorization.context,
        {
          action: "iam.role.updated",
          reason: input.reason,
          resourceId: role.id,
          resourceType: "role",
          before,
          after: {
            name: current.name,
            description: current.description,
            defaultScope: String(current.defaultScope),
            status: String(current.status),
          },
        },
        now,
      );
      await recordCompletedAuthorizedActionEvidence(
        authorization.context,
        authorization.decision,
        resource,
        command,
        { database: transaction, occurredAt: now },
      );

      return {
        kind: "ok" as const,
        value: { id: current.id, updatedAt: current.updatedAt },
      };
    },
    { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
  );
}

export async function readRolePermissions(
  context: AuthorizedRequestContext,
  roleId: string,
  database: RootDatabase = getPrismaClient(),
): Promise<
  AuthorizationAdminResult<{
    roleId: string;
    permissionsHash: string;
    permissions: readonly {
      permissionKey: string;
      effect: string;
      constraints: unknown;
    }[];
  }>
> {
  const role = await database.role.findFirst({
    where: { id: roleId, organizationId: context.tenant.organizationId },
    select: {
      id: true,
      rolePermissions: {
        select: {
          effect: true,
          constraints: true,
          permission: { select: { key: true } },
        },
      },
    },
  });
  if (!role) return { kind: "error", code: "NOT_FOUND" };

  const permissions = role.rolePermissions
    .map((edge) => ({
      permissionKey: edge.permission.key,
      effect: String(edge.effect),
      constraints: edge.constraints,
    }))
    .sort((left, right) => left.permissionKey.localeCompare(right.permissionKey));

  return {
    kind: "ok",
    value: {
      roleId: role.id,
      permissionsHash: rolePermissionFingerprint(permissions),
      permissions,
    },
  };
}

export async function replaceCustomRolePermissions(
  context: AuthorizedRequestContext,
  roleId: string,
  input: ReplaceRolePermissionsInput,
  database: RootDatabase = getPrismaClient(),
  now = new Date(),
): Promise<
  AuthorizationAdminResult<{ roleId: string; permissionsHash: string }>
> {
  const parsedPermissions: {
    permissionKey: CanonicalPermissionKey;
    effect: PermissionEffect;
    constraints: RolePermissionConstraints;
  }[] = [];
  const seen = new Set<string>();

  for (const requested of input.permissions) {
    if (
      !isCanonicalPermissionKey(requested.permissionKey) ||
      seen.has(requested.permissionKey)
    ) {
      return { kind: "error", code: "INVALID" };
    }
    seen.add(requested.permissionKey);

    const definition = getPermissionDefinition(requested.permissionKey);
    if (definition.assignability !== "TEAM_ROLE") {
      return { kind: "error", code: "INVALID" };
    }

    const constraints = parseRolePermissionConstraints(
      requested.constraints ?? {},
    );
    if (!constraints.valid) return { kind: "error", code: "INVALID" };

    parsedPermissions.push({
      permissionKey: requested.permissionKey,
      effect:
        requested.effect === "DENY"
          ? PermissionEffect.DENY
          : PermissionEffect.ALLOW,
      constraints: constraints.constraints,
    });
  }

  return database.$transaction(
    async (transaction) => {
      const role = await transaction.role.findFirst({
        where: { id: roleId, organizationId: context.tenant.organizationId },
        select: {
          id: true,
          key: true,
          systemRole: true,
          rolePermissions: {
            select: {
              effect: true,
              constraints: true,
              permission: { select: { key: true } },
            },
          },
        },
      });
      if (!role) return { kind: "error" as const, code: "NOT_FOUND" as const };
      if (role.systemRole) {
        return {
          kind: "error" as const,
          code: "SYSTEM_ROLE_IMMUTABLE" as const,
        };
      }

      const currentPermissions = role.rolePermissions.map((edge) => ({
        permissionKey: edge.permission.key,
        effect: String(edge.effect),
        constraints: edge.constraints,
      }));
      const currentHash = rolePermissionFingerprint(currentPermissions);
      const concurrencyMatches = currentHash === input.expectedPermissionsHash;
      const ceiling = canMutateCustomPermissions(
        context,
        parsedPermissions.map((permission) => permission.permissionKey),
      );
      const resource = roleResource(context.tenant.organizationId, role.id);
      const command = adminCommand(context, now, "manage", input.reason, {
        fieldPolicyResource: "role-permission",
        requestedFields: ["effect", "constraints"],
        delegationCeilingSatisfied: ceiling,
        optimisticConcurrencySatisfied: concurrencyMatches,
      });
      const authorization = await authorizeInTransaction(
        transaction,
        context,
        "permission.manage",
        resource,
        command,
        now,
      );
      if (authorization.kind === "denied") {
        return {
          kind: "denied" as const,
          code: "DENIED" as const,
          decision: authorization.decision,
        };
      }
      if (!ceiling) {
        return {
          kind: "error" as const,
          code: "DELEGATION_CEILING" as const,
        };
      }
      if (!concurrencyMatches) {
        return { kind: "error" as const, code: "STALE_WRITE" as const };
      }

      const permissionRecords = await transaction.permission.findMany({
        where: {
          key: {
            in: parsedPermissions.map((permission) => permission.permissionKey),
          },
        },
        select: { id: true, key: true },
      });
      if (permissionRecords.length !== parsedPermissions.length) {
        return { kind: "error" as const, code: "CONFLICT" as const };
      }
      const permissionIdByKey = new Map(
        permissionRecords.map((permission) => [permission.key, permission.id]),
      );

      await transaction.rolePermission.deleteMany({
        where: { roleId: role.id },
      });
      if (parsedPermissions.length > 0) {
        await transaction.rolePermission.createMany({
          data: parsedPermissions.map((permission) => ({
            roleId: role.id,
            permissionId: permissionIdByKey.get(permission.permissionKey)!,
            effect: permission.effect,
            constraints: permission.constraints as Prisma.InputJsonObject,
          })),
        });
      }

      const afterPermissions = parsedPermissions.map((permission) => ({
        permissionKey: permission.permissionKey,
        effect: String(permission.effect),
        constraints: permission.constraints,
      }));
      const afterHash = rolePermissionFingerprint(afterPermissions);

      await persistAdminMutation(
        transaction,
        authorization.context,
        {
          action: "iam.role.permissions.replaced",
          reason: input.reason,
          resourceId: role.id,
          resourceType: "role-permission",
          before: currentPermissions,
          after: afterPermissions,
        },
        now,
      );
      await recordCompletedAuthorizedActionEvidence(
        authorization.context,
        authorization.decision,
        resource,
        command,
        { database: transaction, occurredAt: now },
      );

      return {
        kind: "ok" as const,
        value: { roleId: role.id, permissionsHash: afterHash },
      };
    },
    { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
  );
}

export async function assignMembershipAuthorizationRole(
  context: AuthorizedRequestContext,
  input: AssignMembershipRoleInput,
  database: RootDatabase = getPrismaClient(),
  now = new Date(),
): Promise<AuthorizationAdminResult<{ membershipRoleId: string }>> {
  return database.$transaction(
    async (transaction) => {
      const [membership, role] = await Promise.all([
        transaction.organizationMembership.findFirst({
          where: {
            id: input.membershipId,
            organizationId: context.tenant.organizationId,
            status: MembershipStatus.ACTIVE,
            membershipType: MembershipType.STAFF,
            endedAt: null,
          },
          select: { id: true, updatedAt: true },
        }),
        transaction.role.findFirst({
          where: {
            id: input.roleId,
            organizationId: context.tenant.organizationId,
            status: RecordStatus.ACTIVE,
          },
          select: {
            id: true,
            key: true,
            systemRole: true,
            defaultScope: true,
            rolePermissions: {
              select: { permission: { select: { key: true } } },
            },
          },
        }),
      ]);
      if (!membership || !role) {
        return { kind: "error" as const, code: "NOT_FOUND" as const };
      }

      const concurrencyMatches =
        membership.updatedAt.getTime() ===
        input.expectedMembershipUpdatedAt.getTime();
      const actorRole = actorAdminRole(context);
      let ceiling = false;

      if (actorRole && role.systemRole && isLaunchRoleCode(role.key)) {
        ceiling =
          role.key !== "R17" &&
          canAdministerLaunchRole(context, role.key);
      } else if (
        actorRole &&
        !role.systemRole &&
        String(role.defaultScope) !== "CLIENT"
      ) {
        const customPermissionKeys = role.rolePermissions
          .map((edge) => edge.permission.key)
          .filter(isCanonicalPermissionKey);
        ceiling =
          ROLE_DELEGATION_CEILINGS[actorRole].mayCreateCustomTeamRoles &&
          canMutateCustomPermissions(context, customPermissionKeys);
      }

      const requestedScopeAllowed = role.systemRole && isLaunchRoleCode(role.key)
        ? (() => {
            const definition = ROLE_DELEGATION_CEILINGS[actorRole ?? "R02"];
            void definition;
            return true;
          })()
        : String(role.defaultScope) === input.scope;

      if (role.systemRole && isLaunchRoleCode(role.key)) {
        const definition = getLaunchRoleDefinition(role.key);
        if (!definition.scopes.includes(input.scope as never)) {
          ceiling = false;
        }
      } else if (!requestedScopeAllowed) {
        ceiling = false;
      }

      if (input.validUntil && input.validUntil <= now) {
        return { kind: "error" as const, code: "INVALID" as const };
      }

      const resource = membershipRoleResource(
        context.tenant.organizationId,
        "new-membership-role",
        membership.id,
      );
      const command = adminCommand(context, now, "assign", input.reason, {
        fieldPolicyResource: "membership-role",
        requestedFields: ["roleId", "scope", "validUntil"],
        delegationCeilingSatisfied: ceiling,
        optimisticConcurrencySatisfied: concurrencyMatches,
      });
      const authorization = await authorizeInTransaction(
        transaction,
        context,
        "role.manage",
        resource,
        command,
        now,
      );
      if (authorization.kind === "denied") {
        return {
          kind: "denied" as const,
          code: "DENIED" as const,
          decision: authorization.decision,
        };
      }
      if (!ceiling) {
        return {
          kind: "error" as const,
          code: "DELEGATION_CEILING" as const,
        };
      }
      if (!concurrencyMatches) {
        return { kind: "error" as const, code: "STALE_WRITE" as const };
      }

      const duplicate = await transaction.membershipRole.findFirst({
        where: {
          membershipId: membership.id,
          roleId: role.id,
          validFrom: { lte: now },
          OR: [{ validUntil: null }, { validUntil: { gt: now } }],
        },
        select: { id: true },
      });
      if (duplicate) {
        return { kind: "error" as const, code: "CONFLICT" as const };
      }

      const membershipRole = await transaction.membershipRole.create({
        data: {
          id: randomUUID(),
          membershipId: membership.id,
          roleId: role.id,
          scope: input.scope as RoleScope,
          validFrom: now,
          validUntil: input.validUntil ?? null,
        },
        select: { id: true },
      });

      await persistAdminMutation(
        transaction,
        authorization.context,
        {
          action: "iam.membership-role.assigned",
          reason: input.reason,
          resourceId: membershipRole.id,
          resourceType: "membership-role",
          after: {
            membershipId: membership.id,
            roleId: role.id,
            scope: input.scope,
            validUntil: input.validUntil ?? null,
          },
        },
        now,
      );
      await recordCompletedAuthorizedActionEvidence(
        authorization.context,
        authorization.decision,
        { ...resource, resourceId: membershipRole.id },
        command,
        { database: transaction, occurredAt: now },
      );

      return {
        kind: "ok" as const,
        value: { membershipRoleId: membershipRole.id },
      };
    },
    { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
  );
}

export async function revokeMembershipAuthorizationRole(
  context: AuthorizedRequestContext,
  input: RevokeMembershipRoleInput,
  database: RootDatabase = getPrismaClient(),
  now = new Date(),
): Promise<AuthorizationAdminResult<{ membershipRoleId: string }>> {
  return database.$transaction(
    async (transaction) => {
      const grant = await transaction.membershipRole.findFirst({
        where: {
          id: input.membershipRoleId,
          membership: {
            organizationId: context.tenant.organizationId,
          },
          role: {
            organizationId: context.tenant.organizationId,
          },
        },
        select: {
          id: true,
          membershipId: true,
          roleId: true,
          scope: true,
          validFrom: true,
          validUntil: true,
          createdAt: true,
          role: { select: { key: true, systemRole: true } },
        },
      });
      if (!grant) return { kind: "error" as const, code: "NOT_FOUND" as const };

      const concurrencyMatches =
        grant.createdAt.getTime() === input.expectedCreatedAt.getTime() &&
        (!grant.validUntil || grant.validUntil > now);
      const ceiling =
        grant.role.systemRole && isLaunchRoleCode(grant.role.key)
          ? canAdministerLaunchRole(context, grant.role.key)
          : Boolean(actorAdminRole(context));

      const resource = membershipRoleResource(
        context.tenant.organizationId,
        grant.id,
        grant.membershipId,
      );
      const command = adminCommand(context, now, "revoke", input.reason, {
        fieldPolicyResource: "membership-role",
        requestedFields: ["validUntil"],
        delegationCeilingSatisfied: ceiling,
        optimisticConcurrencySatisfied: concurrencyMatches,
      });
      const authorization = await authorizeInTransaction(
        transaction,
        context,
        "role.manage",
        resource,
        command,
        now,
      );
      if (authorization.kind === "denied") {
        return {
          kind: "denied" as const,
          code: "DENIED" as const,
          decision: authorization.decision,
        };
      }
      if (!ceiling) {
        return {
          kind: "error" as const,
          code: "DELEGATION_CEILING" as const,
        };
      }
      if (!concurrencyMatches) {
        return { kind: "error" as const, code: "STALE_WRITE" as const };
      }

      const updated = await transaction.membershipRole.updateMany({
        where: {
          id: grant.id,
          createdAt: input.expectedCreatedAt,
          OR: [{ validUntil: null }, { validUntil: { gt: now } }],
        },
        data: { validUntil: now },
      });
      if (updated.count !== 1) {
        return { kind: "error" as const, code: "STALE_WRITE" as const };
      }

      await persistAdminMutation(
        transaction,
        authorization.context,
        {
          action: "iam.membership-role.revoked",
          reason: input.reason,
          resourceId: grant.id,
          resourceType: "membership-role",
          before: {
            membershipId: grant.membershipId,
            roleId: grant.roleId,
            scope: String(grant.scope),
            validFrom: grant.validFrom,
            validUntil: grant.validUntil,
          },
          after: {
            membershipId: grant.membershipId,
            roleId: grant.roleId,
            scope: String(grant.scope),
            validFrom: grant.validFrom,
            validUntil: now,
          },
        },
        now,
      );
      await recordCompletedAuthorizedActionEvidence(
        authorization.context,
        authorization.decision,
        resource,
        command,
        { database: transaction, occurredAt: now },
      );

      return {
        kind: "ok" as const,
        value: { membershipRoleId: grant.id },
      };
    },
    { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
  );
}
