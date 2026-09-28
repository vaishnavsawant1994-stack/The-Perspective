import "server-only";

import type { PrismaClient } from "@/generated/prisma/client";
import type { AuthorizedRequestContext } from "@/modules/foundation/request-context";
import { evaluateAuthorization } from "@/modules/authorization/policy";
import type { AuthorizationResourceContext } from "@/modules/authorization/types";
import { getPrismaClient } from "@/modules/persistence/client";

const OVERFETCH_FACTOR = 4;

export function projectR6ReadableFields<T extends Readonly<Record<string, unknown>>>(
  value: T,
  readableFields: readonly string[],
) {
  const allowed = new Set(readableFields);
  return Object.fromEntries(
    Object.entries(value).filter(([field]) => allowed.has(field)),
  ) as Partial<T>;
}

function authorizedReadableFields(
  context: AuthorizedRequestContext,
  permissionKey:
    | "lead.view"
    | "company.view"
    | "contact.view"
    | "lead.discover"
    | "campaign.view"
    | "emailaccount.manage"
    | "sequence.manage"
    | "inbox.view"
    | "reply.view"
    | "message.read"
    | "meeting.view"
    | "deal.view"
    | "client.view",
  resource: AuthorizationResourceContext,
  requestedFields: readonly string[],
  action: "list" | "view" | "discover" | "manage" | "update" = "list",
) {
  const decision = evaluateAuthorization(context, permissionKey, resource, {
    action,
    requestedFields,
  });
  return decision.decision === "ALLOW" ? decision.readableFields ?? [] : undefined;
}

function commonResource(input: {
  readonly resourceId: string;
  readonly resourceType: string;
  readonly ownerOrganizationId: string;
  readonly departmentId: string | null;
  readonly ownerMembershipId: string | null;
  readonly visibility: string;
  readonly sensitivity: string;
  readonly lifecycleState: string;
  readonly version: number;
}): AuthorizationResourceContext {
  return {
    resourceId: input.resourceId,
    resourceType: input.resourceType,
    ownerOrganizationId: input.ownerOrganizationId,
    departmentId: input.departmentId,
    ownerMembershipId: input.ownerMembershipId,
    visibility: input.visibility as AuthorizationResourceContext["visibility"],
    sensitivity: input.sensitivity as AuthorizationResourceContext["sensitivity"],
    lifecycleState: input.lifecycleState,
    version: input.version,
  };
}

export async function getAuthorizedCompany(
  context: AuthorizedRequestContext,
  companyId: string,
  database: PrismaClient = getPrismaClient(),
) {
  const row = await database.crmCompany.findFirst({
    where: {
      id: companyId,
      ownerOrganizationId: context.tenant.organizationId,
      archivedAt: null,
    },
    select: {
      id: true,
      resourceId: true,
      ownerOrganizationId: true,
      departmentId: true,
      ownerMembershipId: true,
      visibility: true,
      sensitivity: true,
      name: true,
      legalName: true,
      domain: true,
      website: true,
      industry: true,
      sizeBand: true,
      revenueBand: true,
      country: true,
      rowVersion: true,
    },
  });
  if (!row) return undefined;

  const requestedFields = [
    "id",
    "resourceId",
    "name",
    "legalName",
    "domain",
    "website",
    "industry",
    "sizeBand",
    "revenueBand",
    "country",
  ] as const;
  const resource = commonResource({
    resourceId: row.resourceId,
    resourceType: "company",
    ownerOrganizationId: row.ownerOrganizationId,
    departmentId: row.departmentId,
    ownerMembershipId: row.ownerMembershipId,
    visibility: row.visibility,
    sensitivity: row.sensitivity,
    lifecycleState: "ACTIVE",
    version: row.rowVersion,
  });
  const readableFields = authorizedReadableFields(
    context,
    "company.view",
    resource,
    requestedFields,
    "view",
  );
  if (!readableFields) return undefined;

  return projectR6ReadableFields({
    id: row.id,
    resourceId: row.resourceId,
    name: row.name,
    legalName: row.legalName,
    domain: row.domain,
    website: row.website,
    industry: row.industry,
    sizeBand: row.sizeBand,
    revenueBand: row.revenueBand,
    country: row.country,
  }, readableFields);
}

export async function getAuthorizedContact(
  context: AuthorizedRequestContext,
  contactId: string,
  database: PrismaClient = getPrismaClient(),
) {
  const row = await database.crmContact.findFirst({
    where: {
      id: contactId,
      ownerOrganizationId: context.tenant.organizationId,
      archivedAt: null,
    },
    select: {
      id: true,
      resourceId: true,
      ownerOrganizationId: true,
      departmentId: true,
      ownerMembershipId: true,
      visibility: true,
      sensitivity: true,
      companyId: true,
      personId: true,
      title: true,
      relationshipState: true,
      preferredChannel: true,
      contactabilityState: true,
      consentState: true,
      emailOriginal: true,
      emailNormalized: true,
      phoneNormalized: true,
      rowVersion: true,
    },
  });
  if (!row) return undefined;

  const requestedFields = [
    "id",
    "resourceId",
    "companyId",
    "personId",
    "title",
    "relationshipState",
    "preferredChannel",
    "contactabilityState",
    "consentState",
    "emailOriginal",
    "emailNormalized",
    "phoneNormalized",
  ] as const;
  const resource = commonResource({
    resourceId: row.resourceId,
    resourceType: "contact",
    ownerOrganizationId: row.ownerOrganizationId,
    departmentId: row.departmentId,
    ownerMembershipId: row.ownerMembershipId,
    visibility: row.visibility,
    sensitivity: row.sensitivity,
    lifecycleState: "ACTIVE",
    version: row.rowVersion,
  });
  const readableFields = authorizedReadableFields(
    context,
    "contact.view",
    resource,
    requestedFields,
    "view",
  );
  if (!readableFields) return undefined;

  return projectR6ReadableFields({
    id: row.id,
    resourceId: row.resourceId,
    companyId: row.companyId,
    personId: row.personId,
    title: row.title,
    relationshipState: row.relationshipState,
    preferredChannel: row.preferredChannel,
    contactabilityState: row.contactabilityState,
    consentState: row.consentState,
    emailOriginal: row.emailOriginal,
    emailNormalized: row.emailNormalized,
    phoneNormalized: row.phoneNormalized,
  }, readableFields);
}

