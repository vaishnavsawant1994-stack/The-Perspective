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
  AuthorizationCommandContext,
  AuthorizationDecision,
  AuthorizationFieldPolicy,
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

export {
  evaluateAuthorization,
  evaluateAuthorizationByKey,
  type AuthorizationPolicyOptions,
} from "./policy";

export {
  CLIENT_CAPABILITY_ROLES,
  FROZEN_TEAM_ROLE_PERMISSION_KEYS,
  getClientCapabilityRoleDefinition,
  getLaunchRoleDefinition,
  isLaunchRoleCode,
  LAUNCH_ROLES,
  PERMISSION_BUNDLES,
  permissionRegistryFingerprint,
  PROTECTED_PERMISSION_KEYS,
  R5_FROZEN_CONTRACT_SHA,
  R5_PERMISSION_REGISTRY_VERSION,
  ROLE_DELEGATION_CEILINGS,
  type ClientCapabilityRoleDefinition,
  type LaunchRoleCode,
  type LaunchRoleDefinition,
  type PermissionBundle,
  type PermissionBundleKey,
} from "./launch-roles";

export {
  buildTrustedIamResourceContext,
  loadTrustedResourceContext,
  type LoadedResourceEnvelope,
} from "./resource-context";
export {
  getR5FieldPolicy,
  projectClientSafeResourceMetadata,
  type ClientSafeResourceMetadata,
  type R5FieldPolicyResourceType,
} from "./fields";

export {
  recordCompletedAuthorizedActionEvidence,
  recordDeniedAuthorizationEvidence,
  type AuthorizationTelemetry,
} from "./audit";
