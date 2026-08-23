import { z } from "zod";

const securityEnvironmentSchema = z.object({
  PERSPECTIVE_AUTH_BOUNDARY_MODE: z.enum(["deny-all", "sessions"]),
});

export interface SecurityBoundaryConfiguration {
  readonly mode: "deny-all" | "sessions";
  readonly valid: boolean;
  readonly issues: readonly string[];
}

/**
 * R1 deliberately supports only a deny-all boundary. Missing or invalid
 * configuration never degrades protected routes to public access.
 */
export function getSecurityBoundaryConfiguration(
  environment: Record<string, string | undefined>,
): SecurityBoundaryConfiguration {
  const result = securityEnvironmentSchema.safeParse(environment);

  if (result.success) {
    return {
      mode: result.data.PERSPECTIVE_AUTH_BOUNDARY_MODE,
      valid: true,
      issues: [],
    };
  }

  return {
    mode: "deny-all",
    valid: false,
    issues: result.error.issues.map((issue) => issue.message),
  };
}