export async function getAuthorizedLead(
  context: AuthorizedRequestContext,
  leadId: string,
  database: PrismaClient = getPrismaClient(),
) {
  const row = await database.crmLead.findFirst({
    where: {
      id: leadId,
      ownerOrganizationId: context.tenant.organizationId,
      archivedAt: null,
    },
    select: {
      id: true,
      resourceId: true,
      ownerOrganizationId: true,
      departmentId: true,
      ownerMembershipId: true,
      visibility: true,
      sensitivity: true,
      companyId: true,
      contactId: true,
      leadSourceId: true,
      lifecycleState: true,
      fitScore: true,
      qualificationState: true,
      lastActivityAt: true,
      rowVersion: true,
    },
  });
  if (!row) return undefined;

  const requestedFields = [
    "id",
    "resourceId",
    "companyId",
    "contactId",
    "leadSourceId",
    "lifecycleState",
    "fitScore",
    "qualificationState",
    "lastActivityAt",
    "ownerMembershipId",
    "departmentId",
  ] as const;
  const resource = commonResource({
    resourceId: row.resourceId,
    resourceType: "lead",
    ownerOrganizationId: row.ownerOrganizationId,
    departmentId: row.departmentId,
    ownerMembershipId: row.ownerMembershipId,
    visibility: row.visibility,
    sensitivity: row.sensitivity,
    lifecycleState: row.lifecycleState,
    version: row.rowVersion,
  });
  const readableFields = authorizedReadableFields(
    context,
    "lead.view",
    resource,
    requestedFields,
    "view",
  );
  if (!readableFields) return undefined;

  return projectR6ReadableFields({
    id: row.id,
    resourceId: row.resourceId,
    companyId: row.companyId,
    contactId: row.contactId,
    leadSourceId: row.leadSourceId,
    lifecycleState: row.lifecycleState,
    fitScore: row.fitScore?.toString() ?? null,
    qualificationState: row.qualificationState,
    lastActivityAt: row.lastActivityAt?.toISOString() ?? null,
    ownerMembershipId: row.ownerMembershipId,
    departmentId: row.departmentId,
  }, readableFields);
}

export async function listDiscoverableLeadSources(
  context: AuthorizedRequestContext,
  limit: number,
  database: PrismaClient = getPrismaClient(),
) {
  const requestedFields = [
    "id",
    "resourceId",
    "name",
    "sourceType",
    "health",
    "createdAt",
    "updatedAt",
  ] as const;

  const candidates = await database.crmLeadSource.findMany({
    where: {
      ownerOrganizationId: context.tenant.organizationId,
      archivedAt: null,
    },
    orderBy: [{ updatedAt: "desc" }, { id: "desc" }],
    take: Math.min(limit * OVERFETCH_FACTOR, 400),
    select: {
      id: true,
      resourceId: true,
      ownerOrganizationId: true,
      departmentId: true,
      ownerMembershipId: true,
      visibility: true,
      sensitivity: true,
      name: true,
      sourceType: true,
      health: true,
      createdAt: true,
      updatedAt: true,
      rowVersion: true,
    },
  });

  const items = [];
  for (const row of candidates) {
    const resource = commonResource({
      resourceId: row.resourceId,
      resourceType: "lead-source",
      ownerOrganizationId: row.ownerOrganizationId,
      departmentId: row.departmentId,
      ownerMembershipId: row.ownerMembershipId,
      visibility: row.visibility,
      sensitivity: row.sensitivity,
      lifecycleState: "ACTIVE",
      version: row.rowVersion,
    });
    const readableFields = authorizedReadableFields(
      context,
      "lead.discover",
      resource,
      requestedFields,
      "discover",
    );
    if (!readableFields) continue;

    items.push(projectR6ReadableFields({
      id: row.id,
      resourceId: row.resourceId,
      name: row.name,
      sourceType: row.sourceType,
      health: row.health,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    }, readableFields));

    if (items.length >= limit) break;
  }

  return { items };
}

export async function listAuthorizedCompanies(
  context: AuthorizedRequestContext,
  limit: number,
  database: PrismaClient = getPrismaClient(),
) {
  const requestedFields = [
    "id",
    "resourceId",
    "name",
    "legalName",
    "domain",
    "website",
    "industry",
    "sizeBand",
    "revenueBand",
    "country",
  ] as const;

  const candidates = await database.crmCompany.findMany({
    where: {
      ownerOrganizationId: context.tenant.organizationId,
      archivedAt: null,
    },
    orderBy: [{ updatedAt: "desc" }, { id: "desc" }],
    take: Math.min(limit * OVERFETCH_FACTOR, 400),
    select: {
      id: true,
      resourceId: true,
      ownerOrganizationId: true,
      departmentId: true,
      ownerMembershipId: true,
      visibility: true,
      sensitivity: true,
      name: true,
      legalName: true,
      domain: true,
      website: true,
      industry: true,
      sizeBand: true,
      revenueBand: true,
      country: true,
      rowVersion: true,
    },
  });

  const items = [];
  for (const row of candidates) {
    const resource = commonResource({
      resourceId: row.resourceId,
      resourceType: "company",
      ownerOrganizationId: row.ownerOrganizationId,
      departmentId: row.departmentId,
      ownerMembershipId: row.ownerMembershipId,
      visibility: row.visibility,
      sensitivity: row.sensitivity,
      lifecycleState: "ACTIVE",
      version: row.rowVersion,
    });
    const readableFields = authorizedReadableFields(
      context,
      "company.view",
      resource,
      requestedFields,
    );
    if (!readableFields) continue;

    items.push(projectR6ReadableFields({
      id: row.id,
      resourceId: row.resourceId,
      name: row.name,
      legalName: row.legalName,
      domain: row.domain,
      website: row.website,
      industry: row.industry,
      sizeBand: row.sizeBand,
      revenueBand: row.revenueBand,
      country: row.country,
    }, readableFields));

    if (items.length >= limit) break;
  }

  return { items };
}

