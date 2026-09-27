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
} from "@/modules/crm/core";

import {
  createDeal,
  createDealPipeline,
  moveDeal,
  updateDealFields,
} from "./core";
import type { CommercialResult, R6DealStageClass } from "./types";

const database = createPrismaClient();
const epoch = new Date("2026-09-27T12:30:00.000Z");

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
      sessionId: ("commercial-falsification-" + input.requestId) as never,
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
  organizationId: seedIds.organization.platform,
  membershipId: seedIds.membership.operator,
  userId: seedIds.user.operator,
  requestId: "r6-commercial-platform",
});

const foreign = teamContext({
  organizationId: seedIds.organization.asteria,
  membershipId: seedIds.membership.asteriaAdmin,
  userId: seedIds.user.asteriaAdmin,
  requestId: "r6-commercial-foreign",
});

function mustOk<T>(result: CommercialResult<T>): T {
  if (result.kind !== "ok") {
    throw new Error("Commercial fixture failed: " + result.code);
  }
  return result.value;
}

function mustCrmOk<T>(
  result:
    | { readonly kind: "ok"; readonly value: T }
    | { readonly kind: "error"; readonly code: string },
): T {
  if (result.kind !== "ok") {
    throw new Error("CRM fixture failed: " + result.code);
  }
  return result.value;
}

