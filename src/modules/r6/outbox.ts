import "server-only";

import { createHash, randomUUID } from "node:crypto";

import { Prisma, type PrismaClient } from "@/generated/prisma/client";
import type { AuthorizedRequestContext } from "@/modules/foundation/request-context";
import type { AuthorizationResourceContext } from "@/modules/authorization/types";
import { canonicalCommsEvidenceHash } from "@/modules/comms/snapshot";
import { getPrismaClient } from "@/modules/persistence/client";

const RUNTIME_ROLE = "perspective_runtime";

export class R6OutboxError extends Error {
  constructor(readonly code: "INVALID" | "IDEMPOTENCY_CONFLICT" | "CONFLICT") {
    super(code);
  }
}

export interface R6ActorEvidence {
  readonly userAccountId: string;
  readonly membershipId: string;
  readonly organizationId: string;
  readonly sessionId: string;
  readonly sessionIssuedAt: string;
  readonly sessionExpiresAt: string;
  readonly mfaVerifiedAt: string | null;
}

export function actorEvidenceFromContext(
  context: AuthorizedRequestContext,
): R6ActorEvidence {
  return {
    userAccountId: context.identity.userId,
    membershipId: context.membership.membershipId,
    organizationId: context.tenant.organizationId,
    sessionId: context.session.sessionId,
    sessionIssuedAt: context.session.issuedAt.toISOString(),
    sessionExpiresAt: context.session.expiresAt.toISOString(),
    mfaVerifiedAt: context.session.mfaVerifiedAt?.toISOString() ?? null,
  };
}

export interface R6CampaignLaunchPayload {
  readonly type: "R6_COMMS_CAMPAIGN_LAUNCH";
  readonly campaignId: string;
  readonly expectedRowVersion: number;
  readonly reason: string;
  readonly actor: R6ActorEvidence;
  readonly requestHash: string;
  readonly requestedAt: string;
}

function databaseIdempotencyKey(
  organizationId: string,
  scope: string,
  suppliedKey: string,
) {
  return createHash("sha256")
    .update(`${organizationId}:${scope}:${suppliedKey}`)
    .digest("hex");
}

function payloadRequestHash(value: Prisma.JsonValue) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return undefined;
  const requestHash = (value as Record<string, Prisma.JsonValue>).requestHash;
  return typeof requestHash === "string" ? requestHash : undefined;
}

export async function queueR6CampaignLaunch(
  context: AuthorizedRequestContext,
  resource: AuthorizationResourceContext,
  input: {
    readonly campaignId: string;
    readonly expectedRowVersion: number;
    readonly reason: string;
    readonly idempotencyKey: string;
  },
  database: PrismaClient = getPrismaClient(),
) {
  if (!resource.resourceId) throw new R6OutboxError("INVALID");

  const actor = actorEvidenceFromContext(context);
  const requestedAt = new Date().toISOString();
  const requestHash = canonicalCommsEvidenceHash({
    campaignId: input.campaignId,
    expectedRowVersion: input.expectedRowVersion,
    reason: input.reason.trim(),
    actor,
  });
  const idempotencyKey = databaseIdempotencyKey(
    context.tenant.organizationId,
    "R6_COMMS_CAMPAIGN_LAUNCH",
    input.idempotencyKey,
  );
  const payload: R6CampaignLaunchPayload = {
    type: "R6_COMMS_CAMPAIGN_LAUNCH",
    campaignId: input.campaignId,
    expectedRowVersion: input.expectedRowVersion,
    reason: input.reason.trim(),
    actor,
    requestHash,
    requestedAt,
  };

  return database.$transaction(
    async (transaction) => {
      await transaction.$executeRawUnsafe(`SET LOCAL ROLE ${RUNTIME_ROLE}`);
      await transaction.$queryRaw`
        SELECT
          set_config('app.organization_id', ${context.tenant.organizationId}, true),
          set_config('app.client_organization_id', '', true)
      `;

      const existing = await transaction.outboxEvent.findUnique({
        where: { idempotencyKey },
        select: { id: true, payload: true },
      });
      if (existing) {
        if (payloadRequestHash(existing.payload) !== requestHash) {
          throw new R6OutboxError("IDEMPOTENCY_CONFLICT");
        }
        return { eventId: existing.id, replay: true as const };
      }

      try {
        const event = await transaction.outboxEvent.create({
          data: {
            id: randomUUID(),
            ownerOrganizationId: context.tenant.organizationId,
            aggregateResourceId: resource.resourceId,
            eventType: payload.type,
            schemaVersion: 1,
            payload: payload as unknown as Prisma.InputJsonValue,
            idempotencyKey,
            status: "PENDING",
            availableAt: new Date(),
          },
          select: { id: true },
        });
        return { eventId: event.id, replay: false as const };
      } catch (error) {
        if (
          error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === "P2002"
        ) {
          throw new R6OutboxError("CONFLICT");
        }
        throw error;
      }
    },
    { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
  );
}
