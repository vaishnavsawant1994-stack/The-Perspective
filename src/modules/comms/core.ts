import "server-only";

import { Prisma, type PrismaClient } from "@/generated/prisma/client";
import type {
  AuthorizedRequestContext,
  TenantScopedRequestContext,
} from "@/modules/foundation/request-context";
import { getPrismaClient } from "@/modules/persistence/client";

import {
  canAdvanceRecipient,
  canTransitionCampaign,
  canTransitionConversation,
  canTransitionMeeting,
} from "./lifecycle";
import { hashNormalizedDestination } from "./safety";
import {
  CommsTenantBoundaryError,
  newCommsId,
  registerCommsResource,
  type CommsTransaction,
  withCommsTenantTransaction,
} from "./persistence";
import type {
  AddCampaignRecipientInput,
  AddSequenceStepInput,
  CampaignState,
  CommsErrorCode,
  CommsResult,
  ConversationState,
  CreateCampaignInput,
  CreateConversationInput,
  CreateMeetingInput,
  CreateSendingAccountInput,
  CreateSequenceInput,
  EvaluateDispatchSafetyInput,
  MeetingState,
  RecipientState,
  RecordDeliveryEventInput,
  RecordMessageInput,
  TransitionCampaignInput,
  TransitionConversationInput,
  TransitionMeetingInput,
} from "./types";

type CommsContext = TenantScopedRequestContext | AuthorizedRequestContext;

class CommsCommandError extends Error {
  constructor(readonly code: CommsErrorCode) {
    super(code);
  }
}

function ok<T>(value: T): CommsResult<T> {
  return { kind: "ok", value };
}

function error(code: CommsErrorCode): CommsResult<never> {
  return { kind: "error", code };
}

function databaseCode(value: unknown) {
  if (!value || typeof value !== "object" || !("code" in value)) return undefined;
  return String((value as { code?: unknown }).code ?? "");
}

function mapKnownFailure(value: unknown): CommsResult<never> | undefined {
  if (value instanceof CommsCommandError) return error(value.code);
  if (value instanceof CommsTenantBoundaryError) return error("TEAM_REQUIRED");

  switch (databaseCode(value)) {
    case "P2002":
    case "P2034":
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
      return error("INVALID");
    default:
      return undefined;
  }
}

function json(value: unknown): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}

async function run<T>(
  context: CommsContext,
  operation: (transaction: CommsTransaction) => Promise<T>,
  database: PrismaClient,
): Promise<CommsResult<T>> {
  try {
    return ok(await withCommsTenantTransaction(context, operation, database));
  } catch (cause) {
    const known = mapKnownFailure(cause);
    if (known) return known;
    throw cause;
  }
}

function owner(context: CommsContext) {
  return {
    ownerOrganizationId: context.tenant.organizationId,
    ownerMembershipId: context.membership.membershipId,
    createdByMembershipId: context.membership.membershipId,
    updatedByMembershipId: context.membership.membershipId,
  };
}

export async function createSendingAccount(
  context: CommsContext,
  input: CreateSendingAccountInput,
  database: PrismaClient = getPrismaClient(),
) {
  return run(context, async (transaction) => {
    const provider = input.provider.trim();
    const address = input.address.trim().toLowerCase();
    if (!provider || !address) throw new CommsCommandError("INVALID");
    if ((input.dailyLimit ?? 0) < 0 || (input.hourlyLimit ?? 0) < 0) {
      throw new CommsCommandError("INVALID");
    }

    const id = newCommsId();
    const resourceId = newCommsId();
    await registerCommsResource(transaction, {
      id: resourceId,
      type: "sending-account",
      title: address,
      sensitivity: "SECURITY",
    });

    return transaction.commsSendingAccount.create({
      data: {
        id,
        resourceId,
        ...owner(context),
        visibility: "INTERNAL",
        sensitivity: "SECURITY",
        provider,
        address,
        displayName: input.displayName?.trim() || null,
        dailyLimit: input.dailyLimit ?? null,
        hourlyLimit: input.hourlyLimit ?? null,
        health: "UNKNOWN",
        syncState: "DISCONNECTED",
      },
      select: { id: true, resourceId: true, health: true, syncState: true, rowVersion: true },
    });
  }, database);
}