async function count(sql: string, ...params: readonly unknown[]) {
  const rows = await database.$queryRawUnsafe<Array<{ count: bigint }>>(
    sql,
    ...params,
  );
  return Number(rows[0]?.count ?? BigInt(0));
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

const mainStages = [
  ["qualified", "Qualified", 1, "QUALIFIED", 0.1],
  ["interested", "Interested", 2, "INTERESTED", 0.2],
  ["discovery-scheduled", "Discovery scheduled", 3, "DISCOVERY_SCHEDULED", 0.4],
  ["discovery-completed", "Discovery completed", 4, "DISCOVERY_COMPLETED", 0.6],
  ["proposal-preparation", "Proposal preparation", 5, "PROPOSAL_PREPARATION", 0.75],
] as const;

function pipelineInput(name: string) {
  return {
    name,
    version: 1,
    stages: mainStages.map(([key, stageName, position, canonicalClass, probability]) => ({
      key,
      name: stageName,
      position,
      canonicalClass: canonicalClass as R6DealStageClass,
      probability,
    })),
  };
}

let fixture!: {
  pipelineId: string;
  qualifiedStageId: string;
  interestedStageId: string;
  discoveryScheduledStageId: string;
  proposalPreparationStageId: string;
  ownCompanyId: string;
  ownContactId: string;
  foreignCompanyId: string;
  foreignContactId: string;
};

beforeAll(async () => {
  const pipeline = mustOk(
    await createDealPipeline(
      platform,
      pipelineInput("Commercial falsification pipeline"),
      database,
    ),
  );

  const stageByClass = new Map(
    pipeline.stages.map((stage) => [stage.canonicalClass, stage.id]),
  );

  const ownCompany = mustCrmOk(
    await createCompany(platform, { name: "Commercial own company" }, database),
  );
  const ownContact = mustCrmOk(
    await createContact(
      platform,
      {
        companyId: ownCompany.id,
        title: "Commercial own contact",
        emailOriginal: "commercial-own@example.invalid",
        emailNormalized: "commercial-own@example.invalid",
      },
      database,
    ),
  );
  const foreignCompany = mustCrmOk(
    await createCompany(foreign, { name: "Commercial foreign company" }, database),
  );
  const foreignContact = mustCrmOk(
    await createContact(
      foreign,
      {
        companyId: foreignCompany.id,
        title: "Commercial foreign contact",
        emailOriginal: "commercial-foreign@example.invalid",
        emailNormalized: "commercial-foreign@example.invalid",
      },
      database,
    ),
  );

  fixture = {
    pipelineId: pipeline.id,
    qualifiedStageId: stageByClass.get("QUALIFIED")!,
    interestedStageId: stageByClass.get("INTERESTED")!,
    discoveryScheduledStageId: stageByClass.get("DISCOVERY_SCHEDULED")!,
    proposalPreparationStageId: stageByClass.get("PROPOSAL_PREPARATION")!,
    ownCompanyId: ownCompany.id,
    ownContactId: ownContact.id,
    foreignCompanyId: foreignCompany.id,
    foreignContactId: foreignContact.id,
  };
});

afterAll(async () => {
  await database.$disconnect();
});

describe("R6 Commercial command falsification", () => {
  it("derives owner authority from trusted context and ignores forged owner input", async () => {
    const forged = {
      ...pipelineInput("Forged commercial owner pipeline"),
      ownerOrganizationId: seedIds.organization.asteria,
      ownerMembershipId: seedIds.membership.asteriaAdmin,
    };

    const result = await createDealPipeline(platform, forged, database);
    expect(result.kind).toBe("ok");
    if (result.kind !== "ok") return;

    const rows = await database.$queryRawUnsafe<
      Array<{
        owner_organization_id: string;
        owner_membership_id: string | null;
      }>
    >(
      `SELECT owner_organization_id, owner_membership_id
         FROM commercial.deal_pipelines
        WHERE id = $1::uuid`,
      result.value.id,
    );

    expect(rows).toEqual([
      {
        owner_organization_id: seedIds.organization.platform,
        owner_membership_id: seedIds.membership.operator,
      },
    ]);
  });

  it("rejects R7-owned stage vocabulary and rolls back the pipeline resource", async () => {
    const before = await resourceCount(seedIds.organization.platform, "deal-pipeline");
    const input = pipelineInput("R7 injection pipeline");
    const poisoned = {
      ...input,
      stages: [
        ...input.stages,
        {
          key: "proposal-sent",
          name: "Proposal sent",
          position: 6,
          canonicalClass: "PROPOSAL_SENT" as never,
          probability: 0.8,
        },
      ],
    };

    const result = await createDealPipeline(platform, poisoned, database);

    expect(result).toEqual({ kind: "error", code: "INVALID" });
    expect(await resourceCount(seedIds.organization.platform, "deal-pipeline")).toBe(
      before,
    );
    expect(
      await count(
        `SELECT count(*)::bigint AS count
           FROM commercial.deal_pipelines
          WHERE name = 'R7 injection pipeline'`,
      ),
    ).toBe(0);
  });

  it("rejects cross-tenant company/contact relationships with zero deal/resource/history residue", async () => {
    const beforeResources = await resourceCount(
      seedIds.organization.platform,
      "deal",
    );
    const beforeHistory = await count(
      `SELECT count(*)::bigint AS count
         FROM commercial.deal_stage_history
        WHERE owner_organization_id = $1::uuid`,
      seedIds.organization.platform,
    );

    const foreignCompany = await createDeal(
      platform,
      {
        pipelineId: fixture.pipelineId,
        companyId: fixture.foreignCompanyId,
        amountMinor: BigInt(1000),
        currency: "USD",
      },
      database,
    );
    const foreignContact = await createDeal(
      platform,
      {
        pipelineId: fixture.pipelineId,
        companyId: fixture.ownCompanyId,
        primaryContactId: fixture.foreignContactId,
        amountMinor: BigInt(1000),
        currency: "USD",
      },
      database,
    );

    expect(foreignCompany.kind).toBe("error");
    expect(foreignContact.kind).toBe("error");
    expect(await resourceCount(seedIds.organization.platform, "deal")).toBe(
      beforeResources,
    );
    expect(
      await count(
        `SELECT count(*)::bigint AS count
           FROM commercial.deal_stage_history
          WHERE owner_organization_id = $1::uuid`,
        seedIds.organization.platform,
      ),
    ).toBe(beforeHistory);
  });

  it.each(["CONTACTED", "REPLIED"])(
    "rejects lead-to-deal conversion from non-contract state %s with zero residue",
    async (state) => {
      const lead = mustCrmOk(
        await createLead(
          platform,
          {
            companyId: fixture.ownCompanyId,
            contactId: fixture.ownContactId,
            sourceRecordKey: "commercial-invalid-conversion-" + state,
          },
          database,
        ),
      );
      await database.crmLead.update({
        where: { id: lead.id },
        data: { lifecycleState: state },
      });

      const beforeResources = await resourceCount(
        seedIds.organization.platform,
        "deal",
      );
      const result = await createDeal(
        platform,
        {
          pipelineId: fixture.pipelineId,
          sourceLeadId: lead.id,
          amountMinor: BigInt(2500),
          currency: "USD",
        },
        database,
      );

      expect(result).toEqual({ kind: "error", code: "TRANSITION_DENIED" });
      expect(await resourceCount(seedIds.organization.platform, "deal")).toBe(
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
      ).toBe(0);
    },
  );

  it("converts a qualified lead atomically and records both immutable histories", async () => {
    const lead = mustCrmOk(
      await createLead(
        platform,
        {
          companyId: fixture.ownCompanyId,
          contactId: fixture.ownContactId,
          sourceRecordKey: "commercial-qualified-conversion",
        },
        database,
      ),
    );
    await database.crmLead.update({
      where: { id: lead.id },
      data: { lifecycleState: "QUALIFIED" },
    });

    const result = await createDeal(
      platform,
      {
        pipelineId: fixture.pipelineId,
        sourceLeadId: lead.id,
        amountMinor: BigInt(5000),
        currency: "USD",
      },
      database,
    );
    expect(result.kind).toBe("ok");
    if (result.kind !== "ok") return;

    const persistedLead = await database.crmLead.findUniqueOrThrow({
      where: { id: lead.id },
      select: {
        lifecycleState: true,
        convertedDealId: true,
        rowVersion: true,
      },
    });
    expect(persistedLead.lifecycleState).toBe("CONVERTED");
    expect(persistedLead.convertedDealId).toBe(result.value.id);
    expect(persistedLead.rowVersion).toBe(2);

    expect(
      await count(
        `SELECT count(*)::bigint AS count
           FROM commercial.deal_stage_history
          WHERE deal_id = $1::uuid`,
        result.value.id,
      ),
    ).toBe(1);
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

  it("makes exact lead conversion retry idempotent with no duplicate resource/history", async () => {
    const lead = mustCrmOk(
      await createLead(
        platform,
        {
          companyId: fixture.ownCompanyId,
          contactId: fixture.ownContactId,
          sourceRecordKey: "commercial-idempotent-conversion",
        },
        database,
      ),
    );
    await database.crmLead.update({
      where: { id: lead.id },
      data: { lifecycleState: "QUALIFIED" },
    });

    const input = {
      pipelineId: fixture.pipelineId,
      sourceLeadId: lead.id,
      amountMinor: BigInt(7000),
      currency: "USD",
    } as const;

    const first = await createDeal(platform, input, database);
    expect(first.kind).toBe("ok");
    if (first.kind !== "ok") return;

    const resourceBefore = await resourceCount(
      seedIds.organization.platform,
      "deal",
    );
    const historyBefore = await count(
      `SELECT count(*)::bigint AS count
         FROM commercial.deal_stage_history
        WHERE deal_id = $1::uuid`,
      first.value.id,
    );

    const replay = await createDeal(platform, input, database);
    expect(replay).toEqual(first);
    expect(await resourceCount(seedIds.organization.platform, "deal")).toBe(
      resourceBefore,
    );
    expect(
      await count(
        `SELECT count(*)::bigint AS count
           FROM commercial.deal_stage_history
          WHERE deal_id = $1::uuid`,
        first.value.id,
      ),
    ).toBe(historyBefore);
  });

  it("contains concurrent lead conversion to one deal and one conversion history", async () => {
    const lead = mustCrmOk(
      await createLead(
        platform,
        {
          companyId: fixture.ownCompanyId,
          contactId: fixture.ownContactId,
          sourceRecordKey: "commercial-concurrent-conversion",
        },
        database,
      ),
    );
    await database.crmLead.update({
      where: { id: lead.id },
      data: { lifecycleState: "QUALIFIED" },
    });

    const input = {
      pipelineId: fixture.pipelineId,
      sourceLeadId: lead.id,
      amountMinor: BigInt(9000),
      currency: "USD",
    } as const;

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

  it("rejects illegal skip, foreign target stage and stale move without history residue", async () => {
    const deal = mustOk(
      await createDeal(
        platform,
        {
          pipelineId: fixture.pipelineId,
          companyId: fixture.ownCompanyId,
          primaryContactId: fixture.ownContactId,
          amountMinor: BigInt(12000),
          currency: "USD",
        },
        database,
      ),
    );

    const historyBefore = await count(
      `SELECT count(*)::bigint AS count
         FROM commercial.deal_stage_history
        WHERE deal_id = $1::uuid`,
      deal.id,
    );

    const skip = await moveDeal(
      platform,
      {
        dealId: deal.id,
        toStageId: fixture.discoveryScheduledStageId,
        expectedRowVersion: 1,
      },
      database,
    );
    expect(skip).toEqual({ kind: "error", code: "TRANSITION_DENIED" });

    const foreignPipeline = mustOk(
      await createDealPipeline(
        foreign,
        pipelineInput("Foreign commercial pipeline"),
        database,
      ),
    );
    const foreignTarget = await moveDeal(
      platform,
      {
        dealId: deal.id,
        toStageId: foreignPipeline.stages[1].id,
        expectedRowVersion: 1,
      },
      database,
    );
    expect(foreignTarget.kind).toBe("error");

    const first = await moveDeal(
      platform,
      {
        dealId: deal.id,
        toStageId: fixture.interestedStageId,
        expectedRowVersion: 1,
      },
      database,
    );
    expect(first.kind).toBe("ok");

    const stale = await moveDeal(
      platform,
      {
        dealId: deal.id,
        toStageId: fixture.qualifiedStageId,
        expectedRowVersion: 1,
        reason: "stale rollback",
      },
      database,
    );
    expect(stale).toEqual({ kind: "error", code: "STALE_WRITE" });

    expect(
      await count(
        `SELECT count(*)::bigint AS count
           FROM commercial.deal_stage_history
          WHERE deal_id = $1::uuid`,
        deal.id,
      ),
    ).toBe(historyBefore + 1);
  });

  it("requires a reason for backward movement and keeps PROPOSAL_PREPARATION as the ceiling", async () => {
    const deal = mustOk(
      await createDeal(
        platform,
        {
          pipelineId: fixture.pipelineId,
          companyId: fixture.ownCompanyId,
          primaryContactId: fixture.ownContactId,
          amountMinor: BigInt(15000),
          currency: "USD",
        },
        database,
      ),
    );

    const forward = await moveDeal(
      platform,
      {
        dealId: deal.id,
        toStageId: fixture.interestedStageId,
        expectedRowVersion: 1,
      },
      database,
    );
    expect(forward.kind).toBe("ok");

    const noReason = await moveDeal(
      platform,
      {
        dealId: deal.id,
        toStageId: fixture.qualifiedStageId,
        expectedRowVersion: 2,
      },
      database,
    );
    expect(noReason).toEqual({ kind: "error", code: "TRANSITION_DENIED" });

    const withReason = await moveDeal(
      platform,
      {
        dealId: deal.id,
        toStageId: fixture.qualifiedStageId,
        expectedRowVersion: 2,
        reason: "re-qualify",
      },
      database,
    );
    expect(withReason.kind).toBe("ok");

    expect(
      await count(
        `SELECT count(*)::bigint AS count
           FROM commercial.deal_stages
          WHERE canonical_class IN (
            'PROPOSAL_SENT','NEGOTIATION','VERBAL_CONFIRMATION',
            'CONTRACT_SENT','CONTRACT_SIGNED','PAYMENT_PENDING','WON'
          )`,
      ),
    ).toBe(0);
  });

  it("conceals archived deals from update/move and leaves no new history", async () => {
    const deal = mustOk(
      await createDeal(
        platform,
        {
          pipelineId: fixture.pipelineId,
          companyId: fixture.ownCompanyId,
          primaryContactId: fixture.ownContactId,
          amountMinor: BigInt(18000),
          currency: "USD",
        },
        database,
      ),
    );
    await database.commercialDeal.update({
      where: { id: deal.id },
      data: { archivedAt: new Date() },
    });

    const historyBefore = await count(
      `SELECT count(*)::bigint AS count
         FROM commercial.deal_stage_history
        WHERE deal_id = $1::uuid`,
      deal.id,
    );

    const update = await updateDealFields(
      platform,
      {
        dealId: deal.id,
        expectedRowVersion: 1,
        amountMinor: BigInt(19000),
        currency: "USD",
      },
      database,
    );
    const move = await moveDeal(
      platform,
      {
        dealId: deal.id,
        toStageId: fixture.interestedStageId,
        expectedRowVersion: 1,
      },
      database,
    );

    expect(update).toEqual({ kind: "error", code: "NOT_FOUND" });
    expect(move).toEqual({ kind: "error", code: "NOT_FOUND" });
    expect(
      await count(
        `SELECT count(*)::bigint AS count
           FROM commercial.deal_stage_history
          WHERE deal_id = $1::uuid`,
        deal.id,
      ),
    ).toBe(historyBefore);
  });
});