export async function listAuthorizedContacts(
  context: AuthorizedRequestContext,
  limit: number,
  database: PrismaClient = getPrismaClient(),
) {
  const requestedFields = [
    "id",
    "resourceId",
    "companyId",
    "personId",
    "title",
    "relationshipState",
    "preferredChannel",
    "contactabilityState",
    "consentState",
  ] as const;

  const candidates = await database.crmContact.findMany({
    where: {
      ownerOrganizationId: context.tenant.organizationId,
      archivedAt: null,
    },
    orderBy: [{ updatedAt: "desc" }, { id: "desc" }],
    take: Math.min(limit * OVERFETCH_FACTOR, 400),
    select: {
      id: true,
      resourceId: true,
      ownerOrganizationId: true,
      departmentId: true,
      ownerMembershipId: true,
      visibility: true,
      sensitivity: true,
      companyId: true,
      personId: true,
      title: true,
      relationshipState: true,
      preferredChannel: true,
      contactabilityState: true,
      consentState: true,
      rowVersion: true,
    },
  });

  const items = [];
  for (const row of candidates) {
    const resource = commonResource({
      resourceId: row.resourceId,
      resourceType: "contact",
      ownerOrganizationId: row.ownerOrganizationId,
      departmentId: row.departmentId,
      ownerMembershipId: row.ownerMembershipId,
      visibility: row.visibility,
      sensitivity: row.sensitivity,
      lifecycleState: "ACTIVE",
      version: row.rowVersion,
    });
    const readableFields = authorizedReadableFields(
      context,
      "contact.view",
      resource,
      requestedFields,
    );
    if (!readableFields) continue;

    items.push(projectR6ReadableFields({
      id: row.id,
      resourceId: row.resourceId,
      companyId: row.companyId,
      personId: row.personId,
      title: row.title,
      relationshipState: row.relationshipState,
      preferredChannel: row.preferredChannel,
      contactabilityState: row.contactabilityState,
      consentState: row.consentState,
    }, readableFields));

    if (items.length >= limit) break;
  }

  return { items };
}

export async function listAuthorizedLeads(
  context: AuthorizedRequestContext,
  limit: number,
  database: PrismaClient = getPrismaClient(),
) {
  const requestedFields = [
    "id",
    "resourceId",
    "companyId",
    "contactId",
    "leadSourceId",
    "lifecycleState",
    "fitScore",
    "qualificationState",
    "lastActivityAt",
    "ownerMembershipId",
    "departmentId",
  ] as const;

  const candidates = await database.crmLead.findMany({
    where: {
      ownerOrganizationId: context.tenant.organizationId,
      archivedAt: null,
    },
    orderBy: [{ updatedAt: "desc" }, { id: "desc" }],
    take: Math.min(limit * OVERFETCH_FACTOR, 400),
    select: {
      id: true,
      resourceId: true,
      ownerOrganizationId: true,
      departmentId: true,
      ownerMembershipId: true,
      visibility: true,
      sensitivity: true,
      companyId: true,
      contactId: true,
      leadSourceId: true,
      lifecycleState: true,
      fitScore: true,
      qualificationState: true,
      lastActivityAt: true,
      rowVersion: true,
    },
  });

  const items = [];
  for (const row of candidates) {
    const resource = commonResource({
      resourceId: row.resourceId,
      resourceType: "lead",
      ownerOrganizationId: row.ownerOrganizationId,
      departmentId: row.departmentId,
      ownerMembershipId: row.ownerMembershipId,
      visibility: row.visibility,
      sensitivity: row.sensitivity,
      lifecycleState: row.lifecycleState,
      version: row.rowVersion,
    });

    const readableFields = authorizedReadableFields(context, "lead.view", resource, requestedFields);
    if (!readableFields) continue;

    items.push(projectR6ReadableFields({
      id: row.id,
      resourceId: row.resourceId,
      companyId: row.companyId,
      contactId: row.contactId,
      leadSourceId: row.leadSourceId,
      lifecycleState: row.lifecycleState,
      fitScore: row.fitScore?.toString() ?? null,
      qualificationState: row.qualificationState,
      lastActivityAt: row.lastActivityAt?.toISOString() ?? null,
      ownerMembershipId: row.ownerMembershipId,
      departmentId: row.departmentId,
    }, readableFields));

    if (items.length >= limit) break;
  }

  return { items };
}

