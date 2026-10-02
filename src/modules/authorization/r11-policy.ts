import type { CanonicalPermissionKey } from "./registry";
import type { AuthorizationFieldPolicy } from "./types";

/** Keys this implementation may activate. Registry stamps are not edited. */
export const R11_ACTIVE_PERMISSION_KEYS = [
  "analytics.distribution.view",
  "report.view",
  "report.create",
  "report.approve",
  "renewal.view",
  "renewal.edit",
  "renewal.manage",
] as const satisfies readonly CanonicalPermissionKey[];

export type R11ActivePermissionKey = (typeof R11_ACTIVE_PERMISSION_KEYS)[number];

export const R11_DORMANT_PERMISSION_KEYS = [
  "publish.execute",
  "magazine.reader.publish",
] as const satisfies readonly CanonicalPermissionKey[];

export type R11AuthorizationResourceType =
  | "growth-observation"
  | "growth-report"
  | "growth-signal"
  | "automation-rule"
  | "search-document";

export interface R11PermissionBinding {
  readonly resourceTypes: readonly R11AuthorizationResourceType[];
  readonly actions: readonly string[];
  readonly workflowActions?: readonly string[];
}

const SERVER_OWNED = [
  "ownerOrganizationId",
  "state",
  "views",
  "count",
  "conversionRate",
  "snapshot",
  "reason",
  "actor",
  "url",
] as const;

function policy(readable: readonly string[], mutable: readonly string[] = []): AuthorizationFieldPolicy {
  return {
    readableFields: [...readable],
    mutableFields: [...mutable],
    serverOwnedFields: [...SERVER_OWNED],
    createOnlyFields: [...mutable],
    fieldGroups: { identity: ["id"] },
  };
}

export const R11_PERMISSION_BINDINGS = {
  "analytics.distribution.view": {
    resourceTypes: ["growth-observation", "search-document"],
    actions: ["list", "view"],
  },
  "report.view": { resourceTypes: ["growth-report"], actions: ["list", "view"] },
  "report.create": { resourceTypes: ["growth-report"], actions: ["create"] },
  "report.approve": {
    resourceTypes: ["growth-report"],
    actions: ["approve"],
    workflowActions: ["approve"],
  },
  "renewal.view": { resourceTypes: ["growth-signal", "automation-rule"], actions: ["list", "view"] },
  "renewal.edit": { resourceTypes: ["growth-signal"], actions: ["open"] },
  "renewal.manage": {
    resourceTypes: ["growth-signal", "automation-rule"],
    actions: ["review", "act", "create", "enable"],
  },
} as const satisfies Record<R11ActivePermissionKey, R11PermissionBinding>;

export const R11_FIELD_POLICIES = {
  "growth-observation": policy(["id", "slug"]),
  "growth-report": policy(["id", "family", "state"], ["family", "from", "to", "expectedRowVersion"]),
  "growth-signal": policy(["id", "kind", "state"], ["contractId", "clientAccountId", "expectedRowVersion"]),
  "automation-rule": policy(["id", "name", "state"], ["name", "trigger", "field", "operator", "threshold", "enabled", "expectedRowVersion"]),
  "search-document": policy(["id", "slug", "title"]),
} as const satisfies Record<R11AuthorizationResourceType, AuthorizationFieldPolicy>;

export function isR11ActivePermissionKey(key: string): key is R11ActivePermissionKey {
  return (R11_ACTIVE_PERMISSION_KEYS as readonly string[]).includes(key);
}

export function getR11PermissionBinding(key: R11ActivePermissionKey) {
  return R11_PERMISSION_BINDINGS[key];
}

export function getR11FieldPolicy(resourceType: string) {
  return R11_FIELD_POLICIES[resourceType as R11AuthorizationResourceType];
}
