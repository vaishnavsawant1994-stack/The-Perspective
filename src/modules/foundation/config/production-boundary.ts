const originPattern = /^https?:\/\/[^/\s*]+(?::[0-9]+)?$/u;

export function productionConfigurationErrors(
  environment: Record<string, string | undefined>,
): readonly string[] {
  if (environment.PERSPECTIVE_REQUIRE_PRODUCTION_CONFIG !== "true") return [];

  const errors: string[] = [];
  if (environment.PERSPECTIVE_AUTH_BOUNDARY_MODE !== "sessions") errors.push("auth mode");

  const origin = environment.PERSPECTIVE_PUBLIC_APP_ORIGIN ?? "";
  if (!originPattern.test(origin) || origin.includes("*")) errors.push("origin");
  else if (origin.startsWith("http://") && environment.PERSPECTIVE_ALLOW_INSECURE_ORIGIN !== "true") {
    errors.push("https origin");
  }

  try {
    if (Buffer.from(environment.PERSPECTIVE_AUTH_DATA_KEY ?? "", "base64").length !== 32) errors.push("data key");
  } catch {
    errors.push("data key");
  }

  if (!/^[1-9][0-9]*$/u.test(environment.PERSPECTIVE_AUTH_KEY_VERSION ?? "")) errors.push("key version");
  if (!environment.DATABASE_URL) errors.push("database");
  return errors;
}

export function assertProductionConfiguration(environment: Record<string, string | undefined>): void {
  const errors = productionConfigurationErrors(environment);
  if (errors.length > 0) {
    throw new Error(`Production configuration is incomplete: ${errors.join(", ")}`);
  }
}
