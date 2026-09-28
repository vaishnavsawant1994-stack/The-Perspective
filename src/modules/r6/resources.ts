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


export async function loadR6CompanyResource(
  context: AuthorizedRequestContext,
  companyId: string,
  database: PrismaClient = getPrismaClient(),
): Promise<AuthorizationResourceContext | null> {
  const row = await database.crmCompany.findFirst({
    where: {
      id: companyId,
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
    resourceType: "company",
    ownerOrganizationId: row.ownerOrganizationId,
    departmentId: row.departmentId,
    ownerMembershipId: row.ownerMembershipId,
    visibility: row.visibility as AuthorizationResourceContext["visibility"],
    sensitivity: row.sensitivity as AuthorizationResourceContext["sensitivity"],
    lifecycleState: "ACTIVE",
    version: row.rowVersion,
  };
}

export async function loadR6ContactResource(
  context: AuthorizedRequestContext,
  contactId: string,
  database: PrismaClient = getPrismaClient(),
): Promise<AuthorizationResourceContext | null> {
  const row = await database.crmContact.findFirst({
    where: {
      id: contactId,
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
    resourceType: "contact",
    ownerOrganizationId: row.ownerOrganizationId,
    departmentId: row.departmentId,
    ownerMembershipId: row.ownerMembershipId,
    visibility: row.visibility as AuthorizationResourceContext["visibility"],
    sensitivity: row.sensitivity as AuthorizationResourceContext["sensitivity"],
    lifecycleState: "ACTIVE",
    version: row.rowVersion,
  };
}

export async function loadR6StagedRecordResource(
  context: AuthorizedRequestContext,
  stagedRecordId: string,
  database: PrismaClient = getPrismaClient(),
): Promise<AuthorizationResourceContext | null> {
  const row = await database.crmStagedRecord.findFirst({
    where: {
      id: stagedRecordId,
      ownerOrganizationId: context.tenant.organizationId,
    },
    select: {
      ownerOrganizationId: true,
      extractionJobId: true,
      validationState: true,
      rowVersion: true,
    },
  });
  if (!row) return null;

  const job = await database.crmExtractionJob.findFirst({
    where: {
      id: row.extractionJobId,
      ownerOrganizationId: context.tenant.organizationId,
      archivedAt: null,
    },
    select: {
      departmentId: true,
      ownerMembershipId: true,
      visibility: true,
    },
  });
  if (!job) return null;

  return {
    resourceType: "staged-record",
    ownerOrganizationId: row.ownerOrganizationId,
    departmentId: job.departmentId,
    ownerMembershipId: job.ownerMembershipId,
    visibility: job.visibility as AuthorizationResourceContext["visibility"],
    sensitivity: "PII",
    lifecycleState: row.validationState,
    version: row.rowVersion,
  };
}

export async function loadR6EnrichmentFactResource(
  context: AuthorizedRequestContext,
  enrichmentFactId: string,
  database: PrismaClient = getPrismaClient(),
): Promise<AuthorizationResourceContext | null> {
  const row = await database.crmEnrichmentFact.findFirst({
    where: {
      id: enrichmentFactId,
      ownerOrganizationId: context.tenant.organizationId,
    },
    select: {
      ownerOrganizationId: true,
      jobId: true,
      acceptedAt: true,
      rejectedAt: true,
      rowVersion: true,
    },
  });
  if (!row) return null;

  const job = await database.crmEnrichmentJob.findFirst({
    where: {
      id: row.jobId,
      ownerOrganizationId: context.tenant.organizationId,
      archivedAt: null,
    },
    select: {
      departmentId: true,
      ownerMembershipId: true,
      visibility: true,
    },
  });
  if (!job) return null;

  return {
    resourceType: "enrichment-fact",
    ownerOrganizationId: row.ownerOrganizationId,
    departmentId: job.departmentId,
    ownerMembershipId: job.ownerMembershipId,
    visibility: job.visibility as AuthorizationResourceContext["visibility"],
    sensitivity: "PII",
    lifecycleState: row.acceptedAt
      ? "ACCEPTED"
      : row.rejectedAt
        ? "REJECTED"
        : "PENDING",
    version: row.rowVersion,
  };
}


export async function loadR6SendingAccountResource(
  context: AuthorizedRequestContext,
  sendingAccountId: string,
  database: PrismaClient = getPrismaClient(),
): Promise<AuthorizationResourceContext | null> {
  const row = await database.commsSendingAccount.findFirst({
    where: {
      id: sendingAccountId,
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
      syncState: true,
      rowVersion: true,
    },
  });
  if (!row) return null;
  return {
    resourceId: row.resourceId,
    resourceType: "sending-account",
    ownerOrganizationId: row.ownerOrganizationId,
    departmentId: row.departmentId,
    ownerMembershipId: row.ownerMembershipId,
    visibility: row.visibility as AuthorizationResourceContext["visibility"],
    sensitivity: row.sensitivity as AuthorizationResourceContext["sensitivity"],
    lifecycleState: row.syncState,
    version: row.rowVersion,
  };
}

export async function loadR6SequenceResource(
  context: AuthorizedRequestContext,
  sequenceId: string,
  database: PrismaClient = getPrismaClient(),
): Promise<AuthorizationResourceContext | null> {
  const row = await database.commsSequence.findFirst({
    where: {
      id: sequenceId,
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
    resourceType: "sequence",
    ownerOrganizationId: row.ownerOrganizationId,
    departmentId: row.departmentId,
    ownerMembershipId: row.ownerMembershipId,
    visibility: row.visibility as AuthorizationResourceContext["visibility"],
    sensitivity: row.sensitivity as AuthorizationResourceContext["sensitivity"],
    lifecycleState: row.status,
    version: row.rowVersion,
  };
}

export async function loadR6ConversationResource(
  context: AuthorizedRequestContext,
  conversationId: string,
  database: PrismaClient = getPrismaClient(),
): Promise<AuthorizationResourceContext | null> {
  const row = await database.commsConversation.findFirst({
    where: {
      id: conversationId,
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
    resourceType: "conversation",
    ownerOrganizationId: row.ownerOrganizationId,
    departmentId: row.departmentId,
    ownerMembershipId: row.ownerMembershipId,
    visibility: row.visibility as AuthorizationResourceContext["visibility"],
    sensitivity: row.sensitivity as AuthorizationResourceContext["sensitivity"],
    lifecycleState: row.status,
    version: row.rowVersion,
  };
}

export async function loadR6MeetingResource(
  context: AuthorizedRequestContext,
  meetingId: string,
  database: PrismaClient = getPrismaClient(),
): Promise<AuthorizationResourceContext | null> {
  const row = await database.commsMeeting.findFirst({
    where: {
      id: meetingId,
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
    resourceType: "meeting",
    ownerOrganizationId: row.ownerOrganizationId,
    departmentId: row.departmentId,
    ownerMembershipId: row.ownerMembershipId,
    visibility: row.visibility as AuthorizationResourceContext["visibility"],
    sensitivity: row.sensitivity as AuthorizationResourceContext["sensitivity"],
    lifecycleState: row.status,
    version: row.rowVersion,
  };
}

export async function loadR6DealPipelineResource(context:AuthorizedRequestContext,pipelineId:string,database:PrismaClient=getPrismaClient()):Promise<AuthorizationResourceContext|null>{const row=await database.commercialDealPipeline.findFirst({where:{id:pipelineId,ownerOrganizationId:context.tenant.organizationId,archivedAt:null},select:{resourceId:true,ownerOrganizationId:true,departmentId:true,ownerMembershipId:true,visibility:true,sensitivity:true,active:true,rowVersion:true}});return row?{resourceId:row.resourceId,resourceType:"deal-pipeline",ownerOrganizationId:row.ownerOrganizationId,departmentId:row.departmentId,ownerMembershipId:row.ownerMembershipId,visibility:row.visibility as AuthorizationResourceContext["visibility"],sensitivity:row.sensitivity as AuthorizationResourceContext["sensitivity"],lifecycleState:row.active?"ACTIVE":"INACTIVE",version:row.rowVersion}:null}
export async function loadR6ClientAccountResource(context:AuthorizedRequestContext,clientAccountId:string,database:PrismaClient=getPrismaClient()):Promise<AuthorizationResourceContext|null>{const row=await database.commercialClientAccount.findFirst({where:{id:clientAccountId,ownerOrganizationId:context.tenant.organizationId,archivedAt:null},select:{resourceId:true,ownerOrganizationId:true,departmentId:true,ownerMembershipId:true,visibility:true,sensitivity:true,rowVersion:true}});return row?{resourceId:row.resourceId,resourceType:"client-account",ownerOrganizationId:row.ownerOrganizationId,departmentId:row.departmentId,ownerMembershipId:row.ownerMembershipId,visibility:row.visibility as AuthorizationResourceContext["visibility"],sensitivity:row.sensitivity as AuthorizationResourceContext["sensitivity"],lifecycleState:"ACTIVE",version:row.rowVersion}:null}
