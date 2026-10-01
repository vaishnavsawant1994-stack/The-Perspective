import { describe, expect, it } from "vitest";

import type { TenantScopedRequestContext } from "@/modules/foundation/request-context";

import { createInvoiceDraft, issueInvoice } from "./invoice-draft";

const owner = "11111111-1111-4111-8111-111111111111";

function team(): TenantScopedRequestContext {
  return {
    authentication: "authenticated",
    scope: "tenant",
    requestId: "r7-invoice-draft",
    identity: { userId: "user" as never },
    session: {
      sessionId: "session" as never,
      issuedAt: new Date("2026-10-01T00:00:00.000Z"),
      expiresAt: new Date("2026-10-01T01:00:00.000Z"),
      authenticationMethod: "TEST",
    },
    membership: {
      membershipId: "membership" as never,
      organizationId: owner as never,
      surface: "TEAM",
    },
    tenant: {
      organizationId: owner as never,
      membershipId: "membership" as never,
      surface: "TEAM",
    },
  };
}

describe("R7 invoice draft commands", () => {
  it("rejects a client actor and malformed identifiers before a database call", async () => {
    const client = team();
    const input = {
      contractId: "33333333-3333-4333-8333-333333333333",
      expectedContractVersionId: "44444444-4444-4444-8444-444444444444",
      expectedContractVersion: 1,
      idempotencyKey: "invoice-draft-1",
    };
    await expect(createInvoiceDraft(
      { ...client, tenant: { ...client.tenant, surface: "CLIENT" }, membership: { ...client.membership, surface: "CLIENT" } },
      input,
    )).resolves.toEqual({ kind: "error", code: "TEAM_REQUIRED" });
    await expect(createInvoiceDraft(team(), { ...input, contractId: "not-a-contract" })).resolves.toEqual({
      kind: "error",
      code: "INVALID",
    });
    await expect(issueInvoice(team(), {
      invoiceId: "not-an-invoice",
      expectedRowVersion: 1,
      idempotencyKey: "invoice-issue-1",
    })).resolves.toEqual({ kind: "error", code: "INVALID" });
  });
});
