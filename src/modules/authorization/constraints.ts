import { z } from "zod";

import type { RolePermissionConstraints } from "./types";

const boundedString = z.string().trim().min(1).max(128);
const boundedStringList = z.array(boundedString).min(1).max(100);

export const rolePermissionConstraintsSchema = z
  .object({
    allowedResourceTypes: boundedStringList.optional(),
    maximumSensitivity: z
      .enum(["STANDARD", "CONFIDENTIAL", "PII", "FINANCIAL", "SECURITY", "SECRET"])
      .optional(),
    allowedProjectTypes: boundedStringList.optional(),
    requireAssignment: z.boolean().optional(),
    requireOwnership: z.boolean().optional(),
    allowedFieldGroups: boundedStringList.optional(),
    deniedFieldGroups: boundedStringList.optional(),
    clientSafeOnly: z.boolean().optional(),
    allowedLifecycleStates: boundedStringList.optional(),
    requireReason: z.boolean().optional(),
    requireRecentAuthentication: z.boolean().optional(),
    requireMfa: z.boolean().optional(),
    noSelfAction: z.boolean().optional(),
    requireSeparationOfDuty: z.boolean().optional(),
  })
  .strict();

export type RolePermissionConstraintParseResult =
  | {
      readonly valid: true;
      readonly constraints: RolePermissionConstraints;
    }
  | {
      readonly valid: false;
      readonly issues: readonly string[];
    };

export function parseRolePermissionConstraints(
  input: unknown,
): RolePermissionConstraintParseResult {
  const parsed = rolePermissionConstraintsSchema.safeParse(input ?? {});

  if (!parsed.success) {
    return {
      valid: false,
      issues: parsed.error.issues.map(
        (issue) =>
          `${issue.path.length > 0 ? issue.path.join(".") : "constraints"}: ${issue.message}`,
      ),
    };
  }

  return {
    valid: true,
    constraints: parsed.data,
  };
}
