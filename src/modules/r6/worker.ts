import "server-only";

import { randomUUID } from "node:crypto";
import { z } from "zod";

import { Prisma, type PrismaClient } from "@/generated/prisma/client";
import { evaluateAuthorization } from "@/modules/authorization/policy";
import { resolveAuthorizedRequestContext } from "@/modules/authorization/resolver";
import { buildCampaignApprovalSnapshotInTransaction, evaluateDispatchSafety } from "@/modules/comms/core";
import { withCommsTenantTransaction } from "@/modules/comms/persistence";
import { canonicalCommsEvidenceHash } from "@/modules/comms/snapshot";
import type {
  AuthorizedRequestContext,
  MembershipId,
  OrganizationId,
  SessionId,
  TenantScopedRequestContext,
  UserId,
} from "@/modules/foundation/request-context";
import { getPrismaClient } from "@/modules/persistence/client";

import { loadR6CampaignResource } from "./resources";
import {
  r6MfaSatisfied,
  r6RecentAuthenticationSatisfied,
} from "./security";
import type {
  R6ProviderAdapterResolver,
} from "./providers";
import { resolveConfiguredR6ProviderAdapter } from "./providers";

const actorSchema = z.object({
  userAccountId: z.string().uuid(),
  membershipId: z.string().uuid(),
  organizationId: z.string().uuid(),
  sessionId: z.string().uuid(),
  sessionIssuedAt: z.string().datetime({ offset: true }),
  sessionExpiresAt: z.string().datetime({ offset: true }),
  mfaVerifiedAt: z.string().datetime({ offset: true }).nullable(),
}).strict();

const launchSchema = z.object({
  type: z.literal("R6_COMMS_CAMPAIGN_LAUNCH"),
  campaignId: z.string().uuid(),
  expectedRowVersion: z.number().int().positive(),
  reason: z.string().trim().min(3).max(500),
  actor: actorSchema,
  requestHash: z.string().regex(/^[a-f0-9]{64}$/u),
  requestedAt: z.string().datetime({ offset: true }),
}).strict();

const dispatchSchema = z.object({
  type: z.literal("R6_COMMS_RECIPIENT_DISPATCH"),
  campaignId: z.string().uuid(),
  campaignRecipientId: z.string().uuid(),
  expectedCampaignVersion: z.number().int().positive(),
  reason: z.string().trim().min(3).max(500),
  actor: actorSchema,
  requestHash: z.string().regex(/^[a-f0-9]{64}$/u),
  requestedAt: z.string().datetime({ offset: true }),
}).strict();

type LaunchPayload = z.infer<typeof launchSchema>;
type DispatchPayload = z.infer<typeof dispatchSchema>;

export class R6WorkerError extends Error {
  constructor(
    readonly code:
      | "EVENT_NOT_FOUND"
      | "EVENT_BUSY"
      | "EVENT_INVALID"
      | "SESSION_INVALID"
      | "AUTHORIZATION_DENIED"
      | "WORKFLOW_DENIED"
      | "PROVIDER_NOT_CONFIGURED"
      | "PROVIDER_REJECTED",
  ) {
    super(code);
  }
}

function jsonObject(value: unknown): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}

