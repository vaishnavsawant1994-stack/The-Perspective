import { describe, expect, it } from "vitest";

import type { TenantScopedRequestContext } from "@/modules/foundation/request-context";

import { requestContractSignature } from "./signature-request";
import {
  resolveOutboundSignatureProvider,
  type SignatureProviderAdapter,
} from "./signatures";

const owner = "11111111-1111-4111-8111-111111111111";

function team(): TenantScopedRequestContext {
  return {
    authentication: "authenticated",
    scope: "tenant",
    requestId: "r7-signature-request",
    identity: { userId: "user" as never },
    session: {
      sessionId: "session" as never,
      issuedAt: new Date("2026-09-30T00:00:00.000Z"),
      expiresAt: new Date("2026-09-30T01:00:00.000Z"),
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

const input = {
  contractId: "33333333-3333-4333-8333-333333333333",
  expectedVersionId: "44444444-4444-4444-8444-444444444444",
  expectedVersion: 1,
  expectedRowVersion: 1,
  expectedDocumentSha256: "ab".repeat(32),
  idempotencyKey: "contract-send-001",
};

describe("R7 outbound signature request", () => {
  it("fails closed when no production provider is configured", async () => {
    expect(resolveOutboundSignatureProvider()).toBeUndefined();
    await expect(requestContractSignature(team(), input)).resolves.toEqual({
      kind: "error",
      code: "PROVIDER_UNAVAILABLE",
    });
  });

  it("rejects a client actor and a malformed contract before any provider call", async () => {
    const calls: string[] = [];
    const adapter: SignatureProviderAdapter = {
      provider: "test-provider",
      verifyAndNormalize: async () => null,
      submitSignatureRequest: async () => {
        calls.push("submit");
        return { providerRequestId: "env-1" };
      },
    };
    const client = team();
    await expect(requestContractSignature(
      { ...client, tenant: { ...client.tenant, surface: "CLIENT" }, membership: { ...client.membership, surface: "CLIENT" } },
      input,
      undefined,
      adapter,
    )).resolves.toEqual({ kind: "error", code: "TEAM_REQUIRED" });
    await expect(requestContractSignature(
      team(),
      { ...input, contractId: "not-a-uuid" },
      undefined,
      adapter,
    )).resolves.toEqual({ kind: "error", code: "INVALID" });
    expect(calls).toEqual([]);
  });
});
