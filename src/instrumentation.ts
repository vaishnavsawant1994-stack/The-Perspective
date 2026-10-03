export async function register() {
  const { assertProductionConfiguration } = await import("@/modules/foundation/config/production-boundary");
  assertProductionConfiguration(process.env);
}
