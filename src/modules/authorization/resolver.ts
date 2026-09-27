import "server-only";

import type {
  AuthorizedRequestContext,
  EffectiveAuthorizationGrant,
  PermissionKey,
  TenantScopedRequestContext,
} from "@/modules/foundation/request-context";
import { getPrismaClient } from "@/modules/persistence/client";

import { parseRolePermissionConstraints } from "./constraints";
import {
  getPermissionDefinition,
  isCanonicalPermissionKey,
  type CanonicalPermissionKey,
} from "./registry";
import type {
  AuthorityResolutionIssue,
  AuthorityResolutionResult,
  AuthorizationScope,
  EffectiveGrantPath,
  ResolvedAuthority,
} from "./types";

export interface PersistedAuthorityState {
  readonly membershipId: string;
  readonly userAccountId: string;
  readonly organizationId: string;
  readonly membershipStatus: string;
  readonly membershipRoles: readonly {
    readonly id: string;
    readonly scope: AuthorizationScope;
    readonly validFrom: Date;
    readonly validUntil: Date | null;
    readonly role: {
      readonly id: string;
      readonly key: string;
      readonly organizationId: string;
      readonly status: string;
      readonly rolePermissions: readonly {
        readonly effect: "ALLOW" | "DENY";
        readonly constraints: unknown;
        readonly permission: {
          readonly key: string;
        };
      }[];
    };
  }[];
}

export interface ResolveAuthorityInput {
  readonly userAccountId: string;
  readonly membershipId: string;
  readonly organizationId: string;
  readonly surface: "TEAM" | "CLIENT";
}

function addIssue(
  issues: AuthorityResolutionIssue<CanonicalPermissionKey>[],
  issue: AuthorityResolutionIssue<CanonicalPermissionKey>,
) {
  issues.push(issue);
}

function expectedAssignability(surface: "TEAM" | "CLIENT") {
  return surface === "TEAM" ? "TEAM_ROLE" : "CLIENT_ROLE";
}

export function resolveAuthorityFromState(
  input: ResolveAuthorityInput,
  state: PersistedAuthorityState | null,
  now = new Date(),
): AuthorityResolutionResult<CanonicalPermissionKey> {
  if (
    !state ||
    state.membershipId !== input.membershipId ||
    state.userAccountId !== input.userAccountId ||
    state.organizationId !== input.organizationId ||
    state.membershipStatus !== "ACTIVE"
  ) {
    return {
      kind: "denied",
      reasonCode: "MEMBERSHIP_INACTIVE",
      issues: [{ code: "MEMBERSHIP_NOT_ACTIVE" }],
    };
  }

  const roleKeys = new Set<string>();
  const grantPaths: EffectiveGrantPath<CanonicalPermissionKey>[] = [];
  const issues: AuthorityResolutionIssue<CanonicalPermissionKey>[] = [];
  const blockedPermissionKeys = new Set<CanonicalPermissionKey>();

  for (const membershipRole of state.membershipRoles) {
    if (
      membershipRole.validFrom.getTime() > now.getTime() ||
      (membershipRole.validUntil &&
        membershipRole.validUntil.getTime() <= now.getTime())
    ) {
      addIssue(issues, {
        code: "GRANT_NOT_ACTIVE",
        roleKey: membershipRole.role.key,
        membershipRoleId: membershipRole.id,
      });
      continue;
    }

    if (membershipRole.role.organizationId !== input.organizationId) {
      addIssue(issues, {
        code: "CROSS_TENANT_ROLE",
        roleKey: membershipRole.role.key,
        membershipRoleId: membershipRole.id,
      });
      continue;
    }

    if (membershipRole.role.status !== "ACTIVE") {
      addIssue(issues, {
        code: "ROLE_NOT_ACTIVE",
        roleKey: membershipRole.role.key,
        membershipRoleId: membershipRole.id,
      });
      continue;
    }

    roleKeys.add(membershipRole.role.key);

    for (const rolePermission of membershipRole.role.rolePermissions) {
      const rawPermissionKey = rolePermission.permission.key;

      if (!isCanonicalPermissionKey(rawPermissionKey)) {
        addIssue(issues, {
          code: "UNKNOWN_PERMISSION",
          roleKey: membershipRole.role.key,
          permissionKey: rawPermissionKey,
          membershipRoleId: membershipRole.id,
        });
        continue;
      }

      const permissionKey = rawPermissionKey;
      const definition = getPermissionDefinition(permissionKey);

      if (definition.assignability !== expectedAssignability(input.surface)) {
        blockedPermissionKeys.add(permissionKey);
        addIssue(issues, {
          code: "SURFACE_MISMATCH",
          roleKey: membershipRole.role.key,
          permissionKey,
          membershipRoleId: membershipRole.id,
        });
        continue;
      }

      if (!definition.permittedScopes.includes(membershipRole.scope)) {
        blockedPermissionKeys.add(permissionKey);
        addIssue(issues, {
          code: "SCOPE_INCOMPATIBLE",
          roleKey: membershipRole.role.key,
          permissionKey,
          membershipRoleId: membershipRole.id,
        });
        continue;
      }

      const parsedConstraints = parseRolePermissionConstraints(
        rolePermission.constraints,
      );

      if (!parsedConstraints.valid) {
        blockedPermissionKeys.add(permissionKey);
        addIssue(issues, {
          code: "INVALID_CONSTRAINTS",
          roleKey: membershipRole.role.key,
          permissionKey,
          membershipRoleId: membershipRole.id,
          details: parsedConstraints.issues,
        });
        continue;
      }

      grantPaths.push({
        membershipRoleId: membershipRole.id,
        roleId: membershipRole.role.id,
        roleKey: membershipRole.role.key,
        permissionKey,
        effect: rolePermission.effect,
        scope: membershipRole.scope,
        constraints: parsedConstraints.constraints,
        validFrom: membershipRole.validFrom,
        validUntil: membershipRole.validUntil,
      });
    }
  }

  const permissionKeys = new Set<CanonicalPermissionKey>();
  for (const grant of grantPaths) {
    if (
      grant.effect === "ALLOW" &&
      !blockedPermissionKeys.has(grant.permissionKey)
    ) {
      permissionKeys.add(grant.permissionKey);
    }
  }

  const authority: ResolvedAuthority<CanonicalPermissionKey> = {
    roleKeys: [...roleKeys].sort(),
    permissionKeys,
    blockedPermissionKeys,
    grantPaths,
    issues,
  };

  return {
    kind: "resolved",
    authority,
  };
}