export async function listAuthorizedCampaigns(
  context: AuthorizedRequestContext,
  limit: number,
  database: PrismaClient = getPrismaClient(),
) {
  const requestedFields = [
    "id",
    "resourceId",
    "name",
    "leadListId",
    "sequenceId",
    "sendingAccountId",
    "schedule",
    "status",
    "recipientCount",
    "sentCount",
    "replyCount",
    "positiveReplyCount",
    "audienceSnapshotHash",
    "approvedSnapshotHash",
    "rowVersion",
  ] as const;

  const candidates = await database.commsOutreachCampaign.findMany({
    where: {
      ownerOrganizationId: context.tenant.organizationId,
      archivedAt: null,
    },
    orderBy: [{ updatedAt: "desc" }, { id: "desc" }],
    take: Math.min(limit * OVERFETCH_FACTOR, 400),
    select: {
      id: true,
      resourceId: true,
      ownerOrganizationId: true,
      departmentId: true,
      ownerMembershipId: true,
      visibility: true,
      sensitivity: true,
      name: true,
      leadListId: true,
      sequenceId: true,
      sendingAccountId: true,
      schedule: true,
      status: true,
      recipientCount: true,
      sentCount: true,
      replyCount: true,
      positiveReplyCount: true,
      audienceSnapshotHash: true,
      approvedSnapshotHash: true,
      rowVersion: true,
    },
  });

  const items = [];
  for (const row of candidates) {
    const resource = commonResource({
      resourceId: row.resourceId,
      resourceType: "outreach-campaign",
      ownerOrganizationId: row.ownerOrganizationId,
      departmentId: row.departmentId,
      ownerMembershipId: row.ownerMembershipId,
      visibility: row.visibility,
      sensitivity: row.sensitivity,
      lifecycleState: row.status,
      version: row.rowVersion,
    });

    const readableFields = authorizedReadableFields(context, "campaign.view", resource, requestedFields);
    if (!readableFields) continue;

    items.push(projectR6ReadableFields({
      id: row.id,
      resourceId: row.resourceId,
      name: row.name,
      leadListId: row.leadListId,
      sequenceId: row.sequenceId,
      sendingAccountId: row.sendingAccountId,
      schedule: row.schedule,
      status: row.status,
      recipientCount: row.recipientCount,
      sentCount: row.sentCount,
      replyCount: row.replyCount,
      positiveReplyCount: row.positiveReplyCount,
      audienceSnapshotHash: row.audienceSnapshotHash,
      approvedSnapshotHash: row.approvedSnapshotHash,
      rowVersion: row.rowVersion,
    }, readableFields));

    if (items.length >= limit) break;
  }

  return { items };
}

export async function listAuthorizedDeals(
  context: AuthorizedRequestContext,
  limit: number,
  database: PrismaClient = getPrismaClient(),
) {
  const requestedFields = [
    "id",
    "resourceId",
    "companyId",
    "primaryContactId",
    "sourceLeadId",
    "pipelineId",
    "stageId",
    "amountMinor",
    "currency",
    "probability",
    "expectedCloseDate",
    "ownerMembershipId",
    "departmentId",
    "rowVersion",
    "archivedAt",
  ] as const;

  const candidates = await database.commercialDeal.findMany({
    where: {
      ownerOrganizationId: context.tenant.organizationId,
      archivedAt: null,
    },
    orderBy: [{ updatedAt: "desc" }, { id: "desc" }],
    take: Math.min(limit * OVERFETCH_FACTOR, 400),
    select: {
      id: true,
      resourceId: true,
      ownerOrganizationId: true,
      departmentId: true,
      ownerMembershipId: true,
      visibility: true,
      sensitivity: true,
      companyId: true,
      primaryContactId: true,
      sourceLeadId: true,
      pipelineId: true,
      stageId: true,
      amountMinor: true,
      currency: true,
      probability: true,
      expectedCloseDate: true,
      rowVersion: true,
      archivedAt: true,
    },
  });

  const items = [];
  for (const row of candidates) {
    const resource = commonResource({
      resourceId: row.resourceId,
      resourceType: "deal",
      ownerOrganizationId: row.ownerOrganizationId,
      departmentId: row.departmentId,
      ownerMembershipId: row.ownerMembershipId,
      visibility: row.visibility,
      sensitivity: row.sensitivity,
      lifecycleState: row.archivedAt ? "ARCHIVED" : "ACTIVE",
      version: row.rowVersion,
    });

    const readableFields = authorizedReadableFields(context, "deal.view", resource, requestedFields);
    if (!readableFields) continue;

    items.push(projectR6ReadableFields({
      id: row.id,
      resourceId: row.resourceId,
      companyId: row.companyId,
      primaryContactId: row.primaryContactId,
      sourceLeadId: row.sourceLeadId,
      pipelineId: row.pipelineId,
      stageId: row.stageId,
      amountMinor: row.amountMinor?.toString() ?? null,
      currency: row.currency,
      probability: row.probability?.toString() ?? null,
      expectedCloseDate: row.expectedCloseDate?.toISOString().slice(0, 10) ?? null,
      ownerMembershipId: row.ownerMembershipId,
      departmentId: row.departmentId,
      rowVersion: row.rowVersion,
    }, readableFields));

    if (items.length >= limit) break;
  }

  return { items };
}

