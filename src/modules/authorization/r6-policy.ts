import type { CanonicalPermissionKey } from "./registry";
import type { AuthorizationFieldPolicy } from "./types";

export const R6_ACTIVE_PERMISSION_KEYS = [
  "campaign.manage",
  "campaign.view",
  "client.contact.manage",
  "client.portal.manage",
  "client.portal.provision",
  "client.view",
  "company.edit",
  "company.view",
  "contact.edit",
  "contact.view",
  "deal.edit",
  "deal.manage",
  "deal.move",
  "deal.view",
  "emailaccount.manage",
  "inbox.view",
  "lead.discover",
  "lead.edit",
  "lead.enrich",
  "lead.extract.run",
  "lead.import.review",
  "lead.list.manage",
  "lead.qualify",
  "lead.review",
  "lead.view",
  "meeting.edit",
  "meeting.view",
  "message.read",
  "message.send",
  "outreach.dashboard.view",
  "outreach.launch",
  "outreach.prepare",
  "reply.assign",
  "reply.handle",
  "reply.view",
  "sequence.manage",
  "source.manage",
] as const satisfies readonly CanonicalPermissionKey[];

export type R6ActivePermissionKey = (typeof R6_ACTIVE_PERMISSION_KEYS)[number];

export const R6_DORMANT_PERMISSION_KEYS = [
  "proposal.view",
  "proposal.edit",
  "proposal.send",
  "proposal.approve",
] as const satisfies readonly CanonicalPermissionKey[];

export type R6AuthorizationResourceType =
  | "lead-source"
  | "lead-search"
  | "extraction-job"
  | "staged-record"
  | "enrichment-job"
  | "enrichment-fact"
  | "lead"
  | "duplicate-candidate"
  | "qualification"
  | "lead-list"
  | "company"
  | "contact"
  | "outreach-dashboard"
  | "outreach-campaign"
  | "sequence"
  | "sending-account"
  | "reply"
  | "conversation"
  | "message"
  | "meeting"
  | "deal"
  | "deal-pipeline"
  | "client-account"
  | "client-relationship"
  | "portal-access";

export interface R6PermissionBinding {
  readonly resourceTypes: readonly R6AuthorizationResourceType[];
  readonly actions: readonly string[];
  readonly workflowActions?: readonly string[];
}

