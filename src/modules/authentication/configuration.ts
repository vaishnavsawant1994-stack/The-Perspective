import { z } from "zod";

const denyAllSchema = z.object({
  PERSPECTIVE_AUTH_BOUNDARY_MODE: z.literal("deny-all"),
});

const sessionsSchema = z.object({
  PERSPECTIVE_AUTH_BOUNDARY_MODE: z.literal("sessions"),
  DATABASE_URL: z.string().url().refine((value) => /^postgres(?:ql)?:\/\//.test(value)),
  PERSPECTIVE_PUBLIC_APP_ORIGIN: z.string().url(),
  PERSPECTIVE_AUTH_DATA_KEY: z.string().refine((value) => {
    try {
      return Buffer.from(value, "base64").length === 32;
    } catch {
      return false;
    }
  }, "PERSPECTIVE_AUTH_DATA_KEY must be a base64-encoded 32-byte key."),
  PERSPECTIVE_AUTH_KEY_VERSION: z.coerce.number().int().positive(),
});

export type AuthenticationConfiguration =
  | {
      readonly mode: "deny-all";
      readonly valid: boolean;
      readonly issues: readonly string[];
    }
  | {
      readonly mode: "sessions";
      readonly valid: true;
      readonly databaseUrl: string;
      readonly publicOrigin: string;
      readonly dataKey: Buffer;
      readonly keyVersion: number;
      readonly issues: readonly [];
    };

export function getAuthenticationConfiguration(
  environment: Record<string, string | undefined>,
): AuthenticationConfiguration {
  if (environment.PERSPECTIVE_AUTH_BOUNDARY_MODE === "sessions") {
    const result = sessionsSchema.safeParse(environment);

    if (result.success) {
      return {
        mode: "sessions",
        valid: true,
        databaseUrl: result.data.DATABASE_URL,
        publicOrigin: new URL(result.data.PERSPECTIVE_PUBLIC_APP_ORIGIN).origin,
        dataKey: Buffer.from(result.data.PERSPECTIVE_AUTH_DATA_KEY, "base64"),
        keyVersion: result.data.PERSPECTIVE_AUTH_KEY_VERSION,
        issues: [],
      };
    }

    return {
      mode: "deny-all",
      valid: false,
      issues: result.error.issues.map((issue) => issue.message),
    };
  }

  const result = denyAllSchema.safeParse(environment);

  return {
    mode: "deny-all",
    valid: result.success,
    issues: result.success
      ? []
      : result.error.issues.map((issue) => issue.message),
  };
}

export function requireAuthenticationConfiguration(
  environment: Record<string, string | undefined>,
) {
  const configuration = getAuthenticationConfiguration(environment);

  if (configuration.mode !== "sessions") {
    throw new Error("Verified authentication configuration is unavailable.");
  }

  return configuration;
}

