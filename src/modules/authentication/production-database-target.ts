/** Pinned production Neon endpoint used only by the guarded first-owner CLI. */
export const PRODUCTION_NEON_HOST =
  "ep-cool-waterfall-bavwtqv2.c-8.eu-central-1.aws.neon.tech";

export function assertProductionDatabaseTarget(databaseUrl: string) {
  const url = new URL(databaseUrl);
  if (
    url.protocol !== "postgresql:" ||
    url.hostname !== PRODUCTION_NEON_HOST ||
    url.searchParams.get("sslmode") !== "verify-full"
  ) {
    throw new Error(
      "The first-owner command only accepts the pinned production Neon endpoint with sslmode=verify-full.",
    );
  }
}
