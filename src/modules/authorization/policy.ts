import "server-only";

import type {
  AuthorizedRequestContext,
  EffectiveAuthorizationGrant,
  PermissionKey,
} from "@/modules/foundation/request-context";

import { parseRolePermissionConstraints } from "./constraints";
import {
  getPermissionDefinition,
  isCanonicalPermissionKey,
  type CanonicalPermissionKey,
} from "./registry";
import type {
  AuthorizationCommandContext,
  AuthorizationDecision,
  AuthorizationObligation,
  AuthorizationResourceContext,
  AuthorizationScope,
  RolePermissionConstraints,
  SensitivityLevel,
} from "./types";

const DEFAULT_ACTIVE_STAGES = new Set(["R5", "R5+"]);
const READ_ACTIONS = new Set([
  "read",
  "view",
  "list",
  "search",
  "discover",
  "export",
  "download",
]);

const sensitivityRank: Record<SensitivityLevel, number> = {
  STANDARD: 0,
  CONFIDENTIAL: 1,
  PII: 2,
  FINANCIAL: 3,
  SECURITY: 4,
  SECRET: 5,
};

export interface AuthorizationPolicyOptions {
  readonly activeStages?: ReadonlySet<string>;
}

function deny(
  permissionKey: CanonicalPermissionKey,
  reasonCode: AuthorizationDecision<CanonicalPermissionKey>["reasonCode"],
  obligations: readonly AuthorizationObligation[] = [],
): AuthorizationDecision<CanonicalPermissionKey> {
  return {
    decision: "DENY",
    reasonCode,
    permissionKey,
    obligations,
  };
}

function isTenantRelated(
  context: AuthorizedRequestContext,
  resource: AuthorizationResourceContext,
) {
  if (context.tenant.surface === "TEAM") {
    return resource.ownerOrganizationId === context.tenant.organizationId;
  }

  if (resource.clientOrganizationId !== context.tenant.organizationId) {
    return false;
  }

  return (
    resource.visibility === undefined ||
    resource.visibility === "CLIENT_SHARED"
  );
}

function isOwned(
  context: AuthorizedRequestContext,
  resource: AuthorizationResourceContext,
) {
  return (
    resource.ownerMembershipId === context.membership.membershipId ||
    resource.ownerUserId === context.identity.userId
  );
}

function isAssigned(
  context: AuthorizedRequestContext,
  resource: AuthorizationResourceContext,
) {
  return (
    resource.assignedMembershipIds?.includes(context.membership.membershipId) ??
    false
  );
}

function scopeMatches(
  context: AuthorizedRequestContext,
  scope: AuthorizationScope,
  resource: AuthorizationResourceContext | undefined,
  action: string,
) {
  if (scope === "NONE") return resource === undefined;
  if (!resource) return false;

  switch (scope) {
    case "ORG":
      return (
        context.tenant.surface === "TEAM" &&
        resource.ownerOrganizationId === context.tenant.organizationId
      );
    case "DEPT":
      return (
        context.tenant.surface === "TEAM" &&
        resource.ownerOrganizationId === context.tenant.organizationId &&
        Boolean(context.authorization.actorDepartmentId) &&
        resource.departmentId === context.authorization.actorDepartmentId
      );
    case "ASN":
      return isTenantRelated(context, resource) && isAssigned(context, resource);
    case "OWN":
      return isTenantRelated(context, resource) && isOwned(context, resource);
    case "CLIENT":
      return (
        context.tenant.surface === "CLIENT" &&
        resource.clientOrganizationId === context.tenant.organizationId &&
        (resource.visibility === undefined ||
          resource.visibility === "CLIENT_SHARED")
      );
    case "READ":
      return READ_ACTIONS.has(action) && isTenantRelated(context, resource);
  }
}

