import "server-only";

import { Prisma, type PrismaClient } from "@/generated/prisma/client";
import type {
  AuthorizedRequestContext,
  TenantScopedRequestContext,
} from "@/modules/foundation/request-context";
import { getPrismaClient } from "@/modules/persistence/client";

import { canTransitionLeadLifecycle } from "./lifecycle";
import {
  CrmTenantBoundaryError,
  newCrmId,
  registerCrmResource,
  type CrmTransaction,
  withCrmTenantTransaction,
} from "./persistence";
import type {
  AddLeadListMemberInput,
  CreateCompanyInput,
  CreateContactInput,
  CreateDuplicateCandidateInput,
  CreateExtractionJobInput,
  CreateLeadInput,
  CreateLeadListInput,
  CreateLeadSourceInput,
  CreateSuppressionEntryInput,
  CrmCoreErrorCode,
  CrmCoreResult,
  LeadLifecycleState,
  RecordEnrichmentFactInput,
  RecordLeadScoreInput,
  RecordQualificationInput,
  RemoveLeadListMemberInput,
  RequestEnrichmentInput,
  StageExtractedRecordInput,
  SuppressLeadInput,
  TransitionLeadLifecycleInput,
} from "./types";

type CrmContext = TenantScopedRequestContext | AuthorizedRequestContext;

class CrmCommandError extends Error {
  constructor(readonly code: CrmCoreErrorCode) {
    super(code);
  }
}

function ok<T>(value: T): CrmCoreResult<T> {
  return { kind: "ok", value };
}

function error(code: CrmCoreErrorCode): CrmCoreResult<never> {
  return { kind: "error", code };
}

function databaseCode(value: unknown) {
  if (!value || typeof value !== "object") return undefined;

  const direct = "code" in value
    ? String((value as { code?: unknown }).code ?? "")
    : "";
  const nested = (
    value as {
      meta?: {
        driverAdapterError?: {
          cause?: { originalCode?: unknown };
        };
      };
    }
  ).meta?.driverAdapterError?.cause?.originalCode;

  return nested ? String(nested) : direct || undefined;
}

function mapKnownFailure(value: unknown): CrmCoreResult<never> | undefined {
  if (value instanceof CrmCommandError) return error(value.code);
  if (value instanceof CrmTenantBoundaryError) return error("TEAM_REQUIRED");

  switch (databaseCode(value)) {
    case "P2002":
    case "P2034":
    case "23505":
    case "40001":
    case "40P01":
      return error("CONFLICT");
    case "P2025":
      return error("NOT_FOUND");
    case "P2003":
    case "P2004":
    case "P2007":
    case "23503":
    case "23514":
    case "22023":
    case "22P02":
      return error("INVALID");
    default:
      return undefined;
  }
}

function json(value: unknown): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}

async function run<T>(
  context: CrmContext,
  operation: (transaction: CrmTransaction) => Promise<T>,
  database: PrismaClient,
): Promise<CrmCoreResult<T>> {
  try {
    return ok(await withCrmTenantTransaction(context, operation, database));
  } catch (cause) {
    const known = mapKnownFailure(cause);
    if (known) return known;
    throw cause;
  }
}

function owner(context: CrmContext) {
  return {
    ownerOrganizationId: context.tenant.organizationId,
    ownerMembershipId: context.membership.membershipId,
    createdByMembershipId: context.membership.membershipId,
    updatedByMembershipId: context.membership.membershipId,
  };
}

export async function createLeadSource(
  context: CrmContext,
  input: CreateLeadSourceInput,
  database: PrismaClient = getPrismaClient(),
) {
  return run(
    context,
    async (transaction) => {
      const id = newCrmId();
      const resourceId = newCrmId();
      const name = input.name.trim();
      if (!name || !input.sourceType.trim()) throw new CrmCommandError("INVALID");

      await registerCrmResource(transaction, {
        id: resourceId,
        type: "lead-source",
        title: name,
        sensitivity: "CONFIDENTIAL",
      });

      return transaction.crmLeadSource.create({
        data: {
          id,
          resourceId,
          ...owner(context),
          visibility: "INTERNAL",
          sensitivity: "CONFIDENTIAL",
          sourceType: input.sourceType.trim(),
          name,
          baseUrl: input.baseUrl?.trim() || null,
          complianceNotes: input.complianceNotes?.trim() || null,
          configuration: json(input.configuration ?? {}),
          health: "UNKNOWN",
        },
        select: { id: true, resourceId: true, rowVersion: true },
      });
    },
    database,
  );
}

