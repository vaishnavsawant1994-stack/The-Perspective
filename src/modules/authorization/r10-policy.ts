import type { CanonicalPermissionKey } from "./registry";
import type { AuthorizationFieldPolicy } from "./types";

/** Keys this implementation may activate. Registry stamps are not edited. */
export const R10_ACTIVE_PERMISSION_KEYS = [
  "podcast.dashboard.view",
  "podcast.episode.view",
  "podcast.episode.edit",
  "podcast.guest.manage",
  "podcast.review",
  "podcast.schedule.manage",
  "video.dashboard.view",
  "video.view",
  "video.edit",
  "video.review",
  "video.schedule.manage",
  "video.publish.prepare",
  "event.dashboard.view",
  "event.view",
  "event.manage",
  "event.agenda.manage",
  "event.participant.manage",
  "event.registration.manage",
  "distribution.dashboard.view",
  "distribution.campaign.view",
  "distribution.campaign.manage",
  "distribution.launch",
] as const satisfies readonly CanonicalPermissionKey[];

export type R10ActivePermissionKey = (typeof R10_ACTIVE_PERMISSION_KEYS)[number];

export const R10_DORMANT_PERMISSION_KEYS = [
  "analytics.distribution.view",
  "publish.execute",
] as const satisfies readonly CanonicalPermissionKey[];

export type R10AuthorizationResourceType =
  | "podcast-show"
  | "podcast-episode"
  | "podcast-guest"
  | "video-project"
  | "event"
  | "event-agenda"
  | "event-participant"
  | "event-registration"
  | "distribution-campaign"
  | "distribution-target"
  | "distribution-item"
  | "delivery";

export interface R10PermissionBinding {
  readonly resourceTypes: readonly R10AuthorizationResourceType[];
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
  "digest",
  "url",
  "trusted",
  "verifier",
  "actor",
  "delivered",
] as const;

function policy(readable: readonly string[], mutable: readonly string[] = [], createOnly: readonly string[] = []): AuthorizationFieldPolicy {
  return {
    readableFields: [...readable],
    mutableFields: [...mutable],
    serverOwnedFields: [...SERVER_OWNED],
    createOnlyFields: [...createOnly],
    fieldGroups: { identity: ["id"] },
  };
}

export const R10_PERMISSION_BINDINGS = {
  "podcast.dashboard.view": { resourceTypes: ["podcast-show", "podcast-episode"], actions: ["list", "view"] },
  "podcast.episode.view": { resourceTypes: ["podcast-show", "podcast-episode"], actions: ["view", "read"] },
  "podcast.episode.edit": {
    resourceTypes: ["podcast-show", "podcast-episode"],
    actions: ["create", "edit"],
  },
  "podcast.guest.manage": { resourceTypes: ["podcast-guest", "podcast-episode"], actions: ["guest"] },
  "podcast.review": {
    resourceTypes: ["podcast-episode"],
    actions: ["review", "return"],
    workflowActions: ["review", "return"],
  },
  "podcast.schedule.manage": { resourceTypes: ["podcast-episode"], actions: ["schedule", "archive"] },
  "video.dashboard.view": { resourceTypes: ["video-project"], actions: ["list", "view"] },
  "video.view": { resourceTypes: ["video-project"], actions: ["view", "read"] },
  "video.edit": { resourceTypes: ["video-project"], actions: ["create", "edit"] },
  "video.review": {
    resourceTypes: ["video-project"],
    actions: ["review", "return"],
    workflowActions: ["review", "return"],
  },
  "video.schedule.manage": { resourceTypes: ["video-project"], actions: ["schedule", "archive"] },
  "video.publish.prepare": {
    resourceTypes: ["video-project"],
    actions: ["prepare"],
    workflowActions: ["prepare"],
  },
  "event.dashboard.view": { resourceTypes: ["event"], actions: ["list", "view"] },
  "event.view": { resourceTypes: ["event"], actions: ["view", "read"] },
  "event.manage": { resourceTypes: ["event"], actions: ["create", "schedule", "open", "close", "cancel"] },
  "event.agenda.manage": { resourceTypes: ["event-agenda", "event"], actions: ["agenda"] },
  "event.participant.manage": { resourceTypes: ["event-participant", "event"], actions: ["participant"] },
  "event.registration.manage": { resourceTypes: ["event-registration", "event"], actions: ["record", "cancel"] },
  "distribution.dashboard.view": { resourceTypes: ["distribution-campaign"], actions: ["list", "view"] },
  "distribution.campaign.view": {
    resourceTypes: ["distribution-campaign", "distribution-target", "distribution-item", "delivery"],
    actions: ["view", "read"],
  },
  "distribution.campaign.manage": {
    resourceTypes: ["distribution-campaign", "distribution-target", "distribution-item"],
    actions: ["create", "target", "item", "close"],
  },
  "distribution.launch": {
    resourceTypes: ["distribution-campaign", "delivery"],
    actions: ["launch"],
    workflowActions: ["launch"],
  },
} as const satisfies Record<R10ActivePermissionKey, R10PermissionBinding>;

export const R10_FIELD_POLICIES: Partial<Record<R10AuthorizationResourceType, AuthorizationFieldPolicy>> = {
  "podcast-show": policy(["id", "title", "slug", "state"], ["title"], ["title"]),
  "podcast-episode": policy(["id", "title", "slug", "state"], ["title", "runAt", "name", "role"], ["title", "showId"]),
  "podcast-guest": policy(["id", "name"], ["name", "role"], ["name", "role"]),
  "video-project": policy(["id", "title", "slug", "state"], ["title", "runAt"], ["title"]),
  event: policy(["id", "title", "slug", "state"], ["title", "startsAt"], ["title", "startsAt"]),
  "event-agenda": policy(["id", "title"], ["title"], ["title"]),
  "event-participant": policy(["id", "name", "kind"], ["name", "kind"], ["name", "kind"]),
  "event-registration": policy(["id", "name", "state"], ["name"], ["name"]),
  "distribution-campaign": policy(["id", "name", "state"], ["name"], ["name"]),
  "distribution-target": policy(["id", "channel", "label"], ["channel", "label"], ["channel", "label"]),
  "distribution-item": policy(["id", "sourceKind"], ["sourceKind", "sourceId"], ["sourceKind", "sourceId"]),
  delivery: policy(["id", "url", "verifiedAt"]),
};

export function isR10ActivePermissionKey(key: string): key is R10ActivePermissionKey {
  return (R10_ACTIVE_PERMISSION_KEYS as readonly string[]).includes(key);
}

export function isR10DormantPermissionKey(key: string) {
  return (R10_DORMANT_PERMISSION_KEYS as readonly string[]).includes(key);
}

export function getR10PermissionBinding(key: R10ActivePermissionKey) {
  return R10_PERMISSION_BINDINGS[key];
}

export function getR10FieldPolicy(resourceType: string) {
  return R10_FIELD_POLICIES[resourceType as R10AuthorizationResourceType];
}