type AuthorizationDatabase = ReturnType<typeof getPrismaClient>;

export async function resolveEffectiveAuthority(
  context: TenantScopedRequestContext,
  database: AuthorizationDatabase = getPrismaClient(),
  now = new Date(),
): Promise<AuthorityResolutionResult<CanonicalPermissionKey>> {
  const persisted = await database.organizationMembership.findUnique({
    where: { id: context.membership.membershipId },
    select: {
      id: true,
      userAccountId: true,
      organizationId: true,
      status: true,
      membershipRoles: {
        select: {
          id: true,
          scope: true,
          validFrom: true,
          validUntil: true,
          role: {
            select: {
              id: true,
              key: true,
              organizationId: true,
              status: true,
              rolePermissions: {
                select: {
                  effect: true,
                  constraints: true,
                  permission: {
                    select: {
                      key: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  const state: PersistedAuthorityState | null = persisted
    ? {
        membershipId: persisted.id,
        userAccountId: persisted.userAccountId,
        organizationId: persisted.organizationId,
        membershipStatus: persisted.status,
        membershipRoles: persisted.membershipRoles.map((membershipRole) => ({
          id: membershipRole.id,
          scope: membershipRole.scope,
          validFrom: membershipRole.validFrom,
          validUntil: membershipRole.validUntil,
          role: {
            id: membershipRole.role.id,
            key: membershipRole.role.key,
            organizationId: membershipRole.role.organizationId,
            status: membershipRole.role.status,
            rolePermissions: membershipRole.role.rolePermissions.map(
              (rolePermission) => ({
                effect: rolePermission.effect,
                constraints: rolePermission.constraints,
                permission: {
                  key: rolePermission.permission.key,
                },
              }),
            ),
          },
        })),
      }
    : null;

  return resolveAuthorityFromState(
    {
      userAccountId: context.identity.userId,
      membershipId: context.membership.membershipId,
      organizationId: context.tenant.organizationId,
      surface: context.tenant.surface,
    },
    state,
    now,
  );
}

export type AuthorizedContextResolution =
  | {
      readonly kind: "authorized";
      readonly context: AuthorizedRequestContext;
      readonly issues: readonly AuthorityResolutionIssue<CanonicalPermissionKey>[];
    }
  | {
      readonly kind: "denied";
      readonly reasonCode: "MEMBERSHIP_INACTIVE";
      readonly issues: readonly AuthorityResolutionIssue<CanonicalPermissionKey>[];
    };

export async function resolveAuthorizedRequestContext(
  context: TenantScopedRequestContext,
  database: AuthorizationDatabase = getPrismaClient(),
  now = new Date(),
): Promise<AuthorizedContextResolution> {
  const resolution = await resolveEffectiveAuthority(context, database, now);

  if (resolution.kind === "denied") {
    return resolution;
  }

  const permissions = new Set<PermissionKey>(
    [...resolution.authority.permissionKeys].map(
      (permissionKey) => permissionKey as PermissionKey,
    ),
  );
  const blockedPermissions = new Set<PermissionKey>(
    [...resolution.authority.blockedPermissionKeys].map(
      (permissionKey) => permissionKey as PermissionKey,
    ),
  );

  const grantPaths: EffectiveAuthorizationGrant[] =
    resolution.authority.grantPaths.map((grant) => ({
      ...grant,
      permissionKey: grant.permissionKey as PermissionKey,
      constraints: grant.constraints as Readonly<Record<string, unknown>>,
    }));

  return {
    kind: "authorized",
    issues: resolution.authority.issues,
    context: {
      ...context,
      scope: "authorized",
      authorization: {
        roleKeys: resolution.authority.roleKeys,
        permissions,
        blockedPermissions,
        grantPaths,
      },
    },
  };
}
