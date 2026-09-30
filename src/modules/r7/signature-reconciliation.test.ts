import { describe, expect, it } from "vitest";

import {
  decideSignatureReconciliation,
  reconcileVerifiedSignatureEvent,
  type ReconciliationSnapshot,
} from "./signature-reconciliation";
import {
  verifySignatureWebhook,
  type NormalizedSignatureEvent,
} from "./signatures";

const owner = "11111111-1111-4111-8111-111111111111";
const requestId = "22222222-2222-4222-8222-222222222222";
const contractId = "33333333-3333-4333-8333-333333333333";
const versionId = "44444444-4444-4444-8444-444444444444";
const digest = "ab".repeat(32);

function snapshot(overrides: Partial<ReconciliationSnapshot> = {}): ReconciliationSnapshot {
  return {
    request: {
      id: requestId,
      ownerOrganizationId: owner,
      contractId,
      contractVersionId: versionId,
      provider: "test-provider",
      providerRequestId: "req-1",
      documentSha256: digest,
      status: "SENT",
    },
    version: {
      id: versionId,
      ownerOrganizationId: owner,
      contractId,
      status: "OUT_FOR_SIGNATURE",
      documentSha256: digest,
    },
    requiredSignerKeys: ["signer-a", "signer-b"],
    knownSignerKeys: ["signer-a", "signer-b"],
    completedSignerKeys: [],
    existingEvent: null,
    ...overrides,
  };
}

function decide(
  overrides: Partial<Parameters<typeof decideSignatureReconciliation>[0]> = {},
  state: Partial<ReconciliationSnapshot> = {},
) {
  return decideSignatureReconciliation({
    ownerOrganizationId: owner,
    eventHash: "hash-1",
    provider: "test-provider",
    providerRequestId: "req-1",
    contractVersionId: versionId,
    documentSha256: digest,
    eventType: "SIGNER_COMPLETED",
    signerKey: "signer-a",
    snapshot: snapshot(state),
    ...overrides,
  });
}

