import type { CanonicalPermissionKey } from "./registry";
import type { AuthorizationFieldPolicy } from "./types";

/** Client read keys this release activates. Registry stamps are not edited. */
export const R12_ACTIVE_PERMISSION_KEYS = [
  "client.dashboard.view",
  "client.project.view",
  "client.approval.view",
  "client.billing.view",
  "client.contract.view",
] as const satisfies readonly CanonicalPermissionKey[];

export type R12ActivePermissionKey = (typeof R12_ACTIVE_PERMISSION_KEYS)[number];

export const R12_DORMANT_PERMISSION_KEYS = [
  "client.billing.pay",
  "client.contract.sign",
  "client.invite.accept",
  "client.message.send",
  "client.message.view",
  "client.notification.view",
  "client.org.manage",
  "client.support.manage",
  "client.task.complete",
  "client.asset.upload",
] as const satisfies readonly CanonicalPermissionKey[];

export type R12AuthorizationResourceType =
  | "client-dashboard"
  | "client-project"
  | "project"
  | "client-approval-view"
  | "client-invoice"
  | "client-contract";

export interface R12PermissionBinding {
  readonly resourceTypes: readonly R12AuthorizationResourceType[];
  readonly actions: readonly string[];
}

const SERVER_OWNED = [
  "ownerOrganizationId",
  "clientAccountId",
  "health",
  "margin",
  "notes",
  "state",
  "token",
] as const;

function policy(readable: readonly string[]): AuthorizationFieldPolicy {
  return {
    readableFields: [...readable],
    mutableFields: [],
    serverOwnedFields: [...SERVER_OWNED],
    createOnlyFields: [],
    fieldGroups: { identity: ["id"] },
  };
}

export const R12_PERMISSION_BINDINGS = {
  "client.dashboard.view": { resourceTypes: ["client-dashboard"], actions: ["view"] },
  "client.project.view": { resourceTypes: ["client-project", "project"], actions: ["list", "view"] },
  "client.approval.view": { resourceTypes: ["client-approval-view"], actions: ["list"] },
  "client.billing.view": { resourceTypes: ["client-invoice"], actions: ["list"] },
  "client.contract.view": { resourceTypes: ["client-contract"], actions: ["list"] },
} as const satisfies Record<R12ActivePermissionKey, R12PermissionBinding>;

export const R12_FIELD_POLICIES = {
  "client-dashboard": policy(["projectCount", "approvalCount", "invoiceCount"]),
  "client-project": policy(["id", "title", "status"]),
  project: policy(["id", "title", "status"]),
  "client-approval-view": policy(["projectId", "title", "versionId", "version"]),
  "client-invoice": policy(["id", "status", "currency", "totalMinor", "paymentState"]),
  "client-contract": policy(["id", "status", "version"]),
} as const satisfies Record<R12AuthorizationResourceType, AuthorizationFieldPolicy>;

export function isR12ActivePermissionKey(key: string): key is R12ActivePermissionKey {
  return (R12_ACTIVE_PERMISSION_KEYS as readonly string[]).includes(key);
}

export function getR12PermissionBinding(key: R12ActivePermissionKey) {
  return R12_PERMISSION_BINDINGS[key];
}

export function getR12FieldPolicy(resourceType: string) {
  return R12_FIELD_POLICIES[resourceType as R12AuthorizationResourceType];
}
