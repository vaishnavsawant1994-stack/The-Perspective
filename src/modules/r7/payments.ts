import "server-only";

export const PAYMENT_EVENT_TYPES = [
  "PAYMENT_SUCCEEDED",
  "PAYMENT_FAILED",
  "PAYMENT_CANCELED",
] as const;

export type PaymentEventType = (typeof PAYMENT_EVENT_TYPES)[number];

export interface PaymentWebhookEnvelope {
  readonly headers: Readonly<Record<string, string | undefined>>;
  readonly rawBody: Uint8Array;
  readonly receivedAt: Date;
}

export interface NormalizedPaymentEvent {
  readonly providerEventId: string;
  readonly invoiceId: string;
  readonly currency: string;
  readonly amountMinor: number;
  readonly eventType: PaymentEventType;
  readonly providerOccurredAt: Date;
  readonly normalizedEvidence: Readonly<Record<string, unknown>>;
}

export interface PaymentProviderAdapter {
  readonly provider: string;
  /**
   * Verify provider authentication over the original bytes and normalize only
   * after verification. Return null for an invalid signature or unsupported event.
   * Implementations must not trust caller-supplied parsed JSON.
   */
  verifyAndNormalize(
    envelope: PaymentWebhookEnvelope,
  ): Promise<readonly NormalizedPaymentEvent[] | null>;
}

export type PaymentProviderAdapterResolver = (
  provider: string,
) => PaymentProviderAdapter | undefined;

/** Production payment capture trusts nobody until a real adapter is configured. */
export const resolveConfiguredPaymentProviderAdapter:
  PaymentProviderAdapterResolver = () => undefined;

const verifiedPaymentEvent = Symbol("VerifiedPaymentEvent");

export type VerifiedPaymentEvent = NormalizedPaymentEvent & {
  readonly provider: string;
  readonly receivedAt: Date;
  readonly [verifiedPaymentEvent]: true;
};

export type PaymentVerificationResult =
  | { readonly kind: "ok"; readonly events: readonly VerifiedPaymentEvent[] }
  | {
      readonly kind: "error";
      readonly code: "INVALID_PROVIDER" | "PROVIDER_UNAVAILABLE" | "INVALID_PAYMENT_EVENT";
    };

const UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/iu;
const MAX_EVENTS_PER_WEBHOOK = 100;

function validEvent(candidate: unknown): candidate is NormalizedPaymentEvent {
  if (typeof candidate !== "object" || candidate === null || Array.isArray(candidate)) {
    return false;
  }
  const event = candidate as Record<string, unknown>;
  return typeof event.providerEventId === "string"
    && event.providerEventId.length > 0
    && event.providerEventId.length <= 500
    && typeof event.invoiceId === "string"
    && UUID.test(event.invoiceId)
    && typeof event.currency === "string"
    && /^[A-Z]{3}$/u.test(event.currency)
    && typeof event.amountMinor === "number"
    && Number.isSafeInteger(event.amountMinor)
    && event.amountMinor > 0
    && typeof event.eventType === "string"
    && PAYMENT_EVENT_TYPES.some((type) => type === event.eventType)
    && event.providerOccurredAt instanceof Date
    && Number.isFinite(event.providerOccurredAt.getTime())
    && typeof event.normalizedEvidence === "object"
    && event.normalizedEvidence !== null
    && !Array.isArray(event.normalizedEvidence);
}

/**
 * The adapter is a trust boundary. Only its authenticated, normalized result
 * becomes a branded event. The default resolver deliberately trusts nobody.
 */
export async function verifyPaymentWebhook(
  provider: string,
  envelope: PaymentWebhookEnvelope,
  resolve: PaymentProviderAdapterResolver = resolveConfiguredPaymentProviderAdapter,
): Promise<PaymentVerificationResult> {
  if (
    typeof provider !== "string"
    || !/^[a-z0-9][a-z0-9._-]{0,99}$/u.test(provider)
    || !(envelope.rawBody instanceof Uint8Array)
    || envelope.rawBody.byteLength === 0
    || !(envelope.receivedAt instanceof Date)
    || !Number.isFinite(envelope.receivedAt.getTime())
  ) {
    return { kind: "error", code: "INVALID_PROVIDER" };
  }
  const adapter = resolve(provider);
  if (!adapter || adapter.provider !== provider) {
    return { kind: "error", code: "PROVIDER_UNAVAILABLE" };
  }
  let normalized: readonly NormalizedPaymentEvent[] | null;
  try {
    normalized = await adapter.verifyAndNormalize(envelope);
  } catch {
    return { kind: "error", code: "INVALID_PAYMENT_EVENT" };
  }
  if (
    !normalized
    || normalized.length === 0
    || normalized.length > MAX_EVENTS_PER_WEBHOOK
    || normalized.some((event) => !validEvent(event))
  ) {
    return { kind: "error", code: "INVALID_PAYMENT_EVENT" };
  }
  return {
    kind: "ok",
    events: normalized.map((event) => ({
      ...event,
      provider,
      receivedAt: new Date(envelope.receivedAt.getTime()),
      [verifiedPaymentEvent]: true as const,
    })),
  };
}

export function isVerifiedPaymentEvent(value: unknown): value is VerifiedPaymentEvent {
  return typeof value === "object"
    && value !== null
    && !Array.isArray(value)
    && verifiedPaymentEvent in value
    && (value as { [verifiedPaymentEvent]?: unknown })[verifiedPaymentEvent] === true;
}