describe("R7 signature reconciliation decisions", () => {
  it("records one required signer without signing a multi-signer contract", () => {
    expect(decide().kind === "ok" && decide().code).toBe("SIGNER_RECORDED");
  });

  it("signs only when every required signer has completion evidence", () => {
    const result = decide({}, { completedSignerKeys: ["signer-b"] });
    expect(result).toMatchObject({ kind: "ok", code: "SIGNED", contractStatus: "SIGNED" });
  });

  it("does not let one signer complete a multi-signer set", () => {
    expect(decide({ signerKey: "signer-a" })).toMatchObject({ code: "SIGNER_RECORDED" });
  });

  it("rejects an unknown signer and does not count them", () => {
    expect(decide({ signerKey: "intruder" })).toEqual({ kind: "error", code: "SIGNER_DENIED" });
  });

  it("treats a duplicate signer event as recorded, not a second completion", () => {
    const result = decide({}, { completedSignerKeys: ["signer-a"] });
    expect(result).toMatchObject({ kind: "ok", code: "SIGNER_RECORDED", contractStatus: "OUT_FOR_SIGNATURE" });
  });

  it("rejects the wrong request, version, contract, tenant and digest", () => {
    expect(decide({ providerRequestId: "other-request" })).toEqual({ kind: "error", code: "NOT_FOUND" });
    expect(decide({ contractVersionId: "55555555-5555-4555-8555-555555555555" })).toEqual({
      kind: "error",
      code: "CORRELATION_DENIED",
    });
    expect(decide({}, { version: { ...snapshot().version!, contractId: "99999999-9999-4999-8999-999999999999" } })).toEqual({
      kind: "error",
      code: "CORRELATION_DENIED",
    });
    expect(decide({ ownerOrganizationId: "66666666-6666-4666-8666-666666666666" })).toEqual({
      kind: "error",
      code: "NOT_FOUND",
    });
    expect(decide({ documentSha256: "cd".repeat(32) })).toEqual({
      kind: "error",
      code: "CORRELATION_DENIED",
    });
  });

  it("replays an exact event and conflicts when the same id carries different evidence", () => {
    expect(decide({}, {
      existingEvent: { ownerOrganizationId: owner, eventHash: "hash-1", outcome: "SIGNER_RECORDED" },
    })).toMatchObject({ kind: "ok", code: "REPLAY", priorCode: "SIGNER_RECORDED" });
    expect(decide({}, {
      existingEvent: { ownerOrganizationId: owner, eventHash: "hash-changed", outcome: "SIGNER_RECORDED" },
    })).toEqual({ kind: "error", code: "EVIDENCE_CONFLICT" });
    expect(decide({}, {
      existingEvent: { ownerOrganizationId: "66666666-6666-4666-8666-666666666666", eventHash: "hash-1", outcome: "SIGNED" },
    })).toEqual({ kind: "error", code: "EVIDENCE_CONFLICT" });
  });

  it("does not regress a terminal SIGNED contract and rejects ineligible versions", () => {
    expect(decide({ eventType: "REQUEST_VOIDED", signerKey: null }, {
      version: { ...snapshot().version!, status: "SIGNED" },
    })).toMatchObject({ code: "IGNORED_TERMINAL", contractStatus: "SIGNED" });
    expect(decide({}, { version: { ...snapshot().version!, status: "DRAFT" } })).toEqual({
      kind: "error",
      code: "INELIGIBLE",
    });
  });

  it("voids or expires only from OUT_FOR_SIGNATURE", () => {
    expect(decide({ eventType: "REQUEST_VOIDED", signerKey: null })).toMatchObject({
      code: "VOIDED",
      contractStatus: "VOID",
    });
    expect(decide({ eventType: "REQUEST_EXPIRED", signerKey: null })).toMatchObject({
      code: "EXPIRED",
      contractStatus: "EXPIRED",
    });
  });

  it("rejects a caller-supplied SIGNED event and an empty required signer set", () => {
    expect(decide({ eventType: "SIGNED" })).toEqual({ kind: "error", code: "INVALID_EVENT" });
    expect(decide({}, { requiredSignerKeys: [] })).toEqual({ kind: "error", code: "INELIGIBLE" });
  });

  it("refuses an unbranded provider payload before any database call", async () => {
    const payload: NormalizedSignatureEvent = {
      providerEventId: "evt-1",
      providerRequestId: "req-1",
      contractVersionId: versionId,
      documentSha256: digest,
      eventType: "SIGNER_COMPLETED",
      signerKey: "signer-a",
      providerOccurredAt: null,
      normalizedEvidence: { signer: "signer-a" },
    };
    await expect(
      reconcileVerifiedSignatureEvent(
        {
          authentication: "authenticated",
          scope: "tenant",
          requestId: "r7-signature-unverified",
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
        },
        payload,
      ),
    ).resolves.toEqual({ kind: "error", code: "UNVERIFIED_EVENT" });
  });

  it("rejects null, non-object and signer-less completion from the adapter", async () => {
    const envelope = {
      headers: {},
      rawBody: new TextEncoder().encode("{}"),
      receivedAt: new Date("2026-09-30T00:00:00.000Z"),
    };
    for (const normalized of [null, [], [{ providerEventId: "evt" }]]) {
      await expect(
        verifySignatureWebhook("test-provider", envelope, () => ({
          provider: "test-provider",
          verifyAndNormalize: async () => normalized as never,
        })),
      ).resolves.toEqual({ kind: "error", code: "INVALID_SIGNATURE_EVENT" });
    }
    await expect(
      verifySignatureWebhook("test-provider", envelope, () => ({
        provider: "test-provider",
        verifyAndNormalize: async () => {
          throw new Error("adapter down");
        },
      })),
    ).resolves.toEqual({ kind: "error", code: "INVALID_SIGNATURE_EVENT" });
    await expect(
      verifySignatureWebhook("missing-provider", envelope, () => undefined),
    ).resolves.toEqual({ kind: "error", code: "PROVIDER_UNAVAILABLE" });
  });
});