export async function listAuthorizedClients(
  context: AuthorizedRequestContext,
  limit: number,
  database: PrismaClient = getPrismaClient(),
) {
  const requestedFields = [
    "id",
    "resourceId",
    "clientOrganizationId",
    "accountManagerMembershipId",
    "health",
    "onboardingState",
    "portalState",
    "customerSince",
    "rowVersion",
    "archivedAt",
  ] as const;

  const candidates = await database.commercialClientAccount.findMany({
    where: {
      ownerOrganizationId: context.tenant.organizationId,
      archivedAt: null,
    },
    orderBy: [{ updatedAt: "desc" }, { id: "desc" }],
    take: Math.min(limit * OVERFETCH_FACTOR, 400),
    select: {
      id: true,
      resourceId: true,
      ownerOrganizationId: true,
      departmentId: true,
      ownerMembershipId: true,
      visibility: true,
      sensitivity: true,
      clientOrganizationId: true,
      accountManagerMembershipId: true,
      health: true,
      onboardingState: true,
      portalState: true,
      customerSince: true,
      rowVersion: true,
      archivedAt: true,
    },
  });

  const items = [];
  for (const row of candidates) {
    const resource = commonResource({
      resourceId: row.resourceId,
      resourceType: "client-account",
      ownerOrganizationId: row.ownerOrganizationId,
      departmentId: row.departmentId,
      ownerMembershipId: row.ownerMembershipId,
      visibility: row.visibility,
      sensitivity: row.sensitivity,
      lifecycleState: row.archivedAt ? "ARCHIVED" : "ACTIVE",
      version: row.rowVersion,
    });

    const readableFields = authorizedReadableFields(context, "client.view", resource, requestedFields);
    if (!readableFields) continue;

    items.push(projectR6ReadableFields({
      id: row.id,
      resourceId: row.resourceId,
      clientOrganizationId: row.clientOrganizationId,
      accountManagerMembershipId: row.accountManagerMembershipId,
      health: row.health,
      onboardingState: row.onboardingState,
      portalState: row.portalState,
      customerSince: row.customerSince?.toISOString().slice(0, 10) ?? null,
      rowVersion: row.rowVersion,
    }, readableFields));

    if (items.length >= limit) break;
  }

  return { items };
}


export async function getAuthorizedCampaign(
  context: AuthorizedRequestContext,
  campaignId: string,
  database: PrismaClient = getPrismaClient(),
) {
  const row = await database.commsOutreachCampaign.findFirst({
    where: {
      id: campaignId,
      ownerOrganizationId: context.tenant.organizationId,
      archivedAt: null,
    },
    select: {
      id: true,
      resourceId: true,
      ownerOrganizationId: true,
      departmentId: true,
      ownerMembershipId: true,
      visibility: true,
      sensitivity: true,
      name: true,
      leadListId: true,
      sequenceId: true,
      sequenceVersion: true,
      sendingAccountId: true,
      schedule: true,
      status: true,
      recipientCount: true,
      sentCount: true,
      replyCount: true,
      positiveReplyCount: true,
      audienceSnapshotHash: true,
      approvedSnapshotHash: true,
      rowVersion: true,
    },
  });
  if (!row) return undefined;

  const requestedFields = [
    "id", "resourceId", "name", "leadListId", "sequenceId", "sequenceVersion",
    "sendingAccountId", "schedule", "status", "recipientCount", "sentCount",
    "replyCount", "positiveReplyCount", "audienceSnapshotHash",
    "approvedSnapshotHash", "rowVersion",
  ] as const;
  const resource = commonResource({
    resourceId: row.resourceId,
    resourceType: "outreach-campaign",
    ownerOrganizationId: row.ownerOrganizationId,
    departmentId: row.departmentId,
    ownerMembershipId: row.ownerMembershipId,
    visibility: row.visibility,
    sensitivity: row.sensitivity,
    lifecycleState: row.status,
    version: row.rowVersion,
  });
  const readableFields = authorizedReadableFields(
    context, "campaign.view", resource, requestedFields, "view",
  );
  if (!readableFields) return undefined;
  return projectR6ReadableFields({
    id: row.id,
    resourceId: row.resourceId,
    name: row.name,
    leadListId: row.leadListId,
    sequenceId: row.sequenceId,
    sequenceVersion: row.sequenceVersion,
    sendingAccountId: row.sendingAccountId,
    schedule: row.schedule,
    status: row.status,
    recipientCount: row.recipientCount,
    sentCount: row.sentCount,
    replyCount: row.replyCount,
    positiveReplyCount: row.positiveReplyCount,
    audienceSnapshotHash: row.audienceSnapshotHash,
    approvedSnapshotHash: row.approvedSnapshotHash,
    rowVersion: row.rowVersion,
  }, readableFields);
}

export async function listAuthorizedSendingAccounts(
  context: AuthorizedRequestContext,
  limit: number,
  database: PrismaClient = getPrismaClient(),
) {
  const requestedFields = [
    "id", "resourceId", "provider", "address", "displayName", "dailyLimit",
    "hourlyLimit", "health", "syncState", "lastSyncAt", "rowVersion",
  ] as const;
  const candidates = await database.commsSendingAccount.findMany({
    where: { ownerOrganizationId: context.tenant.organizationId, archivedAt: null },
    orderBy: [{ updatedAt: "desc" }, { id: "desc" }],
    take: Math.min(limit * OVERFETCH_FACTOR, 400),
    select: {
      id: true, resourceId: true, ownerOrganizationId: true, departmentId: true,
      ownerMembershipId: true, visibility: true, sensitivity: true, provider: true,
      address: true, displayName: true, dailyLimit: true, hourlyLimit: true,
      health: true, syncState: true, lastSyncAt: true, rowVersion: true,
    },
  });
  const items = [];
  for (const row of candidates) {
    const resource = commonResource({
      resourceId: row.resourceId, resourceType: "sending-account",
      ownerOrganizationId: row.ownerOrganizationId, departmentId: row.departmentId,
      ownerMembershipId: row.ownerMembershipId, visibility: row.visibility,
      sensitivity: row.sensitivity, lifecycleState: row.syncState, version: row.rowVersion,
    });
    const readableFields = authorizedReadableFields(
      context, "emailaccount.manage", resource, requestedFields, "manage",
    );
    if (!readableFields) continue;
    items.push(projectR6ReadableFields({
      id: row.id, resourceId: row.resourceId, provider: row.provider,
      address: row.address, displayName: row.displayName, dailyLimit: row.dailyLimit,
      hourlyLimit: row.hourlyLimit, health: row.health, syncState: row.syncState,
      lastSyncAt: row.lastSyncAt?.toISOString() ?? null, rowVersion: row.rowVersion,
    }, readableFields));
    if (items.length >= limit) break;
  }
  return { items };
}