export async function createCompany(
  context: CrmContext,
  input: CreateCompanyInput,
  database: PrismaClient = getPrismaClient(),
) {
  return run(
    context,
    async (transaction) => {
      const id = newCrmId();
      const resourceId = newCrmId();
      const name = input.name.trim();
      if (!name) throw new CrmCommandError("INVALID");

      await registerCrmResource(transaction, {
        id: resourceId,
        type: "company",
        title: name,
        sensitivity: "STANDARD",
      });

      return transaction.crmCompany.create({
        data: {
          id,
          resourceId,
          ...owner(context),
          visibility: "INTERNAL",
          sensitivity: "STANDARD",
          name,
          legalName: input.legalName?.trim() || null,
          domain: input.domain?.trim().toLowerCase() || null,
          website: input.website?.trim() || null,
          industry: input.industry?.trim() || null,
          sizeBand: input.sizeBand?.trim() || null,
          revenueBand: input.revenueBand?.trim() || null,
          country: input.country?.trim() || null,
        },
        select: { id: true, resourceId: true, rowVersion: true },
      });
    },
    database,
  );
}

export async function createContact(
  context: CrmContext,
  input: CreateContactInput,
  database: PrismaClient = getPrismaClient(),
) {
  return run(
    context,
    async (transaction) => {
      const id = newCrmId();
      const resourceId = newCrmId();

      await registerCrmResource(transaction, {
        id: resourceId,
        type: "contact",
        title: input.title?.trim() || input.emailOriginal?.trim() || "Contact",
        sensitivity: "PII",
      });

      return transaction.crmContact.create({
        data: {
          id,
          resourceId,
          ...owner(context),
          visibility: "INTERNAL",
          sensitivity: "PII",
          companyId: input.companyId ?? null,
          personId: input.personId ?? null,
          title: input.title?.trim() || null,
          relationshipState: input.relationshipState?.trim() || null,
          preferredChannel: input.preferredChannel?.trim() || null,
          emailOriginal: input.emailOriginal?.trim() || null,
          emailNormalized: input.emailNormalized?.trim().toLowerCase() || null,
          phoneNormalized: input.phoneNormalized?.trim() || null,
        },
        select: { id: true, resourceId: true, rowVersion: true },
      });
    },
    database,
  );
}

export async function createLead(
  context: CrmContext,
  input: CreateLeadInput,
  database: PrismaClient = getPrismaClient(),
) {
  return run(
    context,
    async (transaction) => {
      const id = newCrmId();
      const resourceId = newCrmId();

      await registerCrmResource(transaction, {
        id: resourceId,
        type: "lead",
        title: "Lead",
        sensitivity: "CONFIDENTIAL",
      });

      return transaction.crmLead.create({
        data: {
          id,
          resourceId,
          ...owner(context),
          visibility: "INTERNAL",
          sensitivity: "CONFIDENTIAL",
          companyId: input.companyId ?? null,
          contactId: input.contactId ?? null,
          leadSourceId: input.leadSourceId ?? null,
          sourceRecordKey: input.sourceRecordKey?.trim() || null,
          lifecycleState: "NEW",
        },
        select: {
          id: true,
          resourceId: true,
          lifecycleState: true,
          rowVersion: true,
        },
      });
    },
    database,
  );
}

