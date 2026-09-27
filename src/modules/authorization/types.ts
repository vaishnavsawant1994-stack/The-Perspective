export const AUTHORIZATION_SCOPES = [
  "ORG",
  "DEPT",
  "ASN",
  "OWN",
  "CLIENT",
  "READ",
  "NONE",
] as const;

export type AuthorizationScope = (typeof AUTHORIZATION_SCOPES)[number];

export const AUTHORIZATION_SURFACES = [
  "TEAM",
  "CLIENT",
  "SELF_TEAM",
  "SELF_CLIENT",
  "SYSTEM",
] as const;

export type AuthorizationSurface = (typeof AUTHORIZATION_SURFACES)[number];

export const PERMISSION_RISK_LEVELS = [
  "LOW",
  "MEDIUM",
  "HIGH",
  "CRITICAL",
] as const;

export type PermissionRiskLevel = (typeof PERMISSION_RISK_LEVELS)[number];

export const PERMISSION_ASSIGNABILITY = [
  "TEAM_ROLE",
  "CLIENT_ROLE",
  "SELF_ONLY",
  "SYSTEM_ONLY",
] as const;

export type PermissionAssignability =
  (typeof PERMISSION_ASSIGNABILITY)[number];

export type PermissionEffect = "ALLOW" | "DENY";

export type AuthorizationObligation =
  | "audit"
  | "reason"
  | "recent-auth"
  | "MFA"
  | "no-self"
  | "delegation-ceiling"
  | "optimistic-concurrency"
  | "exact-version"
  | "SoD"
  | "financial-evidence"
  | "client-safe-projection";

export interface PermissionDefinition<K extends string = string> {
  readonly key: K;
  readonly surface: AuthorizationSurface;
  readonly risk: PermissionRiskLevel;
  readonly assignability: PermissionAssignability;
  readonly permittedScopes: readonly AuthorizationScope[];
  readonly requiresFieldPolicy: boolean;
  readonly requiresWorkflowPolicy: boolean;
  readonly obligations: readonly AuthorizationObligation[];
  readonly activationStage: string;
}

export type SensitivityLevel =
  | "STANDARD"
  | "CONFIDENTIAL"
  | "PII"
  | "FINANCIAL"
  | "SECURITY"
  | "SECRET";

export type ResourceVisibility = "INTERNAL" | "CLIENT_SHARED" | "PUBLIC";

export interface RolePermissionConstraints {
  readonly allowedResourceTypes?: readonly string[];
  readonly maximumSensitivity?: SensitivityLevel;
  readonly allowedProjectTypes?: readonly string[];
  readonly requireAssignment?: boolean;
  readonly requireOwnership?: boolean;
  readonly allowedFieldGroups?: readonly string[];
  readonly deniedFieldGroups?: readonly string[];
  readonly clientSafeOnly?: boolean;
  readonly allowedLifecycleStates?: readonly string[];
  readonly requireReason?: boolean;
  readonly requireRecentAuthentication?: boolean;
  readonly requireMfa?: boolean;
  readonly noSelfAction?: boolean;
  readonly requireSeparationOfDuty?: boolean;
}

export interface EffectiveGrantPath<K extends string = string> {
  readonly membershipRoleId: string;
  readonly roleId: string;
  readonly roleKey: string;
  readonly permissionKey: K;
  readonly effect: PermissionEffect;
  readonly scope: AuthorizationScope;
  readonly constraints: RolePermissionConstraints;
  readonly validFrom: Date;
  readonly validUntil: Date | null;
}

export interface AuthorizationResourceContext {
  readonly resourceId?: string;
  readonly resourceType: string;
  readonly ownerOrganizationId?: string;
  readonly clientOrganizationId?: string | null;
  readonly projectId?: string | null;
  readonly projectType?: string | null;
  readonly departmentId?: string | null;
  readonly ownerUserId?: string | null;
  readonly ownerMembershipId?: string | null;
  readonly assignedMembershipIds?: readonly string[];
  readonly visibility?: ResourceVisibility;
  readonly sensitivity?: SensitivityLevel;
  readonly lifecycleState?: string;
  readonly version?: string | number | null;
  readonly contentHash?: string | null;
  readonly targetMembershipId?: string | null;
}


export interface AuthorizationFieldPolicy {
  readonly readableFields: readonly string[];
  readonly mutableFields: readonly string[];
}

export interface AuthorizationCommandContext {
  readonly action: string;
  readonly requestedFields?: readonly string[];
  readonly fieldPolicy?: AuthorizationFieldPolicy;
  readonly workflowSatisfied?: boolean;
  readonly clientSafeProjection?: boolean;
  readonly reason?: string;
  readonly recentAuthenticationSatisfied?: boolean;
  readonly mfaSatisfied?: boolean;
  readonly exactVersionMatches?: boolean;
  readonly separationOfDutySatisfied?: boolean;
  readonly delegationCeilingSatisfied?: boolean;
  readonly optimisticConcurrencySatisfied?: boolean;
  readonly financialEvidencePresent?: boolean;
}

export const AUTHORIZATION_REASON_CODES = [
  "AUTH_REQUIRED",
  "TENANT_REQUIRED",
  "MEMBERSHIP_INACTIVE",
  "ROLE_INACTIVE",
  "GRANT_EXPIRED",
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
] as const;

export type AuthorizationReasonCode =
  (typeof AUTHORIZATION_REASON_CODES)[number];

export interface AuthorizationDecision<K extends string = string> {
  readonly decision: "ALLOW" | "DENY";
  readonly reasonCode: AuthorizationReasonCode;
  readonly permissionKey: K;
  readonly matchedGrant?: EffectiveGrantPath<K>;
  readonly effectiveScope?: AuthorizationScope;
  readonly obligations: readonly AuthorizationObligation[];
  readonly readableFields?: readonly string[];
  readonly mutableFields?: readonly string[];
}

export const AUTHORITY_RESOLUTION_ISSUE_CODES = [
  "MEMBERSHIP_NOT_ACTIVE",
  "CROSS_TENANT_ROLE",
  "ROLE_NOT_ACTIVE",
  "GRANT_NOT_ACTIVE",
  "UNKNOWN_PERMISSION",
  "SURFACE_MISMATCH",
  "SCOPE_INCOMPATIBLE",
  "INVALID_CONSTRAINTS",
] as const;

export type AuthorityResolutionIssueCode =
  (typeof AUTHORITY_RESOLUTION_ISSUE_CODES)[number];

export interface AuthorityResolutionIssue<K extends string = string> {
  readonly code: AuthorityResolutionIssueCode;
  readonly roleKey?: string;
  readonly permissionKey?: K | string;
  readonly membershipRoleId?: string;
  readonly details?: readonly string[];
}

export interface ResolvedAuthority<K extends string = string> {
  readonly roleKeys: readonly string[];
  readonly actorDepartmentId?: string;
  /**
   * Coarse capability summary only. Policy evaluation MUST inspect grantPaths.
   */
  readonly permissionKeys: ReadonlySet<K>;
  readonly blockedPermissionKeys: ReadonlySet<K>;
  readonly grantPaths: readonly EffectiveGrantPath<K>[];
  readonly issues: readonly AuthorityResolutionIssue<K>[];
}

export type AuthorityResolutionResult<K extends string = string> =
  | {
      readonly kind: "resolved";
      readonly authority: ResolvedAuthority<K>;
    }
  | {
      readonly kind: "denied";
      readonly reasonCode: "MEMBERSHIP_INACTIVE";
      readonly issues: readonly AuthorityResolutionIssue<K>[];
    };
