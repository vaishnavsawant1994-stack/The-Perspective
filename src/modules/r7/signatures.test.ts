import { describe, expect, it } from "vitest";

import {
  verifySignatureWebhook,
  type NormalizedSignatureEvent,
  type SignatureProviderAdapter,
  type SignatureWebhookEnvelope,
} from "./signatures";

const event: NormalizedSignatureEvent = {
  providerEventId: "evt_test_1",
  providerRequestId: "req_test_1",
  contractVersionId: "123e4567-e89b-42d3-a456-426614174000",
  documentSha256: "a".repeat(64),
  eventType: "SIGNER_COMPLETED",
  signerKey: "signer-1",
  providerOccurredAt: new Date("2026-01-01T00:00:00.000Z"),
  normalizedEvidence: { signer: "signer-1" },
};

function envelope(): SignatureWebhookEnvelope {
  return {
    headers: { "x-test-signature": "valid" },
    rawBody: new TextEncoder().encode('{"event":"test"}'),
    receivedAt: new Date("2026-01-02T00:00:00.000Z"),
  };
}

function adapter(
  verifyAndNormalize: SignatureProviderAdapter["verifyAndNormalize"] =
    async () => [event],
): SignatureProviderAdapter {
  return {
    provider: "test-provider",
    verifyAndNormalize,
  };
}

describe("R7 signature provider boundary", () => {
  it("fails closed when no production provider adapter is configured", async () => {
    await expect(
      verifySignatureWebhook("test-provider", envelope()),
    ).resolves.toEqual({
      kind: "error",
      code: "PROVIDER_UNAVAILABLE",
    });
  });

  it("rejects malformed or mismatched provider identities", async () => {
    await expect(
      verifySignatureWebhook("bad provider", envelope(), () => adapter()),
    ).resolves.toEqual({ kind: "error", code: "INVALID_PROVIDER" });

    await expect(
      verifySignatureWebhook("other-provider", envelope(), () => adapter()),
    ).resolves.toEqual({ kind: "error", code: "PROVIDER_UNAVAILABLE" });
  });

  it("brands only adapter-verified normalized events and records server receipt time", async () => {
    const receivedAt = envelope().receivedAt;
    const result = await verifySignatureWebhook(
      "test-provider",
      { ...envelope(), receivedAt },
      () => adapter(),
    );

    expect(result.kind).toBe("ok");
    if (result.kind !== "ok") return;
    expect(result.events).toHaveLength(1);
    expect(result.events[0]).toMatchObject({
      ...event,
      provider: "test-provider",
      receivedAt,
    });
    expect(result.events[0].receivedAt).not.toBe(receivedAt);
  });

  it("rejects empty, oversized, malformed and unsupported normalized events", async () => {
    for (const normalized of [
      null,
      [],
      [null],
      [{ ...event, contractVersionId: "not-a-uuid" }],
      [{ ...event, documentSha256: "not-a-digest" }],
      [{ ...event, eventType: "SIGNED" }],
      [{ ...event, normalizedEvidence: [] }],
    ] as unknown as readonly NormalizedSignatureEvent[][]) {
      const result = await verifySignatureWebhook(
        "test-provider",
        envelope(),
        () => adapter(async () => normalized),
      );
      expect(result).toEqual({
        kind: "error",
        code: "INVALID_SIGNATURE_EVENT",
      });
    }

    const oversized = Array.from({ length: 101 }, () => event);
    await expect(
      verifySignatureWebhook(
        "test-provider",
        envelope(),
        () => adapter(async () => oversized),
      ),
    ).resolves.toEqual({
      kind: "error",
      code: "INVALID_SIGNATURE_EVENT",
    });
  });

  it("fails closed when provider verification throws", async () => {
    await expect(
      verifySignatureWebhook(
        "test-provider",
        envelope(),
        () => adapter(async () => {
          throw new Error("provider verification failed");
        }),
      ),
    ).resolves.toEqual({
      kind: "error",
      code: "INVALID_SIGNATURE_EVENT",
    });
  });

  it("rejects invalid request envelopes before consulting an adapter", async () => {
    let consulted = false;
    const result = await verifySignatureWebhook(
      "test-provider",
      { ...envelope(), rawBody: new Uint8Array() },
      () => {
        consulted = true;
        return adapter();
      },
    );

    expect(result).toEqual({ kind: "error", code: "INVALID_PROVIDER" });
    expect(consulted).toBe(false);
  });
});
