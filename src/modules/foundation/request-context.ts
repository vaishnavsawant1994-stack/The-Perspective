export type UserId = string & { readonly __brand: "UserId" };
export type SessionId = string & { readonly __brand: "SessionId" };
export type OrganizationId = string & { readonly __brand: "OrganizationId" };
export type WorkspaceId = string & { readonly __brand: "WorkspaceId" };
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
  readonly workspaceId: WorkspaceId;
  readonly membershipId: MembershipId;
}

export interface EffectiveAuthorization {
  readonly roleKeys: readonly string[];
  readonly permissions: ReadonlySet<PermissionKey>;
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
  readonly membership: AuthenticationMembership;
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
  | AuthorizedRequestContext;

export type RequestContext =
  | AnonymousRequestContext
  | AuthenticatedRequestContext;

export function isAuthenticatedRequestContext(
  context: RequestContext,
): context is AuthenticatedRequestContext {
  return context.authentication === "authenticated";
}

export function isAuthorizedRequestContext(
  context: RequestContext,
): context is AuthorizedRequestContext {
  return context.authentication === "authenticated" && context.scope === "authorized";
}
