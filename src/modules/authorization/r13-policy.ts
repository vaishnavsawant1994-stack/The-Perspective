import type { CanonicalPermissionKey } from "./registry";
import type { AuthorizationFieldPolicy } from "./types";

/** The only registry keys stamped R13. Both are activated. No key is added. */
export const R13_ACTIVE_PERMISSION_KEYS = [
  "settings.manage",
  "integration.manage",
] as const satisfies readonly CanonicalPermissionKey[];

export type R13ActivePermissionKey = (typeof R13_ACTIVE_PERMISSION_KEYS)[number];

export type R13AuthorizationResourceType = "organization-settings" | "integration-declaration";

const SERVER_OWNED = ["ownerOrganizationId", "state", "verified", "secret", "token", "status"] as const;

function policy(readable: readonly string[], mutable: readonly string[]): AuthorizationFieldPolicy {
  return {
    readableFields: [...readable],
    mutableFields: [...mutable],
    serverOwnedFields: [...SERVER_OWNED],
    createOnlyFields: [],
    fieldGroups: { identity: ["id"] },
  };
}

export const R13_PERMISSION_BINDINGS = {
  "settings.manage": { resourceTypes: ["organization-settings"], actions: ["view", "update"] },
  "integration.manage": { resourceTypes: ["integration-declaration"], actions: ["list", "declare", "disable", "verify"] },
} as const;

export const R13_FIELD_POLICIES = {
  "organization-settings": policy(
    ["timezone", "weekStartsOn", "supportLabel", "expectedVersion", "configured"],
    ["timezone", "weekStartsOn", "supportLabel", "expectedVersion", "reason"],
  ),
  "integration-declaration": policy(
    ["integrationType", "state", "result"],
    ["integrationType", "reason"],
  ),
} as const satisfies Record<R13AuthorizationResourceType, AuthorizationFieldPolicy>;

export function isR13ActivePermissionKey(key: string): key is R13ActivePermissionKey {
  return (R13_ACTIVE_PERMISSION_KEYS as readonly string[]).includes(key);
}

export function getR13PermissionBinding(key: R13ActivePermissionKey) {
  return R13_PERMISSION_BINDINGS[key];
}

export function getR13FieldPolicy(resourceType: string) {
  return R13_FIELD_POLICIES[resourceType as R13AuthorizationResourceType];
}
