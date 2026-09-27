import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { seedIds } from "../../../prisma/seed/stable-ids";
import type {
  MembershipId,
  OrganizationId,
  TenantScopedRequestContext,
  UserId,
} from "@/modules/foundation/request-context";
import { createPrismaClient } from "@/modules/persistence/client";
import {
  createCompany,
  createContact,
  createLead,
  createLeadList,
  createSuppressionEntry,
  suppressLead,
} from "@/modules/crm/core";

import {
  addCampaignRecipient,
  addSequenceStep,
  createCampaign,
  createConversation,
  createMeeting,
  createSendingAccount,
  createSequence,
  evaluateDispatchSafety,
  recordDeliveryEvent,
  recordMessage,
  transitionCampaign,
  transitionConversation,
  transitionMeeting,
} from "./core";
import { hashNormalizedDestination } from "./safety";
import type { CommsResult } from "./types";

const database = createPrismaClient();
const epoch = new Date("2026-09-27T11:35:00.000Z");
const primaryOrganizationId = crypto.randomUUID();
const secondaryOrganizationId = crypto.randomUUID();
const primaryMembershipId = crypto.randomUUID();
const secondaryMembershipId = crypto.randomUUID();

function teamContext(input: {
  organizationId: string;
  membershipId: string;
  userId: string;
  requestId: string;
}): TenantScopedRequestContext {
  return {
    authentication: "authenticated",
    scope: "tenant",
    requestId: input.requestId,
    identity: { userId: input.userId as UserId },
    session: {
      sessionId: ("comms-falsify-" + input.requestId) as never,
      issuedAt: epoch,
      expiresAt: new Date(epoch.getTime() + 60 * 60 * 1000),
      authenticationMethod: "TEST",
    },
    membership: {
      membershipId: input.membershipId as MembershipId,
      organizationId: input.organizationId as OrganizationId,
      surface: "TEAM",
    },
    tenant: {
      organizationId: input.organizationId as OrganizationId,
      membershipId: input.membershipId as MembershipId,
      surface: "TEAM",
    },
  };
}

const platform = teamContext({
  organizationId: primaryOrganizationId,
  membershipId: primaryMembershipId,
  userId: seedIds.user.operator,
  requestId: "r6-comms-platform",
});

const foreign = teamContext({
  organizationId: secondaryOrganizationId,
  membershipId: secondaryMembershipId,
  userId: seedIds.user.asteriaAdmin,
  requestId: "r6-comms-foreign",
});

function mustOk<T>(result: CommsResult<T>): T {
  if (result.kind !== "ok") throw new Error("Communications fixture failed: " + result.code);
  return result.value;
}

function mustCrmOk<T>(result: { kind: "ok"; value: T } | { kind: "error"; code: string }): T {
  if (result.kind !== "ok") throw new Error("CRM communications fixture failed: " + result.code);
  return result.value;
}

async function count(sql: string, ...params: readonly (string | number | Date)[]) {
  const rows = await database.$queryRawUnsafe<Array<{ count: bigint }>>(sql, ...params);
  return Number(rows[0]?.count ?? 0);
}

async function resourceCount(organizationId: string, resourceType: string) {
  return count(
    `SELECT count(*)::bigint AS count
       FROM platform.resources
      WHERE owner_organization_id = $1::uuid
        AND resource_type = $2::text`,
    organizationId,
    resourceType,
  );
}

