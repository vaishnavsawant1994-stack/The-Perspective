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
import {
  getR6FieldPolicy,
  getR6PermissionBinding,
  isR6ActivePermissionKey,
} from "./r6-policy";
import {
  getR7FieldPolicy,
  getR7PermissionBinding,
  isR7ActivePermissionKey,
} from "./r7-policy";
import {
  getR8FieldPolicy,
  getR8PermissionBinding,
  isR8ActivePermissionKey,
} from "./r8-policy";
import {
  getR9FieldPolicy,
  getR9PermissionBinding,
  isR9ActivePermissionKey,
} from "./r9-policy";
import type {
  AuthorizationCommandContext,
  AuthorizationDecision,
  AuthorizationObligation,
  AuthorizationResourceContext,
  AuthorizationScope,
  RolePermissionConstraints,
  SensitivityLevel,
} from "./types";

const DEFAULT_ACTIVE_STAGES = new Set(["R5", "R6", "R7", "R8", "R9"]);
const READ_ACTIONS = new Set([
  "read",
  "view",
  "list",
  "search",
  "discover",
  "export",
  "download",
]);

const R5_PERMISSION_ACTIONS: Partial<
  Record<CanonicalPermissionKey, ReadonlySet<string>>
> = {
  "audit.view": new Set(["read", "view", "list", "search"]),
  "department.manage": new Set(["manage"]),
  "permission.manage": new Set(["manage"]),
  "role.manage": new Set(["create", "update", "assign", "revoke", "manage"]),
  "team.manage": new Set(["manage"]),
  "team.view": new Set(["read", "view", "list", "search"]),
};

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
  if (!command.fieldPolicy) return false;

  const requestedFields = command.requestedFields ?? [];
  if (requestedFields.length === 0) return true;

  if (READ_ACTIONS.has(command.action)) {
    return requestedFields.every((field) =>
      command.fieldPolicy?.readableFields.includes(field),
    );
  }

  const serverOwnedFields = new Set(command.fieldPolicy.serverOwnedFields ?? []);
  if (requestedFields.some((field) => serverOwnedFields.has(field))) {
    return false;
  }

  const allowedFields = new Set([
    ...command.fieldPolicy.mutableFields,
    ...(command.action === "create"
      ? command.fieldPolicy.createOnlyFields ?? []
      : []),
    ...(command.fieldPolicy.actionFields?.[command.action] ?? []),
  ]);

  return requestedFields.every((field) => allowedFields.has(field));
}