export async function createSequence(
  context: CommsContext,
  input: CreateSequenceInput,
  database: PrismaClient = getPrismaClient(),
) {
  return run(context, async (transaction) => {
    const name = input.name.trim();
    if (!name) throw new CommsCommandError("INVALID");

    const id = newCommsId();
    const resourceId = newCommsId();
    await registerCommsResource(transaction, {
      id: resourceId,
      type: "sequence",
      title: name,
      sensitivity: "STANDARD",
    });

    return transaction.commsSequence.create({
      data: {
        id,
        resourceId,
        ...owner(context),
        visibility: "INTERNAL",
        sensitivity: "STANDARD",
        name,
        currentVersion: 1,
        status: "DRAFT",
      },
      select: { id: true, resourceId: true, currentVersion: true, status: true, rowVersion: true },
    });
  }, database);
}

export async function addSequenceStep(
  context: CommsContext,
  input: AddSequenceStepInput,
  database: PrismaClient = getPrismaClient(),
) {
  return run(context, async (transaction) => {
    const channel = input.channel.trim();
    if (!channel || input.position <= 0 || (input.delaySeconds ?? 0) < 0) {
      throw new CommsCommandError("INVALID");
    }

    const sequence = await transaction.commsSequence.findFirst({
      where: {
        id: input.sequenceId,
        ownerOrganizationId: context.tenant.organizationId,
        archivedAt: null,
      },
      select: { currentVersion: true },
    });
    if (!sequence) throw new CommsCommandError("NOT_FOUND");
    if (sequence.currentVersion !== input.expectedSequenceVersion) {
      throw new CommsCommandError("STALE_WRITE");
    }

    const version = await transaction.commsMessageTemplateVersion.findFirst({
      where: {
        id: input.templateVersionId,
        ownerOrganizationId: context.tenant.organizationId,
      },
      select: { id: true, templateId: true },
    });
    if (!version) throw new CommsCommandError("TEMPLATE_NOT_APPROVED");

    const template = await transaction.commsMessageTemplate.findFirst({
      where: {
        id: version.templateId,
        ownerOrganizationId: context.tenant.organizationId,
        currentVersionId: version.id,
        status: "APPROVED",
        archivedAt: null,
      },
      select: { id: true },
    });
    if (!template) throw new CommsCommandError("TEMPLATE_NOT_APPROVED");

    return transaction.commsSequenceStep.create({
      data: {
        id: newCommsId(),
        ownerOrganizationId: context.tenant.organizationId,
        sequenceId: input.sequenceId,
        sequenceVersion: input.expectedSequenceVersion,
        position: input.position,
        channel,
        templateVersionId: input.templateVersionId,
        delaySeconds: input.delaySeconds ?? 0,
        conditions: json(input.conditions ?? {}),
        stopRules: json(input.stopRules ?? {}),
      },
      select: { id: true, sequenceId: true, sequenceVersion: true, position: true },
    });
  }, database);
}

export async function createCampaign(
  context: CommsContext,
  input: CreateCampaignInput,
  database: PrismaClient = getPrismaClient(),
) {
  return run(context, async (transaction) => {
    const name = input.name.trim();
    if (!name) throw new CommsCommandError("INVALID");

    const id = newCommsId();
    const resourceId = newCommsId();
    await registerCommsResource(transaction, {
      id: resourceId,
      type: "outreach-campaign",
      title: name,
      sensitivity: "CONFIDENTIAL",
    });

    return transaction.commsOutreachCampaign.create({
      data: {
        id,
        resourceId,
        ...owner(context),
        visibility: "INTERNAL",
        sensitivity: "CONFIDENTIAL",
        name,
        leadListId: input.leadListId,
        sequenceId: input.sequenceId,
        sendingAccountId: input.sendingAccountId,
        schedule: json(input.schedule ?? {}),
        status: "DRAFT",
      },
      select: { id: true, resourceId: true, status: true, rowVersion: true },
    });
  }, database);
}

