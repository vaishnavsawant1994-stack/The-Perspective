export type AuthenticationSurface = "TEAM" | "CLIENT";

export interface AuthenticationRequestMetadata {
  readonly correlationId: string;
  readonly ipAddress?: string;
  readonly deviceId?: string;
}

export interface VerifiedAuthenticationSession {
  readonly sessionId: string;
  readonly userAccountId: string;
  readonly membershipId: string;
  readonly organizationId: string;
  readonly surface: AuthenticationSurface;
  readonly issuedAt: Date;
  readonly expiresAt: Date;
  readonly authenticationMethod: string;
  readonly mfaVerifiedAt?: Date;
}

export type LoginResult =
  | {
      readonly kind: "authenticated";
      readonly session: VerifiedAuthenticationSession;
      readonly token: string;
    }
  | {
      readonly kind: "mfa-required";
      readonly challengeToken: string;
      readonly expiresAt: Date;
    }
  | { readonly kind: "invalid" }
  | { readonly kind: "throttled" };