export async function createExtractionJob(
  context: CrmContext,
  input: CreateExtractionJobInput,
  database: PrismaClient = getPrismaClient(),
) {
  return run(
    context,
    async (transaction) => {
      const id = newCrmId();
      const resourceId = newCrmId();

      await registerCrmResource(transaction, {
        id: resourceId,
        type: "extraction-job",
        title: "Extraction job",
        sensitivity: "CONFIDENTIAL",
      });

      return transaction.crmExtractionJob.create({
        data: {
          id,
          resourceId,
          ...owner(context),
          visibility: "INTERNAL",
          sensitivity: "CONFIDENTIAL",
          leadSourceId: input.leadSourceId,
          querySnapshot: json(input.querySnapshot),
          requestHash: input.requestHash?.trim() || null,
          requestedCount: input.requestedCount ?? 0,
          status: "QUEUED",
        },
        select: { id: true, resourceId: true, status: true, rowVersion: true },
      });
    },
    database,
  );
}

export async function stageExtractedRecord(
  context: CrmContext,
  input: StageExtractedRecordInput,
  database: PrismaClient = getPrismaClient(),
) {
  if (!input.sourceRecordKey.trim()) {
    return error("INVALID");
  }

  return run(
    context,
    (transaction) =>
      transaction.crmStagedRecord.create({
        data: {
          id: newCrmId(),
          ownerOrganizationId: context.tenant.organizationId,
          extractionJobId: input.extractionJobId,
          sourceRecordKey: input.sourceRecordKey.trim(),
          rawPayload: json(input.rawPayload),
          normalizedPayload: json(input.normalizedPayload),
          provenanceUrl: input.provenanceUrl?.trim() || null,
          confidence: input.confidence ?? null,
          validationState: "PENDING",
        },
        select: { id: true, validationState: true, rowVersion: true },
      }),
    database,
  );
}

export async function requestEnrichment(
  context: CrmContext,
  input: RequestEnrichmentInput,
  database: PrismaClient = getPrismaClient(),
) {
  if (
    !input.provider.trim() ||
    !input.requestHash.trim() ||
    input.requestedFields.length === 0 ||
    input.requestedFields.some((field) => !field.trim())
  ) {
    return error("INVALID");
  }

  return run(
    context,
    async (transaction) => {
      const id = newCrmId();
      const resourceId = newCrmId();

      await registerCrmResource(transaction, {
        id: resourceId,
        type: "enrichment-job",
        title: "Enrichment job",
        sensitivity: "CONFIDENTIAL",
      });

      return transaction.crmEnrichmentJob.create({
        data: {
          id,
          resourceId,
          ...owner(context),
          visibility: "INTERNAL",
          sensitivity: "CONFIDENTIAL",
          targetResourceId: input.targetResourceId,
          provider: input.provider.trim(),
          requestedFields: json(input.requestedFields),
          requestHash: input.requestHash.trim(),
          status: "QUEUED",
        },
        select: { id: true, resourceId: true, status: true, rowVersion: true },
      });
    },
    database,
  );
}

export async function recordEnrichmentFact(
  context: CrmContext,
  input: RecordEnrichmentFactInput,
  database: PrismaClient = getPrismaClient(),
) {
  return run(
    context,
    (transaction) =>
      transaction.crmEnrichmentFact.create({
        data: {
          id: newCrmId(),
          ownerOrganizationId: context.tenant.organizationId,
          jobId: input.jobId,
          targetResourceId: input.targetResourceId,
          fieldKey: input.fieldKey.trim(),
          typedValue: json(input.typedValue),
          sourceUrl: input.sourceUrl?.trim() || null,
          confidence: input.confidence ?? null,
          observedAt: input.observedAt,
        },
        select: { id: true, rowVersion: true },
      }),
    database,
  );
}

