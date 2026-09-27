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
  recordQualification,
  transitionLeadLifecycle,
} from "@/modules/crm/core";
import { createMeeting, transitionMeeting } from "@/modules/comms/core";

import {
  addClientRelationship,
  convertDealToClient,
  createDeal,
  createDealPipeline,
  moveDeal,
  updateDealFields,
} from "./core";
import type { CommercialResult, CreateDealPipelineInput } from "./types";

const database = createPrismaClient();
const epoch = new Date("2026-09-27T12:25:00.000Z");
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
      sessionId: ("commercial-falsify-" + input.requestId) as never,
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
  requestId: "r6-commercial-platform",
});

const foreign = teamContext({
  organizationId: secondaryOrganizationId,
  membershipId: secondaryMembershipId,
  userId: seedIds.user.asteriaAdmin,
  requestId: "r6-commercial-foreign",
});

function mustOk<T>(result: CommercialResult<T>): T {
  if (result.kind !== "ok") {
    throw new Error("Commercial fixture failed: " + result.code);
  }
  return result.value;
}

function mustDomainOk<T>(
  result: { kind: "ok"; value: T } | { kind: "error"; code: string },
): T {
  if (result.kind !== "ok") {
    throw new Error("Commercial dependency fixture failed: " + result.code);
  }
  return result.value;
}