async function importApprovedTemplate(input: {
  organizationId: string;
  membershipId: string;
  name: string;
}) {
  const resourceId = crypto.randomUUID();
  const templateId = crypto.randomUUID();
  const versionId = crypto.randomUUID();

  await database.$transaction(async (transaction) => {
    await transaction.$queryRawUnsafe(
      `SELECT set_config('app.r6_template_import', 'on', true)`,
    );
    await transaction.$executeRawUnsafe(
      `INSERT INTO platform.resources (
         id, resource_type, title, owner_organization_id, visibility, sensitivity, created_at
       ) VALUES ($1::uuid, 'message-template', $2::text, $3::uuid, 'INTERNAL', 'STANDARD', CURRENT_TIMESTAMP)`,
      resourceId,
      input.name,
      input.organizationId,
    );
    await transaction.$executeRawUnsafe(
      `INSERT INTO comms.message_templates (
         id, resource_id, owner_organization_id, owner_membership_id,
         visibility, sensitivity, name, channel, status, row_version,
         created_by_membership_id, updated_by_membership_id, created_at, updated_at
       ) VALUES (
         $1::uuid, $2::uuid, $3::uuid, $4::uuid,
         'INTERNAL', 'STANDARD', $5::text, 'EMAIL', 'APPROVED', 1,
         $4::uuid, $4::uuid, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
       )`,
      templateId,
      resourceId,
      input.organizationId,
      input.membershipId,
      input.name,
    );
    await transaction.$executeRawUnsafe(
      `INSERT INTO comms.message_template_versions (
         id, owner_organization_id, template_id, version, subject, body,
         variables, content_hash, approved_at, approved_by_membership_id, created_at
       ) VALUES (
         $1::uuid, $2::uuid, $3::uuid, 1, 'Subject', 'Body', '[]'::jsonb,
         $4::text, CURRENT_TIMESTAMP, $5::uuid, CURRENT_TIMESTAMP
       )`,
      versionId,
      input.organizationId,
      templateId,
      "hash-" + versionId,
      input.membershipId,
    );
    await transaction.$executeRawUnsafe(
      `UPDATE comms.message_templates
          SET current_version_id = $1::uuid
        WHERE id = $2::uuid`,
      versionId,
      templateId,
    );
  });

  return { templateId, versionId };
}

let fixture!: {
  ownCompanyId: string;
  ownContactId: string;
  ownLeadId: string;
  ownLeadListId: string;
  ownTemplateVersionId: string;
  ownSequenceId: string;
  ownSendingAccountId: string;
  ownCampaignId: string;
  ownRecipientId: string;
  foreignLeadId: string;
  foreignLeadListId: string;
  foreignTemplateVersionId: string;
  foreignSequenceId: string;
  foreignSendingAccountId: string;
  foreignConversationId: string;
};

