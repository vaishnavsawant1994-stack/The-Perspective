import "server-only";

export interface R6ProviderDispatchRequest {
  readonly eventId: string;
  readonly idempotencyKey: string;
  readonly campaignId: string;
  readonly campaignRecipientId: string;
  readonly provider: string;
  readonly channel: string;
  readonly destination: string;
  readonly destinationHash: string;
}

export interface R6ProviderDispatchResult {
  readonly externalRequestId: string;
}

export interface R6ProviderAdapter {
  dispatch(request: R6ProviderDispatchRequest): Promise<R6ProviderDispatchResult>;
}

export type R6ProviderAdapterResolver = (
  provider: string,
) => R6ProviderAdapter | undefined;

/**
 * No provider is implicitly trusted. Concrete provider modules must be
 * explicitly registered/injected by the deployment. Missing adapters fail
 * closed and never manufacture SENT/DELIVERED state.
 */
export const resolveConfiguredR6ProviderAdapter: R6ProviderAdapterResolver = () =>
  undefined;