export async function getAuthorizedSendingAccount(
  context: AuthorizedRequestContext,
  sendingAccountId: string,
  database: PrismaClient = getPrismaClient(),
) {
  const row = await database.commsSendingAccount.findFirst({
    where: {
      id: sendingAccountId,
      ownerOrganizationId: context.tenant.organizationId,
      archivedAt: null,
    },
    select: {
      id: true,
      resourceId: true,
      ownerOrganizationId: true,
      departmentId: true,
      ownerMembershipId: true,
      visibility: true,
      sensitivity: true,
      provider: true,
      address: true,
      displayName: true,
      dailyLimit: true,
      hourlyLimit: true,
      health: true,
      syncState: true,
      lastSyncAt: true,
      rowVersion: true,
    },
  });
  if (!row) return undefined;
  const requestedFields = [
    "id", "resourceId", "provider", "address", "displayName", "dailyLimit",
    "hourlyLimit", "health", "syncState", "lastSyncAt", "rowVersion",
  ] as const;
  const resource = commonResource({
    resourceId: row.resourceId,
    resourceType: "sending-account",
    ownerOrganizationId: row.ownerOrganizationId,
    departmentId: row.departmentId,
    ownerMembershipId: row.ownerMembershipId,
    visibility: row.visibility,
    sensitivity: row.sensitivity,
    lifecycleState: row.syncState,
    version: row.rowVersion,
  });
  const readableFields = authorizedReadableFields(
    context, "emailaccount.manage", resource, requestedFields, "manage",
  );
  if (!readableFields) return undefined;
  return projectR6ReadableFields({
    id: row.id,
    resourceId: row.resourceId,
    provider: row.provider,
    address: row.address,
    displayName: row.displayName,
    dailyLimit: row.dailyLimit,
    hourlyLimit: row.hourlyLimit,
    health: row.health,
    syncState: row.syncState,
    lastSyncAt: row.lastSyncAt?.toISOString() ?? null,
    rowVersion: row.rowVersion,
  }, readableFields);
}

export async function listAuthorizedSequences(
  context: AuthorizedRequestContext,
  limit: number,
  database: PrismaClient = getPrismaClient(),
) {
  const requestedFields = [
    "id", "resourceId", "name", "currentVersion", "status", "rowVersion", "archivedAt",
  ] as const;
  const candidates = await database.commsSequence.findMany({
    where: { ownerOrganizationId: context.tenant.organizationId, archivedAt: null },
    orderBy: [{ updatedAt: "desc" }, { id: "desc" }],
    take: Math.min(limit * OVERFETCH_FACTOR, 400),
    select: {
      id: true, resourceId: true, ownerOrganizationId: true, departmentId: true,
      ownerMembershipId: true, visibility: true, sensitivity: true, name: true,
      currentVersion: true, status: true, rowVersion: true, archivedAt: true,
    },
  });
  const items = [];
  for (const row of candidates) {
    const resource = commonResource({
      resourceId: row.resourceId, resourceType: "sequence",
      ownerOrganizationId: row.ownerOrganizationId, departmentId: row.departmentId,
      ownerMembershipId: row.ownerMembershipId, visibility: row.visibility,
      sensitivity: row.sensitivity, lifecycleState: row.status, version: row.rowVersion,
    });
    const readableFields = authorizedReadableFields(
      context, "sequence.manage", resource, requestedFields, "update",
    );
    if (!readableFields) continue;
    items.push(projectR6ReadableFields({
      id: row.id, resourceId: row.resourceId, name: row.name,
      currentVersion: row.currentVersion, status: row.status, rowVersion: row.rowVersion,
      archivedAt: row.archivedAt?.toISOString() ?? null,
    }, readableFields));
    if (items.length >= limit) break;
  }
  return { items };
}

export async function getAuthorizedSequence(
  context: AuthorizedRequestContext,
  sequenceId: string,
  database: PrismaClient = getPrismaClient(),
) {
  const row = await database.commsSequence.findFirst({
    where: { id: sequenceId, ownerOrganizationId: context.tenant.organizationId, archivedAt: null },
    select: {
      id: true, resourceId: true, ownerOrganizationId: true, departmentId: true,
      ownerMembershipId: true, visibility: true, sensitivity: true, name: true,
      currentVersion: true, status: true, rowVersion: true, archivedAt: true,
    },
  });
  if (!row) return undefined;
  const requestedFields = [
    "id", "resourceId", "name", "currentVersion", "status", "steps", "rowVersion", "archivedAt",
  ] as const;
  const resource = commonResource({
    resourceId: row.resourceId, resourceType: "sequence",
    ownerOrganizationId: row.ownerOrganizationId, departmentId: row.departmentId,
    ownerMembershipId: row.ownerMembershipId, visibility: row.visibility,
    sensitivity: row.sensitivity, lifecycleState: row.status, version: row.rowVersion,
  });
  const readableFields = authorizedReadableFields(
    context, "sequence.manage", resource, requestedFields, "update",
  );
  if (!readableFields) return undefined;
  const steps = readableFields.includes("steps")
    ? await database.commsSequenceStep.findMany({
        where: { sequenceId: row.id, ownerOrganizationId: context.tenant.organizationId },
        orderBy: [{ sequenceVersion: "asc" }, { position: "asc" }],
        select: {
          id: true, sequenceVersion: true, position: true, channel: true,
          templateVersionId: true, delaySeconds: true, conditions: true, stopRules: true,
        },
      })
    : undefined;
  return projectR6ReadableFields({
    id: row.id, resourceId: row.resourceId, name: row.name,
    currentVersion: row.currentVersion, status: row.status, steps,
    rowVersion: row.rowVersion, archivedAt: row.archivedAt?.toISOString() ?? null,
  }, readableFields);
}