function constraintsMatch(
  context: AuthorizedRequestContext,
  resource: AuthorizationResourceContext | undefined,
  constraints: RolePermissionConstraints,
  command: AuthorizationCommandContext,
) {
  if (constraints.allowedResourceTypes) {
    if (
      !resource ||
      !constraints.allowedResourceTypes.includes(resource.resourceType)
    ) {
      return false;
    }
  }

  if (constraints.maximumSensitivity) {
    if (
      !resource?.sensitivity ||
      sensitivityRank[resource.sensitivity] >
        sensitivityRank[constraints.maximumSensitivity]
    ) {
      return false;
    }
  }

  if (constraints.allowedProjectTypes) {
    if (
      !resource?.projectType ||
      !constraints.allowedProjectTypes.includes(resource.projectType)
    ) {
      return false;
    }
  }

  if (constraints.requireAssignment && (!resource || !isAssigned(context, resource))) {
    return false;
  }

  if (constraints.requireOwnership && (!resource || !isOwned(context, resource))) {
    return false;
  }

  if (
    constraints.allowedLifecycleStates &&
    (!resource?.lifecycleState ||
      !constraints.allowedLifecycleStates.includes(resource.lifecycleState))
  ) {
    return false;
  }

  if (constraints.clientSafeOnly && command.clientSafeProjection !== true) {
    return false;
  }

  if (
    constraints.noSelfAction &&
    resource?.targetMembershipId === context.membership.membershipId
  ) {
    return false;
  }

  return true;
}

function obligationsFor(
  base: readonly AuthorizationObligation[],
  constraints: RolePermissionConstraints,
): AuthorizationObligation[] {
  const obligations = new Set(base);

  if (constraints.requireReason) obligations.add("reason");
  if (constraints.requireRecentAuthentication) obligations.add("recent-auth");
  if (constraints.requireMfa) obligations.add("MFA");
  if (constraints.noSelfAction) obligations.add("no-self");
  if (constraints.requireSeparationOfDuty) obligations.add("SoD");

  return [...obligations];
}

function unmetObligationReason(
  context: AuthorizedRequestContext,
  resource: AuthorizationResourceContext | undefined,
  command: AuthorizationCommandContext,
  obligations: readonly AuthorizationObligation[],
): AuthorizationDecision<CanonicalPermissionKey>["reasonCode"] | undefined {
  for (const obligation of obligations) {
    switch (obligation) {
      case "audit":
        break;
      case "reason":
        if (!command.reason?.trim()) return "OBLIGATION_REQUIRED";
        break;
      case "recent-auth":
        if (command.recentAuthenticationSatisfied !== true) {
          return "OBLIGATION_REQUIRED";
        }
        break;
      case "MFA":
        if (command.mfaSatisfied !== true) return "OBLIGATION_REQUIRED";
        break;
      case "no-self":
        if (
          resource?.targetMembershipId &&
          resource.targetMembershipId === context.membership.membershipId
        ) {
          return "SEPARATION_OF_DUTY_DENIED";
        }
        break;
      case "delegation-ceiling":
        if (command.delegationCeilingSatisfied !== true) {
          return "OBLIGATION_REQUIRED";
        }
        break;
      case "optimistic-concurrency":
        if (command.optimisticConcurrencySatisfied !== true) {
          return "OBLIGATION_REQUIRED";
        }
        break;
      case "exact-version":
        if (command.exactVersionMatches !== true) return "WORKFLOW_DENIED";
        break;
      case "SoD":
        if (command.separationOfDutySatisfied !== true) {
          return "SEPARATION_OF_DUTY_DENIED";
        }
        break;
      case "financial-evidence":
        if (command.financialEvidencePresent !== true) {
          return "OBLIGATION_REQUIRED";
        }
        break;
      case "client-safe-projection":
        if (command.clientSafeProjection !== true) {
          return "CLIENT_PROJECTION_DENIED";
        }
        break;
    }
  }

  return undefined;
}

function fieldPolicyAllows(
  command: AuthorizationCommandContext,
) {
  const requestedFields = command.requestedFields ?? [];
  if (requestedFields.length === 0) return true;
  if (!command.fieldPolicy) return false;

  const allowedFields = READ_ACTIONS.has(command.action)
    ? command.fieldPolicy.readableFields
    : command.fieldPolicy.mutableFields;

  return requestedFields.every((field) => allowedFields.includes(field));
}

