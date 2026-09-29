import type { CanonicalPermissionKey } from "./registry";
import type { AuthorizationFieldPolicy } from "./types";

export const R7_ACTIVE_PERMISSION_KEYS = [
  "proposal.view",
  "proposal.edit",
  "proposal.send",
  "proposal.accept",
  "invoice.view",
  "invoice.edit",
  "invoice.issue",
  "invoice.send",
  "payment.view",
  "payment.reconcile",
] as const satisfies readonly CanonicalPermissionKey[];

export type R7ActivePermissionKey = (typeof R7_ACTIVE_PERMISSION_KEYS)[number];

export const R7_DORMANT_PERMISSION_KEYS = [
  "commercial.exception.approve",
  "contract.edit",
  "contract.send",
  "contract.view",
  "package.manage",
  "payment.refund",
] as const satisfies readonly CanonicalPermissionKey[];

export type R7AuthorizationResourceType =
  | "proposal"
  | "proposal-version"
  | "invoice"
  | "payment"
  | "product";

export interface R7PermissionBinding {
  readonly resourceTypes: readonly R7AuthorizationResourceType[];
  readonly actions: readonly string[];
  readonly workflowActions?: readonly string[];
}

export const R7_PERMISSION_BINDINGS = {
  "proposal.view": {
    resourceTypes: ["proposal", "proposal-version"],
    actions: ["view", "read", "list"],
  },
  "proposal.edit": {
    resourceTypes: ["proposal", "proposal-version", "product"],
    actions: ["create", "update", "edit"],
  },
  "proposal.send": {
    resourceTypes: ["proposal", "proposal-version"],
    actions: ["send"],
    workflowActions: ["send"],
  },
  "proposal.accept": {
    resourceTypes: ["proposal", "proposal-version"],
    actions: ["accept"],
    workflowActions: ["accept"],
  },
  "invoice.view": {
    resourceTypes: ["invoice"],
    actions: ["view", "read", "list"],
  },
  "invoice.edit": {
    resourceTypes: ["invoice"],
    actions: ["create", "update", "edit"],
  },
  "invoice.issue": {
    resourceTypes: ["invoice"],
    actions: ["issue", "finalize"],
    workflowActions: ["issue", "finalize"],
  },
  "invoice.send": {
    resourceTypes: ["invoice"],
    actions: ["send"],
    workflowActions: ["send"],
  },
  "payment.view": {
    resourceTypes: ["payment"],
    actions: ["view", "read", "list"],
  },
  "payment.reconcile": {
    resourceTypes: ["payment"],
    actions: ["reconcile"],
    workflowActions: ["reconcile"],
  },
} as const satisfies Record<R7ActivePermissionKey, R7PermissionBinding>;

const SERVER_OWNED_FINANCE_FIELDS = [
  "totalMinor",
  "subtotalMinor",
  "taxMinor",
  "allocatedMinor",
  "status",
  "ownerOrganizationId",
  "resourceId",
] as const;

function financeFieldPolicy(
  readable: readonly string[],
  mutable: readonly string[],
): AuthorizationFieldPolicy {
  return {
    readableFields: [...readable],
    mutableFields: [...mutable],
    serverOwnedFields: [...SERVER_OWNED_FINANCE_FIELDS],
    createOnlyFields: [],
    fieldGroups: {
      identity: ["id"],
      money: ["currency", "totalMinor", "subtotalMinor", "taxMinor"],
    },
  };
}

export const R7_FIELD_POLICIES: Partial<
  Record<R7AuthorizationResourceType, AuthorizationFieldPolicy>
> = {
  proposal: financeFieldPolicy(
    ["id", "status", "currency", "dealId", "currentVersion", "rowVersion"],
    ["currency"],
  ),
  "proposal-version": financeFieldPolicy(
    ["id", "status", "currency", "totalMinor", "subtotalMinor", "taxMinor", "version", "description", "quantity", "unitAmountMinor", "lineTotalMinor", "position"],
    [],
  ),
  invoice: financeFieldPolicy(
    ["id", "status", "currency", "totalMinor", "allocatedMinor"],
    ["currency"],
  ),
  payment: financeFieldPolicy(
    ["id", "status", "currency", "amountMinor", "provider"],
    [],
  ),
  product: financeFieldPolicy(
    ["id", "key", "name", "currency", "unitAmountMinor"],
    ["name", "key", "currency"],
  ),
};

export function isR7ActivePermissionKey(
  key: string,
): key is R7ActivePermissionKey {
  return (R7_ACTIVE_PERMISSION_KEYS as readonly string[]).includes(key);
}

export function isR7DormantPermissionKey(key: string) {
  return (R7_DORMANT_PERMISSION_KEYS as readonly string[]).includes(key);
}

export function getR7PermissionBinding(key: R7ActivePermissionKey) {
  return R7_PERMISSION_BINDINGS[key];
}

export function getR7FieldPolicy(resourceType: string) {
  return R7_FIELD_POLICIES[resourceType as R7AuthorizationResourceType];
}
