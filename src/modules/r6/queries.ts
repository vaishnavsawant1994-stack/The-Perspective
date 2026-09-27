import "server-only";

import type { PrismaClient } from "@/generated/prisma/client";
import type { AuthorizedRequestContext } from "@/modules/foundation/request-context";
import { evaluateAuthorization } from "@/modules/authorization/policy";
import type { AuthorizationResourceContext } from "@/modules/authorization/types";
import { getPrismaClient } from "@/modules/persistence/client";

const OVERFETCH_FACTOR = 4;

function allowed(
  context: AuthorizedRequestContext,
  permissionKey: "lead.view" | "campaign.view" | "deal.view" | "client.view",
  resource: AuthorizationResourceContext,
  requestedFields: readonly string[],
) {
  return evaluateAuthorization(context, permissionKey, resource, {
    action: "list",
    requestedFields,
  }).decision === "ALLOW";
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
      updatedAt: true,
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

    if (!allowed(context, "lead.view", resource, requestedFields)) continue;

    items.push({
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
      updatedAt: row.updatedAt.toISOString(),
    });

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
      updatedAt: true,
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

    if (!allowed(context, "campaign.view", resource, requestedFields)) continue;

    items.push({
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
      updatedAt: row.updatedAt.toISOString(),
    });

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
      updatedAt: true,
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

    if (!allowed(context, "deal.view", resource, requestedFields)) continue;

    items.push({
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
      updatedAt: row.updatedAt.toISOString(),
    });

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
      updatedAt: true,
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

    if (!allowed(context, "client.view", resource, requestedFields)) continue;

    items.push({
      id: row.id,
      resourceId: row.resourceId,
      clientOrganizationId: row.clientOrganizationId,
      accountManagerMembershipId: row.accountManagerMembershipId,
      health: row.health,
      onboardingState: row.onboardingState,
      portalState: row.portalState,
      customerSince: row.customerSince?.toISOString().slice(0, 10) ?? null,
      rowVersion: row.rowVersion,
      updatedAt: row.updatedAt.toISOString(),
    });

    if (items.length >= limit) break;
  }

  return { items };
}