export async function listAuthorizedConversations(
  context: AuthorizedRequestContext,
  limit: number,
  database: PrismaClient = getPrismaClient(),
) {
  const requestedFields = [
    "id", "resourceId", "channel", "subject", "leadId", "dealId",
    "clientAccountId", "status", "lastMessageAt", "ownerMembershipId",
    "assignedMembershipId", "rowVersion",
  ] as const;
  const candidates = await database.commsConversation.findMany({
    where: { ownerOrganizationId: context.tenant.organizationId, archivedAt: null },
    orderBy: [{ lastMessageAt: "desc" }, { id: "desc" }],
    take: Math.min(limit * OVERFETCH_FACTOR, 400),
    select: {
      id: true, resourceId: true, ownerOrganizationId: true, departmentId: true,
      ownerMembershipId: true, assignedMembershipId: true, visibility: true,
      sensitivity: true, channel: true, subject: true, leadId: true, dealId: true,
      clientAccountId: true, status: true, lastMessageAt: true, rowVersion: true,
    },
  });
  const items = [];
  for (const row of candidates) {
    const resource = commonResource({
      resourceId: row.resourceId, resourceType: "conversation",
      ownerOrganizationId: row.ownerOrganizationId, departmentId: row.departmentId,
      ownerMembershipId: row.ownerMembershipId, visibility: row.visibility,
      sensitivity: row.sensitivity, lifecycleState: row.status, version: row.rowVersion,
    });
    const readableFields = authorizedReadableFields(
      context, "inbox.view", resource, requestedFields, "list",
    );
    if (!readableFields) continue;
    items.push(projectR6ReadableFields({
      id: row.id, resourceId: row.resourceId, channel: row.channel, subject: row.subject,
      leadId: row.leadId, dealId: row.dealId, clientAccountId: row.clientAccountId,
      status: row.status, lastMessageAt: row.lastMessageAt?.toISOString() ?? null,
      ownerMembershipId: row.ownerMembershipId,
      assignedMembershipId: row.assignedMembershipId, rowVersion: row.rowVersion,
    }, readableFields));
    if (items.length >= limit) break;
  }
  return { items };
}

export async function getAuthorizedConversation(
  context: AuthorizedRequestContext,
  conversationId: string,
  database: PrismaClient = getPrismaClient(),
) {
  const row = await database.commsConversation.findFirst({
    where: { id: conversationId, ownerOrganizationId: context.tenant.organizationId, archivedAt: null },
    select: {
      id: true, resourceId: true, ownerOrganizationId: true, departmentId: true,
      ownerMembershipId: true, assignedMembershipId: true, visibility: true,
      sensitivity: true, channel: true, subject: true, leadId: true, dealId: true,
      clientAccountId: true, status: true, lastMessageAt: true, rowVersion: true,
    },
  });
  if (!row) return undefined;
  const requestedFields = [
    "id", "resourceId", "channel", "subject", "leadId", "dealId", "clientAccountId",
    "status", "lastMessageAt", "ownerMembershipId", "assignedMembershipId", "rowVersion",
  ] as const;
  const resource = commonResource({
    resourceId: row.resourceId, resourceType: "conversation",
    ownerOrganizationId: row.ownerOrganizationId, departmentId: row.departmentId,
    ownerMembershipId: row.ownerMembershipId, visibility: row.visibility,
    sensitivity: row.sensitivity, lifecycleState: row.status, version: row.rowVersion,
  });
  const readableFields = authorizedReadableFields(
    context, "reply.view", resource, requestedFields, "view",
  );
  if (!readableFields) return undefined;
  return projectR6ReadableFields({
    id: row.id, resourceId: row.resourceId, channel: row.channel, subject: row.subject,
    leadId: row.leadId, dealId: row.dealId, clientAccountId: row.clientAccountId,
    status: row.status, lastMessageAt: row.lastMessageAt?.toISOString() ?? null,
    ownerMembershipId: row.ownerMembershipId,
    assignedMembershipId: row.assignedMembershipId, rowVersion: row.rowVersion,
  }, readableFields);
}

export async function listAuthorizedConversationMessages(
  context: AuthorizedRequestContext,
  conversationId: string,
  limit: number,
  database: PrismaClient = getPrismaClient(),
) {
  const conversation = await database.commsConversation.findFirst({
    where: { id: conversationId, ownerOrganizationId: context.tenant.organizationId, archivedAt: null },
    select: { departmentId: true, ownerMembershipId: true },
  });
  if (!conversation) return { items: [] };
  const requestedFields = [
    "id", "conversationId", "direction", "bodyText", "visibility",
    "isInternalNote", "sentAt", "receivedAt",
  ] as const;
  const candidates = await database.commsMessage.findMany({
    where: { ownerOrganizationId: context.tenant.organizationId, conversationId },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: Math.min(limit * OVERFETCH_FACTOR, 400),
    select: {
      id: true, resourceId: true, ownerOrganizationId: true, conversationId: true,
      direction: true, bodyText: true, visibility: true, isInternalNote: true,
      sentAt: true, receivedAt: true,
    },
  });
  const items = [];
  for (const row of candidates) {
    const resource: AuthorizationResourceContext = {
      ...(row.resourceId ? { resourceId: row.resourceId } : {}),
      resourceType: "message",
      ownerOrganizationId: row.ownerOrganizationId,
      departmentId: conversation.departmentId,
      ownerMembershipId: conversation.ownerMembershipId,
      visibility: row.visibility as AuthorizationResourceContext["visibility"],
      sensitivity: "PII",
      lifecycleState: row.direction,
      version: 1,
    };
    const readableFields = authorizedReadableFields(
      context, "message.read", resource, requestedFields, "list",
    );
    if (!readableFields) continue;
    items.push(projectR6ReadableFields({
      id: row.id, conversationId: row.conversationId, direction: row.direction,
      bodyText: row.bodyText, visibility: row.visibility,
      isInternalNote: row.isInternalNote,
      sentAt: row.sentAt?.toISOString() ?? null,
      receivedAt: row.receivedAt?.toISOString() ?? null,
    }, readableFields));
    if (items.length >= limit) break;
  }
  return { items };
}

