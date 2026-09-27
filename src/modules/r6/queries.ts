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
    | "deal.view"
    | "client.view",
  resource: AuthorizationResourceContext,
  requestedFields: readonly string[],
  action: "list" | "view" | "discover" = "list",
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
