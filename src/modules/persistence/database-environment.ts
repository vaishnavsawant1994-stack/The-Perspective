import { z } from "zod";

const postgresUrlSchema = z
  .string()
  .url()
  .refine(
    (value) => /^postgres(?:ql)?:\/\//.test(value),
    "DATABASE_URL must use the postgresql:// or postgres:// protocol.",
  );

export type DatabaseEnvironmentResult =
  | { readonly valid: true; readonly databaseUrl: string }
  | { readonly valid: false; readonly issues: readonly string[] };

export function getDatabaseEnvironment(
  environment: Record<string, string | undefined>,
): DatabaseEnvironmentResult {
  const parsed = postgresUrlSchema.safeParse(environment.DATABASE_URL);

  if (parsed.success) {
    return { valid: true, databaseUrl: parsed.data };
  }

  return {
    valid: false,
    issues: parsed.error.issues.map((issue) => issue.message),
  };
}

export function requireDatabaseUrl(
  environment: Record<string, string | undefined>,
) {
  const result = getDatabaseEnvironment(environment);

  if (!result.valid) {
    throw new Error(
      `Database configuration is unavailable: ${result.issues.join(" ")}`,
    );
  }

  return result.databaseUrl;
}

export function assertDemoSeedEnvironment(
  environment: Record<string, string | undefined>,
) {
  if (environment.NODE_ENV === "production") {
    throw new Error("The deterministic R2 demo seed is forbidden in production.");
  }

  if (environment.PERSPECTIVE_ALLOW_DEMO_SEED !== "true") {
    throw new Error(
      "Set PERSPECTIVE_ALLOW_DEMO_SEED=true explicitly to run the R2 demo seed.",
    );
  }

  return requireDatabaseUrl(environment);
}