export async function createLeadList(
  context: CrmContext,
  input: CreateLeadListInput,
  database: PrismaClient = getPrismaClient(),
) {
  return run(
    context,
    async (transaction) => {
      const id = newCrmId();
      const resourceId = newCrmId();
      const name = input.name.trim();
      if (!name) throw new CrmCommandError("INVALID");

      await registerCrmResource(transaction, {
        id: resourceId,
        type: "lead-list",
        title: name,
        sensitivity: "CONFIDENTIAL",
      });

      return transaction.crmLeadList.create({
        data: {
          id,
          resourceId,
          ...owner(context),
          visibility: "INTERNAL",
          sensitivity: "CONFIDENTIAL",
          name,
          listType: input.listType ?? "STATIC",
          filterDefinition: json(input.filterDefinition ?? {}),
          memberCount: 0,
        },
        select: { id: true, resourceId: true, memberCount: true, rowVersion: true },
      });
    },
    database,
  );
}

async function refreshLeadListCount(
  transaction: CrmTransaction,
  context: CrmContext,
  leadListId: string,
) {
  const memberCount = await transaction.crmLeadListMember.count({
    where: {
      ownerOrganizationId: context.tenant.organizationId,
      leadListId,
      removedAt: null,
    },
  });

  const updated = await transaction.crmLeadList.updateMany({
    where: {
      id: leadListId,
      ownerOrganizationId: context.tenant.organizationId,
    },
    data: {
      memberCount,
      rowVersion: { increment: 1 },
      updatedByMembershipId: context.membership.membershipId,
    },
  });

  if (updated.count !== 1) throw new CrmCommandError("NOT_FOUND");
  return memberCount;
}

export async function addLeadListMember(
  context: CrmContext,
  input: AddLeadListMemberInput,
  database: PrismaClient = getPrismaClient(),
) {
  return run(
    context,
    async (transaction) => {
      await transaction.crmLeadListMember.upsert({
        where: {
          leadListId_leadId: {
            leadListId: input.leadListId,
            leadId: input.leadId,
          },
        },
        create: {
          ownerOrganizationId: context.tenant.organizationId,
          leadListId: input.leadListId,
          leadId: input.leadId,
          addedByMembershipId: context.membership.membershipId,
        },
        update: {
          ownerOrganizationId: context.tenant.organizationId,
          addedAt: new Date(),
          addedByMembershipId: context.membership.membershipId,
          removedAt: null,
          removedByMembershipId: null,
        },
      });

      return {
        leadListId: input.leadListId,
        leadId: input.leadId,
        memberCount: await refreshLeadListCount(transaction, context, input.leadListId),
      };
    },
    database,
  );
}

export async function removeLeadListMember(
  context: CrmContext,
  input: RemoveLeadListMemberInput,
  database: PrismaClient = getPrismaClient(),
) {
  return run(
    context,
    async (transaction) => {
      const updated = await transaction.crmLeadListMember.updateMany({
        where: {
          ownerOrganizationId: context.tenant.organizationId,
          leadListId: input.leadListId,
          leadId: input.leadId,
          removedAt: null,
        },
        data: {
          removedAt: new Date(),
          removedByMembershipId: context.membership.membershipId,
        },
      });

      if (updated.count !== 1) throw new CrmCommandError("NOT_FOUND");

      return {
        leadListId: input.leadListId,
        leadId: input.leadId,
        memberCount: await refreshLeadListCount(transaction, context, input.leadListId),
      };
    },
    database,
  );
}

export async function recordLeadScore(
  context: CrmContext,
  input: RecordLeadScoreInput,
  database: PrismaClient = getPrismaClient(),
) {
  return run(
    context,
    (transaction) =>
      transaction.crmLeadScore.create({
        data: {
          id: newCrmId(),
          ownerOrganizationId: context.tenant.organizationId,
          leadId: input.leadId,
          modelVersion: input.modelVersion.trim(),
          score: input.score,
          components: json(input.components ?? {}),
          calculatedAt: input.calculatedAt ?? new Date(),
        },
        select: { id: true, score: true, calculatedAt: true },
      }),
    database,
  );
}

