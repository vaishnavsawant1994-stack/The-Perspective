export type UserId = string & { readonly __brand: "UserId" };
export type SessionId = string & { readonly __brand: "SessionId" };
export type OrganizationId = string & { readonly __brand: "OrganizationId" };
export type MembershipId = string & { readonly __brand: "MembershipId" };
export type PermissionKey = string & { readonly __brand: "PermissionKey" };

export interface RequestIdentity {
  readonly userId: UserId;
  readonly displayName?: string;
  readonly email?: string;
}

export interface RequestSession {
  readonly sessionId: SessionId;
  readonly issuedAt: Date;
  readonly expiresAt: Date;
  readonly authenticationMethod: string;
}

export interface RequestTenant {
  readonly organizationId: OrganizationId;
  readonly membershipId: MembershipId;
  readonly surface: "TEAM" | "CLIENT";
}

export type EffectiveAuthorizationScope =
  | "ORG"
  | "DEPT"
  | "ASN"
  | "OWN"
  | "CLIENT"
  | "READ"
  | "NONE";

export interface EffectiveAuthorizationGrant {
  readonly membershipRoleId: string;
  readonly roleId: string;
  readonly roleKey: string;
  readonly permissionKey: PermissionKey;
  readonly effect: "ALLOW" | "DENY";
  readonly scope: EffectiveAuthorizationScope;
  readonly constraints: Readonly<Record<string, unknown>>;
  readonly validFrom: Date;
  readonly validUntil: Date | null;
}

export interface EffectiveAuthorization {
  readonly roleKeys: readonly string[];
  /**
   * Coarse capability summary only. Resource authorization MUST use grantPaths.
   */
  readonly permissions: ReadonlySet<PermissionKey>;
  readonly blockedPermissions: ReadonlySet<PermissionKey>;
  readonly grantPaths: readonly EffectiveAuthorizationGrant[];
}

export interface AuthenticationMembership {
  readonly membershipId: MembershipId;
  readonly organizationId: OrganizationId;
  readonly surface: "TEAM" | "CLIENT";
}

export interface AnonymousRequestContext {
  readonly authentication: "anonymous";
  readonly requestId: string;
}

export interface IdentityAuthenticatedRequestContext {
  readonly authentication: "authenticated";
  readonly scope: "identity-only";
  readonly requestId: string;
  readonly identity: RequestIdentity;
  readonly session: RequestSession;
}

export interface TenantScopedRequestContext {
  readonly authentication: "authenticated";
  readonly scope: "tenant";
  readonly requestId: string;
  readonly identity: RequestIdentity;
  readonly session: RequestSession;
  readonly membership: AuthenticationMembership;
  readonly tenant: RequestTenant;
}

export interface AuthorizedRequestContext {
  readonly authentication: "authenticated";
  readonly scope: "authorized";
  readonly requestId: string;
  readonly identity: RequestIdentity;
  readonly session: RequestSession;
  readonly membership: AuthenticationMembership;
  readonly tenant: RequestTenant;
  readonly authorization: EffectiveAuthorization;
}

export type AuthenticatedRequestContext =
  | IdentityAuthenticatedRequestContext
  | TenantScopedRequestContext
  | AuthorizedRequestContext;

export type RequestContext =
  | AnonymousRequestContext
  | AuthenticatedRequestContext;

export function isAuthenticatedRequestContext(
  context: RequestContext,
): context is AuthenticatedRequestContext {
  return context.authentication === "authenticated";
}

export function isTenantScopedRequestContext(
  context: RequestContext,
): context is TenantScopedRequestContext | AuthorizedRequestContext {
  return context.authentication === "authenticated" && context.scope !== "identity-only";
}

export function isAuthorizedRequestContext(
  context: RequestContext,
): context is AuthorizedRequestContext {
  return context.authentication === "authenticated" && context.scope === "authorized";
}