beforeAll(async () => {
  await database.organization.createMany({
    data: [
      {
        id: primaryOrganizationId,
        organizationType: "PLATFORM",
        legalName: "R6 Comms Primary Test Org",
        displayName: "R6 Comms Primary",
        slug: "r6-comms-primary-" + primaryOrganizationId.slice(0, 8),
        status: "ACTIVE",
      },
      {
        id: secondaryOrganizationId,
        organizationType: "PLATFORM",
        legalName: "R6 Comms Secondary Test Org",
        displayName: "R6 Comms Secondary",
        slug: "r6-comms-secondary-" + secondaryOrganizationId.slice(0, 8),
        status: "ACTIVE",
      },
    ],
  });
  await database.organizationMembership.createMany({
    data: [
      {
        id: primaryMembershipId,
        organizationId: primaryOrganizationId,
        userAccountId: seedIds.user.operator,
        membershipType: "STAFF",
        status: "ACTIVE",
        joinedAt: epoch,
      },
      {
        id: secondaryMembershipId,
        organizationId: secondaryOrganizationId,
        userAccountId: seedIds.user.asteriaAdmin,
        membershipType: "STAFF",
        status: "ACTIVE",
        joinedAt: epoch,
      },
    ],
  });
  const ownCompany = mustCrmOk(
    await createCompany(platform, { name: "COMMS Own Company" }, database),
  );
  const ownContact = mustCrmOk(
    await createContact(
      platform,
      {
        companyId: ownCompany.id,
        title: "COMMS Own Contact",
        emailOriginal: "comms-own@example.invalid",
        emailNormalized: "comms-own@example.invalid",
      },
      database,
    ),
  );
  const ownLead = mustCrmOk(
    await createLead(
      platform,
      {
        companyId: ownCompany.id,
        contactId: ownContact.id,
        sourceRecordKey: "comms-own-lead",
      },
      database,
    ),
  );
  const ownList = mustCrmOk(
    await createLeadList(platform, { name: "COMMS Own List" }, database),
  );
  const foreignCompany = mustCrmOk(
    await createCompany(foreign, { name: "COMMS Foreign Company" }, database),
  );
  const foreignLead = mustCrmOk(
    await createLead(
      foreign,
      { companyId: foreignCompany.id, sourceRecordKey: "comms-foreign-lead" },
      database,
    ),
  );
  const foreignList = mustCrmOk(
    await createLeadList(foreign, { name: "COMMS Foreign List" }, database),
  );

  const ownTemplate = await importApprovedTemplate({
    organizationId: primaryOrganizationId,
    membershipId: primaryMembershipId,
    name: "COMMS Own Approved Template",
  });
  const foreignTemplate = await importApprovedTemplate({
    organizationId: secondaryOrganizationId,
    membershipId: secondaryMembershipId,
    name: "COMMS Foreign Approved Template",
  });

  const ownSequence = mustOk(
    await createSequence(platform, { name: "COMMS Own Sequence" }, database),
  );
  mustOk(
    await addSequenceStep(
      platform,
      {
        sequenceId: ownSequence.id,
        expectedSequenceVersion: 1,
        position: 1,
        channel: "EMAIL",
        templateVersionId: ownTemplate.versionId,
      },
      database,
    ),
  );

  const foreignSequence = mustOk(
    await createSequence(foreign, { name: "COMMS Foreign Sequence" }, database),
  );
  const foreignSender = mustOk(
    await createSendingAccount(
      foreign,
      { provider: "test", address: "foreign-sender@example.invalid" },
      database,
    ),
  );

  const ownSender = mustOk(
    await createSendingAccount(
      platform,
      { provider: "test", address: "own-sender@example.invalid" },
      database,
    ),
  );
  await database.commsSendingAccount.update({
    where: { id: ownSender.id },
    data: { health: "HEALTHY", syncState: "CONNECTED" },
  });

  const ownCampaign = mustOk(
    await createCampaign(
      platform,
      {
        name: "COMMS Own Campaign",
        leadListId: ownList.id,
        sequenceId: ownSequence.id,
        sendingAccountId: ownSender.id,
      },
      database,
    ),
  );
  const ownRecipient = mustOk(
    await addCampaignRecipient(
      platform,
      { campaignId: ownCampaign.id, leadId: ownLead.id },
      database,
    ),
  );

  mustOk(
    await transitionCampaign(
      platform,
      {
        campaignId: ownCampaign.id,
        to: "READY",
        expectedRowVersion: 1,
        audienceSnapshotHash: "snapshot-own-v1",
      },
      database,
    ),
  );
  mustOk(
    await transitionCampaign(
      platform,
      { campaignId: ownCampaign.id, to: "APPROVED", expectedRowVersion: 2 },
      database,
    ),
  );
  mustOk(
    await transitionCampaign(
      platform,
      { campaignId: ownCampaign.id, to: "SCHEDULED", expectedRowVersion: 3 },
      database,
    ),
  );

  const foreignConversation = mustOk(
    await createConversation(
      foreign,
      { channel: "EMAIL", subject: "Foreign conversation", leadId: foreignLead.id },
      database,
    ),
  );

  fixture = {
    ownCompanyId: ownCompany.id,
    ownContactId: ownContact.id,
    ownLeadId: ownLead.id,
    ownLeadListId: ownList.id,
    ownTemplateVersionId: ownTemplate.versionId,
    ownSequenceId: ownSequence.id,
    ownSendingAccountId: ownSender.id,
    ownCampaignId: ownCampaign.id,
    ownRecipientId: ownRecipient.id,
    foreignLeadId: foreignLead.id,
    foreignLeadListId: foreignList.id,
    foreignTemplateVersionId: foreignTemplate.versionId,
    foreignSequenceId: foreignSequence.id,
    foreignSendingAccountId: foreignSender.id,
    foreignConversationId: foreignConversation.id,
  };
});

afterAll(async () => {
  await database.$disconnect();
});

