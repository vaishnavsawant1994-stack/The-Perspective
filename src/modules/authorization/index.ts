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