async function rehydrateActor(
  actor: z.infer<typeof actorSchema>,
  requestId: string,
  database: PrismaClient,
  now = new Date(),
): Promise<AuthorizedRequestContext> {
  const session = await database.session.findFirst({
    where: {
      id: actor.sessionId,
      userAccountId: actor.userAccountId,
      activeMembershipId: actor.membershipId,
      surface: "TEAM",
      revokedAt: null,
      expiresAt: { gt: now },
    },
    select: {
      id: true,
      userAccountId: true,
      activeMembershipId: true,
      surface: true,
      authenticationMethod: true,
      mfaVerifiedAt: true,
      issuedAt: true,
      expiresAt: true,
    },
  });
  if (!session || !session.activeMembershipId) {
    throw new R6WorkerError("SESSION_INVALID");
  }

  if (
    session.issuedAt.toISOString() !== actor.sessionIssuedAt ||
    session.expiresAt.toISOString() !== actor.sessionExpiresAt ||
    (session.mfaVerifiedAt?.toISOString() ?? null) !== actor.mfaVerifiedAt
  ) {
    throw new R6WorkerError("SESSION_INVALID");
  }

  const tenantContext: TenantScopedRequestContext = {
    authentication: "authenticated",
    scope: "tenant",
    requestId,
    identity: { userId: session.userAccountId as UserId },
    session: {
      sessionId: session.id as SessionId,
      issuedAt: session.issuedAt,
      expiresAt: session.expiresAt,
      authenticationMethod: session.authenticationMethod,
      mfaVerifiedAt: session.mfaVerifiedAt ?? undefined,
    },
    membership: {
      membershipId: session.activeMembershipId as MembershipId,
      organizationId: actor.organizationId as OrganizationId,
      surface: "TEAM",
    },
    tenant: {
      membershipId: session.activeMembershipId as MembershipId,
      organizationId: actor.organizationId as OrganizationId,
      surface: "TEAM",
    },
  };

  const resolved = await resolveAuthorizedRequestContext(
    tenantContext,
    database,
    now,
  );
  if (resolved.kind !== "authorized") {
    throw new R6WorkerError("AUTHORIZATION_DENIED");
  }
  return resolved.context;
}

async function authorizeLaunchExecution(
  context: AuthorizedRequestContext,
  payload: LaunchPayload | DispatchPayload,
  expectedVersion: number,
  database: PrismaClient,
  now: Date,
) {
  const resource = await loadR6CampaignResource(
    context,
    payload.campaignId,
    database,
  );
  if (!resource) throw new R6WorkerError("WORKFLOW_DENIED");

  const decision = evaluateAuthorization(
    context,
    "outreach.launch",
    resource,
    {
      action: "launch",
      requestedFields: [],
      workflowSatisfied:
        resource.lifecycleState === "SCHEDULED" ||
        resource.lifecycleState === "RUNNING",
      reason: payload.reason,
      recentAuthenticationSatisfied: r6RecentAuthenticationSatisfied(
        context.session,
        now,
      ),
      mfaSatisfied: r6MfaSatisfied(context.session, now),
      exactVersionMatches: resource.version === expectedVersion,
    },
  );
  if (decision.decision !== "ALLOW") {
    throw new R6WorkerError("AUTHORIZATION_DENIED");
  }
  return resource;
}

