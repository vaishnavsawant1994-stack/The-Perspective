import "server-only";

import {
  CLIENT_CAPABILITY_ROLES,
  FROZEN_TEAM_ROLE_PERMISSION_KEYS,
  getClientCapabilityRoleDefinition,
  getLaunchRoleDefinition,
  isLaunchRoleCode,
  ROLE_DELEGATION_CEILINGS,
  type LaunchRoleCode,
} from "./launch-roles";
import {
  getPermissionDefinition,
  isCanonicalPermissionKey,
  type CanonicalPermissionKey,
} from "./registry";
import type { AuthorizationScope } from "./types";

export const DELEGATION_DENIAL_REASONS = [
  "DELEGATION_AUTHORITY_REQUIRED",
  "SELF_ESCALATION_DENIED",
  "ROLE_ABOVE_CEILING",
  "ROLE_SCOPE_DENIED",
  "FROZEN_LAUNCH_ROLE",
  "UNKNOWN_PERMISSION",
  "PERMISSION_ASSIGNABILITY_DENIED",
  "ACCESS_ADMIN_PERMISSION_RESERVED",
  "CLIENT_CAPABILITY_TEMPLATE_REQUIRED",
] as const;

export type DelegationDenialReason =
  (typeof DELEGATION_DENIAL_REASONS)[number];

export type DelegationAssessment =
  | { readonly allowed: true; readonly actorRole: "R01" | "R02" }
  | {
      readonly allowed: false;
      readonly reason: DelegationDenialReason;
      readonly actorRole?: "R01" | "R02";
    };

function delegationActor(roleKeys: readonly string[]) {
  if (roleKeys.includes("R01")) return "R01" as const;
  if (roleKeys.includes("R02")) return "R02" as const;
  return undefined;
}

export function assessLaunchRoleAssignment(input: {
  readonly actorRoleKeys: readonly string[];
  readonly actorMembershipId: string;
  readonly targetMembershipId: string;
  readonly targetRoleCode: LaunchRoleCode;
  readonly scope: AuthorizationScope;
}): DelegationAssessment {
  const actorRole = delegationActor(input.actorRoleKeys);
  if (!actorRole) {
    return { allowed: false, reason: "DELEGATION_AUTHORITY_REQUIRED" };
  }

  if (input.actorMembershipId === input.targetMembershipId) {
    return {
      allowed: false,
      reason: "SELF_ESCALATION_DENIED",
      actorRole,
    };
  }

  const ceiling = ROLE_DELEGATION_CEILINGS[actorRole];
  if (!ceiling.assignableLaunchRoles.includes(input.targetRoleCode)) {
    return {
      allowed: false,
      reason: "ROLE_ABOVE_CEILING",
      actorRole,
    };
  }

  const role = getLaunchRoleDefinition(input.targetRoleCode);
  if (!role.scopes.includes(input.scope)) {
    return {
      allowed: false,
      reason: "ROLE_SCOPE_DENIED",
      actorRole,
    };
  }

  return { allowed: true, actorRole };
}

export function assessClientCapabilityAssignment(input: {
  readonly actorRoleKeys: readonly string[];
  readonly actorMembershipId: string;
  readonly targetMembershipId: string;
  readonly capabilityRoleKey: string;
}): DelegationAssessment {
  const actorRole = delegationActor(input.actorRoleKeys);
  if (!actorRole) {
    return { allowed: false, reason: "DELEGATION_AUTHORITY_REQUIRED" };
  }

  if (input.actorMembershipId === input.targetMembershipId) {
    return {
      allowed: false,
      reason: "SELF_ESCALATION_DENIED",
      actorRole,
    };
  }

  if (!ROLE_DELEGATION_CEILINGS[actorRole].mayCreateClientCapabilityRoles) {
    return {
      allowed: false,
      reason: "ROLE_ABOVE_CEILING",
      actorRole,
    };
  }

  if (!getClientCapabilityRoleDefinition(input.capabilityRoleKey)) {
    return {
      allowed: false,
      reason: "CLIENT_CAPABILITY_TEMPLATE_REQUIRED",
      actorRole,
    };
  }

  return { allowed: true, actorRole };
}

export function assessRolePermissionSetMutation(input: {
  readonly actorRoleKeys: readonly string[];
  readonly targetRoleKey: string;
  readonly targetSurface: "TEAM" | "CLIENT";
  readonly permissionKeys: readonly string[];
}): DelegationAssessment {
  const actorRole = delegationActor(input.actorRoleKeys);
  if (!actorRole) {
    return { allowed: false, reason: "DELEGATION_AUTHORITY_REQUIRED" };
  }

  if (!ROLE_DELEGATION_CEILINGS[actorRole].mayMutateRolePermissions) {
    return {
      allowed: false,
      reason: "ROLE_ABOVE_CEILING",
      actorRole,
    };
  }

  // Frozen launch roles are governance artifacts, not mutable runtime policy.
  if (isLaunchRoleCode(input.targetRoleKey)) {
    return {
      allowed: false,
      reason: "FROZEN_LAUNCH_ROLE",
      actorRole,
    };
  }

  if (input.targetSurface === "CLIENT") {
    const template = getClientCapabilityRoleDefinition(input.targetRoleKey);
    if (!template) {
      return {
        allowed: false,
        reason: "CLIENT_CAPABILITY_TEMPLATE_REQUIRED",
        actorRole,
      };
    }

    const expected = [...template.permissions].sort();
    const proposed = [...new Set(input.permissionKeys)].sort();

    if (
      expected.length !== proposed.length ||
      expected.some((permission, index) => permission !== proposed[index])
    ) {
      return {
        allowed: false,
        reason: "CLIENT_CAPABILITY_TEMPLATE_REQUIRED",
        actorRole,
      };
    }

    return { allowed: true, actorRole };
  }

  for (const rawPermissionKey of input.permissionKeys) {
    if (!isCanonicalPermissionKey(rawPermissionKey)) {
      return {
        allowed: false,
        reason: "UNKNOWN_PERMISSION",
        actorRole,
      };
    }

    const definition = getPermissionDefinition(rawPermissionKey);
    if (definition.assignability !== "TEAM_ROLE") {
      return {
        allowed: false,
        reason: "PERMISSION_ASSIGNABILITY_DENIED",
        actorRole,
      };
    }

    if (
      rawPermissionKey === "role.manage" ||
      rawPermissionKey === "permission.manage"
    ) {
      return {
        allowed: false,
        reason: "ACCESS_ADMIN_PERMISSION_RESERVED",
        actorRole,
      };
    }
  }

  return { allowed: true, actorRole };
}

export function frozenLaunchRolePermissionSet(
  roleCode: LaunchRoleCode,
): ReadonlySet<CanonicalPermissionKey> {
  return new Set(getLaunchRoleDefinition(roleCode).permissions);
}

export function isR01EquivalentPermissionSet(
  permissionKeys: readonly CanonicalPermissionKey[],
) {
  const proposed = new Set(permissionKeys);
  return FROZEN_TEAM_ROLE_PERMISSION_KEYS.every((permission) =>
    proposed.has(permission),
  );
}

export function approvedClientCapabilityRoleKeys() {
  return CLIENT_CAPABILITY_ROLES.map((role) => role.key);
}
