export {
  getPermissionDefinition,
  isCanonicalPermissionKey,
  PERMISSION_DEFINITIONS,
  PERMISSION_REGISTRY,
  type CanonicalPermissionKey,
} from "./registry";
export {
  parseRolePermissionConstraints,
  rolePermissionConstraintsSchema,
  type RolePermissionConstraintParseResult,
} from "./constraints";
export type {
  AuthorityResolutionIssue,
  AuthorityResolutionIssueCode,
  AuthorityResolutionResult,
  AuthorizationDecision,
  AuthorizationObligation,
  AuthorizationReasonCode,
  AuthorizationResourceContext,
  AuthorizationScope,
  AuthorizationSurface,
  EffectiveGrantPath,
  PermissionAssignability,
  PermissionDefinition,
  PermissionEffect,
  PermissionRiskLevel,
  ResolvedAuthority,
  ResourceVisibility,
  RolePermissionConstraints,
  SensitivityLevel,
} from "./types";

export {
  resolveAuthorityFromState,
  resolveAuthorizedRequestContext,
  resolveEffectiveAuthority,
  type AuthorizedContextResolution,
  type PersistedAuthorityState,
  type ResolveAuthorityInput,
} from "./resolver";