function fieldGroupConstraintsAllow(
  constraints: RolePermissionConstraints,
  command: AuthorizationCommandContext,
) {
  const allowedGroups = constraints.allowedFieldGroups ?? [];
  const deniedGroups = constraints.deniedFieldGroups ?? [];

  if (allowedGroups.length === 0 && deniedGroups.length === 0) return true;

  const fieldGroups = command.fieldPolicy?.fieldGroups;
  const requestedFields = command.requestedFields ?? [];

  // Constraint names are untrusted persisted data. They may only reference a
  // server-owned field-group map, and an empty/unknown mapping fails closed.
  if (!fieldGroups || requestedFields.length === 0) return false;

  const referencedGroups = [...allowedGroups, ...deniedGroups];
  if (
    referencedGroups.some(
      (group) => !Object.prototype.hasOwnProperty.call(fieldGroups, group),
    )
  ) {
    return false;
  }

  if (allowedGroups.length > 0) {
    const allowedFields = new Set(
      allowedGroups.flatMap((group) => fieldGroups[group] ?? []),
    );
    if (!requestedFields.every((field) => allowedFields.has(field))) {
      return false;
    }
  }

  const deniedFields = new Set(
    deniedGroups.flatMap((group) => fieldGroups[group] ?? []),
  );
  return !requestedFields.some((field) => deniedFields.has(field));
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

  let policyCommand = command;

  // Active R7 permissions are dispatched here even when the registry still
  // stamps proposal.* as R6. They must not enter the R6 binding path. Only
  // proposal.accept is CLIENT-owned; every other active R7 key remains TEAM-only.
  // Stage-R7 keys outside the active slice (contract.edit, contract.view,
  // payment.refund, package.manage, commercial.exception.approve) stay
  // workflow-denied. contract.send is active only for the qualified send command.
  if (
    isR7ActivePermissionKey(permissionKey) ||
    definition.activationStage === "R7"
  ) {
    if (!activeStages.has("R7") || !isR7ActivePermissionKey(permissionKey)) {
      return deny(permissionKey, "WORKFLOW_DENIED");
    }

    const clientAcceptance = permissionKey === "proposal.accept";
    if (
      clientAcceptance
        ? definition.surface !== "CLIENT" ||
          definition.assignability !== "CLIENT_ROLE" ||
          context.membership.surface !== "CLIENT" ||
          context.tenant.surface !== "CLIENT"
        : definition.surface !== "TEAM" ||
          definition.assignability !== "TEAM_ROLE" ||
          context.membership.surface !== "TEAM" ||
          context.tenant.surface !== "TEAM"
    ) {
      return deny(permissionKey, "POLICY_INVALID");
    }

    if (
      context.membership.membershipId !== context.tenant.membershipId ||
      context.membership.organizationId !== context.tenant.organizationId ||
      context.membership.surface !== context.tenant.surface
    ) {
      return deny(permissionKey, "POLICY_INVALID");
    }

    const binding = getR7PermissionBinding(permissionKey);
    if (!(binding.actions as readonly string[]).includes(command.action)) {
      return deny(permissionKey, "WORKFLOW_DENIED");
    }

    if (
      !resource ||
      !(binding.resourceTypes as readonly string[]).includes(
        resource.resourceType,
      )
    ) {
      return deny(permissionKey, "RESOURCE_DENIED");
    }

    const trustedFieldPolicy = getR7FieldPolicy(resource.resourceType);
    if (!trustedFieldPolicy) {
      return deny(permissionKey, "FIELD_DENIED");
    }

    policyCommand = {
      ...command,
      fieldPolicy: trustedFieldPolicy,
    };

    if (
      "workflowActions" in binding &&
      binding.workflowActions.includes(command.action as never) &&
      command.workflowSatisfied !== true
    ) {
      return deny(permissionKey, "WORKFLOW_DENIED");
    }
  } else if (definition.activationStage === "R8") {
    if (!activeStages.has("R8") || !isR8ActivePermissionKey(permissionKey)) {
      return deny(permissionKey, "WORKFLOW_DENIED");
    }

    const clientDecision = permissionKey === "approval.client.decide";
    if (
      clientDecision
        ? definition.surface !== "CLIENT" ||
          definition.assignability !== "CLIENT_ROLE" ||
          context.membership.surface !== "CLIENT" ||
          context.tenant.surface !== "CLIENT"
        : definition.surface !== "TEAM" ||
          definition.assignability !== "TEAM_ROLE" ||
          context.membership.surface !== "TEAM" ||
          context.tenant.surface !== "TEAM"
    ) {
      return deny(permissionKey, "POLICY_INVALID");
    }

    if (
      context.membership.membershipId !== context.tenant.membershipId ||
      context.membership.organizationId !== context.tenant.organizationId ||
      context.membership.surface !== context.tenant.surface
    ) {
      return deny(permissionKey, "POLICY_INVALID");
    }

    const binding = getR8PermissionBinding(permissionKey);
    if (!(binding.actions as readonly string[]).includes(command.action)) {
      return deny(permissionKey, "WORKFLOW_DENIED");
    }

    if (
      !resource ||
      !(binding.resourceTypes as readonly string[]).includes(resource.resourceType)
    ) {
      return deny(permissionKey, "RESOURCE_DENIED");
    }

    const trustedFieldPolicy = getR8FieldPolicy(resource.resourceType);
    if (!trustedFieldPolicy) {
      return deny(permissionKey, "FIELD_DENIED");
    }

    policyCommand = {
      ...command,
      fieldPolicy: trustedFieldPolicy,
    };

    if (
      "workflowActions" in binding &&
      binding.workflowActions.includes(command.action as never) &&
      command.workflowSatisfied !== true
    ) {
      return deny(permissionKey, "WORKFLOW_DENIED");
    }
  } else if (definition.activationStage === "R9") {
    if (!activeStages.has("R9") || !isR9ActivePermissionKey(permissionKey)) {
      return deny(permissionKey, "WORKFLOW_DENIED");
    }

    if (
      definition.surface !== "TEAM" ||
      definition.assignability !== "TEAM_ROLE" ||
      context.membership.surface !== "TEAM" ||
      context.tenant.surface !== "TEAM"
    ) {
      return deny(permissionKey, "POLICY_INVALID");
    }

    if (
      context.membership.membershipId !== context.tenant.membershipId ||
      context.membership.organizationId !== context.tenant.organizationId ||
      context.membership.surface !== context.tenant.surface
    ) {
      return deny(permissionKey, "POLICY_INVALID");
    }

    const binding = getR9PermissionBinding(permissionKey);
    if (!(binding.actions as readonly string[]).includes(command.action)) {
      return deny(permissionKey, "WORKFLOW_DENIED");
    }

    if (
      !resource ||
      !(binding.resourceTypes as readonly string[]).includes(resource.resourceType)
    ) {
      return deny(permissionKey, "RESOURCE_DENIED");
    }

    const trustedFieldPolicy = getR9FieldPolicy(resource.resourceType);
    if (!trustedFieldPolicy) {
      return deny(permissionKey, "FIELD_DENIED");
    }

    policyCommand = {
      ...command,
      fieldPolicy: trustedFieldPolicy,
    };

    if (
      "workflowActions" in binding &&
      binding.workflowActions.includes(command.action as never) &&
      command.workflowSatisfied !== true
    ) {
      return deny(permissionKey, "WORKFLOW_DENIED");
    }
  } else if (definition.activationStage === "R6") {
    if (!isR6ActivePermissionKey(permissionKey)) {
      return deny(permissionKey, "WORKFLOW_DENIED");
    }

    if (
      definition.surface !== "TEAM" ||
      definition.assignability !== "TEAM_ROLE" ||
      context.membership.surface !== "TEAM" ||
      context.tenant.surface !== "TEAM"
    ) {
      return deny(permissionKey, "POLICY_INVALID");
    }

    const binding = getR6PermissionBinding(permissionKey);
    if (!(binding.actions as readonly string[]).includes(command.action)) {
      return deny(permissionKey, "WORKFLOW_DENIED");
    }

    if (
      !resource ||
      !(binding.resourceTypes as readonly string[]).includes(resource.resourceType)
    ) {
      return deny(permissionKey, "RESOURCE_DENIED");
    }

    const trustedFieldPolicy = getR6FieldPolicy(resource.resourceType);
    if (!trustedFieldPolicy) {
      return deny(permissionKey, "FIELD_DENIED");
    }

    policyCommand = {
      ...command,
      fieldPolicy: trustedFieldPolicy,
    };

    if (
      binding.workflowActions?.includes(command.action as never) &&
      command.workflowSatisfied !== true
    ) {
      return deny(permissionKey, "WORKFLOW_DENIED");
    }
  }

  const permittedActions = R5_PERMISSION_ACTIONS[permissionKey];
  if (
    definition.activationStage === "R5" &&
    (!permittedActions || !permittedActions.has(policyCommand.action))
  ) {
    return deny(permissionKey, "WORKFLOW_DENIED");
  }

  // Export remains separately authorized. Neither R5 nor frozen R6 defines a
  // generic export permission, so read/view authority cannot be laundered.
  if (policyCommand.action === "export") {
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

  if (
    (definition.activationStage === "R6" ||
      definition.activationStage === "R7" ||
      definition.activationStage === "R8" ||
      definition.activationStage === "R9") &&
    grants.some((grant) => !definition.permittedScopes.includes(grant.scope))
  ) {
    return deny(permissionKey, "POLICY_INVALID");
  }

  for (const grant of grants) {
    if (
      grant.effect === "DENY" &&
      scopeMatches(context, grant.scope, resource, policyCommand.action) &&
      constraintsMatch(context, resource, grant.constraints, policyCommand)
    ) {
      return deny(permissionKey, "PERMISSION_DENIED");
    }
  }

  const applicableAllows = grants.filter(
    (grant) =>
      grant.effect === "ALLOW" &&
      scopeMatches(context, grant.scope, resource, policyCommand.action) &&
      constraintsMatch(context, resource, grant.constraints, policyCommand) &&
      fieldGroupConstraintsAllow(grant.constraints, policyCommand),
  );

  if (applicableAllows.length === 0) {
    return deny(
      permissionKey,
      hasBlockedEdge ? "POLICY_INVALID" : "SCOPE_DENIED",
    );
  }

  if (
    definition.requiresWorkflowPolicy &&
    policyCommand.workflowSatisfied !== true
  ) {
    return deny(permissionKey, "WORKFLOW_DENIED");
  }

  if (definition.requiresFieldPolicy && !fieldPolicyAllows(policyCommand)) {
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
      policyCommand,
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
        readableFields: policyCommand.fieldPolicy?.readableFields,
        mutableFields: policyCommand.fieldPolicy?.mutableFields,
      };
    }
  }

  const obligations = obligationsFor(
    definition.obligations,
    applicableAllows[0].constraints,
  );
  const reasonCode =
    unmetObligationReason(context, resource, policyCommand, obligations) ??
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