export async function listAuthorizedMeetings(
  context: AuthorizedRequestContext,
  limit: number,
  database: PrismaClient = getPrismaClient(),
) {
  const requestedFields = [
    "id", "resourceId", "title", "meetingType", "startsAt", "endsAt",
    "timezone", "status", "locationUrl", "dealId", "clientAccountId",
    "ownerMembershipId", "rowVersion",
  ] as const;
  const candidates = await database.commsMeeting.findMany({
    where: { ownerOrganizationId: context.tenant.organizationId, archivedAt: null },
    orderBy: [{ startsAt: "asc" }, { id: "asc" }],
    take: Math.min(limit * OVERFETCH_FACTOR, 400),
    select: {
      id: true, resourceId: true, ownerOrganizationId: true, departmentId: true,
      ownerMembershipId: true, visibility: true, sensitivity: true, title: true,
      meetingType: true, startsAt: true, endsAt: true, timezone: true, status: true,
      locationUrl: true, dealId: true, clientAccountId: true, rowVersion: true,
    },
  });
  const items = [];
  for (const row of candidates) {
    const resource = commonResource({
      resourceId: row.resourceId, resourceType: "meeting",
      ownerOrganizationId: row.ownerOrganizationId, departmentId: row.departmentId,
      ownerMembershipId: row.ownerMembershipId, visibility: row.visibility,
      sensitivity: row.sensitivity, lifecycleState: row.status, version: row.rowVersion,
    });
    const readableFields = authorizedReadableFields(
      context, "meeting.view", resource, requestedFields, "list",
    );
    if (!readableFields) continue;
    items.push(projectR6ReadableFields({
      id: row.id, resourceId: row.resourceId, title: row.title,
      meetingType: row.meetingType, startsAt: row.startsAt.toISOString(),
      endsAt: row.endsAt.toISOString(), timezone: row.timezone, status: row.status,
      locationUrl: row.locationUrl, dealId: row.dealId,
      clientAccountId: row.clientAccountId, ownerMembershipId: row.ownerMembershipId,
      rowVersion: row.rowVersion,
    }, readableFields));
    if (items.length >= limit) break;
  }
  return { items };
}

export async function getAuthorizedMeeting(
  context: AuthorizedRequestContext,
  meetingId: string,
  database: PrismaClient = getPrismaClient(),
) {
  const row = await database.commsMeeting.findFirst({
    where: { id: meetingId, ownerOrganizationId: context.tenant.organizationId, archivedAt: null },
    select: {
      id: true, resourceId: true, ownerOrganizationId: true, departmentId: true,
      ownerMembershipId: true, visibility: true, sensitivity: true, title: true,
      meetingType: true, startsAt: true, endsAt: true, timezone: true, status: true,
      locationUrl: true, dealId: true, clientAccountId: true, rowVersion: true,
    },
  });
  if (!row) return undefined;
  const requestedFields = [
    "id", "resourceId", "title", "meetingType", "startsAt", "endsAt", "timezone",
    "status", "locationUrl", "dealId", "clientAccountId", "ownerMembershipId",
    "rowVersion", "rescheduleHistory",
  ] as const;
  const resource = commonResource({
    resourceId: row.resourceId, resourceType: "meeting",
    ownerOrganizationId: row.ownerOrganizationId, departmentId: row.departmentId,
    ownerMembershipId: row.ownerMembershipId, visibility: row.visibility,
    sensitivity: row.sensitivity, lifecycleState: row.status, version: row.rowVersion,
  });
  const readableFields = authorizedReadableFields(
    context, "meeting.view", resource, requestedFields, "view",
  );
  if (!readableFields) return undefined;
  const rescheduleHistory = readableFields.includes("rescheduleHistory")
    ? await database.commsMeetingNote.findMany({
        where: {
          ownerOrganizationId: context.tenant.organizationId,
          meetingId,
          visibility: "INTERNAL",
          body: "Meeting rescheduled",
        },
        orderBy: [{ createdAt: "asc" }, { id: "asc" }],
        select: { id: true, decisions: true, createdAt: true },
      }).then((rows) => rows.map((note) => ({
        id: note.id,
        decisions: note.decisions,
        createdAt: note.createdAt.toISOString(),
      })))
    : undefined;
  return projectR6ReadableFields({
    id: row.id, resourceId: row.resourceId, title: row.title,
    meetingType: row.meetingType, startsAt: row.startsAt.toISOString(),
    endsAt: row.endsAt.toISOString(), timezone: row.timezone, status: row.status,
    locationUrl: row.locationUrl, dealId: row.dealId,
    clientAccountId: row.clientAccountId, ownerMembershipId: row.ownerMembershipId,
    rowVersion: row.rowVersion, rescheduleHistory,
  }, readableFields);
}