export async function addCampaignRecipient(
  context: CommsContext,
  input: AddCampaignRecipientInput,
  database: PrismaClient = getPrismaClient(),
) {
  if (Boolean(input.leadId) === Boolean(input.contactId)) return error("INVALID");

  return run(context, async (transaction) => {
    const campaign = await transaction.commsOutreachCampaign.findFirst({
      where: {
        id: input.campaignId,
        ownerOrganizationId: context.tenant.organizationId,
        archivedAt: null,
      },
      select: { status: true, rowVersion: true },
    });
    if (!campaign) throw new CommsCommandError("NOT_FOUND");
    if (!["DRAFT", "READY"].includes(campaign.status)) {
      throw new CommsCommandError("TRANSITION_DENIED");
    }

    const recipient = await transaction.commsCampaignRecipient.create({
      data: {
        id: newCommsId(),
        ownerOrganizationId: context.tenant.organizationId,
        campaignId: input.campaignId,
        leadId: input.leadId ?? null,
        contactId: input.contactId ?? null,
        state: "QUEUED",
        currentStep: 0,
      },
      select: { id: true, campaignId: true, state: true, rowVersion: true },
    });

    if (campaign.status === "READY") {
      await transaction.commsOutreachCampaign.updateMany({
        where: {
          id: input.campaignId,
          ownerOrganizationId: context.tenant.organizationId,
          rowVersion: campaign.rowVersion,
        },
        data: {
          status: "DRAFT",
          audienceSnapshotHash: null,
          approvedSnapshotHash: null,
          approvedAt: null,
          approvedByMembershipId: null,
          rowVersion: { increment: 1 },
          updatedByMembershipId: context.membership.membershipId,
        },
      });
    }

    return recipient;
  }, database);
}

async function assertCampaignReady(
  transaction: CommsTransaction,
  context: CommsContext,
  campaignId: string,
) {
  const campaign = await transaction.commsOutreachCampaign.findFirst({
    where: {
      id: campaignId,
      ownerOrganizationId: context.tenant.organizationId,
      archivedAt: null,
    },
    select: {
      sequenceId: true,
      sendingAccountId: true,
      recipientCount: true,
    },
  });
  if (!campaign) throw new CommsCommandError("NOT_FOUND");

  const [steps, recipients, sender] = await Promise.all([
    transaction.commsSequenceStep.count({
      where: {
        ownerOrganizationId: context.tenant.organizationId,
        sequenceId: campaign.sequenceId,
      },
    }),
    transaction.commsCampaignRecipient.count({
      where: {
        ownerOrganizationId: context.tenant.organizationId,
        campaignId,
        state: "QUEUED",
      },
    }),
    transaction.commsSendingAccount.findFirst({
      where: {
        id: campaign.sendingAccountId,
        ownerOrganizationId: context.tenant.organizationId,
        archivedAt: null,
      },
      select: { id: true },
    }),
  ]);

  if (!sender || steps < 1 || recipients < 1) throw new CommsCommandError("INVALID");
  return recipients;
}

