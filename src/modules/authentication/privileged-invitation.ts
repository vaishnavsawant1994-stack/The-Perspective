import type { OrganizationType } from "@/generated/prisma/client";

export function isPrivilegedOwnerInvitation(input: {
  readonly intendedRoleKey: string | null | undefined;
}) {
  return input.intendedRoleKey === "R01";
}

export function privilegedInvitationActivationEligibility(input: {
  readonly acceptedAt: Date | null;
  readonly termsAcceptedAt: Date | null;
  readonly revokedAt: Date | null;
  readonly intendedRoleKey: string | null | undefined;
  readonly organizationType: OrganizationType;
}) {
  return Boolean(
    input.acceptedAt &&
      input.termsAcceptedAt &&
      !input.revokedAt &&
      input.intendedRoleKey === "R01" &&
      input.organizationType === "PLATFORM",
  );
}
