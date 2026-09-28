import "server-only";

import { createHash } from "node:crypto";

import { Prisma, type PrismaClient } from "@/generated/prisma/client";
import { getPrismaClient } from "@/modules/persistence/client";

import {
  canMoveDeal,
  isR6ClientConversionStage,
  isR6DealStageClass,
  isR6LeadToDealConversionState,
  requiresDealMoveReason,
  R6_DEAL_MAIN_PATH,
} from "./lifecycle";
import {
  CommercialTenantBoundaryError,
  newCommercialId,
  registerCommercialResource,
  updateCommercialResource,
  type CommercialContext,
  type CommercialTransaction,
  withCommercialTenantTransaction,
} from "./persistence";
import type {
  AddClientRelationshipInput,
  CommercialErrorCode,
  CommercialResult,
  ConvertDealToClientInput,
  CreateDealInput,
  CreateDealPipelineInput,
  MoveDealInput,
  R6DealStageClass,
  UpdateDealFieldsInput,
} from "./types";

class CommercialCommandError extends Error {
  constructor(readonly code: CommercialErrorCode) {
    super(code);
  }
}

function ok<T>(value: T): CommercialResult<T> {
  return { kind: "ok", value };
}

function error(code: CommercialErrorCode): CommercialResult<never> {
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

function mapKnownFailure(value: unknown): CommercialResult<never> | undefined {
  if (value instanceof CommercialCommandError) return error(value.code);
  if (value instanceof CommercialTenantBoundaryError) return error("TEAM_REQUIRED");

  switch (databaseCode(value)) {
    case "P2002":
    case "P2034":
    case "40001":
    case "23505":
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

async function run<T>(
  context: CommercialContext,
  operation: (transaction: CommercialTransaction) => Promise<T>,
  database: PrismaClient,
): Promise<CommercialResult<T>> {
  try {
    return ok(await withCommercialTenantTransaction(context, operation, database));
  } catch (cause) {
    const known = mapKnownFailure(cause);
    if (known) return known;
    throw cause;
  }
}

function owner(context: CommercialContext) {
  return {
    ownerOrganizationId: context.tenant.organizationId,
    ownerMembershipId: context.membership.membershipId,
    createdByMembershipId: context.membership.membershipId,
    updatedByMembershipId: context.membership.membershipId,
  };
}

function json(value: unknown): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}

function clientConversionRequestHash(input: ConvertDealToClientInput) {
  return createHash("sha256")
    .update(
      JSON.stringify({
        dealId: input.dealId,
        expectedRowVersion: input.expectedRowVersion,
      }),
    )
    .digest("hex");
}

function validateMoney(input: {
  amountMinor?: bigint | null;
  currency?: string | null;
}) {
  const amount = input.amountMinor ?? null;
  const currency = input.currency?.trim().toUpperCase() || null;
  if ((amount === null) !== (currency === null)) {
    throw new CommercialCommandError("INVALID");
  }
  if (amount !== null && amount < BigInt(0)) {
    throw new CommercialCommandError("INVALID");
  }
  if (currency !== null && !/^[A-Z]{3}$/.test(currency)) {
    throw new CommercialCommandError("INVALID");
  }
  return { amount, currency };
}

function validateProbability(value: number | null | undefined) {
  if (value == null) return null;
  if (!Number.isFinite(value) || value < 0 || value > 1) {
    throw new CommercialCommandError("INVALID");
  }
  return value;
}

function validatePipeline(input: CreateDealPipelineInput) {
  const name = input.name.trim();
  if (!name || !Number.isInteger(input.version) || input.version <= 0) {
    throw new CommercialCommandError("INVALID");
  }
  if (input.stages.length < R6_DEAL_MAIN_PATH.length) {
    throw new CommercialCommandError("INVALID");
  }

  const keys = new Set<string>();
  const positions = new Set<number>();
  const classes = new Set<R6DealStageClass>();

  for (const stage of input.stages) {
    const key = stage.key.trim();
    const stageName = stage.name.trim();
    if (
      !key ||
      !stageName ||
      !Number.isInteger(stage.position) ||
      stage.position <= 0 ||
      !isR6DealStageClass(stage.canonicalClass) ||
      keys.has(key) ||
      positions.has(stage.position) ||
      classes.has(stage.canonicalClass)
    ) {
      throw new CommercialCommandError("INVALID");
    }
    validateProbability(stage.probability);
    keys.add(key);
    positions.add(stage.position);
    classes.add(stage.canonicalClass);
  }

  for (const required of R6_DEAL_MAIN_PATH) {
    if (!classes.has(required)) throw new CommercialCommandError("INVALID");
  }

  return name;
}

export async function createDealPipeline(
  context: CommercialContext,
  input: CreateDealPipelineInput,
  database: PrismaClient = getPrismaClient(),
) {
  return run(
    context,
    async (transaction) => {
      const name = validatePipeline(input);
      const id = newCommercialId();
      const resourceId = newCommercialId();

      await registerCommercialResource(transaction, {
        id: resourceId,
        type: "deal-pipeline",
        title: name,
        sensitivity: "CONFIDENTIAL",
      });

      await transaction.commercialDealPipeline.create({
        data: {
          id,
          resourceId,
          ...owner(context),
          visibility: "INTERNAL",
          sensitivity: "CONFIDENTIAL",
          name,
          version: input.version,
          active: true,
        },
      });

      const stages = [];
      for (const stage of [...input.stages].sort((a, b) => a.position - b.position)) {
        stages.push(
          await transaction.commercialDealStage.create({
            data: {
              id: newCommercialId(),
              ownerOrganizationId: context.tenant.organizationId,
              pipelineId: id,
              pipelineVersion: input.version,
              key: stage.key.trim(),
              name: stage.name.trim(),
              position: stage.position,
              canonicalClass: stage.canonicalClass,
              probability: stage.probability ?? null,
              entryRules: json(stage.entryRules ?? {}),
              exitRules: json(stage.exitRules ?? {}),
            },
            select: {
              id: true,
              key: true,
              position: true,
              canonicalClass: true,
            },
          }),
        );
      }

      return { id, resourceId, name, version: input.version, stages };
    },
    database,
  );
}

async function readDealIdentity(
  transaction: CommercialTransaction,
  context: CommercialContext,
  input: CreateDealInput,
) {
  const pipeline = await transaction.commercialDealPipeline.findFirst({
    where: {
      id: input.pipelineId,
      ownerOrganizationId: context.tenant.organizationId,
      active: true,
      archivedAt: null,
    },
    select: { id: true, version: true },
  });
  if (!pipeline) throw new CommercialCommandError("NOT_FOUND");

  const stage = await transaction.commercialDealStage.findFirst({
    where: {
      ownerOrganizationId: context.tenant.organizationId,
      pipelineId: pipeline.id,
      pipelineVersion: pipeline.version,
      canonicalClass: "QUALIFIED",
    },
    select: { id: true, probability: true },
  });
  if (!stage) throw new CommercialCommandError("INVALID");

  let companyId = input.companyId ?? null;
  let contactId = input.primaryContactId ?? null;
  let sourceLead:
    | {
        id: string;
        companyId: string | null;
        contactId: string | null;
        lifecycleState: string;
        rowVersion: number;
      }
    | null = null;

  if (input.sourceLeadId) {
    sourceLead = await transaction.crmLead.findFirst({
      where: {
        id: input.sourceLeadId,
        ownerOrganizationId: context.tenant.organizationId,
        archivedAt: null,
      },
      select: {
        id: true,
        companyId: true,
        contactId: true,
        lifecycleState: true,
        rowVersion: true,
      },
    });
    if (!sourceLead) throw new CommercialCommandError("NOT_FOUND");
    if (!isR6LeadToDealConversionState(sourceLead.lifecycleState)) {
      throw new CommercialCommandError("TRANSITION_DENIED");
    }
    if (companyId && sourceLead.companyId && companyId !== sourceLead.companyId) {
      throw new CommercialCommandError("INVALID");
    }
    if (contactId && sourceLead.contactId && contactId !== sourceLead.contactId) {
      throw new CommercialCommandError("INVALID");
    }
    companyId = companyId ?? sourceLead.companyId;
    contactId = contactId ?? sourceLead.contactId;
  }

  if (!companyId) throw new CommercialCommandError("INVALID");

  const company = await transaction.crmCompany.findFirst({
    where: {
      id: companyId,
      ownerOrganizationId: context.tenant.organizationId,
      archivedAt: null,
    },
    select: { id: true },
  });
  if (!company) throw new CommercialCommandError("NOT_FOUND");

  if (contactId) {
    const contact = await transaction.crmContact.findFirst({
      where: {
        id: contactId,
        ownerOrganizationId: context.tenant.organizationId,
        archivedAt: null,
      },
      select: { id: true, companyId: true },
    });
    if (!contact) throw new CommercialCommandError("NOT_FOUND");
    if (contact.companyId && contact.companyId !== companyId) {
      throw new CommercialCommandError("INVALID");
    }
  }

  return { pipeline, stage, companyId, contactId, sourceLead };
}

async function readExistingConvertedDeal(
  transaction: CommercialTransaction,
  context: CommercialContext,
  input: CreateDealInput,
) {
  if (!input.sourceLeadId) return null;

  const existing = await transaction.commercialDeal.findFirst({
    where: {
      sourceLeadId: input.sourceLeadId,
      ownerOrganizationId: context.tenant.organizationId,
    },
    select: {
      id: true,
      resourceId: true,
      pipelineId: true,
      companyId: true,
      primaryContactId: true,
      sourceLeadId: true,
      stageId: true,
      amountMinor: true,
      currency: true,
      probability: true,
      expectedCloseDate: true,
      rowVersion: true,
    },
  });
  if (!existing) return null;

  const money = validateMoney(input);
  const probability = validateProbability(input.probability);
  const expectedDate = input.expectedCloseDate?.getTime() ?? null;
  const existingDate = existing.expectedCloseDate?.getTime() ?? null;

  if (
    existing.pipelineId !== input.pipelineId ||
    (input.companyId != null && existing.companyId !== input.companyId) ||
    (input.primaryContactId != null &&
      existing.primaryContactId !== input.primaryContactId) ||
    existing.amountMinor !== money.amount ||
    existing.currency !== money.currency ||
    (input.probability != null &&
      (existing.probability == null ||
        Number(existing.probability) !== probability)) ||
    (input.expectedCloseDate != null && existingDate !== expectedDate)
  ) {
    throw new CommercialCommandError("IDEMPOTENCY_CONFLICT");
  }

  return {
    id: existing.id,
    resourceId: existing.resourceId,
    pipelineId: existing.pipelineId,
    companyId: existing.companyId,
    primaryContactId: existing.primaryContactId,
    sourceLeadId: existing.sourceLeadId,
    stageId: existing.stageId,
    rowVersion: existing.rowVersion,
  };
}

async function createDealInTransaction(
  transaction: CommercialTransaction,
  context: CommercialContext,
  input: CreateDealInput,
) {
  const existing = await readExistingConvertedDeal(transaction, context, input);
  if (existing) return existing;

  const money = validateMoney(input);
  const probability = validateProbability(input.probability);
  const identity = await readDealIdentity(transaction, context, input);

  const id = newCommercialId();
  const resourceId = newCommercialId();

  await registerCommercialResource(transaction, {
    id: resourceId,
    type: "deal",
    title: "Deal",
    sensitivity: "FINANCIAL",
  });

  const deal = await transaction.commercialDeal.create({
    data: {
      id,
      resourceId,
      ...owner(context),
      visibility: "INTERNAL",
      sensitivity: "FINANCIAL",
      companyId: identity.companyId,
      primaryContactId: identity.contactId,
      sourceLeadId: input.sourceLeadId ?? null,
      pipelineId: identity.pipeline.id,
      stageId: identity.stage.id,
      amountMinor: money.amount,
      currency: money.currency,
      probability: probability ?? identity.stage.probability,
      expectedCloseDate: input.expectedCloseDate ?? null,
    },
    select: {
      id: true,
      resourceId: true,
      pipelineId: true,
      companyId: true,
      primaryContactId: true,
      sourceLeadId: true,
      stageId: true,
      rowVersion: true,
    },
  });

  await transaction.commercialDealStageHistory.create({
    data: {
      id: newCommercialId(),
      ownerOrganizationId: context.tenant.organizationId,
      dealId: deal.id,
      fromStageId: null,
      toStageId: identity.stage.id,
      actorMembershipId: context.membership.membershipId,
      reason: "DEAL_CREATED",
      dealVersion: 1,
      occurredAt: new Date(),
    },
  });

  if (identity.sourceLead) {
    const updated = await transaction.crmLead.updateMany({
      where: {
        id: identity.sourceLead.id,
        ownerOrganizationId: context.tenant.organizationId,
        rowVersion: identity.sourceLead.rowVersion,
        convertedDealId: null,
      },
      data: {
        lifecycleState: "CONVERTED",
        convertedDealId: deal.id,
        rowVersion: { increment: 1 },
        lastActivityAt: new Date(),
        updatedByMembershipId: context.membership.membershipId,
      },
    });
    if (updated.count !== 1) throw new CommercialCommandError("STALE_WRITE");

    await transaction.crmLeadStatusHistory.create({
      data: {
        id: newCommercialId(),
        ownerOrganizationId: context.tenant.organizationId,
        leadId: identity.sourceLead.id,
        fromState: identity.sourceLead.lifecycleState,
        toState: "CONVERTED",
        actorMembershipId: context.membership.membershipId,
        reason: "DEAL_CREATED",
        requestId: context.requestId,
        occurredAt: new Date(),
      },
    });
  }

  return deal;
}

export async function createDeal(
  context: CommercialContext,
  input: CreateDealInput,
  database: PrismaClient = getPrismaClient(),
): Promise<CommercialResult<Awaited<ReturnType<typeof createDealInTransaction>>>> {
  const first = await run(
    context,
    (transaction) => createDealInTransaction(transaction, context, input),
    database,
  );
  if (
    first.kind === "error" &&
    first.code === "CONFLICT" &&
    input.sourceLeadId
  ) {
    return run(
      context,
      async (transaction) => {
        const existing = await readExistingConvertedDeal(
          transaction,
          context,
          input,
        );
        if (!existing) throw new CommercialCommandError("CONFLICT");
        return existing;
      },
      database,
    );
  }
  return first;
}

export async function updateDealFields(
  context: CommercialContext,
  input: UpdateDealFieldsInput,
  database: PrismaClient = getPrismaClient(),
) {
  return run(
    context,
    async (transaction) => {
      const money = validateMoney(input);
      const probability = validateProbability(input.probability);
      const row = await transaction.commercialDeal.findFirst({
        where: {
          id: input.dealId,
          ownerOrganizationId: context.tenant.organizationId,
          archivedAt: null,
        },
        select: { rowVersion: true },
      });
      if (!row) throw new CommercialCommandError("NOT_FOUND");
      if (row.rowVersion !== input.expectedRowVersion) {
        throw new CommercialCommandError("STALE_WRITE");
      }

      const updated = await transaction.commercialDeal.updateMany({
        where: {
          id: input.dealId,
          ownerOrganizationId: context.tenant.organizationId,
          rowVersion: input.expectedRowVersion,
        },
        data: {
          amountMinor: money.amount,
          currency: money.currency,
          probability,
          expectedCloseDate: input.expectedCloseDate ?? null,
          rowVersion: { increment: 1 },
          updatedByMembershipId: context.membership.membershipId,
        },
      });
      if (updated.count !== 1) throw new CommercialCommandError("STALE_WRITE");

      return {
        dealId: input.dealId,
        rowVersion: input.expectedRowVersion + 1,
      };
    },
    database,
  );
}

async function assertDealEntryGuard(
  transaction: CommercialTransaction,
  context: CommercialContext,
  deal: {
    id: string;
    sourceLeadId: string | null;
    primaryContactId: string | null;
    amountMinor: bigint | null;
    currency: string | null;
  },
  to: R6DealStageClass,
) {
  if (to === "DISCOVERY_SCHEDULED") {
    const meeting = await transaction.commsMeeting.findFirst({
      where: {
        ownerOrganizationId: context.tenant.organizationId,
        dealId: deal.id,
        archivedAt: null,
        status: { in: ["SCHEDULED", "CONFIRMED", "COMPLETED"] },
      },
      select: { id: true },
    });
    if (!meeting) throw new CommercialCommandError("TRANSITION_DENIED");
  }

  if (to === "DISCOVERY_COMPLETED") {
    const meeting = await transaction.commsMeeting.findFirst({
      where: {
        ownerOrganizationId: context.tenant.organizationId,
        dealId: deal.id,
        archivedAt: null,
        status: "COMPLETED",
      },
      select: { id: true },
    });
    if (!meeting) throw new CommercialCommandError("TRANSITION_DENIED");
  }

  if (to === "PROPOSAL_PREPARATION") {
    if (!deal.primaryContactId || deal.amountMinor === null || !deal.currency) {
      throw new CommercialCommandError("TRANSITION_DENIED");
    }

    const qualification = await transaction.crmQualification.findFirst({
      where: {
        ownerOrganizationId: context.tenant.organizationId,
        OR: [
          { dealId: deal.id },
          ...(deal.sourceLeadId ? [{ leadId: deal.sourceLeadId }] : []),
        ],
      },
      select: { id: true },
    });
    if (!qualification) throw new CommercialCommandError("TRANSITION_DENIED");
  }
}

export async function moveDeal(
  context: CommercialContext,
  input: MoveDealInput,
  database: PrismaClient = getPrismaClient(),
) {
  return run(
    context,
    async (transaction) => {
      const deal = await transaction.commercialDeal.findFirst({
        where: {
          id: input.dealId,
          ownerOrganizationId: context.tenant.organizationId,
          archivedAt: null,
        },
        select: {
          id: true,
          pipelineId: true,
          stageId: true,
          sourceLeadId: true,
          primaryContactId: true,
          amountMinor: true,
          currency: true,
          rowVersion: true,
        },
      });
      if (!deal) throw new CommercialCommandError("NOT_FOUND");
      if (deal.rowVersion !== input.expectedRowVersion) {
        throw new CommercialCommandError("STALE_WRITE");
      }

      const pipeline = await transaction.commercialDealPipeline.findFirst({
        where: {
          id: deal.pipelineId,
          ownerOrganizationId: context.tenant.organizationId,
          active: true,
          archivedAt: null,
        },
        select: { version: true },
      });
      if (!pipeline) throw new CommercialCommandError("TRANSITION_DENIED");

      const [fromStage, toStage] = await Promise.all([
        transaction.commercialDealStage.findFirst({
          where: {
            id: deal.stageId,
            ownerOrganizationId: context.tenant.organizationId,
            pipelineId: deal.pipelineId,
            pipelineVersion: pipeline.version,
          },
          select: {
            id: true,
            canonicalClass: true,
            probability: true,
          },
        }),
        transaction.commercialDealStage.findFirst({
          where: {
            id: input.toStageId,
            ownerOrganizationId: context.tenant.organizationId,
            pipelineId: deal.pipelineId,
            pipelineVersion: pipeline.version,
          },
          select: {
            id: true,
            canonicalClass: true,
            probability: true,
          },
        }),
      ]);

      if (!fromStage || !toStage) {
        throw new CommercialCommandError("TRANSITION_DENIED");
      }
      if (
        !isR6DealStageClass(fromStage.canonicalClass) ||
        !isR6DealStageClass(toStage.canonicalClass)
      ) {
        throw new CommercialCommandError("STAGE_NOT_ACTIVE");
      }

      const from = fromStage.canonicalClass;
      const to = toStage.canonicalClass;
      if (!canMoveDeal(from, to)) {
        throw new CommercialCommandError("TRANSITION_DENIED");
      }

      const reason = input.reason?.trim() || null;
      if (requiresDealMoveReason(from, to) && !reason) {
        throw new CommercialCommandError("TRANSITION_DENIED");
      }

      await assertDealEntryGuard(transaction, context, deal, to);

      const updated = await transaction.commercialDeal.updateMany({
        where: {
          id: deal.id,
          ownerOrganizationId: context.tenant.organizationId,
          rowVersion: input.expectedRowVersion,
        },
        data: {
          stageId: toStage.id,
          probability: toStage.probability ?? undefined,
          lostReason:
            to === "LOST" || to === "DISQUALIFIED" ? reason : undefined,
          rowVersion: { increment: 1 },
          updatedByMembershipId: context.membership.membershipId,
        },
      });
      if (updated.count !== 1) throw new CommercialCommandError("STALE_WRITE");

      await transaction.commercialDealStageHistory.create({
        data: {
          id: newCommercialId(),
          ownerOrganizationId: context.tenant.organizationId,
          dealId: deal.id,
          fromStageId: fromStage.id,
          toStageId: toStage.id,
          actorMembershipId: context.membership.membershipId,
          reason,
          dealVersion: input.expectedRowVersion + 1,
          occurredAt: new Date(),
        },
      });

      return {
        dealId: deal.id,
        from,
        to,
        rowVersion: input.expectedRowVersion + 1,
      };
    },
    database,
  );
}


async function claimClientConversion(
  transaction: CommercialTransaction,
  input: ConvertDealToClientInput,
  requestHash: string,
) {
  const rows = await transaction.$queryRawUnsafe<Array<{ status: string }>>(
    `SELECT "platform"."claim_r6_client_conversion"(
       $1::uuid,
       $2::text,
       $3::text,
       $4::timestamptz
     ) AS status`,
    newCommercialId(),
    input.idempotencyKey.trim(),
    requestHash,
    new Date(Date.now() + 24 * 60 * 60 * 1000),
  );

  return rows[0]?.status ?? "IN_PROGRESS";
}

async function resolveClientOrganization(
  transaction: CommercialTransaction,
  companyId: string,
) {
  const rows = await transaction.$queryRawUnsafe<Array<{ id: string }>>(
    `SELECT "platform"."resolve_r6_client_organization"(
       $1::uuid,
       $2::uuid
     ) AS id`,
    companyId,
    newCommercialId(),
  );

  const id = rows[0]?.id;
  if (!id) throw new CommercialCommandError("CONFLICT");
  return id;
}

async function completeClientConversion(
  transaction: CommercialTransaction,
  idempotencyKey: string,
  requestHash: string,
  clientAccountId: string,
) {
  const responseHash = createHash("sha256")
    .update(clientAccountId)
    .digest("hex");

  await transaction.$queryRawUnsafe(
    `SELECT "platform"."complete_r6_client_conversion"(
       $1::text,
       $2::text,
       $3::text
     )`,
    idempotencyKey.trim(),
    requestHash,
    responseHash,
  );
}

async function readConvertedClientAccount(
  transaction: CommercialTransaction,
  context: CommercialContext,
  dealId: string,
) {
  const deal = await transaction.commercialDeal.findFirst({
    where: {
      id: dealId,
      ownerOrganizationId: context.tenant.organizationId,
      archivedAt: null,
    },
    select: { clientOrganizationId: true },
  });

  if (!deal?.clientOrganizationId) {
    throw new CommercialCommandError("CONFLICT");
  }

  const account = await transaction.commercialClientAccount.findFirst({
    where: {
      ownerOrganizationId: context.tenant.organizationId,
      clientOrganizationId: deal.clientOrganizationId,
      archivedAt: null,
    },
    select: {
      id: true,
      resourceId: true,
      clientOrganizationId: true,
      rowVersion: true,
    },
  });

  if (!account) throw new CommercialCommandError("CONFLICT");
  return account;
}

async function convertDealToClientInTransaction(
  transaction: CommercialTransaction,
  context: CommercialContext,
  input: ConvertDealToClientInput,
) {
  const idempotencyKey = input.idempotencyKey.trim();
  if (!idempotencyKey) throw new CommercialCommandError("INVALID");

  const requestHash = clientConversionRequestHash(input);
  const claim = await claimClientConversion(transaction, input, requestHash);

  if (claim === "MISMATCH") {
    throw new CommercialCommandError("IDEMPOTENCY_CONFLICT");
  }
  if (claim === "REPLAY") {
    return readConvertedClientAccount(transaction, context, input.dealId);
  }
  if (claim !== "CLAIMED") {
    throw new CommercialCommandError("CONFLICT");
  }

  const deal = await transaction.commercialDeal.findFirst({
    where: {
      id: input.dealId,
      ownerOrganizationId: context.tenant.organizationId,
      archivedAt: null,
    },
    select: {
      id: true,
      resourceId: true,
      companyId: true,
      primaryContactId: true,
      sourceLeadId: true,
      clientOrganizationId: true,
      pipelineId: true,
      stageId: true,
      amountMinor: true,
      currency: true,
      rowVersion: true,
    },
  });

  if (!deal) throw new CommercialCommandError("NOT_FOUND");
  if (deal.clientOrganizationId) throw new CommercialCommandError("CONFLICT");
  if (deal.rowVersion !== input.expectedRowVersion) {
    throw new CommercialCommandError("STALE_WRITE");
  }
  if (!deal.companyId || !deal.primaryContactId || deal.amountMinor === null || !deal.currency) {
    throw new CommercialCommandError("TRANSITION_DENIED");
  }

  const stage = await transaction.commercialDealStage.findFirst({
    where: {
      id: deal.stageId,
      ownerOrganizationId: context.tenant.organizationId,
      pipelineId: deal.pipelineId,
    },
    select: { canonicalClass: true },
  });
  if (
    !stage ||
    !isR6DealStageClass(stage.canonicalClass) ||
    !isR6ClientConversionStage(stage.canonicalClass)
  ) {
    throw new CommercialCommandError("TRANSITION_DENIED");
  }

  const company = await transaction.crmCompany.findFirst({
    where: {
      id: deal.companyId,
      ownerOrganizationId: context.tenant.organizationId,
      archivedAt: null,
    },
    select: { id: true, name: true },
  });
  if (!company) throw new CommercialCommandError("NOT_FOUND");

  const contact = await transaction.crmContact.findFirst({
    where: {
      id: deal.primaryContactId,
      ownerOrganizationId: context.tenant.organizationId,
      companyId: deal.companyId,
      archivedAt: null,
    },
    select: { id: true, personId: true },
  });
  if (!contact) throw new CommercialCommandError("NOT_FOUND");

  const qualification = await transaction.crmQualification.findFirst({
    where: {
      ownerOrganizationId: context.tenant.organizationId,
      archivedAt: null,
      OR: [
        { dealId: deal.id },
        ...(deal.sourceLeadId ? [{ leadId: deal.sourceLeadId }] : []),
      ],
    },
    select: { id: true },
  });
  if (!qualification) throw new CommercialCommandError("TRANSITION_DENIED");

  const clientOrganizationId = await resolveClientOrganization(
    transaction,
    company.id,
  );

  const existingAccount = await transaction.commercialClientAccount.findFirst({
    where: {
      ownerOrganizationId: context.tenant.organizationId,
      clientOrganizationId,
      archivedAt: null,
    },
    select: { id: true },
  });
  if (existingAccount) throw new CommercialCommandError("CONFLICT");

  const clientAccountId = newCommercialId();
  const clientAccountResourceId = newCommercialId();

  await registerCommercialResource(transaction, {
    id: clientAccountResourceId,
    type: "client-account",
    title: company.name + " Client Account",
    clientOrganizationId,
    sensitivity: "CONFIDENTIAL",
  });

  const account = await transaction.commercialClientAccount.create({
    data: {
      id: clientAccountId,
      resourceId: clientAccountResourceId,
      ownerOrganizationId: context.tenant.organizationId,
      clientOrganizationId,
      ownerMembershipId: context.membership.membershipId,
      visibility: "INTERNAL",
      sensitivity: "CONFIDENTIAL",
      accountManagerMembershipId: context.membership.membershipId,
      health: "NEW",
      onboardingState: "NOT_STARTED",
      portalState: "NOT_PROVISIONED",
      customerSince: new Date(),
      createdByMembershipId: context.membership.membershipId,
      updatedByMembershipId: context.membership.membershipId,
    },
    select: {
      id: true,
      resourceId: true,
      clientOrganizationId: true,
      rowVersion: true,
    },
  });

  await transaction.commercialClientRelationship.create({
    data: {
      id: newCommercialId(),
      ownerOrganizationId: context.tenant.organizationId,
      clientAccountId: account.id,
      personId: contact.personId,
      contactId: contact.id,
      relationshipRole: "PRIMARY_CONTACT",
      isPrimary: true,
    },
  });

  const dealResource = await transaction.resource.findFirst({
    where: {
      id: deal.resourceId,
      ownerOrganizationId: context.tenant.organizationId,
      archivedAt: null,
    },
    select: { title: true },
  });
  if (!dealResource) throw new CommercialCommandError("NOT_FOUND");

  await updateCommercialResource(transaction, {
    id: deal.resourceId,
    title: dealResource.title ?? "Deal",
    clientOrganizationId,
    sensitivity: "FINANCIAL",
  });

  const updatedDeal = await transaction.commercialDeal.updateMany({
    where: {
      id: deal.id,
      ownerOrganizationId: context.tenant.organizationId,
      rowVersion: input.expectedRowVersion,
      clientOrganizationId: null,
    },
    data: {
      clientOrganizationId,
      rowVersion: { increment: 1 },
      updatedByMembershipId: context.membership.membershipId,
    },
  });
  if (updatedDeal.count !== 1) throw new CommercialCommandError("STALE_WRITE");

  await completeClientConversion(
    transaction,
    idempotencyKey,
    requestHash,
    account.id,
  );

  return account;
}

export async function convertDealToClient(
  context: CommercialContext,
  input: ConvertDealToClientInput,
  database: PrismaClient = getPrismaClient(),
) {
  const first = await run(
    context,
    (transaction) =>
      convertDealToClientInTransaction(transaction, context, input),
    database,
  );

  if (first.kind === "error" && first.code === "CONFLICT") {
    return run(
      context,
      (transaction) =>
        convertDealToClientInTransaction(transaction, context, input),
      database,
    );
  }

  return first;
}

export async function addClientRelationship(
  context: CommercialContext,
  input: AddClientRelationshipInput,
  database: PrismaClient = getPrismaClient(),
) {
  return run(
    context,
    async (transaction) => {
      const relationshipRole = input.relationshipRole.trim();
      if (!relationshipRole) throw new CommercialCommandError("INVALID");

      const account = await transaction.commercialClientAccount.findFirst({
        where: {
          id: input.clientAccountId,
          ownerOrganizationId: context.tenant.organizationId,
          archivedAt: null,
        },
        select: { id: true },
      });
      if (!account) throw new CommercialCommandError("NOT_FOUND");

      const contact = await transaction.crmContact.findFirst({
        where: {
          id: input.contactId,
          ownerOrganizationId: context.tenant.organizationId,
          archivedAt: null,
        },
        select: { id: true, personId: true },
      });
      if (!contact) throw new CommercialCommandError("NOT_FOUND");

      return transaction.commercialClientRelationship.create({
        data: {
          id: newCommercialId(),
          ownerOrganizationId: context.tenant.organizationId,
          clientAccountId: account.id,
          personId: contact.personId,
          contactId: contact.id,
          relationshipRole,
          isPrimary: input.isPrimary ?? false,
          isBilling: input.isBilling ?? false,
          isApprover: input.isApprover ?? false,
          isAdmin: input.isAdmin ?? false,
        },
        select: {
          id: true,
          clientAccountId: true,
          contactId: true,
          relationshipRole: true,
        },
      });
    },
    database,
  );
}