export async function transitionCampaign(
  context: CommsContext,
  input: TransitionCampaignInput,
  database: PrismaClient = getPrismaClient(),
) {
  return run(context, async (transaction) => {
    const campaign = await transaction.commsOutreachCampaign.findFirst({
      where: {
        id: input.campaignId,
        ownerOrganizationId: context.tenant.organizationId,
        archivedAt: null,
      },
      select: {
        status: true,
        rowVersion: true,
        audienceSnapshotHash: true,
        approvedSnapshotHash: true,
      },
    });
    if (!campaign) throw new CommsCommandError("NOT_FOUND");
    if (campaign.rowVersion !== input.expectedRowVersion) {
      throw new CommsCommandError("STALE_WRITE");
    }

    const from = campaign.status as CampaignState;
    if (!canTransitionCampaign(from, input.to)) {
      throw new CommsCommandError("TRANSITION_DENIED");
    }

    const now = new Date();
    const data: Prisma.CommsOutreachCampaignUpdateManyMutationInput = {
      status: input.to,
      rowVersion: { increment: 1 },
      updatedByMembershipId: context.membership.membershipId,
    };

    if (from === "DRAFT" && input.to === "READY") {
      const count = await assertCampaignReady(transaction, context, input.campaignId);
      const snapshot = input.audienceSnapshotHash?.trim();
      if (!snapshot) throw new CommsCommandError("INVALID");
      data.audienceSnapshotHash = snapshot;
      data.recipientCount = count;
      data.approvedSnapshotHash = null;
      data.approvedAt = null;
      data.approvedByMembershipId = null;
    } else if (from === "READY" && input.to === "APPROVED") {
      if (!campaign.audienceSnapshotHash) throw new CommsCommandError("INVALID");
      data.approvedSnapshotHash = campaign.audienceSnapshotHash;
      data.approvedAt = now;
      data.approvedByMembershipId = context.membership.membershipId;
    } else if (input.to === "RUNNING") {
      throw new CommsCommandError("SENDER_NOT_READY");
    } else if (input.to === "PAUSED") {
      data.pausedAt = now;
    } else if (input.to === "COMPLETED") {
      data.completedAt = now;
    }

    const updated = await transaction.commsOutreachCampaign.updateMany({
      where: {
        id: input.campaignId,
        ownerOrganizationId: context.tenant.organizationId,
        rowVersion: input.expectedRowVersion,
      },
      data,
    });
    if (updated.count !== 1) throw new CommsCommandError("STALE_WRITE");

    return {
      campaignId: input.campaignId,
      from,
      to: input.to,
      rowVersion: input.expectedRowVersion + 1,
    };
  }, database);
}