export const R6_PERMISSION_BINDINGS = {
  "source.manage": {
    resourceTypes: ["lead-source"],
    actions: ["create", "update", "disable", "enable", "test", "manage"],
  },
  "lead.discover": {
    resourceTypes: ["lead-search", "lead-source"],
    actions: ["discover", "search"],
  },
  "lead.extract.run": {
    resourceTypes: ["extraction-job"],
    actions: ["create", "start", "retry", "pause", "cancel"],
    workflowActions: ["start", "retry", "pause", "cancel"],
  },
  "lead.import.review": {
    resourceTypes: ["staged-record"],
    actions: ["view", "review", "approve", "reject"],
  },
  "lead.enrich": {
    resourceTypes: ["enrichment-job", "enrichment-fact"],
    actions: ["create", "request", "review", "accept", "reject", "retry"],
    workflowActions: ["review", "accept", "reject", "retry"],
  },
  "lead.view": {
    resourceTypes: ["lead"],
    actions: ["read", "view", "list"],
  },
  "lead.edit": {
    resourceTypes: ["lead"],
    actions: ["create", "update", "assign", "archive"],
  },
  "lead.review": {
    resourceTypes: ["lead", "duplicate-candidate"],
    actions: ["review", "merge", "reject-duplicate"],
  },
  "lead.qualify": {
    resourceTypes: ["lead", "qualification"],
    actions: ["qualify", "nurture", "disqualify"],
    workflowActions: ["qualify", "nurture", "disqualify"],
  },
  "lead.list.manage": {
    resourceTypes: ["lead-list"],
    actions: ["create", "update", "add", "remove", "freeze-audience", "archive"],
    workflowActions: ["freeze-audience", "archive"],
  },
  "company.view": {
    resourceTypes: ["company"],
    actions: ["read", "view", "list"],
  },
  "company.edit": {
    resourceTypes: ["company"],
    actions: ["create", "update", "merge", "archive"],
    workflowActions: ["merge", "archive"],
  },
  "contact.view": {
    resourceTypes: ["contact"],
    actions: ["read", "view", "list"],
  },
  "contact.edit": {
    resourceTypes: ["contact"],
    actions: ["create", "update", "merge", "archive"],
    workflowActions: ["merge", "archive"],
  },
  "outreach.dashboard.view": {
    resourceTypes: ["outreach-dashboard"],
    actions: ["read", "view", "list"],
  },
  "campaign.view": {
    resourceTypes: ["outreach-campaign"],
    actions: ["read", "view", "list"],
  },
  "campaign.manage": {
    resourceTypes: ["outreach-campaign"],
    actions: ["create", "update", "submit", "pause", "cancel", "archive"],
    workflowActions: ["submit", "pause", "cancel", "archive"],
  },
  "outreach.prepare": {
    resourceTypes: ["outreach-campaign"],
    actions: ["prepare", "validate", "submit"],
  },
  "outreach.launch": {
    resourceTypes: ["outreach-campaign"],
    actions: ["approve", "schedule", "launch", "resume"],
  },
  "sequence.manage": {
    resourceTypes: ["sequence"],
    actions: ["create", "update", "create-version", "archive"],
    workflowActions: ["create-version", "archive"],
  },
  "emailaccount.manage": {
    resourceTypes: ["sending-account"],
    actions: ["create", "update", "verify", "disable", "test", "manage"],
    workflowActions: ["verify", "disable"],
  },
  "reply.view": {
    resourceTypes: ["reply", "conversation"],
    actions: ["read", "view", "list"],
  },
  "reply.handle": {
    resourceTypes: ["reply", "conversation"],
    actions: ["classify", "stop-sequence", "create-follow-up", "resolve"],
    workflowActions: ["classify", "stop-sequence", "create-follow-up", "resolve"],
  },
  "reply.assign": {
    resourceTypes: ["reply", "conversation"],
    actions: ["assign", "reassign"],
  },
  "inbox.view": {
    resourceTypes: ["conversation"],
    actions: ["list", "view"],
  },
  "message.read": {
    resourceTypes: ["message", "conversation"],
    actions: ["read", "view", "list"],
  },
  "message.send": {
    resourceTypes: ["message", "conversation"],
    actions: ["send", "reply"],
  },
  "meeting.view": {
    resourceTypes: ["meeting"],
    actions: ["read", "view", "list"],
  },
  "meeting.edit": {
    resourceTypes: ["meeting"],
    actions: [
      "create",
      "update",
      "propose",
      "schedule",
      "confirm",
      "reschedule",
      "complete",
      "cancel",
      "mark-no-show",
    ],
    workflowActions: [
      "propose",
      "schedule",
      "confirm",
      "reschedule",
      "complete",
      "cancel",
      "mark-no-show",
    ],
  },
  "deal.view": {
    resourceTypes: ["deal"],
    actions: ["read", "view", "list"],
  },
  "deal.edit": {
    resourceTypes: ["deal"],
    actions: ["create", "update", "assign"],
  },
  "deal.move": {
    resourceTypes: ["deal"],
    actions: ["move-stage", "hold", "resume", "lose", "disqualify"],
  },
  "deal.manage": {
    resourceTypes: ["deal", "deal-pipeline"],
    actions: ["create", "update", "assign", "configure-pipeline", "archive"],
    workflowActions: ["archive"],
  },
  "client.view": {
    resourceTypes: ["client-account"],
    actions: ["read", "view", "list"],
  },
  "client.contact.manage": {
    resourceTypes: ["client-account", "client-relationship"],
    actions: ["create", "update", "remove", "set-primary"],
    workflowActions: ["remove", "set-primary"],
  },
  "client.portal.manage": {
    resourceTypes: ["client-account", "portal-access"],
    actions: ["update-access", "suspend-access", "revoke-access"],
    workflowActions: ["suspend-access", "revoke-access"],
  },
  "client.portal.provision": {
    resourceTypes: ["client-account", "portal-access"],
    actions: ["invite", "provision", "reissue"],
    workflowActions: ["invite", "provision", "reissue"],
  },
} as const satisfies Record<R6ActivePermissionKey, R6PermissionBinding>;

