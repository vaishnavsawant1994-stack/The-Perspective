import "server-only";

import type {
  MembershipId,
  OrganizationId,
  RequestContext,
  SessionId,
  UserId,
} from "@/modules/foundation/request-context";
import { verifyIdentitySessionToken } from "./service";
import type { AuthenticationSurface } from "./types";

export async function resolveAuthenticationRequestContext(
  requestId: string,
  token: string | undefined,
  surface: AuthenticationSurface,
): Promise<RequestContext> {
  const verified = await verifyIdentitySessionToken(token, surface);
  if (!verified) return { authentication: "anonymous", requestId };

  const base = {
    authentication: "authenticated" as const,
    requestId,
    identity: { userId: verified.userAccountId as UserId },
    session: {
      sessionId: verified.sessionId as SessionId,
      issuedAt: verified.issuedAt,
      expiresAt: verified.expiresAt,
      authenticationMethod: verified.authenticationMethod,
    },
  };

  if (verified.contextState === "selection-required") {
    return {
      ...base,
      scope: "identity-only",
    };
  }

  const membership = {
    membershipId: verified.membershipId as MembershipId,
    organizationId: verified.organizationId as OrganizationId,
    surface: verified.surface,
  };

  return {
    ...base,
    scope: "tenant",
    membership,
    tenant: membership,
  };
}

