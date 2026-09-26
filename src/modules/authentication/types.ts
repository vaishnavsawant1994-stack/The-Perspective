export type AuthenticationSurface = "TEAM" | "CLIENT";

export interface AuthenticationRequestMetadata {
  readonly correlationId: string;
  readonly ipAddress?: string;
  readonly deviceId?: string;
}

export interface AuthenticationContextOption {
  readonly membershipId: string;
  readonly organizationId: string;
  readonly organizationName: string;
  readonly surface: AuthenticationSurface;
}

interface VerifiedSessionBase {
  readonly sessionId: string;
  readonly userAccountId: string;
  readonly surface: AuthenticationSurface;
  readonly issuedAt: Date;
  readonly expiresAt: Date;
  readonly authenticationMethod: string;
  readonly mfaVerifiedAt?: Date;
}

export interface VerifiedUnselectedAuthenticationSession
  extends VerifiedSessionBase {
  readonly contextState: "selection-required";
}

export interface VerifiedAuthenticationSession extends VerifiedSessionBase {
  readonly contextState: "selected";
  readonly membershipId: string;
  readonly organizationId: string;
}

export type VerifiedIdentitySession =
  | VerifiedUnselectedAuthenticationSession
  | VerifiedAuthenticationSession;

export type LoginResult =
  | {
      readonly kind: "authenticated";
      readonly session: VerifiedAuthenticationSession;
      readonly token: string;
    }
  | {
      readonly kind: "context-selection-required";
      readonly session: VerifiedUnselectedAuthenticationSession;
      readonly token: string;
      readonly contexts: readonly AuthenticationContextOption[];
    }
  | {
      readonly kind: "mfa-required";
      readonly challengeToken: string;
      readonly expiresAt: Date;
    }
  | { readonly kind: "invalid" }
  | { readonly kind: "throttled" };
