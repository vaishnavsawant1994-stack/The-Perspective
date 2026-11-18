/** Pinned production Neon endpoint used only by the guarded first-owner flow. */
export const PRODUCTION_NEON_HOST =
  "ep-cool-waterfall-bavwtqv2.c-8.eu-central-1.aws.neon.tech";
const PRODUCTION_NEON_POOLER_HOST =
  "ep-cool-waterfall-bavwtqv2-pooler.c-8.eu-central-1.aws.neon.tech";

/**
 * Normalize the pinned production connection to full certificate verification.
 * The app's existing connection string may omit sslmode; the bootstrap must
 * make the intended TLS behavior explicit before opening a connection.
 */
export function productionBootstrapDatabaseUrl(databaseUrl: string) {
  const url = new URL(databaseUrl);
  if (
    url.protocol !== "postgresql:" ||
    ![PRODUCTION_NEON_HOST, PRODUCTION_NEON_POOLER_HOST].includes(url.hostname)
  ) {
    throw new Error(
      "The first-owner flow only accepts the pinned production Neon endpoint.",
    );
  }
  url.searchParams.set("sslmode", "verify-full");
  return url.toString();
}

export function assertProductionDatabaseTarget(databaseUrl: string) {
  const url = new URL(databaseUrl);
  if (
    url.protocol !== "postgresql:" ||
    ![PRODUCTION_NEON_HOST, PRODUCTION_NEON_POOLER_HOST].includes(url.hostname) ||
    url.searchParams.get("sslmode") !== "verify-full"
  ) {
    throw new Error(
      "The first-owner flow only accepts the pinned production Neon endpoint with sslmode=verify-full.",
    );
  }
}

