import { describe, expect, it } from "vitest";
import {
  isPrivilegedOwnerInvitation,
  privilegedInvitationActivationEligibility,
} from "./privileged-invitation";

describe("privileged invitation activation", () => {
  it("recognizes only the canonical R01 role as MFA-gated", () => {
    expect(isPrivilegedOwnerInvitation({ intendedRoleKey: "R01" })).toBe(true);
    expect(isPrivilegedOwnerInvitation({ intendedRoleKey: "R02" })).toBe(false);
    expect(isPrivilegedOwnerInvitation({ intendedRoleKey: null })).toBe(false);
  });

  it("requires acceptance, accepted terms, an active PLATFORM organization and R01", () => {
    const now = new Date();
    const accepted = {
      acceptedAt: now,
      termsAcceptedAt: now,
      revokedAt: null,
      intendedRoleKey: "R01",
      organizationType: "PLATFORM" as const,
    };
    expect(privilegedInvitationActivationEligibility(accepted)).toBe(true);
    expect(privilegedInvitationActivationEligibility({ ...accepted, acceptedAt: null })).toBe(false);
    expect(privilegedInvitationActivationEligibility({ ...accepted, termsAcceptedAt: null })).toBe(false);
    expect(privilegedInvitationActivationEligibility({ ...accepted, revokedAt: now })).toBe(false);
    expect(privilegedInvitationActivationEligibility({ ...accepted, intendedRoleKey: "R02" })).toBe(false);
    expect(privilegedInvitationActivationEligibility({ ...accepted, organizationType: "CLIENT" })).toBe(false);
  });
});