const activeKeySet = new Set<CanonicalPermissionKey>(R6_ACTIVE_PERMISSION_KEYS);

export function isR6ActivePermissionKey(
  permissionKey: CanonicalPermissionKey,
): permissionKey is R6ActivePermissionKey {
  return activeKeySet.has(permissionKey);
}

export function getR6PermissionBinding(
  permissionKey: R6ActivePermissionKey,
): R6PermissionBinding {
  return R6_PERMISSION_BINDINGS[permissionKey];
}

const groups = (input: {
  publicBusiness?: readonly string[];
  internal?: readonly string[];
  pii?: readonly string[];
  commercial?: readonly string[];
  provider?: readonly string[];
  security?: readonly string[];
}) => ({
  "public-business": input.publicBusiness ?? [],
  "internal-operations": input.internal ?? [],
  pii: input.pii ?? [],
  "restricted-commercial": input.commercial ?? [],
  "restricted-provider": input.provider ?? [],
  security: input.security ?? [],
});

const policy = (
  readableFields: readonly string[],
  mutableFields: readonly string[],
  fieldGroups: ReturnType<typeof groups>,
  fieldLifecycle: {
    readonly createOnlyFields?: readonly string[];
    readonly serverOwnedFields?: readonly string[];
    readonly actionFields?: Readonly<Record<string, readonly string[]>>;
  } = {},
): AuthorizationFieldPolicy => ({
  readableFields,
  mutableFields,
  createOnlyFields: fieldLifecycle.createOnlyFields ?? [],
  serverOwnedFields: fieldLifecycle.serverOwnedFields ?? [],
  actionFields: fieldLifecycle.actionFields ?? {},
  fieldGroups,
});

export const R6_FIELD_POLICIES: Record<
  R6AuthorizationResourceType,
  AuthorizationFieldPolicy