async function startCampaignAndQueueRecipients(
  context: AuthorizedRequestContext,
  payload: LaunchPayload,
  database: PrismaClient,
) {
  return withCommsTenantTransaction(
    context,
    async (transaction) => {
      const campaign = await transaction.commsOutreachCampaign.findFirst({
        where: {
          id: payload.campaignId,
          ownerOrganizationId: context.tenant.organizationId,
          archivedAt: null,
        },
        select: {
          id: true,
          resourceId: true,
          status: true,
          rowVersion: true,
          audienceSnapshotHash: true,
          approvedSnapshotHash: true,
          sendingAccountId: true,
        },
      });
      if (
        !campaign ||
        campaign.status !== "SCHEDULED" ||
        campaign.rowVersion !== payload.expectedRowVersion
      ) {
        throw new R6WorkerError("WORKFLOW_DENIED");
      }

      const snapshot = await buildCampaignApprovalSnapshotInTransaction(
        transaction,
        context,
        campaign.id,
      );
      if (
        !campaign.audienceSnapshotHash ||
        campaign.audienceSnapshotHash !== campaign.approvedSnapshotHash ||
        snapshot.hash !== campaign.approvedSnapshotHash
      ) {
        throw new R6WorkerError("WORKFLOW_DENIED");
      }

      const sender = await transaction.commsSendingAccount.findFirst({
        where: {
          id: campaign.sendingAccountId,
          ownerOrganizationId: context.tenant.organizationId,
          archivedAt: null,
        },
        select: { health: true, syncState: true },
      });
      if (
        !sender ||
        sender.health !== "HEALTHY" ||
        sender.syncState !== "CONNECTED"
      ) {
        throw new R6WorkerError("WORKFLOW_DENIED");
      }

      const recipients = await transaction.commsCampaignRecipient.findMany({
        where: {
          ownerOrganizationId: context.tenant.organizationId,
          campaignId: campaign.id,
          state: "QUEUED",
        },
        orderBy: { id: "asc" },
        select: { id: true },
      });
      if (recipients.length < 1) throw new R6WorkerError("WORKFLOW_DENIED");

      const updated = await transaction.commsOutreachCampaign.updateMany({
        where: {
          id: campaign.id,
          ownerOrganizationId: context.tenant.organizationId,
          status: "SCHEDULED",
          rowVersion: payload.expectedRowVersion,
        },
        data: {
          status: "RUNNING",
          launchedAt: new Date(),
          rowVersion: { increment: 1 },
          updatedByMembershipId: context.membership.membershipId,
        },
      });
      if (updated.count !== 1) throw new R6WorkerError("WORKFLOW_DENIED");

      const expectedCampaignVersion = payload.expectedRowVersion + 1;
      for (const recipient of recipients) {
        const requestHash = canonicalCommsEvidenceHash({
          campaignId: campaign.id,
          campaignRecipientId: recipient.id,
          expectedCampaignVersion,
          actor: payload.actor,
          reason: payload.reason,
        });
        const idempotencyKey = canonicalCommsEvidenceHash({
          type: "R6_COMMS_RECIPIENT_DISPATCH",
          organizationId: context.tenant.organizationId,
          campaignId: campaign.id,
          campaignRecipientId: recipient.id,
          expectedCampaignVersion,
        });
        await transaction.outboxEvent.upsert({
          where: { idempotencyKey },
          update: {},
          create: {
            id: randomUUID(),
            ownerOrganizationId: context.tenant.organizationId,
            aggregateResourceId: campaign.resourceId,
            eventType: "R6_COMMS_RECIPIENT_DISPATCH",
            schemaVersion: 1,
            payload: jsonObject({
              type: "R6_COMMS_RECIPIENT_DISPATCH",
              campaignId: campaign.id,
              campaignRecipientId: recipient.id,
              expectedCampaignVersion,
              reason: payload.reason,
              actor: payload.actor,
              requestHash,
              requestedAt: new Date().toISOString(),
            }),
            idempotencyKey,
            status: "PENDING",
            availableAt: new Date(),
          },
        });
      }

      return {
        campaignId: campaign.id,
        rowVersion: expectedCampaignVersion,
        queuedRecipients: recipients.length,
      };
    },
    database,
  );
}

async function handleLaunch(
  eventId: string,
  payload: LaunchPayload,
  database: PrismaClient,
  now: Date,
) {
  const context = await rehydrateActor(
    payload.actor,
    `r6-worker:${eventId}`,
    database,
    now,
  );
  if (context.tenant.organizationId !== payload.actor.organizationId) {
    throw new R6WorkerError("AUTHORIZATION_DENIED");
  }
  await authorizeLaunchExecution(
    context,
    payload,
    payload.expectedRowVersion,
    database,
    now,
  );
  return startCampaignAndQueueRecipients(context, payload, database);
}

async function handleDispatch(
  eventId: string,
  idempotencyKey: string,
  payload: DispatchPayload,
  database: PrismaClient,
  now: Date,
  resolveAdapter: R6ProviderAdapterResolver,
) {
  const context = await rehydrateActor(
    payload.actor,
    `r6-worker:${eventId}`,
    database,
    now,
  );
  await authorizeLaunchExecution(
    context,
    payload,
    payload.expectedCampaignVersion,
    database,
    now,
  );

  const safety = await evaluateDispatchSafety(
    context,
    { campaignRecipientId: payload.campaignRecipientId },
    database,
  );
  if (safety.kind !== "ok") throw new R6WorkerError("WORKFLOW_DENIED");

  const adapter = resolveAdapter(safety.value.provider);
  if (!adapter) throw new R6WorkerError("PROVIDER_NOT_CONFIGURED");

  try {
    const result = await adapter.dispatch({
      eventId,
      idempotencyKey,
      campaignId: payload.campaignId,
      campaignRecipientId: payload.campaignRecipientId,
      provider: safety.value.provider,
      channel: safety.value.channel,
      destination: safety.value.destination,
      destinationHash: safety.value.normalizedDestinationHash,
    });
    return {
      campaignRecipientId: payload.campaignRecipientId,
      provider: safety.value.provider,
      externalRequestId: result.externalRequestId,
    };
  } catch {
    throw new R6WorkerError("PROVIDER_REJECTED");
  }
}