async function count(sql: string, ...params: readonly (string | number | Date)[]) {
  const rows = await database.$queryRawUnsafe<Array<{ count: bigint }>>(
    sql,
    ...params,
  );
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

const pipelineInput = (name: string): CreateDealPipelineInput => ({
  name,
  version: 1,
  stages: [
    { key: "qualified", name: "Qualified", position: 1, canonicalClass: "QUALIFIED", probability: 0.1 },
    { key: "interested", name: "Interested", position: 2, canonicalClass: "INTERESTED", probability: 0.2 },
    { key: "discovery-scheduled", name: "Discovery scheduled", position: 3, canonicalClass: "DISCOVERY_SCHEDULED", probability: 0.35 },
    { key: "discovery-completed", name: "Discovery completed", position: 4, canonicalClass: "DISCOVERY_COMPLETED", probability: 0.5 },
    { key: "proposal-preparation", name: "Proposal preparation", position: 5, canonicalClass: "PROPOSAL_PREPARATION", probability: 0.65 },
    { key: "lost", name: "Lost", position: 6, canonicalClass: "LOST", probability: 0 },
    { key: "on-hold", name: "On hold", position: 7, canonicalClass: "ON_HOLD", probability: 0.15 },
    { key: "follow-up", name: "Follow up later", position: 8, canonicalClass: "FOLLOW_UP_LATER", probability: 0.15 },
    { key: "disqualified", name: "Disqualified", position: 9, canonicalClass: "DISQUALIFIED", probability: 0 },
  ],
});

async function createQualifiedLead(
  context: TenantScopedRequestContext,
  input: { companyId: string; contactId?: string | null; key: string },
) {
  const lead = mustDomainOk(
    await createLead(
      context,
      {
        companyId: input.companyId,
        contactId: input.contactId ?? null,
        sourceRecordKey: input.key,
      },
      database,
    ),
  );

  let rowVersion = lead.rowVersion;
  for (const to of [
    "EXTRACTED",
    "ENRICHMENT_PENDING",
    "ENRICHED",
    "QUALIFICATION_PENDING",
    "QUALIFIED",
  ] as const) {
    const moved = mustDomainOk(
      await transitionLeadLifecycle(
        context,
        { leadId: lead.id, to, expectedRowVersion: rowVersion },
        database,
      ),
    );
    rowVersion = moved.rowVersion;
  }

  mustDomainOk(
    await recordQualification(
      context,
      {
        leadId: lead.id,
        criteriaVersion: "r6-commercial-v1",
        answers: { qualified: true },
        score: 1,
        disposition: "QUALIFIED",
      },
      database,
    ),
  );

  return { ...lead, rowVersion };
}


async function createProposalPreparationDeal(input: {
  companyId: string;
  contactId: string;
  pipelineId: string;
  stages: Record<string, string>;
  key: string;
}) {
  const deal = mustOk(
    await createDeal(
      platform,
      {
        pipelineId: input.pipelineId,
        companyId: input.companyId,
        primaryContactId: input.contactId,
        amountMinor: BigInt(250000),
        currency: "USD",
      },
      database,
    ),
  );

  mustOk(
    await moveDeal(
      platform,
      {
        dealId: deal.id,
        toStageId: input.stages.INTERESTED,
        expectedRowVersion: 1,
      },
      database,
    ),
  );

  const meeting = mustDomainOk(
    await createMeeting(
      platform,
      {
        title: "Client conversion discovery " + input.key,
        meetingType: "DISCOVERY",
        startsAt: new Date("2026-09-30T10:00:00Z"),
        endsAt: new Date("2026-09-30T11:00:00Z"),
        timezone: "UTC",
        dealId: deal.id,
      },
      database,
    ),
  );
  mustDomainOk(
    await transitionMeeting(
      platform,
      { meetingId: meeting.id, to: "SCHEDULED", expectedRowVersion: 1 },
      database,
    ),
  );

  mustOk(
    await moveDeal(
      platform,
      {
        dealId: deal.id,
        toStageId: input.stages.DISCOVERY_SCHEDULED,
        expectedRowVersion: 2,
      },
      database,
    ),
  );

  mustDomainOk(
    await transitionMeeting(
      platform,
      { meetingId: meeting.id, to: "CONFIRMED", expectedRowVersion: 2 },
      database,
    ),
  );
  mustDomainOk(
    await transitionMeeting(
      platform,
      { meetingId: meeting.id, to: "COMPLETED", expectedRowVersion: 3 },
      database,
    ),
  );

  mustOk(
    await moveDeal(
      platform,
      {
        dealId: deal.id,
        toStageId: input.stages.DISCOVERY_COMPLETED,
        expectedRowVersion: 3,
      },
      database,
    ),
  );

  mustDomainOk(
    await recordQualification(
      platform,
      {
        dealId: deal.id,
        criteriaVersion: "r6-client-conversion-v1",
        answers: { ready: true },
        score: 1,
        disposition: "QUALIFIED",
      },
      database,
    ),
  );

  mustOk(
    await moveDeal(
      platform,
      {
        dealId: deal.id,
        toStageId: input.stages.PROPOSAL_PREPARATION,
        expectedRowVersion: 4,
      },
      database,
    ),
  );

  return { ...deal, rowVersion: 5 };
}

let fixture!: {
  ownCompanyId: string;
  ownContactId: string;
  ownLeadId: string;
  ownPipelineId: string;
  ownStages: Record<string, string>;
  foreignCompanyId: string;
  foreignContactId: string;
  foreignLeadId: string;
  foreignPipelineId: string;
  foreignStages: Record<string, string>;
};

beforeAll(async () => {
  await database.organization.createMany({
    data: [
      {
        id: primaryOrganizationId,
        organizationType: "PLATFORM",
        legalName: "R6 Commercial Primary Test Org",
        displayName: "R6 Commercial Primary",
        slug: "r6-commercial-primary-" + primaryOrganizationId.slice(0, 8),
        status: "ACTIVE",
      },
      {
        id: secondaryOrganizationId,
        organizationType: "PLATFORM",
        legalName: "R6 Commercial Secondary Test Org",
        displayName: "R6 Commercial Secondary",
        slug: "r6-commercial-secondary-" + secondaryOrganizationId.slice(0, 8),
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

  const ownCompany = mustDomainOk(
    await createCompany(platform, { name: "COMMERCIAL Own Company" }, database),
  );
  const ownContact = mustDomainOk(
    await createContact(
      platform,
      {
        companyId: ownCompany.id,
        title: "COMMERCIAL Own Contact",
        emailOriginal: "commercial-own@example.invalid",
        emailNormalized: "commercial-own@example.invalid",
      },
      database,
    ),
  );
  const ownLead = await createQualifiedLead(platform, {
    companyId: ownCompany.id,
    contactId: ownContact.id,
    key: "commercial-own-lead",
  });
  const ownPipeline = mustOk(
    await createDealPipeline(
      platform,
      pipelineInput("COMMERCIAL Own Pipeline"),
      database,
    ),
  );

  const foreignCompany = mustDomainOk(
    await createCompany(foreign, { name: "COMMERCIAL Foreign Company" }, database),
  );
  const foreignContact = mustDomainOk(
    await createContact(
      foreign,
      {
        companyId: foreignCompany.id,
        title: "COMMERCIAL Foreign Contact",
        emailOriginal: "commercial-foreign@example.invalid",
        emailNormalized: "commercial-foreign@example.invalid",
      },
      database,
    ),
  );
  const foreignLead = await createQualifiedLead(foreign, {
    companyId: foreignCompany.id,
    contactId: foreignContact.id,
    key: "commercial-foreign-lead",
  });
  const foreignPipeline = mustOk(
    await createDealPipeline(
      foreign,
      pipelineInput("COMMERCIAL Foreign Pipeline"),
      database,
    ),
  );

  fixture = {
    ownCompanyId: ownCompany.id,
    ownContactId: ownContact.id,
    ownLeadId: ownLead.id,
    ownPipelineId: ownPipeline.id,
    ownStages: Object.fromEntries(
      ownPipeline.stages.map((stage) => [stage.canonicalClass, stage.id]),
    ),
    foreignCompanyId: foreignCompany.id,
    foreignContactId: foreignContact.id,
    foreignLeadId: foreignLead.id,
    foreignPipelineId: foreignPipeline.id,
    foreignStages: Object.fromEntries(
      foreignPipeline.stages.map((stage) => [stage.canonicalClass, stage.id]),
    ),
  };
});

afterAll(async () => {
  await database.$disconnect();
});

describe("R6 commercial deal falsification", () => {
  it("rejects R7-owned stage classes at pipeline creation with zero resource residue", async () => {
    const before = await resourceCount(primaryOrganizationId, "deal-pipeline");
    const input = pipelineInput("COMMERCIAL R7 stage attack");
    const attacked = {
      ...input,
      stages: [
        ...input.stages,
        {
          key: "proposal-sent",
          name: "Proposal sent",
          position: 10,
          canonicalClass: "PROPOSAL_SENT",
        },
      ],
    } as never;

    const result = await createDealPipeline(platform, attacked, database);
    expect(result).toEqual({ kind: "error", code: "INVALID" });
    expect(await resourceCount(primaryOrganizationId, "deal-pipeline")).toBe(before);
  });

  it.each([
    ["foreign pipeline", () =>
      createDeal(
        platform,
        {
          pipelineId: fixture.foreignPipelineId,
          companyId: fixture.ownCompanyId,
        },
        database,
      )],
    ["foreign company", () =>
      createDeal(
        platform,
        {
          pipelineId: fixture.ownPipelineId,
          companyId: fixture.foreignCompanyId,
        },
        database,
      )],
    ["foreign contact", () =>
      createDeal(
        platform,
        {
          pipelineId: fixture.ownPipelineId,
          companyId: fixture.ownCompanyId,
          primaryContactId: fixture.foreignContactId,
        },
        database,
      )],
    ["foreign lead", () =>
      createDeal(
        platform,
        {
          pipelineId: fixture.ownPipelineId,
          sourceLeadId: fixture.foreignLeadId,
        },
        database,
      )],
  ])("rejects %s relationships and rolls back the deal resource envelope", async (_name, operation) => {
    const before = await resourceCount(primaryOrganizationId, "deal");
    const result = await operation();
    expect(result.kind).toBe("error");
    expect(await resourceCount(primaryOrganizationId, "deal")).toBe(before);
  });

  it("derives the initial stage and tenant graph server-side even with forged fields", async () => {
    const company = mustDomainOk(
      await createCompany(platform, { name: "COMMERCIAL forged stage company" }, database),
    );
    const lead = await createQualifiedLead(platform, {
      companyId: company.id,
      key: "commercial-forged-stage",
    });

    const result = await createDeal(
      platform,
      {
        pipelineId: fixture.ownPipelineId,
        sourceLeadId: lead.id,
        stageId: fixture.foreignStages.LOST,
        ownerOrganizationId: secondaryOrganizationId,
      } as never,
      database,
    );
    expect(result.kind).toBe("ok");
    if (result.kind !== "ok") return;
    expect(result.value.stageId).toBe(fixture.ownStages.QUALIFIED);

    const row = await database.commercialDeal.findUniqueOrThrow({
      where: { id: result.value.id },
      select: { ownerOrganizationId: true },
    });
    expect(row.ownerOrganizationId).toBe(primaryOrganizationId);
  });

  it.each(["CONTACTED", "REPLIED"])(
    "rejects lead conversion from non-contract state %s with zero residue",
    async (state) => {
      const company = mustDomainOk(
        await createCompany(
          platform,
          { name: "COMMERCIAL invalid conversion " + state + " " + crypto.randomUUID() },
          database,
        ),
      );
      const lead = mustDomainOk(
        await createLead(
          platform,
          {
            companyId: company.id,
            sourceRecordKey: "commercial-invalid-" + state + "-" + crypto.randomUUID(),
          },
          database,
        ),
      );
      await database.crmLead.update({
        where: { id: lead.id },
        data: { lifecycleState: state },
      });

      const beforeResources = await resourceCount(primaryOrganizationId, "deal");
      const beforeHistory = await count(
        `SELECT count(*)::bigint AS count
           FROM crm.lead_status_history
          WHERE lead_id = $1::uuid
            AND to_state = 'CONVERTED'`,
        lead.id,
      );

      const result = await createDeal(
        platform,
        {
          pipelineId: fixture.ownPipelineId,
          sourceLeadId: lead.id,
        },
        database,
      );

      expect(result).toEqual({ kind: "error", code: "TRANSITION_DENIED" });
      expect(await resourceCount(primaryOrganizationId, "deal")).toBe(
        beforeResources,
      );
      expect(
        await count(
          `SELECT count(*)::bigint AS count
             FROM commercial.deals
            WHERE source_lead_id = $1::uuid`,
          lead.id,
        ),
      ).toBe(0);
      expect(
        await count(
          `SELECT count(*)::bigint AS count
             FROM crm.lead_status_history
            WHERE lead_id = $1::uuid
              AND to_state = 'CONVERTED'`,
          lead.id,
        ),
      ).toBe(beforeHistory);
    },
  );

  it("converts one qualified lead to one canonical deal idempotently", async () => {
    const company = mustDomainOk(
      await createCompany(platform, { name: "COMMERCIAL idempotent company" }, database),
    );
    const contact = mustDomainOk(
      await createContact(
        platform,
        {
          companyId: company.id,
          title: "COMMERCIAL idempotent contact",
          emailOriginal: "idempotent@example.invalid",
          emailNormalized: "idempotent@example.invalid",
        },
        database,
      ),
    );
    const lead = await createQualifiedLead(platform, {
      companyId: company.id,
      contactId: contact.id,
      key: "commercial-idempotent-lead",
    });

    const input = {
      pipelineId: fixture.ownPipelineId,
      sourceLeadId: lead.id,
      amountMinor: BigInt(50000),
      currency: "USD",
    };
    const first = await createDeal(platform, input, database);
    const second = await createDeal(platform, input, database);

    expect(first.kind).toBe("ok");
    expect(second).toEqual(first);
    if (first.kind !== "ok") return;

    expect(
      await count(
        `SELECT count(*)::bigint AS count
           FROM commercial.deals
          WHERE source_lead_id = $1::uuid`,
        lead.id,
      ),
    ).toBe(1);

    const leadRow = await database.crmLead.findUniqueOrThrow({
      where: { id: lead.id },
      select: { lifecycleState: true, convertedDealId: true },
    });
    expect(leadRow).toEqual({
      lifecycleState: "CONVERTED",
      convertedDealId: first.value.id,
    });
    expect(
      await count(
        `SELECT count(*)::bigint AS count
           FROM crm.lead_status_history
          WHERE lead_id = $1::uuid
            AND to_state = 'CONVERTED'`,
        lead.id,
      ),
    ).toBe(1);
  });

  it("contains concurrent lead conversion to one canonical deal", async () => {
    const company = mustDomainOk(
      await createCompany(platform, { name: "COMMERCIAL race company" }, database),
    );
    const lead = await createQualifiedLead(platform, {
      companyId: company.id,
      key: "commercial-race-lead",
    });
    const input = {
      pipelineId: fixture.ownPipelineId,
      sourceLeadId: lead.id,
    };

    const [a, b] = await Promise.all([
      createDeal(platform, input, database),
      createDeal(platform, input, database),
    ]);

    expect(a.kind).toBe("ok");
    expect(b.kind).toBe("ok");
    if (a.kind !== "ok" || b.kind !== "ok") return;
    expect(a.value.id).toBe(b.value.id);
    expect(
      await count(
        `SELECT count(*)::bigint AS count
           FROM commercial.deals
          WHERE source_lead_id = $1::uuid`,
        lead.id,
      ),
    ).toBe(1);
  });

  it("rejects changed-payload reuse for an already converted lead", async () => {
    const company = mustDomainOk(
      await createCompany(platform, { name: "COMMERCIAL payload company" }, database),
    );
    const lead = await createQualifiedLead(platform, {
      companyId: company.id,
      key: "commercial-payload-lead",
    });
    const first = await createDeal(
      platform,
      { pipelineId: fixture.ownPipelineId, sourceLeadId: lead.id },
      database,
    );
    expect(first.kind).toBe("ok");

    const otherPipeline = mustOk(
      await createDealPipeline(
        platform,
        pipelineInput("COMMERCIAL Other Pipeline " + crypto.randomUUID()),
        database,
      ),
    );
    const changed = await createDeal(
      platform,
      { pipelineId: otherPipeline.id, sourceLeadId: lead.id },
      database,
    );
    expect(changed).toEqual({ kind: "error", code: "IDEMPOTENCY_CONFLICT" });
  });

  it("rejects invalid money pairs and stale field writes", async () => {
    const deal = mustOk(
      await createDeal(
        platform,
        {
          pipelineId: fixture.ownPipelineId,
          companyId: fixture.ownCompanyId,
        },
        database,
      ),
    );

    const invalid = await updateDealFields(
      platform,
      {
        dealId: deal.id,
        expectedRowVersion: 1,
        amountMinor: BigInt(100),
        currency: null,
      },
      database,
    );
    expect(invalid).toEqual({ kind: "error", code: "INVALID" });

    const updated = await updateDealFields(
      platform,
      {
        dealId: deal.id,
        expectedRowVersion: 1,
        amountMinor: BigInt(100),
        currency: "usd",
        probability: 0.2,
      },
      database,
    );
    expect(updated.kind).toBe("ok");

    const stale = await updateDealFields(
      platform,
      {
        dealId: deal.id,
        expectedRowVersion: 1,
        amountMinor: BigInt(200),
        currency: "USD",
      },
      database,
    );
    expect(stale).toEqual({ kind: "error", code: "STALE_WRITE" });
  });

  it("rejects foreign stages, skipped stages, and backward moves without reasons with zero history residue", async () => {
    const deal = mustOk(
      await createDeal(
        platform,
        {
          pipelineId: fixture.ownPipelineId,
          companyId: fixture.ownCompanyId,
        },
        database,
      ),
    );

    const before = await count(
      `SELECT count(*)::bigint AS count
         FROM commercial.deal_stage_history
        WHERE deal_id = $1::uuid`,
      deal.id,
    );

    const foreign = await moveDeal(
      platform,
      {
        dealId: deal.id,
        toStageId: fixture.foreignStages.INTERESTED,
        expectedRowVersion: 1,
      },
      database,
    );
    expect(foreign).toEqual({ kind: "error", code: "TRANSITION_DENIED" });

    const skipped = await moveDeal(
      platform,
      {
        dealId: deal.id,
        toStageId: fixture.ownStages.DISCOVERY_SCHEDULED,
        expectedRowVersion: 1,
      },
      database,
    );
    expect(skipped).toEqual({ kind: "error", code: "TRANSITION_DENIED" });

    const forward = await moveDeal(
      platform,
      {
        dealId: deal.id,
        toStageId: fixture.ownStages.INTERESTED,
        expectedRowVersion: 1,
      },
      database,
    );
    expect(forward.kind).toBe("ok");

    const backwardNoReason = await moveDeal(
      platform,
      {
        dealId: deal.id,
        toStageId: fixture.ownStages.QUALIFIED,
        expectedRowVersion: 2,
      },
      database,
    );
    expect(backwardNoReason).toEqual({
      kind: "error",
      code: "TRANSITION_DENIED",
    });

    expect(
      await count(
        `SELECT count(*)::bigint AS count
           FROM commercial.deal_stage_history
          WHERE deal_id = $1::uuid`,
        deal.id,
      ),
    ).toBe(before + 1);
  });

  it("enforces discovery meeting guards before stage progression", async () => {
    const deal = mustOk(
      await createDeal(
        platform,
        {
          pipelineId: fixture.ownPipelineId,
          companyId: fixture.ownCompanyId,
          primaryContactId: fixture.ownContactId,
        },
        database,
      ),
    );
    mustOk(
      await moveDeal(
        platform,
        {
          dealId: deal.id,
          toStageId: fixture.ownStages.INTERESTED,
          expectedRowVersion: 1,
        },
        database,
      ),
    );

    const noMeeting = await moveDeal(
      platform,
      {
        dealId: deal.id,
        toStageId: fixture.ownStages.DISCOVERY_SCHEDULED,
        expectedRowVersion: 2,
      },
      database,
    );
    expect(noMeeting).toEqual({ kind: "error", code: "TRANSITION_DENIED" });

    const meeting = mustDomainOk(
      await createMeeting(
        platform,
        {
          title: "Commercial discovery",
          meetingType: "DISCOVERY",
          startsAt: new Date("2026-09-28T10:00:00Z"),
          endsAt: new Date("2026-09-28T11:00:00Z"),
          timezone: "UTC",
          dealId: deal.id,
        },
        database,
      ),
    );
    mustDomainOk(
      await transitionMeeting(
        platform,
        { meetingId: meeting.id, to: "SCHEDULED", expectedRowVersion: 1 },
        database,
      ),
    );

    const scheduled = await moveDeal(
      platform,
      {
        dealId: deal.id,
        toStageId: fixture.ownStages.DISCOVERY_SCHEDULED,
        expectedRowVersion: 2,
      },
      database,
    );
    expect(scheduled.kind).toBe("ok");

    const notCompleted = await moveDeal(
      platform,
      {
        dealId: deal.id,
        toStageId: fixture.ownStages.DISCOVERY_COMPLETED,
        expectedRowVersion: 3,
      },
      database,
    );
    expect(notCompleted).toEqual({ kind: "error", code: "TRANSITION_DENIED" });

    mustDomainOk(
      await transitionMeeting(
        platform,
        { meetingId: meeting.id, to: "CONFIRMED", expectedRowVersion: 2 },
        database,
      ),
    );
    mustDomainOk(
      await transitionMeeting(
        platform,
        { meetingId: meeting.id, to: "COMPLETED", expectedRowVersion: 3 },
        database,
      ),
    );

    const completed = await moveDeal(
      platform,
      {
        dealId: deal.id,
        toStageId: fixture.ownStages.DISCOVERY_COMPLETED,
        expectedRowVersion: 3,
      },
      database,
    );
    expect(completed.kind).toBe("ok");
  });

  it("requires qualification, primary contact and value before PROPOSAL_PREPARATION", async () => {
    const deal = mustOk(
      await createDeal(
        platform,
        {
          pipelineId: fixture.ownPipelineId,
          companyId: fixture.ownCompanyId,
          primaryContactId: fixture.ownContactId,
        },
        database,
      ),
    );

    await database.commercialDeal.update({
      where: { id: deal.id },
      data: {
        stageId: fixture.ownStages.DISCOVERY_COMPLETED,
        rowVersion: 4,
      },
    });

    const blocked = await moveDeal(
      platform,
      {
        dealId: deal.id,
        toStageId: fixture.ownStages.PROPOSAL_PREPARATION,
        expectedRowVersion: 4,
      },
      database,
    );
    expect(blocked).toEqual({ kind: "error", code: "TRANSITION_DENIED" });

    mustDomainOk(
      await recordQualification(
        platform,
        {
          dealId: deal.id,
          criteriaVersion: "commercial-deal-v1",
          answers: { qualified: true },
          score: 1,
          disposition: "QUALIFIED",
        },
        database,
      ),
    );
    const value = await updateDealFields(
      platform,
      {
        dealId: deal.id,
        expectedRowVersion: 4,
        amountMinor: BigInt(125000),
        currency: "USD",
      },
      database,
    );
    expect(value.kind).toBe("ok");

    const allowed = await moveDeal(
      platform,
      {
        dealId: deal.id,
        toStageId: fixture.ownStages.PROPOSAL_PREPARATION,
        expectedRowVersion: 5,
      },
      database,
    );
    expect(allowed.kind).toBe("ok");
  });

  it("requires reasons for exits and keeps LOST terminal", async () => {
    const deal = mustOk(
      await createDeal(
        platform,
        {
          pipelineId: fixture.ownPipelineId,
          companyId: fixture.ownCompanyId,
        },
        database,
      ),
    );

    const withoutReason = await moveDeal(
      platform,
      {
        dealId: deal.id,
        toStageId: fixture.ownStages.LOST,
        expectedRowVersion: 1,
      },
      database,
    );
    expect(withoutReason).toEqual({
      kind: "error",
      code: "TRANSITION_DENIED",
    });

    const lost = await moveDeal(
      platform,
      {
        dealId: deal.id,
        toStageId: fixture.ownStages.LOST,
        expectedRowVersion: 1,
        reason: "No budget",
      },
      database,
    );
    expect(lost.kind).toBe("ok");

    const reopen = await moveDeal(
      platform,
      {
        dealId: deal.id,
        toStageId: fixture.ownStages.QUALIFIED,
        expectedRowVersion: 2,
        reason: "Changed mind",
      },
      database,
    );
    expect(reopen).toEqual({ kind: "error", code: "TRANSITION_DENIED" });
  });

  it("rejects malformed identifiers as stable INVALID/NOT_FOUND outcomes rather than leaking database exceptions", async () => {
    const result = await createDeal(
      platform,
      {
        pipelineId: fixture.ownPipelineId,
        companyId: "not-a-uuid",
      },
      database,
    );
    expect(["INVALID", "NOT_FOUND"]).toContain(
      result.kind === "error" ? result.code : "unexpected-ok",
    );
  });

  it("keeps stage history immutable", async () => {
    const deal = mustOk(
      await createDeal(
        platform,
        {
          pipelineId: fixture.ownPipelineId,
          companyId: fixture.ownCompanyId,
        },
        database,
      ),
    );
    const history = await database.commercialDealStageHistory.findFirstOrThrow({
      where: { dealId: deal.id },
      select: { id: true },
    });

    await expect(
      database.commercialDealStageHistory.update({
        where: { id: history.id },
        data: { reason: "mutated" },
      }),
    ).rejects.toBeTruthy();
  });

  it("converts a proposal-preparation deal to one canonical client account idempotently", async () => {
    const company = mustDomainOk(
      await createCompany(
        platform,
        {
          name: "Commercial Client Conversion " + crypto.randomUUID(),
          domain: "client-" + crypto.randomUUID() + ".example.invalid",
        },
        database,
      ),
    );
    const contact = mustDomainOk(
      await createContact(
        platform,
        {
          companyId: company.id,
          title: "Primary client contact",
          emailOriginal: "client-conversion@example.invalid",
          emailNormalized: "client-conversion@example.invalid",
        },
        database,
      ),
    );
    const deal = await createProposalPreparationDeal({
      companyId: company.id,
      contactId: contact.id,
      pipelineId: fixture.ownPipelineId,
      stages: fixture.ownStages,
      key: "idempotent",
    });
    const key = "client-conversion-" + crypto.randomUUID();

    const first = await convertDealToClient(
      platform,
      {
        dealId: deal.id,
        expectedRowVersion: deal.rowVersion,
        idempotencyKey: key,
      },
      database,
    );
    const replay = await convertDealToClient(
      platform,
      {
        dealId: deal.id,
        expectedRowVersion: deal.rowVersion,
        idempotencyKey: key,
      },
      database,
    );

    expect(first.kind).toBe("ok");
    expect(replay).toEqual(first);
    if (first.kind !== "ok") return;

    expect(
      await count(
        `SELECT count(*)::bigint AS count
           FROM commercial.client_accounts
          WHERE owner_organization_id = $1::uuid
            AND client_organization_id = $2::uuid
            AND archived_at IS NULL`,
        primaryOrganizationId,
        first.value.clientOrganizationId,
      ),
    ).toBe(1);
    expect(
      await count(
        `SELECT count(*)::bigint AS count
           FROM commercial.client_relationships
          WHERE owner_organization_id = $1::uuid
            AND client_account_id = $2::uuid
            AND contact_id = $3::uuid
            AND relationship_role = 'PRIMARY_CONTACT'
            AND archived_at IS NULL`,
        primaryOrganizationId,
        first.value.id,
        contact.id,
      ),
    ).toBe(1);

    const dealRow = await database.commercialDeal.findUniqueOrThrow({
      where: { id: deal.id },
      select: { clientOrganizationId: true, rowVersion: true, resourceId: true },
    });
    expect(dealRow.clientOrganizationId).toBe(first.value.clientOrganizationId);
    expect(dealRow.rowVersion).toBe(deal.rowVersion + 1);

    const envelope = await database.resource.findUniqueOrThrow({
      where: { id: dealRow.resourceId },
      select: { clientOrganizationId: true },
    });
    expect(envelope.clientOrganizationId).toBe(first.value.clientOrganizationId);

    expect(
      await count(
        `SELECT count(*)::bigint AS count
           FROM platform.idempotency_receipts
          WHERE owner_organization_id = $1::uuid
            AND scope = 'commercial.client-conversion'
            AND idempotency_key = $2::text
            AND state = 'COMPLETED'`,
        primaryOrganizationId,
        key,
      ),
    ).toBe(1);
  });

  it("rejects changed-payload reuse of a client conversion idempotency key", async () => {
    const company = mustDomainOk(
      await createCompany(
        platform,
        { name: "Commercial Client Replay " + crypto.randomUUID() },
        database,
      ),
    );
    const contact = mustDomainOk(
      await createContact(
        platform,
        { companyId: company.id, title: "Replay contact" },
        database,
      ),
    );
    const deal = await createProposalPreparationDeal({
      companyId: company.id,
      contactId: contact.id,
      pipelineId: fixture.ownPipelineId,
      stages: fixture.ownStages,
      key: "changed-payload",
    });
    const key = "client-replay-" + crypto.randomUUID();

    const first = await convertDealToClient(
      platform,
      { dealId: deal.id, expectedRowVersion: deal.rowVersion, idempotencyKey: key },
      database,
    );
    expect(first.kind).toBe("ok");

    const changed = await convertDealToClient(
      platform,
      {
        dealId: deal.id,
        expectedRowVersion: deal.rowVersion + 1,
        idempotencyKey: key,
      },
      database,
    );
    expect(changed).toEqual({ kind: "error", code: "IDEMPOTENCY_CONFLICT" });
  });

  it("contains concurrent same-key client conversion to one account and one relationship", async () => {
    const company = mustDomainOk(
      await createCompany(
        platform,
        { name: "Commercial Client Race " + crypto.randomUUID() },
        database,
      ),
    );
    const contact = mustDomainOk(
      await createContact(
        platform,
        { companyId: company.id, title: "Race contact" },
        database,
      ),
    );
    const deal = await createProposalPreparationDeal({
      companyId: company.id,
      contactId: contact.id,
      pipelineId: fixture.ownPipelineId,
      stages: fixture.ownStages,
      key: "race",
    });
    const key = "client-race-" + crypto.randomUUID();
    const input = {
      dealId: deal.id,
      expectedRowVersion: deal.rowVersion,
      idempotencyKey: key,
    };

    const [a, b] = await Promise.all([
      convertDealToClient(platform, input, database),
      convertDealToClient(platform, input, database),
    ]);

    expect(a.kind).toBe("ok");
    expect(b.kind).toBe("ok");
    if (a.kind !== "ok" || b.kind !== "ok") return;
    expect(a.value.id).toBe(b.value.id);
    expect(
      await count(
        `SELECT count(*)::bigint AS count
           FROM commercial.client_accounts
          WHERE owner_organization_id = $1::uuid
            AND client_organization_id = $2::uuid
            AND archived_at IS NULL`,
        primaryOrganizationId,
        a.value.clientOrganizationId,
      ),
    ).toBe(1);
  });

  it("rejects different-key duplicate client conversion and leaves no second account", async () => {
    const company = mustDomainOk(
      await createCompany(
        platform,
        { name: "Commercial Client Duplicate " + crypto.randomUUID() },
        database,
      ),
    );
    const contact = mustDomainOk(
      await createContact(
        platform,
        { companyId: company.id, title: "Duplicate contact" },
        database,
      ),
    );
    const deal = await createProposalPreparationDeal({
      companyId: company.id,
      contactId: contact.id,
      pipelineId: fixture.ownPipelineId,
      stages: fixture.ownStages,
      key: "different-key",
    });

    const first = await convertDealToClient(
      platform,
      {
        dealId: deal.id,
        expectedRowVersion: deal.rowVersion,
        idempotencyKey: "client-first-" + crypto.randomUUID(),
      },
      database,
    );
    expect(first.kind).toBe("ok");
    if (first.kind !== "ok") return;

    const second = await convertDealToClient(
      platform,
      {
        dealId: deal.id,
        expectedRowVersion: deal.rowVersion + 1,
        idempotencyKey: "client-second-" + crypto.randomUUID(),
      },
      database,
    );
    expect(second).toEqual({ kind: "error", code: "CONFLICT" });
    expect(
      await count(
        `SELECT count(*)::bigint AS count
           FROM commercial.client_accounts
          WHERE owner_organization_id = $1::uuid
            AND client_organization_id = $2::uuid
            AND archived_at IS NULL`,
        primaryOrganizationId,
        first.value.clientOrganizationId,
      ),
    ).toBe(1);
  });

  it("denies client conversion before PROPOSAL_PREPARATION with zero IAM/resource/account/idempotency residue", async () => {
    const company = mustDomainOk(
      await createCompany(
        platform,
        { name: "Commercial Pre Ceiling " + crypto.randomUUID() },
        database,
      ),
    );
    const contact = mustDomainOk(
      await createContact(
        platform,
        { companyId: company.id, title: "Pre ceiling contact" },
        database,
      ),
    );
    const deal = mustOk(
      await createDeal(
        platform,
        {
          pipelineId: fixture.ownPipelineId,
          companyId: company.id,
          primaryContactId: contact.id,
          amountMinor: BigInt(10000),
          currency: "USD",
        },
        database,
      ),
    );
    const key = "client-pre-ceiling-" + crypto.randomUUID();

    const beforeClientOrgs = await count(
      `SELECT count(*)::bigint AS count FROM iam.organizations WHERE organization_type = 'CLIENT'`,
    );
    const beforeResources = await resourceCount(primaryOrganizationId, "client-account");
    const beforeAccounts = await count(
      `SELECT count(*)::bigint AS count
         FROM commercial.client_accounts
        WHERE owner_organization_id = $1::uuid`,
      primaryOrganizationId,
    );

    const result = await convertDealToClient(
      platform,
      { dealId: deal.id, expectedRowVersion: 1, idempotencyKey: key },
      database,
    );

    expect(result).toEqual({ kind: "error", code: "TRANSITION_DENIED" });
    expect(
      await count(
        `SELECT count(*)::bigint AS count FROM iam.organizations WHERE organization_type = 'CLIENT'`,
      ),
    ).toBe(beforeClientOrgs);
    expect(await resourceCount(primaryOrganizationId, "client-account")).toBe(beforeResources);
    expect(
      await count(
        `SELECT count(*)::bigint AS count
           FROM commercial.client_accounts
          WHERE owner_organization_id = $1::uuid`,
        primaryOrganizationId,
      ),
    ).toBe(beforeAccounts);
    expect(
      await count(
        `SELECT count(*)::bigint AS count
           FROM platform.idempotency_receipts
          WHERE owner_organization_id = $1::uuid
            AND scope = 'commercial.client-conversion'
            AND idempotency_key = $2::text`,
        primaryOrganizationId,
        key,
      ),
    ).toBe(0);
  });

  it("conceals foreign and archived deals from client conversion without residue", async () => {
    const key = "client-foreign-" + crypto.randomUUID();
    const foreignResult = await convertDealToClient(
      platform,
      {
        dealId: fixture.foreignLeadId,
        expectedRowVersion: 1,
        idempotencyKey: key,
      },
      database,
    );
    expect(foreignResult).toEqual({ kind: "error", code: "NOT_FOUND" });
    expect(
      await count(
        `SELECT count(*)::bigint AS count
           FROM platform.idempotency_receipts
          WHERE owner_organization_id = $1::uuid
            AND scope = 'commercial.client-conversion'
            AND idempotency_key = $2::text`,
        primaryOrganizationId,
        key,
      ),
    ).toBe(0);

    const company = mustDomainOk(
      await createCompany(
        platform,
        { name: "Commercial Archived Conversion " + crypto.randomUUID() },
        database,
      ),
    );
    const contact = mustDomainOk(
      await createContact(
        platform,
        { companyId: company.id, title: "Archived conversion contact" },
        database,
      ),
    );
    const deal = await createProposalPreparationDeal({
      companyId: company.id,
      contactId: contact.id,
      pipelineId: fixture.ownPipelineId,
      stages: fixture.ownStages,
      key: "archived",
    });
    await database.commercialDeal.update({
      where: { id: deal.id },
      data: { archivedAt: new Date() },
    });

    const archived = await convertDealToClient(
      platform,
      {
        dealId: deal.id,
        expectedRowVersion: deal.rowVersion,
        idempotencyKey: "client-archived-" + crypto.randomUUID(),
      },
      database,
    );
    expect(archived).toEqual({ kind: "error", code: "NOT_FOUND" });
  });

  it("rejects cross-tenant and archived client relationship targets with zero relationship residue", async () => {
    const company = mustDomainOk(
      await createCompany(
        platform,
        { name: "Commercial Relationship " + crypto.randomUUID() },
        database,
      ),
    );
    const contact = mustDomainOk(
      await createContact(
        platform,
        { companyId: company.id, title: "Relationship contact" },
        database,
      ),
    );
    const deal = await createProposalPreparationDeal({
      companyId: company.id,
      contactId: contact.id,
      pipelineId: fixture.ownPipelineId,
      stages: fixture.ownStages,
      key: "relationship",
    });
    const account = mustOk(
      await convertDealToClient(
        platform,
        {
          dealId: deal.id,
          expectedRowVersion: deal.rowVersion,
          idempotencyKey: "client-relationship-" + crypto.randomUUID(),
        },
        database,
      ),
    );

    const before = await count(
      `SELECT count(*)::bigint AS count
         FROM commercial.client_relationships
        WHERE owner_organization_id = $1::uuid
          AND client_account_id = $2::uuid`,
      primaryOrganizationId,
      account.id,
    );

    const foreignContact = await addClientRelationship(
      platform,
      {
        clientAccountId: account.id,
        contactId: fixture.foreignContactId,
        relationshipRole: "APPROVER",
      },
      database,
    );
    expect(foreignContact).toEqual({ kind: "error", code: "NOT_FOUND" });

    await database.commercialClientAccount.update({
      where: { id: account.id },
      data: { archivedAt: new Date() },
    });
    const archivedAccount = await addClientRelationship(
      platform,
      {
        clientAccountId: account.id,
        contactId: contact.id,
        relationshipRole: "BILLING",
      },
      database,
    );
    expect(archivedAccount).toEqual({ kind: "error", code: "NOT_FOUND" });

    expect(
      await count(
        `SELECT count(*)::bigint AS count
           FROM commercial.client_relationships
          WHERE owner_organization_id = $1::uuid
            AND client_account_id = $2::uuid`,
        primaryOrganizationId,
        account.id,
      ),
    ).toBe(before);
  });

});
