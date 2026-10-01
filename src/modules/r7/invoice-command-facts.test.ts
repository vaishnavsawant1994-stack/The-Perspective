import { describe, expect, it } from "vitest";

import type {
  MembershipId,
  OrganizationId,
  UserId,
} from "@/modules/foundation/request-context";
import type { CommercialContext } from "@/modules/commercial/persistence";

import { invoiceCommandFacts } from "./resources";

const ownerId = "00000000-0000-4000-8000-000000000501";

function team(): CommercialContext {
  return {
    authentication: "authenticated",
    scope: "tenant",
    requestId: "invoice-facts",
    identity: { userId: "user-1" as UserId },
    session: {
      sessionId: "session-1" as never,
      issuedAt: new Date("2026-10-01T12:00:00.000Z"),
      expiresAt: new Date("2026-10-01T13:00:00.000Z"),
      authenticationMethod: "TEST",
    },
    membership: {
      membershipId: "00000000-0000-4000-8000-000000000502" as MembershipId,
      organizationId: ownerId as OrganizationId,
      surface: "TEAM",
    },
    tenant: {
      organizationId: ownerId as OrganizationId,
      membershipId: "00000000-0000-4000-8000-000000000502" as MembershipId,
      surface: "TEAM",
    },
  };
}

const row = {
  id: "00000000-0000-4000-8000-000000000503",
  resource_id: "00000000-0000-4000-8000-000000000504",
  owner_organization_id: ownerId,
  status: "DRAFT",
  row_version: 1,
  currency: "USD",
  subtotal_minor: BigInt(100),
  tax_minor: BigInt(5),
  total_minor: BigInt(105),
  source_contract_version_id: "00000000-0000-4000-8000-000000000505",
  line_count: 1,
};

describe("invoice command facts", () => {
  it("accepts only a server snapshot whose line math matches", () => {
    expect(invoiceCommandFacts(team(), row)).toEqual({
      financialEvidencePresent: true,
      separationOfDutySatisfied: true,
    });
    expect(invoiceCommandFacts(team(), { ...row, total_minor: BigInt(1) })?.financialEvidencePresent).toBe(false);
    expect(invoiceCommandFacts(team(), { ...row, currency: "usd" })?.financialEvidencePresent).toBe(false);
    expect(invoiceCommandFacts(team(), { ...row, source_contract_version_id: null })?.financialEvidencePresent).toBe(false);
    expect(invoiceCommandFacts(team(), { ...row, line_count: 0 })?.financialEvidencePresent).toBe(false);
  });

  it("does not attest separation of duty for a foreign owner", () => {
    expect(invoiceCommandFacts(team(), { ...row, owner_organization_id: "foreign" })).toBeNull();
  });
});