export async function evaluateDispatchSafety(
  context: CommsContext,
  input: EvaluateDispatchSafetyInput,
  database: PrismaClient = getPrismaClient(),
) {
  return run(context, async (transaction) => {
    const channel = input.channel.trim().toUpperCase();
    if (!channel) throw new CommsCommandError("INVALID");

    const recipient = await transaction.commsCampaignRecipient.findFirst({
      where: {
        id: input.campaignRecipientId,
        ownerOrganizationId: context.tenant.organizationId,
      },
      select: { id: true, leadId: true, contactId: true, state: true, campaignId: true },
    });
    if (!recipient) throw new CommsCommandError("NOT_FOUND");
    if (["BOUNCED", "UNSUBSCRIBED", "STOPPED", "CONVERTED"].includes(recipient.state)) {
      throw new CommsCommandError("CONTACT_BLOCKED");
    }

    const campaign = await transaction.commsOutreachCampaign.findFirst({
      where: {
        id: recipient.campaignId,
        ownerOrganizationId: context.tenant.organizationId,
        archivedAt: null,
      },
      select: { sendingAccountId: true, status: true },
    });
    if (!campaign) throw new CommsCommandError("NOT_FOUND");
    if (!["SCHEDULED", "RUNNING"].includes(campaign.status)) {
      throw new CommsCommandError("TRANSITION_DENIED");
    }

    const sender = await transaction.commsSendingAccount.findFirst({
      where: {
        id: campaign.sendingAccountId,
        ownerOrganizationId: context.tenant.organizationId,
        archivedAt: null,
      },
      select: { health: true, syncState: true },
    });
    if (!sender || sender.health !== "HEALTHY" || sender.syncState !== "CONNECTED") {
      throw new CommsCommandError("SENDER_NOT_READY");
    }

    let contactId = recipient.contactId ?? null;

    if (recipient.leadId) {
      const lead = await transaction.crmLead.findFirst({
        where: {
          id: recipient.leadId,
          ownerOrganizationId: context.tenant.organizationId,
          archivedAt: null,
        },
        select: { lifecycleState: true, contactId: true },
      });
      if (!lead) throw new CommsCommandError("NOT_FOUND");
      if (lead.lifecycleState === "DO_NOT_CONTACT") {
        throw new CommsCommandError("CONTACT_BLOCKED");
      }
      contactId = contactId ?? lead.contactId;
    }

    if (!contactId) throw new CommsCommandError("CONTACT_BLOCKED");

    const contact = await transaction.crmContact.findFirst({
      where: {
        id: contactId,
        ownerOrganizationId: context.tenant.organizationId,
        archivedAt: null,
      },
      select: {
        contactabilityState: true,
        consentState: true,
        emailNormalized: true,
        phoneNormalized: true,
      },
    });
    if (!contact) throw new CommsCommandError("NOT_FOUND");
    if (
      ["DO_NOT_CONTACT", "BLOCKED", "UNSUBSCRIBED"].includes(
        contact.contactabilityState ?? "",
      ) ||
      ["REVOKED", "DENIED"].includes(contact.consentState ?? "")
    ) {
      throw new CommsCommandError("CONTACT_BLOCKED");
    }

    const destination =
      channel === "EMAIL"
        ? contact.emailNormalized
        : channel === "SMS" || channel === "PHONE"
          ? contact.phoneNormalized
          : null;
    if (!destination) throw new CommsCommandError("CONTACT_BLOCKED");

    const destinationHash = hashNormalizedDestination(channel, destination);

    const suppression = await transaction.crmSuppressionEntry.findFirst({
      where: {
        ownerOrganizationId: context.tenant.organizationId,
        channel,
        normalizedDestinationHash: destinationHash,
        archivedAt: null,
        effectiveAt: { lte: new Date() },
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
      },
      select: { id: true },
    });
    if (suppression) throw new CommsCommandError("CONTACT_BLOCKED");

    return {
      campaignRecipientId: recipient.id,
      allowed: true as const,
      channel,
      normalizedDestinationHash: destinationHash,
    };
  }, database);
}

export async function recordDeliveryEvent(
  context: CommsContext,
  input: RecordDeliveryEventInput,
  database: PrismaClient = getPrismaClient(),
) {
  return run(context, async (transaction) => {
    const provider = input.provider.trim();
    const externalEventId = input.externalEventId.trim();
    const eventType = input.eventType.trim().toUpperCase();
    if (!provider || !externalEventId || !eventType) throw new CommsCommandError("INVALID");

    const row = await transaction.commsMessageDelivery.create({
      data: {
        id: newCommsId(),
        ownerOrganizationId: context.tenant.organizationId,
        campaignRecipientId: input.campaignRecipientId ?? null,
        sequenceStepId: input.sequenceStepId ?? null,
        messageId: input.messageId ?? null,
        provider,
        externalEventId,
        eventType,
        occurredAt: input.occurredAt,
        payloadHash: input.payloadHash?.trim() || null,
        metadata: json(input.metadata ?? {}),
      },
      select: { id: true, campaignRecipientId: true },
    });

    const mapped: Partial<Record<string, RecipientState>> = {
      SENT: "SENT",
      DELIVERED: "DELIVERED",
      OPENED: "OPENED",
      CLICKED: "CLICKED",
      REPLIED: "REPLIED",
      BOUNCED: "BOUNCED",
      UNSUBSCRIBED: "UNSUBSCRIBED",
    };

    if (row.campaignRecipientId && mapped[eventType]) {
      const recipient = await transaction.commsCampaignRecipient.findFirst({
        where: {
          id: row.campaignRecipientId,
          ownerOrganizationId: context.tenant.organizationId,
        },
        select: { state: true, rowVersion: true },
      });
      if (!recipient) throw new CommsCommandError("NOT_FOUND");
      const to = mapped[eventType]!;
      const from = recipient.state as RecipientState;

      if (canAdvanceRecipient(from, to) && from !== to) {
        await transaction.commsCampaignRecipient.updateMany({
          where: {
            id: row.campaignRecipientId,
            ownerOrganizationId: context.tenant.organizationId,
            rowVersion: recipient.rowVersion,
          },
          data: {
            state: to,
            rowVersion: { increment: 1 },
            stoppedAt: ["BOUNCED", "UNSUBSCRIBED"].includes(to) ? input.occurredAt : null,
            stopReason: ["BOUNCED", "UNSUBSCRIBED"].includes(to) ? eventType : null,
          },
        });
      }
    }

    return row;
  }, database);
}

