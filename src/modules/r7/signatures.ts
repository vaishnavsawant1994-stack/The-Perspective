import "server-only";

export const SIGNATURE_EVENT_TYPES = [
  "SIGNER_COMPLETED",
  "REQUEST_VOIDED",
  "REQUEST_EXPIRED",
] as const;

export type SignatureEventType = (typeof SIGNATURE_EVENT_TYPES)[number];

export interface SignatureWebhookEnvelope {
  readonly headers: Readonly<Record<string, string | undefined>>;
  readonly rawBody: Uint8Array;
  readonly receivedAt: Date;
}

export interface NormalizedSignatureEvent {
  readonly providerEventId: string;
  readonly providerRequestId: string;
  readonly contractVersionId: string;
  readonly documentSha256: string;
  readonly eventType: SignatureEventType;
  readonly signerKey: string | null;
  readonly providerOccurredAt: Date | null;
  readonly normalizedEvidence: Readonly<Record<string, unknown>>;
}

export interface SignatureProviderAdapter {
  readonly provider: string;
  /**
   * Verify provider authentication over the original bytes and normalize only
   * after verification. Return null for invalid signatures or unsupported
   * provider events. Implementations must not trust caller-supplied parsed JSON.
   */
  verifyAndNormalize(
    envelope: SignatureWebhookEnvelope,
  ): Promise<readonly NormalizedSignatureEvent[] | null>;
}

export type SignatureProviderAdapterResolver = (
  provider: string,
) => SignatureProviderAdapter | undefined;

export const resolveConfiguredSignatureProviderAdapter:
  SignatureProviderAdapterResolver = () => undefined;

const verifiedSignatureEvent = Symbol("VerifiedSignatureEvent");

export type VerifiedSignatureEvent = NormalizedSignatureEvent & {
  readonly provider: string;
  readonly receivedAt: Date;
  readonly [verifiedSignatureEvent]: true;
};

export type SignatureVerificationResult =
  | { readonly kind: "ok"; readonly events: readonly VerifiedSignatureEvent[] }
  | {
      readonly kind: "error";
      readonly code:
        | "INVALID_PROVIDER"
        | "PROVIDER_UNAVAILABLE"
        | "INVALID_SIGNATURE_EVENT";
    };

const UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/iu;
const SHA256 = /^[0-9a-f]{64}$/u;
const MAX_EVENTS_PER_WEBHOOK = 100;

function validEvent(candidate: unknown): candidate is NormalizedSignatureEvent {
  if (
    typeof candidate !== "object" ||
    candidate === null ||
    Array.isArray(candidate)
  ) {
    return false;
  }

  const event = candidate as Record<string, unknown>;
  return (
    typeof event.providerEventId === "string" &&
    event.providerEventId.length > 0 &&
    event.providerEventId.length <= 500 &&
    typeof event.providerRequestId === "string" &&
    event.providerRequestId.length > 0 &&
    event.providerRequestId.length <= 500 &&
    typeof event.contractVersionId === "string" &&
    UUID.test(event.contractVersionId) &&
    typeof event.documentSha256 === "string" &&
    SHA256.test(event.documentSha256) &&
    typeof event.eventType === "string" &&
    SIGNATURE_EVENT_TYPES.some((type) => type === event.eventType) &&
    (event.signerKey === null ||
      (typeof event.signerKey === "string" &&
        event.signerKey.length > 0 &&
        event.signerKey.length <= 500)) &&
    (event.eventType !== "SIGNER_COMPLETED" ||
      (typeof event.signerKey === "string" && event.signerKey.length > 0)) &&
    (event.providerOccurredAt === null ||
      (event.providerOccurredAt instanceof Date &&
        Number.isFinite(event.providerOccurredAt.getTime()))) &&
    typeof event.normalizedEvidence === "object" &&
    event.normalizedEvidence !== null &&
    !Array.isArray(event.normalizedEvidence)
  );
}

/**
 * The adapter is a trust boundary. Only its authenticated, normalized result
 * becomes a branded event. The default resolver deliberately trusts nobody.
 */
export async function verifySignatureWebhook(
  provider: string,
  envelope: SignatureWebhookEnvelope,
  resolve: SignatureProviderAdapterResolver =
    resolveConfiguredSignatureProviderAdapter,
): Promise<SignatureVerificationResult> {
  if (
    typeof provider !== "string" ||
    !/^[a-z0-9][a-z0-9._-]{0,99}$/u.test(provider) ||
    !(envelope.rawBody instanceof Uint8Array) ||
    envelope.rawBody.byteLength === 0 ||
    !(envelope.receivedAt instanceof Date) ||
    !Number.isFinite(envelope.receivedAt.getTime())
  ) {
    return { kind: "error", code: "INVALID_PROVIDER" };
  }

  const adapter = resolve(provider);
  if (!adapter || adapter.provider !== provider) {
    return { kind: "error", code: "PROVIDER_UNAVAILABLE" };
  }

  let normalized: readonly NormalizedSignatureEvent[] | null;
  try {
    normalized = await adapter.verifyAndNormalize(envelope);
  } catch {
    return { kind: "error", code: "INVALID_SIGNATURE_EVENT" };
  }

  if (
    !normalized ||
    normalized.length === 0 ||
    normalized.length > MAX_EVENTS_PER_WEBHOOK ||
    normalized.some((event) => !validEvent(event))
  ) {
    return { kind: "error", code: "INVALID_SIGNATURE_EVENT" };
  }

  return {
    kind: "ok",
    events: normalized.map((event) => ({
      ...event,
      provider,
      receivedAt: new Date(envelope.receivedAt.getTime()),
      [verifiedSignatureEvent]: true as const,
    })),
  };
}

export function isVerifiedSignatureEvent(
  value: unknown,
): value is VerifiedSignatureEvent {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value) &&
    verifiedSignatureEvent in value &&
    (value as { [verifiedSignatureEvent]?: unknown })[verifiedSignatureEvent] ===
      true
  );
}
