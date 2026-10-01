import { describe, expect, it } from "vitest";

import { reconcileVerifiedPaymentEvent } from "./payment-reconciliation";
import {
  resolveConfiguredPaymentProviderAdapter,
  verifyPaymentWebhook,
} from "./payments";

const epoch = new Date("2026-10-01T12:00:00.000Z");
const invoiceId = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";

describe("R7 payment provider boundary", () => {
  it("fails closed when no production payment adapter is configured", async () => {
    expect(resolveConfiguredPaymentProviderAdapter("test-provider")).toBeUndefined();
    const result = await verifyPaymentWebhook("test-provider", {
      headers: {},
      rawBody: new TextEncoder().encode("{\"event\":\"paid\"}"),
      receivedAt: epoch,
    });
    expect(result).toEqual({ kind: "error", code: "PROVIDER_UNAVAILABLE" });
  });

  it("refuses an unbranded payment payload before any database call", async () => {
    const result = await reconcileVerifiedPaymentEvent({} as never, {
      provider: "test-provider",
      providerEventId: "evt-forged",
      invoiceId,
      currency: "USD",
      amountMinor: 100,
      eventType: "PAYMENT_SUCCEEDED",
      providerOccurredAt: epoch,
      normalizedEvidence: {},
    });
    expect(result).toEqual({ kind: "error", code: "UNVERIFIED_EVENT" });
  });

  it("rejects a malformed normalized event from an adapter", async () => {
    const result = await verifyPaymentWebhook(
      "test-provider",
      {
        headers: {},
        rawBody: new TextEncoder().encode("{\"event\":\"paid\"}"),
        receivedAt: epoch,
      },
      () => ({
        provider: "test-provider",
        verifyAndNormalize: async () => [{
          providerEventId: "evt",
          invoiceId,
          currency: "usd",
          amountMinor: 100,
          eventType: "PAYMENT_SUCCEEDED",
          providerOccurredAt: epoch,
          normalizedEvidence: {},
        }] as never,
      }),
    );
    expect(result).toEqual({ kind: "error", code: "INVALID_PAYMENT_EVENT" });
  });
});