function typedGrant(
  grant: EffectiveAuthorizationGrant,
  permissionKey: CanonicalPermissionKey,
) {
  const parsed = parseRolePermissionConstraints(grant.constraints);
  if (!parsed.valid) return undefined;

  return {
    membershipRoleId: grant.membershipRoleId,
    roleId: grant.roleId,
    roleKey: grant.roleKey,
    permissionKey,
    effect: grant.effect,
    scope: grant.scope,
    constraints: parsed.constraints,
    validFrom: grant.validFrom,
    validUntil: grant.validUntil,
  } as const;
}

export function evaluateAuthorization(
  context: AuthorizedRequestContext,
  permissionKey: CanonicalPermissionKey,
  resource: AuthorizationResourceContext | undefined,
  command: AuthorizationCommandContext,
  options: AuthorizationPolicyOptions = {},
): AuthorizationDecision<CanonicalPermissionKey> {
  const definition = getPermissionDefinition(permissionKey);
  const activeStages = options.activeStages ?? DEFAULT_ACTIVE_STAGES;

  if (!activeStages.has(definition.activationStage)) {
    return deny(permissionKey, "WORKFLOW_DENIED");
  }

  const hasBlockedEdge =
    context.authorization.blockedPermissions.has(permissionKey as PermissionKey);

  const grants = context.authorization.grantPaths
    .filter((grant) => grant.permissionKey === permissionKey)
    .map((grant) => typedGrant(grant, permissionKey))
    .filter((grant): grant is NonNullable<typeof grant> => Boolean(grant));

  if (grants.length === 0) {
    return deny(
      permissionKey,
      hasBlockedEdge ? "POLICY_INVALID" : "PERMISSION_MISSING",
    );
  }

  for (const grant of grants) {
    if (
      grant.effect === "DENY" &&
      scopeMatches(context, grant.scope, resource, command.action) &&
      constraintsMatch(context, resource, grant.constraints, command)
    ) {
      return deny(permissionKey, "PERMISSION_DENIED");
    }
  }

  const applicableAllows = grants.filter(
    (grant) =>
      grant.effect === "ALLOW" &&
      scopeMatches(context, grant.scope, resource, command.action) &&
      constraintsMatch(context, resource, grant.constraints, command),
  );

  if (applicableAllows.length === 0) {
    return deny(
      permissionKey,
      hasBlockedEdge ? "POLICY_INVALID" : "SCOPE_DENIED",
    );
  }

  if (definition.requiresWorkflowPolicy && command.workflowSatisfied !== true) {
    return deny(permissionKey, "WORKFLOW_DENIED");
  }

  if (definition.requiresFieldPolicy && !fieldPolicyAllows(command)) {
    return deny(permissionKey, "FIELD_DENIED");
  }

  for (const grant of applicableAllows) {
    const obligations = obligationsFor(
      definition.obligations,
      grant.constraints,
    );
    const unmetReason = unmetObligationReason(
      context,
      resource,
      command,
      obligations,
    );

    if (!unmetReason) {
      return {
        decision: "ALLOW",
        reasonCode: "PERMISSION_DENIED",
        permissionKey,
        matchedGrant: grant,
        effectiveScope: grant.scope,
        obligations,
        readableFields: command.fieldPolicy?.readableFields,
        mutableFields: command.fieldPolicy?.mutableFields,
      };
    }
  }

  const obligations = obligationsFor(
    definition.obligations,
    applicableAllows[0].constraints,
  );
  const reasonCode =
    unmetObligationReason(context, resource, command, obligations) ??
    "OBLIGATION_REQUIRED";

  return deny(permissionKey, reasonCode, obligations);
}

export function evaluateAuthorizationByKey(
  context: AuthorizedRequestContext,
  rawPermissionKey: string,
  resource: AuthorizationResourceContext | undefined,
  command: AuthorizationCommandContext,
  options: AuthorizationPolicyOptions = {},
): AuthorizationDecision<CanonicalPermissionKey> | undefined {
  if (!isCanonicalPermissionKey(rawPermissionKey)) return undefined;
  return evaluateAuthorization(
    context,
    rawPermissionKey,
    resource,
    command,
    options,
  );
}