export async function createConversation(
  context: CommsContext,
  input: CreateConversationInput,
  database: PrismaClient = getPrismaClient(),
) {
  return run(context, async (transaction) => {
    const channel = input.channel.trim();
    if (!channel) throw new CommsCommandError("INVALID");

    const id = newCommsId();
    const resourceId = newCommsId();
    await registerCommsResource(transaction, {
      id: resourceId,
      type: "conversation",
      title: input.subject?.trim() || "Conversation",
      sensitivity: "PII",
    });

    return transaction.commsConversation.create({
      data: {
        id,
        resourceId,
        ...owner(context),
        visibility: "INTERNAL",
        sensitivity: "PII",
        channel,
        subject: input.subject?.trim() || null,
        leadId: input.leadId ?? null,
        dealId: input.dealId ?? null,
        clientAccountId: input.clientAccountId ?? null,
        sendingAccountId: input.sendingAccountId ?? null,
        provider: input.provider?.trim() || null,
        providerThreadId: input.providerThreadId?.trim() || null,
        status: "OPEN",
      },
      select: { id: true, resourceId: true, status: true, rowVersion: true },
    });
  }, database);
}

export async function transitionConversation(
  context: CommsContext,
  input: TransitionConversationInput,
  database: PrismaClient = getPrismaClient(),
) {
  return run(context, async (transaction) => {
    const row = await transaction.commsConversation.findFirst({
      where: {
        id: input.conversationId,
        ownerOrganizationId: context.tenant.organizationId,
        archivedAt: null,
      },
      select: { status: true, rowVersion: true },
    });
    if (!row) throw new CommsCommandError("NOT_FOUND");
    if (row.rowVersion !== input.expectedRowVersion) throw new CommsCommandError("STALE_WRITE");

    const from = row.status as ConversationState;
    if (!canTransitionConversation(from, input.to)) throw new CommsCommandError("TRANSITION_DENIED");

    const updated = await transaction.commsConversation.updateMany({
      where: {
        id: input.conversationId,
        ownerOrganizationId: context.tenant.organizationId,
        rowVersion: input.expectedRowVersion,
      },
      data: {
        status: input.to,
        rowVersion: { increment: 1 },
        updatedByMembershipId: context.membership.membershipId,
      },
    });
    if (updated.count !== 1) throw new CommsCommandError("STALE_WRITE");

    return {
      conversationId: input.conversationId,
      from,
      to: input.to,
      rowVersion: input.expectedRowVersion + 1,
    };
  }, database);
}

