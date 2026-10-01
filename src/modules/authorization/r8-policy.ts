import type { CanonicalPermissionKey } from "./registry";
import type { AuthorizationFieldPolicy } from "./types";

export const R8_ACTIVE_PERMISSION_KEYS = [
  "project.view",
  "project.create",
  "project.manage",
  "project.assign",
  "project.activity.view",
  "workflow.move",
  "questionnaire.view",
  "questionnaire.edit",
  "task.view",
  "task.edit",
  "draft.view",
  "draft.edit",
  "editorial.view",
  "editorial.dashboard.view",
  "editorial.review",
  "editorial.approve",
  "approval.view",
  "approval.client.decide",
  "file.view",
  "file.version",
] as const satisfies readonly CanonicalPermissionKey[];

export type R8ActivePermissionKey = (typeof R8_ACTIVE_PERMISSION_KEYS)[number];

export const R8_DORMANT_PERMISSION_KEYS = [
  "approval.decide",
  "approval.override",
  "calendar.view",
  "workflow.template.manage",
] as const satisfies readonly CanonicalPermissionKey[];

export type R8AuthorizationResourceType =
  | "project"
  | "questionnaire"
  | "task"
  | "draft"
  | "draft-version"
  | "editorial-review"
  | "client-approval"
  | "asset"
  | "milestone"
  | "deliverable"
  | "citation"
  | "fact-check"
  | "credit";

export interface R8PermissionBinding {
  readonly resourceTypes: readonly R8AuthorizationResourceType[];
  readonly actions: readonly string[];
  readonly workflowActions?: readonly string[];
}

const SERVER_OWNED = [
  "ownerOrganizationId",
  "resourceId",
  "status",
  "state",
  "rowVersion",
  "storageKey",
  "digest",
  "clientOrganizationId",
] as const;

function policy(
  readable: readonly string[],
  mutable: readonly string[] = [],
  createOnly: readonly string[] = [],
): AuthorizationFieldPolicy {
  return {
    readableFields: [...readable],
    mutableFields: [...mutable],
    serverOwnedFields: [...SERVER_OWNED],
    createOnlyFields: [...createOnly],
    fieldGroups: { identity: ["id"] },
  };
}

export const R8_PERMISSION_BINDINGS = {
  "project.view": {
    resourceTypes: ["project", "milestone", "deliverable", "credit"],
    actions: ["view", "read", "list"],
  },
  "project.create": {
    resourceTypes: ["project"],
    actions: ["create"],
  },
  "project.manage": {
    resourceTypes: ["project", "milestone", "deliverable", "credit"],
    actions: ["update", "cancel", "complete", "create"],
  },
  "project.assign": {
    resourceTypes: ["project"],
    actions: ["assign", "end"],
  },
  "project.activity.view": {
    resourceTypes: ["project"],
    actions: ["view", "list"],
  },
  "workflow.move": {
    resourceTypes: ["project"],
    actions: ["transition"],
    workflowActions: ["transition"],
  },
  "questionnaire.view": {
    resourceTypes: ["questionnaire"],
    actions: ["view", "read", "list"],
  },
  "questionnaire.edit": {
    resourceTypes: ["questionnaire"],
    actions: ["create", "generate", "send", "receive", "lock"],
  },
  "task.view": {
    resourceTypes: ["task"],
    actions: ["view", "read", "list"],
  },
  "task.edit": {
    resourceTypes: ["task"],
    actions: ["create", "update", "assign", "complete"],
  },
  "draft.view": {
    resourceTypes: ["draft", "draft-version"],
    actions: ["view", "read", "list"],
  },
  "draft.edit": {
    resourceTypes: ["draft", "draft-version"],
    actions: ["create", "update", "issue"],
  },
  "editorial.view": {
    resourceTypes: ["editorial-review", "citation", "fact-check"],
    actions: ["view", "read", "list"],
  },
  "editorial.dashboard.view": {
    resourceTypes: ["project"],
    actions: ["view", "list"],
  },
  "editorial.review": {
    resourceTypes: ["editorial-review", "citation", "fact-check"],
    actions: ["create", "comment", "request-changes", "resolve", "cite", "fact-check"],
  },
  "editorial.approve": {
    resourceTypes: ["draft-version"],
    actions: ["approve"],
    workflowActions: ["approve"],
  },
  "approval.view": {
    resourceTypes: ["client-approval", "draft-version"],
    actions: ["view", "read"],
  },
  "approval.client.decide": {
    resourceTypes: ["client-approval", "draft-version"],
    actions: ["decide"],
    workflowActions: ["decide"],
  },
  "file.view": {
    resourceTypes: ["asset"],
    actions: ["view", "read", "list"],
  },
  "file.version": {
    resourceTypes: ["asset"],
    actions: ["upload", "rights", "visibility"],
  },
} as const satisfies Record<R8ActivePermissionKey, R8PermissionBinding>;

export const R8_FIELD_POLICIES: Partial<
  Record<R8AuthorizationResourceType, AuthorizationFieldPolicy>
> = {
  project: policy(
    ["id", "title", "state", "rowVersion", "proposalId"],
    ["title"],
    ["proposalId", "title"],
  ),
  questionnaire: policy(
    ["id", "status", "title", "rowVersion"],
    [],
    ["title"],
  ),
  task: policy(
    ["id", "title", "status", "priority", "dueDate", "rowVersion"],
    ["title", "priority", "dueDate"],
    ["title", "priority", "dueDate"],
  ),
  draft: policy(["id", "rowVersion"], ["body"], []),
  "draft-version": policy(["id", "version", "body"]),
  "editorial-review": policy(["id", "state", "rowVersion"], ["note"], ["note"]),
  "client-approval": policy(["id", "versionId", "version", "body", "decision"]),
  asset: policy(
    ["id", "visibility", "present", "approved", "licensed", "cleared", "rowVersion"],
    ["visibility"],
    ["filename"],
  ),
  milestone: policy(["id", "kind", "completedAt", "rowVersion"], [], ["kind"]),
  deliverable: policy(["id", "kind", "rowVersion"], [], ["kind", "targetId"]),
  citation: {
    ...policy(["id", "sourceLabel", "locator"], [], ["sourceLabel", "locator"]),
    actionFields: { cite: ["sourceLabel", "locator"] },
  },
  "fact-check": policy(["id", "status"], ["status", "note"], ["status", "note"]),
  credit: policy(["id", "personId", "creditRole"], [], ["personId", "creditRole"]),
};

export function isR8ActivePermissionKey(
  key: string,
): key is R8ActivePermissionKey {
  return (R8_ACTIVE_PERMISSION_KEYS as readonly string[]).includes(key);
}

export function isR8DormantPermissionKey(key: string) {
  return (R8_DORMANT_PERMISSION_KEYS as readonly string[]).includes(key);
}

export function getR8PermissionBinding(key: R8ActivePermissionKey) {
  return R8_PERMISSION_BINDINGS[key];
}

export function getR8FieldPolicy(resourceType: string) {
  return R8_FIELD_POLICIES[resourceType as R8AuthorizationResourceType];
}
