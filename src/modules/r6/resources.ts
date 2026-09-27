import "server-only";

import type { PrismaClient } from "@/generated/prisma/client";
import type { AuthorizedRequestContext } from "@/modules/foundation/request-context";
import type { AuthorizationResourceContext, SensitivityLevel } from "@/modules/authorization/types";
import { getPrismaClient } from "@/modules/persistence/client";

export function buildProspectiveR6Resource(
  context: AuthorizedRequestContext,
  resourceType: string,
  sensitivity: SensitivityLevel,
  lifecycleState: string,
): AuthorizationResourceContext {
  return {
    resourceType,
    ownerOrganizationId: context.tenant.organizationId,
    departmentId: context.authorization.actorDepartmentId ?? null,
    ownerMembershipId: context.membership.membershipId,
    visibility: "INTERNAL",
    sensitivity,
    lifecycleState,
    version: 0,
  };
}

export async function loadR6LeadResource(
  context: AuthorizedRequestContext,
  leadId: string,
  database: PrismaClient = getPrismaClient(),
): Promise<AuthorizationResourceContext | null> {
  const row = await database.crmLead.findFirst({
    where: {
      id: leadId,
      ownerOrganizationId: context.tenant.organizationId,
      archivedAt: null,
    },
    select: {
      resourceId: true,
      ownerOrganizationId: true,
      departmentId: true,
      ownerMembershipId: true,
      visibility: true,
      sensitivity: true,
      lifecycleState: true,
      rowVersion: true,
    },
  });
  if (!row) return null;
  return {
    resourceId: row.resourceId,
    resourceType: "lead",
    ownerOrganizationId: row.ownerOrganizationId,
    departmentId: row.departmentId,
    ownerMembershipId: row.ownerMembershipId,
    visibility: row.visibility as AuthorizationResourceContext["visibility"],
    sensitivity: row.sensitivity as AuthorizationResourceContext["sensitivity"],
    lifecycleState: row.lifecycleState,
    version: row.rowVersion,
  };
}

export async function loadR6LeadListResource(
  context: AuthorizedRequestContext,
  leadListId: string,
  database: PrismaClient = getPrismaClient(),
): Promise<AuthorizationResourceContext | null> {
  const row = await database.crmLeadList.findFirst({
    where: {
      id: leadListId,
      ownerOrganizationId: context.tenant.organizationId,
      archivedAt: null,
    },
    select: {
      resourceId: true,
      ownerOrganizationId: true,
      departmentId: true,
      ownerMembershipId: true,
      visibility: true,
      sensitivity: true,
      rowVersion: true,
    },
  });
  if (!row) return null;
  return {
    resourceId: row.resourceId,
    resourceType: "lead-list",
    ownerOrganizationId: row.ownerOrganizationId,
    departmentId: row.departmentId,
    ownerMembershipId: row.ownerMembershipId,
    visibility: row.visibility as AuthorizationResourceContext["visibility"],
    sensitivity: row.sensitivity as AuthorizationResourceContext["sensitivity"],
    lifecycleState: "ACTIVE",
    version: row.rowVersion,
  };
}

export async function loadR6CampaignResource(
  context: AuthorizedRequestContext,
  campaignId: string,
  database: PrismaClient = getPrismaClient(),
): Promise<AuthorizationResourceContext | null> {
  const row = await database.commsOutreachCampaign.findFirst({
    where: {
      id: campaignId,
      ownerOrganizationId: context.tenant.organizationId,
      archivedAt: null,
    },
    select: {
      resourceId: true,
      ownerOrganizationId: true,
      departmentId: true,
      ownerMembershipId: true,
      visibility: true,
      sensitivity: true,
      status: true,
      rowVersion: true,
    },
  });
  if (!row) return null;
  return {
    resourceId: row.resourceId,
    resourceType: "outreach-campaign",
    ownerOrganizationId: row.ownerOrganizationId,
    departmentId: row.departmentId,
    ownerMembershipId: row.ownerMembershipId,
    visibility: row.visibility as AuthorizationResourceContext["visibility"],
    sensitivity: row.sensitivity as AuthorizationResourceContext["sensitivity"],
    lifecycleState: row.status,
    version: row.rowVersion,
  };
}

export async function loadR6DealResource(
  context: AuthorizedRequestContext,
  dealId: string,
  database: PrismaClient = getPrismaClient(),
): Promise<AuthorizationResourceContext | null> {
  const row = await database.commercialDeal.findFirst({
    where: {
      id: dealId,
      ownerOrganizationId: context.tenant.organizationId,
      archivedAt: null,
    },
    select: {
      resourceId: true,
      ownerOrganizationId: true,
      departmentId: true,
      ownerMembershipId: true,
      visibility: true,
      sensitivity: true,
      rowVersion: true,
    },
  });
  if (!row) return null;
  return {
    resourceId: row.resourceId,
    resourceType: "deal",
    ownerOrganizationId: row.ownerOrganizationId,
    departmentId: row.departmentId,
    ownerMembershipId: row.ownerMembershipId,
    visibility: row.visibility as AuthorizationResourceContext["visibility"],
    sensitivity: row.sensitivity as AuthorizationResourceContext["sensitivity"],
    lifecycleState: "ACTIVE",
    version: row.rowVersion,
  };
}