export async function transitionLeadLifecycle(
  context: CrmContext,
  input: TransitionLeadLifecycleInput,
  database: PrismaClient = getPrismaClient(),
) {
  return run(
    context,
    async (transaction) => {
      const lead = await transaction.crmLead.findFirst({
        where: {
          id: input.leadId,
          ownerOrganizationId: context.tenant.organizationId,
          archivedAt: null,
        },
        select: { lifecycleState: true, rowVersion: true },
      });

      if (!lead) throw new CrmCommandError("NOT_FOUND");
      if (lead.rowVersion !== input.expectedRowVersion) {
        throw new CrmCommandError("STALE_WRITE");
      }

      const from = lead.lifecycleState as LeadLifecycleState;
      if (!canTransitionLeadLifecycle(from, input.to)) {
        throw new CrmCommandError("TRANSITION_DENIED");
      }

      const now = new Date();
      const updated = await transaction.crmLead.updateMany({
        where: {
          id: input.leadId,
          ownerOrganizationId: context.tenant.organizationId,
          rowVersion: input.expectedRowVersion,
        },
        data: {
          lifecycleState: input.to,
          rowVersion: { increment: 1 },
          lastActivityAt: now,
          updatedByMembershipId: context.membership.membershipId,
        },
      });

      if (updated.count !== 1) throw new CrmCommandError("STALE_WRITE");

      await transaction.crmLeadStatusHistory.create({
        data: {
          id: newCrmId(),
          ownerOrganizationId: context.tenant.organizationId,
          leadId: input.leadId,
          fromState: from,
          toState: input.to,
          actorMembershipId: context.membership.membershipId,
          reason: input.reason?.trim() || null,
          requestId: context.requestId,
          occurredAt: now,
        },
      });

      return {
        leadId: input.leadId,
        from,
        to: input.to,
        rowVersion: input.expectedRowVersion + 1,
      };
    },
    database,
  );
}

export async function recordQualification(
  context: CrmContext,
  input: RecordQualificationInput,
  database: PrismaClient = getPrismaClient(),
) {
  if (Boolean(input.leadId) === Boolean(input.dealId)) return error("INVALID");

  return run(
    context,
    async (transaction) => {
      const id = newCrmId();
      const resourceId = newCrmId();

      await registerCrmResource(transaction, {
        id: resourceId,
        type: "qualification",
        title: "Qualification",
        sensitivity: "CONFIDENTIAL",
      });

      return transaction.crmQualification.create({
        data: {
          id,
          resourceId,
          ...owner(context),
          visibility: "INTERNAL",
          sensitivity: "CONFIDENTIAL",
          leadId: input.leadId ?? null,
          dealId: input.dealId ?? null,
          criteriaVersion: input.criteriaVersion.trim(),
          answers: json(input.answers),
          score: input.score ?? null,
          disposition: input.disposition.trim(),
          reviewerMembershipId: context.membership.membershipId,
          reviewedAt: new Date(),
        },
        select: { id: true, resourceId: true, rowVersion: true },
      });
    },
    database,
  );
}

export async function createDuplicateCandidate(
  context: CrmContext,
  input: CreateDuplicateCandidateInput,
  database: PrismaClient = getPrismaClient(),
) {
  return run(
    context,
    async (transaction) => {
      const id = newCrmId();
      const resourceId = newCrmId();

      await registerCrmResource(transaction, {
        id: resourceId,
        type: "duplicate-candidate",
        title: "Duplicate candidate",
        sensitivity: "CONFIDENTIAL",
      });

      return transaction.crmDuplicateCandidate.create({
        data: {
          id,
          resourceId,
          ...owner(context),
          visibility: "INTERNAL",
          sensitivity: "CONFIDENTIAL",
          entityType: input.entityType.trim(),
          leftResourceId: input.leftResourceId,
          rightResourceId: input.rightResourceId,
          confidence: input.confidence ?? null,
          reasons: json(input.reasons ?? []),
          status: "PENDING",
        },
        select: { id: true, resourceId: true, status: true, rowVersion: true },
      });
    },
    database,
  );
}