describe("R6 communications command-layer falsification", () => {
  it("keeps template.manage dormant while allowing only approved same-tenant template references", async () => {
    const sequence = mustOk(
      await createSequence(platform, { name: "COMMS Template Boundary" }, database),
    );

    const foreign = await addSequenceStep(
      platform,
      {
        sequenceId: sequence.id,
        expectedSequenceVersion: 1,
        position: 1,
        channel: "EMAIL",
        templateVersionId: fixture.foreignTemplateVersionId,
      },
      database,
    );
    expect(foreign).toEqual({ kind: "error", code: "TEMPLATE_NOT_APPROVED" });

    await expect(
      database.$executeRawUnsafe(
        `UPDATE comms.message_templates
            SET name = 'runtime mutation attack'
          WHERE owner_organization_id = $1::uuid`,
        primaryOrganizationId,
      ),
    ).rejects.toMatchObject({ code: "P2010" });
  });

  it("rejects cross-tenant campaign relationships and rolls back the resource envelope", async () => {
    const before = await resourceCount(
      primaryOrganizationId,
      "outreach-campaign",
    );

    for (const attack of [
      {
        leadListId: fixture.foreignLeadListId,
        sequenceId: fixture.ownSequenceId,
        sendingAccountId: fixture.ownSendingAccountId,
      },
      {
        leadListId: fixture.ownLeadListId,
        sequenceId: fixture.foreignSequenceId,
        sendingAccountId: fixture.ownSendingAccountId,
      },
      {
        leadListId: fixture.ownLeadListId,
        sequenceId: fixture.ownSequenceId,
        sendingAccountId: fixture.foreignSendingAccountId,
      },
    ]) {
      const result = await createCampaign(
        platform,
        { name: "COMMS Cross Tenant Attack " + crypto.randomUUID(), ...attack },
        database,
      );
      expect(result.kind).toBe("error");
    }

    expect(
      await resourceCount(primaryOrganizationId, "outreach-campaign"),
    ).toBe(before);
  });

  it("rejects a foreign recipient identity with no campaign-recipient residue", async () => {
    const before = await count(
      `SELECT count(*)::bigint AS count
         FROM comms.campaign_recipients
        WHERE campaign_id = $1::uuid`,
      fixture.ownCampaignId,
    );

    const result = await addCampaignRecipient(
      platform,
      { campaignId: fixture.ownCampaignId, leadId: fixture.foreignLeadId },
      database,
    );

    expect(result.kind).toBe("error");
    expect(
      await count(
        `SELECT count(*)::bigint AS count
           FROM comms.campaign_recipients
          WHERE campaign_id = $1::uuid`,
        fixture.ownCampaignId,
      ),
    ).toBe(before);
  });

  it("performs dispatch-time sender and suppression checks", async () => {
    const safe = await evaluateDispatchSafety(
      platform,
      {
        campaignRecipientId: fixture.ownRecipientId,
        channel: "EMAIL",
        normalizedDestinationHash: "sha256:comms-safe",
      },
      database,
    );
    expect(safe.kind).toBe("ok");

    mustCrmOk(
      await createSuppressionEntry(
        platform,
        {
          channel: "EMAIL",
          normalizedDestinationHash: "sha256:comms-blocked",
          reason: "unsubscribe",
          source: "recipient",
        },
        database,
      ),
    );

    const blocked = await evaluateDispatchSafety(
      platform,
      {
        campaignRecipientId: fixture.ownRecipientId,
        channel: "EMAIL",
        normalizedDestinationHash: "sha256:comms-blocked",
      },
      database,
    );
    expect(blocked).toEqual({ kind: "error", code: "CONTACT_BLOCKED" });

    await database.commsSendingAccount.update({
      where: { id: fixture.ownSendingAccountId },
      data: { health: "UNHEALTHY" },
    });
    const unhealthy = await evaluateDispatchSafety(
      platform,
      {
        campaignRecipientId: fixture.ownRecipientId,
        channel: "EMAIL",
        normalizedDestinationHash: "sha256:comms-safe",
      },
      database,
    );
    expect(unhealthy).toEqual({ kind: "error", code: "SENDER_NOT_READY" });
    await database.commsSendingAccount.update({
      where: { id: fixture.ownSendingAccountId },
      data: { health: "HEALTHY" },
    });
  });

  it("stops dispatch after lead DNC even without a matching suppression hash", async () => {
    const company = mustCrmOk(
      await createCompany(platform, { name: "COMMS DNC Company" }, database),
    );
    const lead = mustCrmOk(
      await createLead(
        platform,
        { companyId: company.id, sourceRecordKey: "comms-dnc-lead" },
        database,
      ),
    );
    const recipient = mustOk(
      await addCampaignRecipient(
        platform,
        { campaignId: fixture.ownCampaignId, leadId: lead.id },
        database,
      ),
    );

    mustCrmOk(
      await suppressLead(
        platform,
        {
          leadId: lead.id,
          expectedRowVersion: 1,
          channel: "EMAIL",
          normalizedDestinationHash: "sha256:different-dnc-hash",
          reason: "legal",
          source: "system",
        },
        database,
      ),
    );

    const result = await evaluateDispatchSafety(
      platform,
      {
        campaignRecipientId: recipient.id,
        channel: "EMAIL",
        normalizedDestinationHash: "sha256:not-the-suppression-row",
      },
      database,
    );
    expect(result).toEqual({ kind: "error", code: "CONTACT_BLOCKED" });
  });

  it("keeps provider evidence idempotent and recipient state monotonic", async () => {
    const sent = await recordDeliveryEvent(
      platform,
      {
        campaignRecipientId: fixture.ownRecipientId,
        provider: "provider-a",
        externalEventId: "evt-sent-1",
        eventType: "SENT",
        occurredAt: epoch,
      },
      database,
    );
    expect(sent.kind).toBe("ok");

    const opened = await recordDeliveryEvent(
      platform,
      {
        campaignRecipientId: fixture.ownRecipientId,
        provider: "provider-a",
        externalEventId: "evt-opened-1",
        eventType: "OPENED",
        occurredAt: new Date(epoch.getTime() + 1000),
      },
      database,
    );
    expect(opened.kind).toBe("ok");

    const lateDelivered = await recordDeliveryEvent(
      platform,
      {
        campaignRecipientId: fixture.ownRecipientId,
        provider: "provider-a",
        externalEventId: "evt-delivered-late",
        eventType: "DELIVERED",
        occurredAt: new Date(epoch.getTime() + 2000),
      },
      database,
    );
    expect(lateDelivered.kind).toBe("ok");

    const recipient = await database.commsCampaignRecipient.findUniqueOrThrow({
      where: { id: fixture.ownRecipientId },
      select: { state: true },
    });
    expect(recipient.state).toBe("OPENED");

    const duplicate = await recordDeliveryEvent(
      platform,
      {
        campaignRecipientId: fixture.ownRecipientId,
        provider: "provider-a",
        externalEventId: "evt-opened-1",
        eventType: "OPENED",
        occurredAt: new Date(epoch.getTime() + 3000),
      },
      database,
    );
    expect(duplicate).toEqual({ kind: "error", code: "CONFLICT" });
    expect(
      await count(
        `SELECT count(*)::bigint AS count
           FROM comms.message_deliveries
          WHERE provider = 'provider-a'
            AND external_event_id = 'evt-opened-1'`,
      ),
    ).toBe(1);
  });

  it("rejects foreign conversation message writes and rolls back conversation resources", async () => {
    const result = await recordMessage(
      platform,
      {
        conversationId: fixture.foreignConversationId,
        direction: "INBOUND",
        bodyText: "cross-tenant message attack",
      },
      database,
    );
    expect(result.kind).toBe("error");

    const before = await resourceCount(
      primaryOrganizationId,
      "conversation",
    );
    const cross = await createConversation(
      platform,
      {
        channel: "EMAIL",
        subject: "cross-tenant lead conversation",
        leadId: fixture.foreignLeadId,
      },
      database,
    );
    expect(cross.kind).toBe("error");
    expect(
      await resourceCount(primaryOrganizationId, "conversation"),
    ).toBe(before);
  });

  it("guards conversation optimistic concurrency and illegal jumps", async () => {
    const conversation = mustOk(
      await createConversation(
        platform,
        { channel: "EMAIL", subject: "Lifecycle proof", leadId: fixture.ownLeadId },
        database,
      ),
    );

    const resolved = await transitionConversation(
      platform,
      {
        conversationId: conversation.id,
        to: "RESOLVED",
        expectedRowVersion: 1,
      },
      database,
    );
    expect(resolved.kind).toBe("ok");

    const stale = await transitionConversation(
      platform,
      {
        conversationId: conversation.id,
        to: "REOPENED",
        expectedRowVersion: 1,
      },
      database,
    );
    expect(stale).toEqual({ kind: "error", code: "STALE_WRITE" });

    const reopened = await transitionConversation(
      platform,
      {
        conversationId: conversation.id,
        to: "REOPENED",
        expectedRowVersion: 2,
      },
      database,
    );
    expect(reopened.kind).toBe("ok");

    const invalid = await transitionConversation(
      platform,
      {
        conversationId: conversation.id,
        to: "OPEN",
        expectedRowVersion: 3,
      },
      database,
    );
    expect(invalid).toEqual({ kind: "error", code: "TRANSITION_DENIED" });
  });

  it("guards meeting lifecycle and malformed schedules", async () => {
    const invalid = await createMeeting(
      platform,
      {
        title: "Bad meeting",
        meetingType: "DISCOVERY",
        startsAt: new Date("2026-09-28T10:00:00Z"),
        endsAt: new Date("2026-09-28T09:00:00Z"),
        timezone: "UTC",
      },
      database,
    );
    expect(invalid).toEqual({ kind: "error", code: "INVALID" });

    const meeting = mustOk(
      await createMeeting(
        platform,
        {
          title: "Good meeting",
          meetingType: "DISCOVERY",
          startsAt: new Date("2026-09-28T10:00:00Z"),
          endsAt: new Date("2026-09-28T11:00:00Z"),
          timezone: "UTC",
        },
        database,
      ),
    );

    const scheduled = await transitionMeeting(
      platform,
      { meetingId: meeting.id, to: "SCHEDULED", expectedRowVersion: 1 },
      database,
    );
    expect(scheduled.kind).toBe("ok");

    const skip = await transitionMeeting(
      platform,
      { meetingId: meeting.id, to: "COMPLETED", expectedRowVersion: 2 },
      database,
    );
    expect(skip).toEqual({ kind: "error", code: "TRANSITION_DENIED" });
  });

  it("does not let a caller-supplied suppression hash bypass canonical destination normalization", async () => {
    const canonicalHash = hashNormalizedDestination(
      "EMAIL",
      "COMMS-OWN@EXAMPLE.INVALID",
    );
    mustCrmOk(
      await createSuppressionEntry(
        platform,
        {
          channel: "EMAIL",
          normalizedDestinationHash: canonicalHash,
          reason: "canonical suppression",
          source: "recipient",
        },
        database,
      ),
    );

    const result = await evaluateDispatchSafety(
      platform,
      {
        campaignRecipientId: fixture.ownRecipientId,
        channel: "EMAIL",
        normalizedDestinationHash: "attacker-controlled-nonmatching-hash",
      },
      database,
    );

    expect(result).toEqual({ kind: "error", code: "CONTACT_BLOCKED" });
  });

  it("rejects recipient mutation after campaign approval so the frozen audience cannot drift", async () => {
    const company = mustCrmOk(
      await createCompany(platform, { name: "COMMS Frozen Audience Company" }, database),
    );
    const lead = mustCrmOk(
      await createLead(
        platform,
        { companyId: company.id, sourceRecordKey: "comms-frozen-audience" },
        database,
      ),
    );

    const before = await count(
      `SELECT count(*)::bigint AS count
         FROM comms.campaign_recipients
        WHERE campaign_id = $1::uuid`,
      fixture.ownCampaignId,
    );

    const result = await addCampaignRecipient(
      platform,
      { campaignId: fixture.ownCampaignId, leadId: lead.id },
      database,
    );

    expect(result).toEqual({ kind: "error", code: "TRANSITION_DENIED" });
    expect(
      await count(
        `SELECT count(*)::bigint AS count
           FROM comms.campaign_recipients
          WHERE campaign_id = $1::uuid`,
        fixture.ownCampaignId,
      ),
    ).toBe(before);
  });

  it("fails dispatch closed when a queued campaign is paused", async () => {
    await database.commsOutreachCampaign.update({
      where: { id: fixture.ownCampaignId },
      data: { status: "PAUSED" },
    });

    const result = await evaluateDispatchSafety(
      platform,
      {
        campaignRecipientId: fixture.ownRecipientId,
        channel: "EMAIL",
        normalizedDestinationHash: "sha256:paused-campaign",
      },
      database,
    );
    expect(result).toEqual({ kind: "error", code: "TRANSITION_DENIED" });

    await database.commsOutreachCampaign.update({
      where: { id: fixture.ownCampaignId },
      data: { status: "SCHEDULED" },
    });
  });

  it("does not create an outbound sent message without provider evidence", async () => {
    const conversation = mustOk(
      await createConversation(
        platform,
        { channel: "EMAIL", subject: "Provider evidence guard", leadId: fixture.ownLeadId },
        database,
      ),
    );
    const before = await count(
      `SELECT count(*)::bigint AS count
         FROM comms.messages
        WHERE conversation_id = $1::uuid`,
      conversation.id,
    );

    const result = await recordMessage(
      platform,
      {
        conversationId: conversation.id,
        direction: "OUTBOUND",
        bodyText: "caller claims this was sent",
      },
      database,
    );

    expect(result).toEqual({ kind: "error", code: "INVALID" });
    expect(
      await count(
        `SELECT count(*)::bigint AS count
           FROM comms.messages
          WHERE conversation_id = $1::uuid`,
        conversation.id,
      ),
    ).toBe(before);
  });

  it("does not allow Step 3 to activate provider launch implicitly", async () => {
    const result = await transitionCampaign(
      platform,
      {
        campaignId: fixture.ownCampaignId,
        to: "RUNNING",
        expectedRowVersion: 4,
      },
      database,
    );
    expect(result).toEqual({ kind: "error", code: "SENDER_NOT_READY" });
  });
});
