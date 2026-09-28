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
  createMeeting,
  rescheduleMeeting,
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

  it("pins a campaign to its selected sequence version while later versions evolve", async () => {
    const sequence = mustOk(
      await createSequence(context(), { name: "Pinned campaign sequence" }, database),
    );
    const sender = mustOk(
      await createSendingAccount(
        context(),
        { provider: "test", address: "pinned-sequence@example.invalid" },
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
          title: "Pinned sequence list",
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
          name: "Pinned sequence list",
        },
      });
    });
    const campaign = mustOk(
      await createCampaign(
        context(),
        {
          name: "Pinned campaign",
          leadListId,
          sequenceId: sequence.id,
          sendingAccountId: sender.id,
        },
        database,
      ),
    );
    await createSequenceVersion(
      context(),
      { sequenceId: sequence.id, expectedRowVersion: 1 },
      database,
    );
    const persisted = await database.commsOutreachCampaign.findUniqueOrThrow({
      where: { id: campaign.id },
      select: { sequenceVersion: true },
    });
    expect(persisted.sequenceVersion).toBe(1);
  });

  it("reschedules atomically and preserves append-only schedule history", async () => {
    const startsAt = new Date("2026-10-01T09:00:00.000Z");
    const endsAt = new Date("2026-10-01T09:30:00.000Z");
    const meeting = mustOk(
      await createMeeting(
        context(),
        { title: "History meeting", meetingType: "SALES", startsAt, endsAt, timezone: "UTC" },
        database,
      ),
    );
    const nextStartsAt = new Date("2026-10-02T10:00:00.000Z");
    const nextEndsAt = new Date("2026-10-02T10:45:00.000Z");
    const result = await rescheduleMeeting(
      context(),
      {
        meetingId: meeting.id,
        expectedRowVersion: 1,
        startsAt: nextStartsAt,
        endsAt: nextEndsAt,
        timezone: "Europe/Berlin",
        reason: "Customer requested",
      },
      database,
    );
    expect(result).toEqual({ kind: "ok", value: { meetingId: meeting.id, rowVersion: 2 } });

    const history = await database.commsMeetingNote.findFirstOrThrow({
      where: { meetingId: meeting.id, visibility: "INTERNAL", body: "Meeting rescheduled" },
    });
    expect(history.body).toBe("Meeting rescheduled");
    expect(history.decisions).toMatchObject({
      kind: "MEETING_RESCHEDULE_HISTORY",
      from: { startsAt: startsAt.toISOString(), endsAt: endsAt.toISOString(), timezone: "UTC" },
      to: { startsAt: nextStartsAt.toISOString(), endsAt: nextEndsAt.toISOString(), timezone: "Europe/Berlin" },
      meetingVersion: 2,
      reason: "Customer requested",
    });

    await expect(
      database.commsMeetingNote.update({
        where: { id: history.id },
        data: { body: "tampered" },
      }),
    ).rejects.toThrow();

    const stale = await rescheduleMeeting(
      context(),
      {
        meetingId: meeting.id,
        expectedRowVersion: 1,
        startsAt: new Date("2026-10-03T10:00:00.000Z"),
        endsAt: new Date("2026-10-03T11:00:00.000Z"),
        timezone: "UTC",
      },
      database,
    );
    expect(stale).toEqual({ kind: "error", code: "STALE_WRITE" });
    expect(
      await database.commsMeetingNote.count({ where: { meetingId: meeting.id, visibility: "INTERNAL", body: "Meeting rescheduled" } }),
    ).toBe(1);
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

  it("fails malformed conversation assignee identifiers closed without mutating the conversation", async () => {
    const conversation = mustOk(
      await createConversation(
        context(),
        { channel: "EMAIL", subject: "Malformed assignee attack" },
        database,
      ),
    );

    const result = await assignConversation(
      context(),
      {
        conversationId: conversation.id,
        assigneeMembershipId: "not-a-uuid",
        expectedRowVersion: 1,
      },
      database,
    );

    expect(result).toEqual({ kind: "error", code: "INVALID" });
    const persisted = await database.commsConversation.findUniqueOrThrow({
      where: { id: conversation.id },
      select: { assignedMembershipId: true, rowVersion: true },
    });
    expect(persisted).toEqual({ assignedMembershipId: null, rowVersion: 1 });
  });

  it("rejects inactive and cross-tenant conversation assignees without assignment residue", async () => {
    const inactiveMembershipId = crypto.randomUUID();
    await database.organizationMembership.create({
      data: {
        id: inactiveMembershipId,
        organizationId,
        userAccountId: seedIds.user.operator,
        membershipType: "STAFF",
        status: "SUSPENDED",
      },
    });

    const foreignOrganizationId = crypto.randomUUID();
    const foreignMembershipId = crypto.randomUUID();
    await database.organization.create({
      data: {
        id: foreignOrganizationId,
        organizationType: "PLATFORM",
        legalName: "Foreign Communications Assignee Org",
        displayName: "Foreign Communications Assignee",
        slug: "comms-assignee-" + foreignOrganizationId.slice(0, 8),
        status: "ACTIVE",
      },
    });
    await database.organizationMembership.create({
      data: {
        id: foreignMembershipId,
        organizationId: foreignOrganizationId,
        userAccountId: seedIds.user.operator,
        membershipType: "STAFF",
        status: "ACTIVE",
        joinedAt: now,
      },
    });

    const conversation = mustOk(
      await createConversation(
        context(),
        { channel: "EMAIL", subject: "Assignee tenant attack" },
        database,
      ),
    );

    expect(
      await assignConversation(
        context(),
        {
          conversationId: conversation.id,
          assigneeMembershipId: inactiveMembershipId,
          expectedRowVersion: 1,
        },
        database,
      ),
    ).toEqual({ kind: "error", code: "INVALID" });

    expect(
      await assignConversation(
        context(),
        {
          conversationId: conversation.id,
          assigneeMembershipId: foreignMembershipId,
          expectedRowVersion: 1,
        },
        database,
      ),
    ).toEqual({ kind: "error", code: "INVALID" });

    const persisted = await database.commsConversation.findUniqueOrThrow({
      where: { id: conversation.id },
      select: { assignedMembershipId: true, rowVersion: true },
    });
    expect(persisted).toEqual({ assignedMembershipId: null, rowVersion: 1 });
  });

  it("contains concurrent sequence-version creation to one canonical next version", async () => {
    const sequence = mustOk(
      await createSequence(context(), { name: "Concurrent version sequence" }, database),
    );

    const results = await Promise.all([
      createSequenceVersion(
        context(),
        { sequenceId: sequence.id, expectedRowVersion: 1 },
        database,
      ),
      createSequenceVersion(
        context(),
        { sequenceId: sequence.id, expectedRowVersion: 1 },
        database,
      ),
    ]);

    expect(results.filter((result) => result.kind === "ok")).toHaveLength(1);
    expect(results.filter((result) => result.kind === "error")).toHaveLength(1);

    const persisted = await database.commsSequence.findUniqueOrThrow({
      where: { id: sequence.id },
      select: { currentVersion: true, rowVersion: true },
    });
    expect(persisted).toEqual({ currentVersion: 2, rowVersion: 2 });
  });

  it("rejects meeting-history delete and relabel attacks while preserving sequential chronology", async () => {
    const firstStartsAt = new Date("2026-11-01T09:00:00.000Z");
    const firstEndsAt = new Date("2026-11-01T09:30:00.000Z");
    const meeting = mustOk(
      await createMeeting(
        context(),
        {
          title: "Chronology attack meeting",
          meetingType: "SALES",
          startsAt: firstStartsAt,
          endsAt: firstEndsAt,
          timezone: "UTC",
        },
        database,
      ),
    );

    const secondStartsAt = new Date("2026-11-02T10:00:00.000Z");
    const secondEndsAt = new Date("2026-11-02T10:45:00.000Z");
    expect(
      await rescheduleMeeting(
        context(),
        {
          meetingId: meeting.id,
          expectedRowVersion: 1,
          startsAt: secondStartsAt,
          endsAt: secondEndsAt,
          timezone: "Europe/Berlin",
          reason: "First move",
        },
        database,
      ),
    ).toEqual({ kind: "ok", value: { meetingId: meeting.id, rowVersion: 2 } });

    const firstHistory = await database.commsMeetingNote.findFirstOrThrow({
      where: {
        meetingId: meeting.id,
        visibility: "INTERNAL",
        body: "Meeting rescheduled",
      },
      orderBy: { createdAt: "asc" },
    });

    await expect(
      database.commsMeetingNote.delete({ where: { id: firstHistory.id } }),
    ).rejects.toThrow();
    await expect(
      database.commsMeetingNote.update({
        where: { id: firstHistory.id },
        data: { decisions: { kind: "ORDINARY_NOTE" } },
      }),
    ).rejects.toThrow();

    const thirdStartsAt = new Date("2026-11-03T11:00:00.000Z");
    const thirdEndsAt = new Date("2026-11-03T11:30:00.000Z");
    expect(
      await rescheduleMeeting(
        context(),
        {
          meetingId: meeting.id,
          expectedRowVersion: 2,
          startsAt: thirdStartsAt,
          endsAt: thirdEndsAt,
          timezone: "UTC",
          reason: "Second move",
        },
        database,
      ),
    ).toEqual({ kind: "ok", value: { meetingId: meeting.id, rowVersion: 3 } });

    const history = await database.commsMeetingNote.findMany({
      where: {
        meetingId: meeting.id,
        visibility: "INTERNAL",
        body: "Meeting rescheduled",
      },
      orderBy: { createdAt: "asc" },
      select: { decisions: true },
    });
    expect(history).toHaveLength(2);
    expect(history[0]?.decisions).toMatchObject({
      kind: "MEETING_RESCHEDULE_HISTORY",
      meetingVersion: 2,
      from: { startsAt: firstStartsAt.toISOString(), endsAt: firstEndsAt.toISOString(), timezone: "UTC" },
      to: { startsAt: secondStartsAt.toISOString(), endsAt: secondEndsAt.toISOString(), timezone: "Europe/Berlin" },
    });
    expect(history[1]?.decisions).toMatchObject({
      kind: "MEETING_RESCHEDULE_HISTORY",
      meetingVersion: 3,
      from: { startsAt: secondStartsAt.toISOString(), endsAt: secondEndsAt.toISOString(), timezone: "Europe/Berlin" },
      to: { startsAt: thirdStartsAt.toISOString(), endsAt: thirdEndsAt.toISOString(), timezone: "UTC" },
    });
  });

  it("contains concurrent meeting reschedules to one schedule and one history record", async () => {
    const meeting = mustOk(
      await createMeeting(
        context(),
        {
          title: "Concurrent reschedule attack",
          meetingType: "SALES",
          startsAt: new Date("2026-12-01T09:00:00.000Z"),
          endsAt: new Date("2026-12-01T09:30:00.000Z"),
          timezone: "UTC",
        },
        database,
      ),
    );

    const results = await Promise.all([
      rescheduleMeeting(
        context(),
        {
          meetingId: meeting.id,
          expectedRowVersion: 1,
          startsAt: new Date("2026-12-02T09:00:00.000Z"),
          endsAt: new Date("2026-12-02T09:30:00.000Z"),
          timezone: "UTC",
          reason: "Race A",
        },
        database,
      ),
      rescheduleMeeting(
        context(),
        {
          meetingId: meeting.id,
          expectedRowVersion: 1,
          startsAt: new Date("2026-12-03T09:00:00.000Z"),
          endsAt: new Date("2026-12-03T09:30:00.000Z"),
          timezone: "UTC",
          reason: "Race B",
        },
        database,
      ),
    ]);

    expect(results.filter((result) => result.kind === "ok")).toHaveLength(1);
    expect(results.filter((result) => result.kind === "error")).toHaveLength(1);
    expect(
      await database.commsMeetingNote.count({
        where: {
          meetingId: meeting.id,
          visibility: "INTERNAL",
          body: "Meeting rescheduled",
        },
      }),
    ).toBe(1);

    const persisted = await database.commsMeeting.findUniqueOrThrow({
      where: { id: meeting.id },
      select: { rowVersion: true },
    });
    expect(persisted.rowVersion).toBe(2);
  });

});