export async function createSuppressionEntry(
  context: CrmContext,
  input: CreateSuppressionEntryInput,
  database: PrismaClient = getPrismaClient(),
) {
  if (
    !input.channel.trim() ||
    !input.normalizedDestinationHash.trim() ||
    !input.reason.trim() ||
    !input.source.trim()
  ) {
    return error("INVALID");
  }

  return run(
    context,
    async (transaction) => {
      const id = newCrmId();
      const resourceId = newCrmId();

      await registerCrmResource(transaction, {
        id: resourceId,
        type: "suppression-entry",
        title: "Suppression " + input.channel.trim(),
        sensitivity: "PII",
      });

      return transaction.crmSuppressionEntry.create({
        data: {
          id,
          resourceId,
          ...owner(context),
          visibility: "INTERNAL",
          sensitivity: "PII",
          channel: input.channel.trim(),
          normalizedDestinationHash: input.normalizedDestinationHash.trim(),
          reason: input.reason.trim(),
          source: input.source.trim(),
          effectiveAt: input.effectiveAt ?? new Date(),
          expiresAt: input.expiresAt ?? null,
        },
        select: { id: true, resourceId: true, rowVersion: true },
      });
    },
    database,
  );
}

export async function suppressLead(
  context: CrmContext,
  input: SuppressLeadInput,
  database: PrismaClient = getPrismaClient(),
) {
  if (
    !input.channel.trim() ||
    !input.normalizedDestinationHash.trim() ||
    !input.reason.trim() ||
    !input.source.trim()
  ) {
    return error("INVALID");
  }

  return run(
    context,
    async (transaction) => {
      const lead = await transaction.crmLead.findFirst({
        where: {
          id: input.leadId,
          ownerOrganizationId: context.tenant.organizationId,
          archivedAt: null,
        },
        select: { lifecycleState: true, rowVersion: true },
      });

      if (!lead) throw new CrmCommandError("NOT_FOUND");
      if (lead.rowVersion !== input.expectedRowVersion) {
        throw new CrmCommandError("STALE_WRITE");
      }

      const from = lead.lifecycleState as LeadLifecycleState;
      if (!canTransitionLeadLifecycle(from, "DO_NOT_CONTACT")) {
        throw new CrmCommandError("TRANSITION_DENIED");
      }

      const suppressionId = newCrmId();
      const suppressionResourceId = newCrmId();

      await registerCrmResource(transaction, {
        id: suppressionResourceId,
        type: "suppression-entry",
        title: "Suppression " + input.channel.trim(),
        sensitivity: "PII",
      });

      const now = new Date();
      await transaction.crmSuppressionEntry.create({
        data: {
          id: suppressionId,
          resourceId: suppressionResourceId,
          ...owner(context),
          visibility: "INTERNAL",
          sensitivity: "PII",
          channel: input.channel.trim(),
          normalizedDestinationHash: input.normalizedDestinationHash.trim(),
          reason: input.reason.trim(),
          source: input.source.trim(),
          effectiveAt: input.effectiveAt ?? now,
          expiresAt: input.expiresAt ?? null,
        },
      });

      const updated = await transaction.crmLead.updateMany({
        where: {
          id: input.leadId,
          ownerOrganizationId: context.tenant.organizationId,
          rowVersion: input.expectedRowVersion,
        },
        data: {
          lifecycleState: "DO_NOT_CONTACT",
          rowVersion: { increment: 1 },
          lastActivityAt: now,
          updatedByMembershipId: context.membership.membershipId,
        },
      });

      if (updated.count !== 1) throw new CrmCommandError("STALE_WRITE");

      await transaction.crmLeadStatusHistory.create({
        data: {
          id: newCrmId(),
          ownerOrganizationId: context.tenant.organizationId,
          leadId: input.leadId,
          fromState: from,
          toState: "DO_NOT_CONTACT",
          actorMembershipId: context.membership.membershipId,
          reason: input.reason.trim(),
          requestId: context.requestId,
          occurredAt: now,
        },
      });

      return {
        leadId: input.leadId,
        suppressionId,
        from,
        to: "DO_NOT_CONTACT" as const,
        rowVersion: input.expectedRowVersion + 1,
      };
    },
    database,
  );
}
