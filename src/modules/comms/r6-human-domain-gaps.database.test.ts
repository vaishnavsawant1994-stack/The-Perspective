import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { seedIds } from "../../../prisma/seed/stable-ids";
import type {
  MembershipId,
  OrganizationId,
  TenantScopedRequestContext,
  UserId,
} from "@/modules/foundation/request-context";
import { createPrismaClient } from "@/modules/persistence/client";
import type { CommsResult } from "./types";
import {
  addSequenceStep,
  assignConversation,
  createCampaign,
  createConversation,
  createInternalNote,
  createSendingAccount,
  createSequence,
  createSequenceVersion,
  updateCampaignDraft,
  updateSendingAccount,
} from "./core";

const database = createPrismaClient();
const now = new Date("2026-09-28T06:00:00.000Z");
const organizationId = crypto.randomUUID();
const membershipId = crypto.randomUUID();

function context(): TenantScopedRequestContext {
  return {
    authentication: "authenticated",
    scope: "tenant",
    requestId: "comms-domain-gap",
    identity: { userId: seedIds.user.operator as UserId },
    session: {
      sessionId: "comms-domain-gap-session" as never,
      issuedAt: now,
      expiresAt: new Date(now.getTime() + 3_600_000),
      authenticationMethod: "TEST",
    },
    membership: {
      membershipId: membershipId as MembershipId,
      organizationId: organizationId as OrganizationId,
      surface: "TEAM",
    },
    tenant: {
      membershipId: membershipId as MembershipId,
      organizationId: organizationId as OrganizationId,
      surface: "TEAM",
    },
  };
}

function mustOk<T>(result: CommsResult<T>): T {
  if (result.kind !== "ok") throw new Error("fixture failed: " + result.code);
  return result.value;
}

beforeAll(async () => {
  await database.organization.create({
    data: {
      id: organizationId,
      organizationType: "PLATFORM",
      legalName: "Communications Domain Gap Org",
      displayName: "Communications Domain Gap",
      slug: "comms-gap-" + organizationId.slice(0, 8),
      status: "ACTIVE",
    },
  });
  await database.organizationMembership.create({
    data: {
      id: membershipId,
      organizationId,
      userAccountId: seedIds.user.operator,
      membershipType: "STAFF",
      status: "ACTIVE",
      joinedAt: now,
    },
  });
});

afterAll(async () => database.$disconnect());

describe("R6 Communications human-owned domain gaps", () => {
  it("updates only human-owned sending-account configuration and preserves provider health truth", async () => {
    const account = mustOk(
      await createSendingAccount(
        context(),
        {
          provider: "test",
          address: "domain-gap@example.invalid",
          displayName: "Before",
          dailyLimit: 50,
        },
        database,
      ),
    );
    await database.commsSendingAccount.update({
      where: { id: account.id },
      data: { health: "HEALTHY", syncState: "CONNECTED", lastSyncAt: now },
    });

    const result = await updateSendingAccount(
      context(),
      {
        sendingAccountId: account.id,
        expectedRowVersion: 1,
        displayName: "After",
        dailyLimit: 75,
        hourlyLimit: 10,
      },
      database,
    );
    expect(result.kind).toBe("ok");

    const persisted = await database.commsSendingAccount.findUniqueOrThrow({
      where: { id: account.id },
    });
    expect(persisted).toMatchObject({
      displayName: "After",
      dailyLimit: 75,
      hourlyLimit: 10,
      health: "HEALTHY",
      syncState: "CONNECTED",
      lastSyncAt: now,
      rowVersion: 2,
    });

    const stale = await updateSendingAccount(
      context(),
      {
        sendingAccountId: account.id,
        expectedRowVersion: 1,
        displayName: "stale",
      },
      database,
    );
    expect(stale).toEqual({ kind: "error", code: "STALE_WRITE" });
  });

  it("creates a new sequence version instead of mutating the previous version", async () => {
    const sequence = mustOk(
      await createSequence(context(), { name: "Versioned sequence" }, database),
    );

    const version = await createSequenceVersion(
      context(),
      { sequenceId: sequence.id, expectedRowVersion: 1 },
      database,
    );
    expect(version).toEqual({
      kind: "ok",
      value: expect.objectContaining({
        sequenceId: sequence.id,
        sequenceVersion: 2,
        rowVersion: 2,
      }),
    });

    const step = await addSequenceStep(
      context(),
      {
        sequenceId: sequence.id,
        expectedSequenceVersion: 1,
        position: 1,
        channel: "EMAIL",
        templateVersionId: crypto.randomUUID(),
      },
      database,
    );
    expect(step).toEqual({ kind: "error", code: "STALE_WRITE" });
  });

  it("permits guarded campaign draft edits without accepting counters or lifecycle truth", async () => {
    const sequence = mustOk(
      await createSequence(context(), { name: "Campaign edit sequence" }, database),
    );
    const sender = mustOk(
      await createSendingAccount(
        context(),
        { provider: "test", address: "campaign-edit@example.invalid" },
        database,
      ),
    );

    const leadListResourceId = crypto.randomUUID();
    const leadListId = crypto.randomUUID();
    await database.$transaction(async (tx) => {
      await tx.resource.create({
        data: {
          id: leadListResourceId,
          resourceType: "lead-list",
          title: "Campaign edit list",
          ownerOrganizationId: organizationId,
          visibility: "INTERNAL",
          sensitivity: "CONFIDENTIAL",
        },
      });
      await tx.crmLeadList.create({
        data: {
          id: leadListId,
          resourceId: leadListResourceId,
          ownerOrganizationId: organizationId,
          ownerMembershipId: membershipId,
          name: "Campaign edit list",
        },
      });
    });

    const campaign = mustOk(
      await createCampaign(
        context(),
        {
          name: "Before campaign",
          leadListId,
          sequenceId: sequence.id,
          sendingAccountId: sender.id,
        },
        database,
      ),
    );

    const result = await updateCampaignDraft(
      context(),
      {
        campaignId: campaign.id,
        expectedRowVersion: 1,
        name: "After campaign",
        schedule: { timezone: "UTC" },
      },
      database,
    );
    expect(result.kind).toBe("ok");

    const persisted = await database.commsOutreachCampaign.findUniqueOrThrow({
      where: { id: campaign.id },
    });
    expect(persisted).toMatchObject({
      name: "After campaign",
      status: "DRAFT",
      recipientCount: 0,
      sentCount: 0,
      replyCount: 0,
      rowVersion: 2,
    });
  });

  it("separates conversation assignment from internal-note evidence", async () => {
    const conversation = mustOk(
      await createConversation(
        context(),
        { channel: "EMAIL", subject: "Human handling" },
        database,
      ),
    );

    const assigned = await assignConversation(
      context(),
      {
        conversationId: conversation.id,
        assigneeMembershipId: membershipId,
        expectedRowVersion: 1,
      },
      database,
    );
    expect(assigned.kind).toBe("ok");

    const note = await createInternalNote(
      context(),
      {
        conversationId: conversation.id,
        bodyText: "Staff-only note",
      },
      database,
    );
    expect(note.kind).toBe("ok");

    const message = await database.commsMessage.findFirstOrThrow({
      where: { conversationId: conversation.id },
      orderBy: { createdAt: "desc" },
    });
    expect(message).toMatchObject({
      direction: "INTERNAL",
      visibility: "INTERNAL",
      isInternalNote: true,
      provider: null,
      externalId: null,
      sentAt: null,
      receivedAt: null,
    });
  });
});