> = {
  "lead-source": policy(
    ["id", "resourceId", "name", "sourceType", "baseUrl", "health", "createdAt", "updatedAt", "archivedAt"],
    ["name", "baseUrl", "configuration", "complianceNotes"],
    groups({
      publicBusiness: ["id", "resourceId", "name", "sourceType", "health", "createdAt", "updatedAt"],
      internal: ["baseUrl", "configuration", "complianceNotes", "archivedAt"],
    }),
    {
      createOnlyFields: ["sourceType"],
      serverOwnedFields: ["id", "resourceId", "health", "createdAt", "updatedAt", "archivedAt"],
    },
  ),
  "lead-search": policy(
    ["query", "sourceIds", "safeResults", "resultCount"],
    ["query", "sourceIds"],
    groups({ publicBusiness: ["query", "safeResults", "resultCount"], internal: ["sourceIds"] }),
  ),
  "extraction-job": policy(
    ["id", "resourceId", "leadSourceId", "status", "requestedCount", "processedCount", "acceptedCount", "rejectedCount", "requestedAt", "startedAt", "finishedAt"],
    ["querySnapshot"],
    groups({
      publicBusiness: ["id", "resourceId", "status", "requestedCount", "processedCount", "acceptedCount", "rejectedCount", "requestedAt", "startedAt", "finishedAt"],
      internal: ["leadSourceId", "querySnapshot"],
    }),
    {
      createOnlyFields: ["leadSourceId", "requestedCount"],
      serverOwnedFields: ["id", "resourceId", "status", "processedCount", "acceptedCount", "rejectedCount", "requestedAt", "startedAt", "finishedAt", "requestHash"],
    },
  ),
  "staged-record": policy(
    ["id", "sourceRecordKey", "normalizedPayload", "provenanceUrl", "confidence", "validationState", "reviewedAt"],
    [],
    groups({
      internal: ["sourceRecordKey", "normalizedPayload", "provenanceUrl", "confidence", "validationState", "reviewedAt"],
      pii: ["normalizedPayload"],
      provider: ["provenanceUrl"],
    }),
    {
      actionFields: {
        approve: ["decision", "expectedRowVersion"],
        reject: ["decision", "expectedRowVersion"],
      },
    },
  ),
  "enrichment-job": policy(
    ["id", "resourceId", "targetResourceId", "provider", "requestedFields", "status", "attempt", "requestedAt", "startedAt", "finishedAt"],
    ["requestedFields"],
    groups({
      internal: ["id", "resourceId", "targetResourceId", "requestedFields", "status", "attempt", "requestedAt", "startedAt", "finishedAt"],
      provider: ["provider"],
    }),
    {
      createOnlyFields: ["targetResourceId", "provider"],
      serverOwnedFields: ["id", "resourceId", "status", "attempt", "requestedAt", "startedAt", "finishedAt", "requestHash"],
    },
  ),
  "enrichment-fact": policy(
    ["id", "targetResourceId", "fieldKey", "typedValue", "sourceUrl", "confidence", "observedAt", "acceptedAt", "rejectedAt"],
    [],
    groups({
      internal: ["id", "targetResourceId", "fieldKey", "confidence", "observedAt", "acceptedAt", "rejectedAt"],
      pii: ["typedValue"],
      provider: ["sourceUrl"],
    }),
    {
      actionFields: {
        accept: ["decision", "expectedRowVersion"],
        reject: ["decision", "expectedRowVersion"],
      },
    },
  ),
  lead: policy(
    ["id", "resourceId", "companyId", "contactId", "leadSourceId", "lifecycleState", "fitScore", "qualificationState", "lastActivityAt", "ownerMembershipId", "departmentId"],
    ["companyId", "contactId", "leadSourceId"],
    groups({
      publicBusiness: ["id", "resourceId", "companyId", "contactId", "lifecycleState", "lastActivityAt"],
      internal: ["leadSourceId", "fitScore", "qualificationState", "ownerMembershipId", "departmentId", "to", "expectedRowVersion", "reason"],
    }),
    {
      serverOwnedFields: ["id", "resourceId", "sourceRecordKey", "lifecycleState", "fitScore", "qualificationState", "lastActivityAt", "ownerMembershipId", "departmentId"],
      actionFields: {
        qualify: ["to", "expectedRowVersion", "reason"],
        nurture: ["to", "expectedRowVersion", "reason"],
        disqualify: ["to", "expectedRowVersion", "reason"],
      },
    },
  ),
  "duplicate-candidate": policy(
    ["id", "resourceId", "entityType", "leftResourceId", "rightResourceId", "confidence", "reasons", "status", "resolvedAt"],
    ["status"],
    groups({ internal: ["id", "resourceId", "entityType", "leftResourceId", "rightResourceId", "confidence", "reasons", "status", "resolvedAt"] }),
  ),
  qualification: policy(
    ["id", "resourceId", "leadId", "dealId", "criteriaVersion", "score", "disposition", "reviewedAt"],
    [],
    groups({ internal: ["id", "resourceId", "leadId", "dealId", "criteriaVersion", "score", "disposition", "reviewedAt"] }),
  ),
  "lead-list": policy(
    ["id", "resourceId", "name", "listType", "filterDefinition", "memberCount", "ownerMembershipId", "archivedAt"],
    ["name", "filterDefinition"],
    groups({
      publicBusiness: ["id", "resourceId", "name", "listType", "memberCount"],
      internal: ["filterDefinition", "ownerMembershipId", "archivedAt", "leadId"],
    }),
    {
      createOnlyFields: ["listType"],
      serverOwnedFields: ["id", "resourceId", "memberCount", "ownerMembershipId", "archivedAt"],
      actionFields: {
        add: ["leadId"],
        remove: ["leadId"],
      },
    },
  ),
  company: policy(
    ["id", "resourceId", "name", "legalName", "domain", "website", "industry", "sizeBand", "revenueBand", "country", "ownerMembershipId", "departmentId", "archivedAt"],
    ["name", "legalName", "domain", "website", "industry", "sizeBand", "revenueBand", "country"],
    groups({
      publicBusiness: ["id", "resourceId", "name", "legalName", "domain", "website", "industry", "sizeBand", "revenueBand", "country"],
      internal: ["ownerMembershipId", "departmentId", "archivedAt"],
    }),
    {
      serverOwnedFields: ["id", "resourceId", "ownerMembershipId", "departmentId", "archivedAt"],
    },
  ),
  contact: policy(
    ["id", "resourceId", "companyId", "personId", "title", "relationshipState", "preferredChannel", "contactabilityState", "consentState", "emailOriginal", "emailNormalized", "phoneNormalized", "ownerMembershipId"],
    ["companyId", "personId", "title", "relationshipState", "preferredChannel"],
    groups({
      publicBusiness: ["id", "resourceId", "companyId", "personId", "title", "relationshipState", "preferredChannel", "contactabilityState", "consentState"],
      internal: ["ownerMembershipId"],
      pii: ["emailOriginal", "emailNormalized", "phoneNormalized"],
    }),
    {
      serverOwnedFields: ["id", "resourceId", "contactabilityState", "consentState", "emailOriginal", "emailNormalized", "phoneNormalized", "ownerMembershipId"],
    },
  ),
  "outreach-dashboard": policy(
    ["campaignCount", "recipientCount", "sentCount", "replyCount", "positiveReplyCount"],
    [],
    groups({ publicBusiness: ["campaignCount", "recipientCount", "sentCount", "replyCount", "positiveReplyCount"] }),
  ),
  "outreach-campaign": policy(
    ["id", "resourceId", "name", "leadListId", "sequenceId", "sequenceVersion", "sendingAccountId", "schedule", "status", "recipientCount", "sentCount", "replyCount", "positiveReplyCount", "audienceSnapshotHash", "approvedSnapshotHash", "rowVersion"],
    ["name", "leadListId", "sequenceId", "sendingAccountId", "schedule"],
    groups({
      publicBusiness: ["id", "resourceId", "name", "status", "recipientCount", "sentCount", "replyCount", "positiveReplyCount"],
      internal: ["leadListId", "sequenceId", "sequenceVersion", "sendingAccountId", "schedule", "audienceSnapshotHash", "approvedSnapshotHash", "rowVersion"],
    }),
    {
      serverOwnedFields: ["id", "resourceId", "sequenceVersion", "status", "recipientCount", "sentCount", "replyCount", "positiveReplyCount", "audienceSnapshotHash", "approvedSnapshotHash", "rowVersion"],
    },
  ),
  sequence: policy(
    ["id", "resourceId", "name", "currentVersion", "status", "steps", "rowVersion", "archivedAt"],
    ["name", "steps"],
    groups({ publicBusiness: ["id", "resourceId", "name", "currentVersion", "status"], internal: ["steps", "rowVersion", "archivedAt"] }),
    {
      serverOwnedFields: ["id", "resourceId", "currentVersion", "status", "rowVersion", "archivedAt"],
    },
  ),
  "sending-account": policy(
    ["id", "resourceId", "provider", "address", "displayName", "dailyLimit", "hourlyLimit", "health", "syncState", "lastSyncAt", "rowVersion"],
    ["displayName", "dailyLimit", "hourlyLimit"],
    groups({
      publicBusiness: ["id", "resourceId", "provider", "address", "displayName", "dailyLimit", "hourlyLimit", "health", "syncState", "lastSyncAt"],
      internal: ["rowVersion"],
      provider: ["provider"],
      security: [],
    }),
    {
      createOnlyFields: ["provider", "address"],
      serverOwnedFields: ["id", "resourceId", "health", "syncState", "lastSyncAt", "rowVersion"],
    },
  ),
  reply: policy(
    ["conversationId", "messageId", "classification", "status", "assignedMembershipIds"],
    ["classification"],
    groups({ internal: ["conversationId", "messageId", "classification", "status", "assignedMembershipIds"] }),
  ),
  conversation: policy(
    ["id", "resourceId", "channel", "subject", "leadId", "dealId", "clientAccountId", "status", "lastMessageAt", "ownerMembershipId", "assignedMembershipId", "rowVersion"],
    ["subject", "assignedMembershipId"],
    groups({
      publicBusiness: ["id", "resourceId", "channel", "subject", "status", "lastMessageAt"],
      internal: ["leadId", "dealId", "clientAccountId", "ownerMembershipId", "assignedMembershipId", "rowVersion"],
      pii: ["subject"],
    }),
    {
      serverOwnedFields: ["id", "resourceId", "status", "lastMessageAt", "ownerMembershipId", "rowVersion"],
      actionFields: {
        assign: ["assignedMembershipId"],
        reassign: ["assignedMembershipId"],
      },
    },
  ),
  message: policy(
    ["id", "conversationId", "direction", "bodyText", "visibility", "isInternalNote", "sentAt", "receivedAt"],
    ["bodyText"],
    groups({
      publicBusiness: ["id", "conversationId", "direction", "visibility", "isInternalNote", "sentAt", "receivedAt"],
      pii: ["bodyText"],
      provider: [],
    }),
    {
      serverOwnedFields: ["id", "conversationId", "direction", "visibility", "isInternalNote", "sentAt", "receivedAt"],
    },
  ),
  meeting: policy(
    ["id", "resourceId", "title", "meetingType", "startsAt", "endsAt", "timezone", "status", "locationUrl", "dealId", "clientAccountId", "ownerMembershipId", "rowVersion", "rescheduleHistory"],
    ["title", "meetingType", "startsAt", "endsAt", "timezone", "locationUrl"],
    groups({
      publicBusiness: ["id", "resourceId", "title", "meetingType", "startsAt", "endsAt", "timezone", "status", "locationUrl"],
      internal: ["dealId", "clientAccountId", "ownerMembershipId", "rowVersion", "rescheduleHistory", "reason"],
    }),
    {
      createOnlyFields: ["dealId", "clientAccountId"],
      serverOwnedFields: ["id", "resourceId", "status", "ownerMembershipId", "rowVersion", "rescheduleHistory"],
      actionFields: {
        reschedule: ["startsAt", "endsAt", "timezone", "reason"],
      },
    },
  ),
  deal: policy(
    ["id", "resourceId", "companyId", "primaryContactId", "sourceLeadId", "pipelineId", "stageId", "amountMinor", "currency", "probability", "expectedCloseDate", "ownerMembershipId", "departmentId", "rowVersion", "archivedAt"],
    ["companyId", "primaryContactId", "amountMinor", "currency", "probability", "expectedCloseDate"],
    groups({
      publicBusiness: ["id", "resourceId", "companyId", "primaryContactId", "pipelineId", "stageId", "expectedCloseDate"],
      internal: ["sourceLeadId", "ownerMembershipId", "departmentId", "rowVersion", "archivedAt"],
      commercial: ["amountMinor", "currency", "probability"],
    }),
    {
      createOnlyFields: ["pipelineId"],
      serverOwnedFields: ["id", "resourceId", "sourceLeadId", "stageId", "ownerMembershipId", "departmentId", "rowVersion", "archivedAt"],
    },
  ),
  "deal-pipeline": policy(
    ["id", "resourceId", "name", "version", "active", "rowVersion", "archivedAt"],
    ["name", "active"],
    groups({ publicBusiness: ["id", "resourceId", "name", "version", "active"], internal: ["rowVersion", "archivedAt"] }),
  ),
  "client-account": policy(
    ["id", "resourceId", "clientOrganizationId", "accountManagerMembershipId", "health", "onboardingState", "portalState", "customerSince", "rowVersion", "archivedAt"],
    ["accountManagerMembershipId"],
    groups({
      publicBusiness: ["id", "resourceId", "clientOrganizationId", "health", "onboardingState", "portalState", "customerSince"],
      internal: ["accountManagerMembershipId", "rowVersion", "archivedAt"],
    }),
  ),
  "client-relationship": policy(
    ["id", "clientAccountId", "personId", "contactId", "relationshipRole", "isPrimary", "isBilling", "isApprover", "isAdmin", "archivedAt"],
    ["relationshipRole", "isPrimary", "isBilling", "isApprover"],
    groups({
      publicBusiness: ["id", "clientAccountId", "relationshipRole", "isPrimary", "isBilling", "isApprover"],
      internal: ["isAdmin", "archivedAt"],
      pii: ["personId", "contactId"],
    }),
  ),
  "portal-access": policy(
    ["clientAccountId", "status", "targetMembershipId", "targetPersonId"],
    ["status"],
    groups({
      publicBusiness: ["clientAccountId", "status"],
      internal: ["targetMembershipId", "targetPersonId"],
      security: [],
    }),
  ),
};

export function getR6FieldPolicy(
  resourceType: string,
): AuthorizationFieldPolicy | undefined {
  return R6_FIELD_POLICIES[
    resourceType as R6AuthorizationResourceType
  ];
}