export async function recordMessage(
  context: CommsContext,
  input: RecordMessageInput,
  database: PrismaClient = getPrismaClient(),
) {
  return run(context, async (transaction) => {
    const body = input.bodyText?.trim() || null;
    const internal = input.internalNote === true || input.direction === "INTERNAL";
    if (!body) throw new CommsCommandError("INVALID");
    if (internal && input.direction === "OUTBOUND") throw new CommsCommandError("INVALID");

    const provider = input.provider?.trim() || null;
    const externalId = input.externalId?.trim() || null;
    if (input.direction === "OUTBOUND" && (!provider || !externalId)) {
      throw new CommsCommandError("INVALID");
    }

    const occurredAt = input.occurredAt ?? new Date();
    const message = await transaction.commsMessage.create({
      data: {
        id: newCommsId(),
        ownerOrganizationId: context.tenant.organizationId,
        conversationId: input.conversationId,
        direction: internal ? "INTERNAL" : input.direction,
        senderMembershipId: internal || input.direction === "OUTBOUND"
          ? context.membership.membershipId
          : null,
        bodyText: body,
        provider,
        externalId,
        sentAt: input.direction === "OUTBOUND" ? occurredAt : null,
        receivedAt: input.direction === "INBOUND" ? occurredAt : null,
        visibility: "INTERNAL",
        isInternalNote: internal,
      },
      select: { id: true, direction: true, isInternalNote: true, createdAt: true },
    });

    await transaction.commsConversation.updateMany({
      where: {
        id: input.conversationId,
        ownerOrganizationId: context.tenant.organizationId,
      },
      data: {
        lastMessageAt: occurredAt,
        rowVersion: { increment: 1 },
        updatedByMembershipId: context.membership.membershipId,
      },
    });

    return message;
  }, database);
}

export async function createMeeting(
  context: CommsContext,
  input: CreateMeetingInput,
  database: PrismaClient = getPrismaClient(),
) {
  return run(context, async (transaction) => {
    const title = input.title.trim();
    const meetingType = input.meetingType.trim();
    const timezone = input.timezone.trim();
    if (!title || !meetingType || !timezone || input.endsAt <= input.startsAt) {
      throw new CommsCommandError("INVALID");
    }

    const id = newCommsId();
    const resourceId = newCommsId();
    await registerCommsResource(transaction, {
      id: resourceId,
      type: "meeting",
      title,
      sensitivity: "CONFIDENTIAL",
    });

    return transaction.commsMeeting.create({
      data: {
        id,
        resourceId,
        ...owner(context),
        visibility: "INTERNAL",
        sensitivity: "CONFIDENTIAL",
        title,
        meetingType,
        startsAt: input.startsAt,
        endsAt: input.endsAt,
        timezone,
        status: "PROPOSED",
        dealId: input.dealId ?? null,
        clientAccountId: input.clientAccountId ?? null,
      },
      select: { id: true, resourceId: true, status: true, rowVersion: true },
    });
  }, database);
}

export async function transitionMeeting(
  context: CommsContext,
  input: TransitionMeetingInput,
  database: PrismaClient = getPrismaClient(),
) {
  return run(context, async (transaction) => {
    const row = await transaction.commsMeeting.findFirst({
      where: {
        id: input.meetingId,
        ownerOrganizationId: context.tenant.organizationId,
        archivedAt: null,
      },
      select: { status: true, rowVersion: true },
    });
    if (!row) throw new CommsCommandError("NOT_FOUND");
    if (row.rowVersion !== input.expectedRowVersion) throw new CommsCommandError("STALE_WRITE");

    const from = row.status as MeetingState;
    if (!canTransitionMeeting(from, input.to)) throw new CommsCommandError("TRANSITION_DENIED");

    const updated = await transaction.commsMeeting.updateMany({
      where: {
        id: input.meetingId,
        ownerOrganizationId: context.tenant.organizationId,
        rowVersion: input.expectedRowVersion,
      },
      data: {
        status: input.to,
        rowVersion: { increment: 1 },
        updatedByMembershipId: context.membership.membershipId,
      },
    });
    if (updated.count !== 1) throw new CommsCommandError("STALE_WRITE");

    return {
      meetingId: input.meetingId,
      from,
      to: input.to,
      rowVersion: input.expectedRowVersion + 1,
    };
  }, database);
}