export async function processR6OutboxEvent(
  eventId: string,
  dependencies: {
    readonly database?: PrismaClient;
    readonly resolveProviderAdapter?: R6ProviderAdapterResolver;
    readonly now?: Date;
  } = {},
) {
  const database = dependencies.database ?? getPrismaClient();
  const now = dependencies.now ?? new Date();
  const resolveAdapter =
    dependencies.resolveProviderAdapter ?? resolveConfiguredR6ProviderAdapter;

  const event = await database.outboxEvent.findUnique({
    where: { id: eventId },
    select: {
      id: true,
      ownerOrganizationId: true,
      eventType: true,
      payload: true,
      idempotencyKey: true,
      status: true,
      attempts: {
        orderBy: { attemptNumber: "desc" },
        take: 1,
        select: { attemptNumber: true, startedAt: true },
      },
    },
  });
  if (!event) throw new R6WorkerError("EVENT_NOT_FOUND");
  if (event.status === "SUCCEEDED") return { eventId, replay: true as const };
  if (event.status === "RUNNING") {
    const latest = event.attempts[0];
    if (!latest || now.getTime() - latest.startedAt.getTime() < 5 * 60 * 1000) {
      throw new R6WorkerError("EVENT_BUSY");
    }
  }
  if (!["PENDING", "FAILED", "RUNNING"].includes(event.status)) {
    throw new R6WorkerError("EVENT_INVALID");
  }

  const attemptNumber = (event.attempts[0]?.attemptNumber ?? 0) + 1;
  const claimed = await database.outboxEvent.updateMany({
    where: { id: event.id, status: event.status },
    data: { status: "RUNNING" },
  });
  if (claimed.count !== 1) throw new R6WorkerError("EVENT_BUSY");

  const attempt = await database.outboxDeliveryAttempt.create({
    data: {
      id: randomUUID(),
      outboxEventId: event.id,
      attemptNumber,
      status: "RUNNING",
      startedAt: now,
      requestHash: canonicalCommsEvidenceHash(event.payload),
    },
    select: { id: true },
  });

  try {
    let result: unknown;
    if (event.eventType === "R6_COMMS_CAMPAIGN_LAUNCH") {
      const parsed = launchSchema.safeParse(event.payload);
      if (!parsed.success) throw new R6WorkerError("EVENT_INVALID");
      if (parsed.data.actor.organizationId !== event.ownerOrganizationId) {
        throw new R6WorkerError("EVENT_INVALID");
      }
      result = await handleLaunch(event.id, parsed.data, database, now);
    } else if (event.eventType === "R6_COMMS_RECIPIENT_DISPATCH") {
      const parsed = dispatchSchema.safeParse(event.payload);
      if (!parsed.success) throw new R6WorkerError("EVENT_INVALID");
      if (parsed.data.actor.organizationId !== event.ownerOrganizationId) {
        throw new R6WorkerError("EVENT_INVALID");
      }
      result = await handleDispatch(
        event.id,
        event.idempotencyKey,
        parsed.data,
        database,
        now,
        resolveAdapter,
      );
    } else {
      throw new R6WorkerError("EVENT_INVALID");
    }

    const responseHash = canonicalCommsEvidenceHash(result);
    await database.$transaction([
      database.outboxDeliveryAttempt.update({
        where: { id: attempt.id },
        data: {
          status: "SUCCEEDED",
          finishedAt: new Date(),
          responseHash,
        },
      }),
      database.outboxEvent.update({
        where: { id: event.id },
        data: { status: "SUCCEEDED", publishedAt: new Date() },
      }),
    ]);
    return { eventId: event.id, replay: false as const, result };
  } catch (error) {
    await database.$transaction([
      database.outboxDeliveryAttempt.update({
        where: { id: attempt.id },
        data: {
          status: "FAILED",
          finishedAt: new Date(),
          errorCode:
            error instanceof R6WorkerError ? error.code : "UNEXPECTED",
          errorSummary: "R6 worker execution failed closed.",
        },
      }),
      database.outboxEvent.update({
        where: { id: event.id },
        data: { status: "FAILED" },
      }),
    ]);
    throw error;
  }
}
