import type { CanonicalPermissionKey } from "./registry";
import type { AuthorizationFieldPolicy } from "./types";

/** Keys this implementation may activate. The freeze forbids the other R9 stamps. */
export const R9_ACTIVE_PERMISSION_KEYS = [
  "magazine.view",
  "magazine.dashboard.view",
  "magazine.proof.review",
  "design.cover.view",
  "design.cover.edit",
  "design.layout.manage",
  "design.approve",
  "publish.dashboard.view",
  "publish.queue.view",
  "publish.schedule",
  "publication.publish",
] as const satisfies readonly CanonicalPermissionKey[];

export type R9ActivePermissionKey = (typeof R9_ACTIVE_PERMISSION_KEYS)[number];

export const R9_DORMANT_PERMISSION_KEYS = [
  "magazine.reader.publish",
  "publish.execute",
] as const satisfies readonly CanonicalPermissionKey[];

export type R9AuthorizationResourceType =
  | "publication"
  | "issue"
  | "placement"
  | "cover"
  | "schedule"
  | "snapshot"
  | "shelf"
  | "draft-version";

export interface R9PermissionBinding {
  readonly resourceTypes: readonly R9AuthorizationResourceType[];
  readonly actions: readonly string[];
  readonly workflowActions?: readonly string[];
}

const SERVER_OWNED = [
  "ownerOrganizationId",
  "resourceId",
  "status",
  "state",
  "rowVersion",
  "slug",
  "editionNumber",
  "digest",
  "actor",
  "publisher",
  "publishedVersion",
  "ready",
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

export const R9_PERMISSION_BINDINGS = {
  "magazine.view": {
    resourceTypes: ["publication", "issue", "placement", "cover", "snapshot"],
    actions: ["view", "read"],
  },
  "magazine.dashboard.view": {
    resourceTypes: ["issue"],
    actions: ["list"],
  },
  "magazine.proof.review": {
    resourceTypes: ["issue", "draft-version"],
    actions: ["prepare", "ready", "reopen"],
    workflowActions: ["prepare", "ready", "reopen"],
  },
  "design.cover.view": {
    resourceTypes: ["cover", "issue"],
    actions: ["view", "read"],
  },
  "design.cover.edit": {
    resourceTypes: ["cover", "issue"],
    actions: ["cover"],
    workflowActions: ["cover"],
  },
  "design.layout.manage": {
    resourceTypes: ["issue", "placement", "shelf"],
    actions: ["create", "open", "section", "place", "remove", "reorder", "sponsor", "attach", "curate"],
    workflowActions: ["create", "open", "section", "place", "remove", "reorder", "sponsor", "attach", "curate"],
  },
  "design.approve": {
    resourceTypes: ["issue"],
    actions: ["approve"],
    workflowActions: ["approve"],
  },
  "publish.dashboard.view": {
    resourceTypes: ["snapshot", "issue"],
    actions: ["view", "read"],
  },
  "publish.queue.view": {
    resourceTypes: ["schedule", "issue"],
    actions: ["view", "read"],
  },
  "publish.schedule": {
    resourceTypes: ["schedule", "issue"],
    actions: ["schedule", "cancel"],
    workflowActions: ["schedule", "cancel"],
  },
  "publication.publish": {
    resourceTypes: ["issue", "snapshot"],
    actions: ["publish", "archive"],
    workflowActions: ["publish", "archive"],
  },
} as const satisfies Record<R9ActivePermissionKey, R9PermissionBinding>;

export const R9_FIELD_POLICIES: Partial<
  Record<R9AuthorizationResourceType, AuthorizationFieldPolicy>
> = {
  publication: policy(["id", "title", "slug"]),
  issue: policy(
    ["id", "title", "season", "theme", "availability", "state", "rowVersion", "slug", "editionNumber"],
    ["title", "season", "theme", "availability", "name", "headline", "dek", "alt", "runAt", "reason"],
    ["title", "season", "theme", "availability"],
  ),
  placement: policy(
    ["id", "title", "authorName", "summary", "altText", "direction"],
    ["title", "authorName", "summary", "altText", "direction"],
    ["draftVersionId", "sectionId", "title", "authorName", "summary", "altText"],
  ),
  cover: policy(
    ["id", "headline", "dek", "alt"],
    ["headline", "dek", "alt", "storyDraftVersionId"],
    ["headline", "dek", "alt", "storyDraftVersionId"],
  ),
  schedule: policy(["id", "runAt", "status"], ["runAt"], ["runAt"]),
  snapshot: policy(["id", "editionNumber", "publishedAt"]),
  shelf: policy(
    ["id", "name", "slug"],
    ["name", "principles", "description"],
    ["name", "editorPersonId", "principles", "description", "editorialWorkId"],
  ),
  "draft-version": policy(["id", "version"]),
};

export function isR9ActivePermissionKey(key: string): key is R9ActivePermissionKey {
  return (R9_ACTIVE_PERMISSION_KEYS as readonly string[]).includes(key);
}

export function isR9DormantPermissionKey(key: string) {
  return (R9_DORMANT_PERMISSION_KEYS as readonly string[]).includes(key);
}

export function getR9PermissionBinding(key: R9ActivePermissionKey) {
  return R9_PERMISSION_BINDINGS[key];
}

export function getR9FieldPolicy(resourceType: string) {
  return R9_FIELD_POLICIES[resourceType as R9AuthorizationResourceType];
}
