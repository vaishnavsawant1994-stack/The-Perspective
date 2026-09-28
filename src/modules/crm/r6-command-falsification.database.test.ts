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
  addLeadListMember,
  createCompany,
  createContact,
  createDuplicateCandidate,
  createExtractionJob,
  createLead,
  createLeadList,
  createLeadSource,
  createSuppressionEntry,
  recordEnrichmentFact,
  recordLeadScore,
  recordQualification,
  removeLeadListMember,
  requestEnrichment,
  stageExtractedRecord,
  suppressLead,
  transitionLeadLifecycle,
} from "./core";
import { withCrmTenantTransaction } from "./persistence";
import type { CrmCoreResult } from "./types";

const database = createPrismaClient();
const epoch = new Date("2026-09-27T11:10:00.000Z");

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
      sessionId: ("crm-falsification-" + input.requestId) as never,
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

const primaryOrganizationId = seedIds.organization.asteria;
const primaryMembershipId = seedIds.membership.asteriaAdmin;
const primaryUserId = seedIds.user.asteriaAdmin;
const foreignOrganizationId = seedIds.organization.northstar;
const foreignMembershipId = seedIds.membership.northstarAdmin;
const foreignUserId = seedIds.user.northstarAdmin;

const platform = teamContext({
  organizationId: primaryOrganizationId,
  membershipId: primaryMembershipId,
  userId: primaryUserId,
  requestId: "r6-crm-falsify-primary",
});

const foreign = teamContext({
  organizationId: foreignOrganizationId,
  membershipId: foreignMembershipId,
  userId: foreignUserId,
  requestId: "r6-crm-falsify-foreign",
});

function mustOk<T>(result: CrmCoreResult<T>): T {
  if (result.kind !== "ok") {
    throw new Error("CRM falsification fixture failed: " + result.code);
  }
  return result.value;
}

async function resourceCount(organizationId: string, resourceType: string) {
  const rows = await database.$queryRawUnsafe<Array<{ count: bigint }>>(
    `SELECT count(*)::bigint AS count
       FROM platform.resources
      WHERE owner_organization_id = $1::uuid
        AND resource_type = $2::text`,
    organizationId,
    resourceType,
  );
  return Number(rows[0]?.count ?? BigInt(0));
}

async function outboxCount(organizationId: string) {
  const rows = await database.$queryRawUnsafe<Array<{ count: bigint }>>(
    `SELECT count(*)::bigint AS count
       FROM platform.outbox_events
      WHERE owner_organization_id = $1::uuid`,
    organizationId,
  );
  return Number(rows[0]?.count ?? BigInt(0));
}

async function tableCount(
  sql: string,
  ...params: readonly (string | number | Date)[]
) {
  const rows = await database.$queryRawUnsafe<Array<{ count: bigint }>>(
    sql,
    ...params,
  );
  return Number(rows[0]?.count ?? BigInt(0));
}

let fixture!: {
  ownCompanyId: string;
  ownContactId: string;
  ownSourceId: string;
  ownLeadId: string;
  ownLeadResourceId: string;
  ownListId: string;
  ownExtractionJobId: string;
  foreignCompanyId: string;
  foreignContactId: string;
  foreignSourceId: string;
  foreignLeadId: string;
  foreignLeadResourceId: string;
  foreignListId: string;
  foreignExtractionJobId: string;
  foreignEnrichmentJobId: string;
};

beforeAll(async () => {
  const ownCompany = mustOk(
    await createCompany(platform, { name: "FALSIFY Own Company" }, database),
  );
  const ownContact = mustOk(
    await createContact(
      platform,
      {
        companyId: ownCompany.id,
        title: "FALSIFY Own Contact",
        emailOriginal: "own@example.invalid",
        emailNormalized: "own@example.invalid",
      },
      database,
    ),
  );
  const ownSource = mustOk(
    await createLeadSource(
      platform,
      { sourceType: "PUBLIC_WEB", name: "FALSIFY Own Source" },
      database,
    ),
  );
  const ownLead = mustOk(
    await createLead(
      platform,
      {
        companyId: ownCompany.id,
        contactId: ownContact.id,
        leadSourceId: ownSource.id,
        sourceRecordKey: "falsify-own-lead",
      },
      database,
    ),
  );
  const ownList = mustOk(
    await createLeadList(platform, { name: "FALSIFY Own List" }, database),
  );
  const ownExtraction = mustOk(
    await createExtractionJob(
      platform,
      {
        leadSourceId: ownSource.id,
        querySnapshot: { q: "own" },
        requestHash: "falsify-own-extraction",
      },
      database,
    ),
  );

  const foreignCompany = mustOk(
    await createCompany(foreign, { name: "FALSIFY Foreign Company" }, database),
  );
  const foreignContact = mustOk(
    await createContact(
      foreign,
      {
        companyId: foreignCompany.id,
        title: "FALSIFY Foreign Contact",
        emailOriginal: "foreign@example.invalid",
        emailNormalized: "foreign@example.invalid",
      },
      database,
    ),
  );
  const foreignSource = mustOk(
    await createLeadSource(
      foreign,
      { sourceType: "PUBLIC_WEB", name: "FALSIFY Foreign Source" },
      database,
    ),
  );
  const foreignLead = mustOk(
    await createLead(
      foreign,
      {
        companyId: foreignCompany.id,
        contactId: foreignContact.id,
        leadSourceId: foreignSource.id,
        sourceRecordKey: "falsify-foreign-lead",
      },
      database,
    ),
  );
  const foreignList = mustOk(
    await createLeadList(foreign, { name: "FALSIFY Foreign List" }, database),
  );
  const foreignExtraction = mustOk(
    await createExtractionJob(
      foreign,
      {
        leadSourceId: foreignSource.id,
        querySnapshot: { q: "foreign" },
        requestHash: "falsify-foreign-extraction",
      },
      database,
    ),
  );
  const foreignEnrichment = mustOk(
    await requestEnrichment(
      foreign,
      {
        targetResourceId: foreignLead.resourceId,
        provider: "falsify-provider",
        requestedFields: ["title"],
        requestHash: "falsify-foreign-enrichment",
      },
      database,
    ),
  );

  fixture = {
    ownCompanyId: ownCompany.id,
    ownContactId: ownContact.id,
    ownSourceId: ownSource.id,
    ownLeadId: ownLead.id,
    ownLeadResourceId: ownLead.resourceId,
    ownListId: ownList.id,
    ownExtractionJobId: ownExtraction.id,
    foreignCompanyId: foreignCompany.id,
    foreignContactId: foreignContact.id,
    foreignSourceId: foreignSource.id,
    foreignLeadId: foreignLead.id,
    foreignLeadResourceId: foreignLead.resourceId,
    foreignListId: foreignList.id,
    foreignExtractionJobId: foreignExtraction.id,
    foreignEnrichmentJobId: foreignEnrichment.id,
  };
});

afterAll(async () => {
  await database.$disconnect();
});

describe("R6 CRM command-layer falsification", () => {
  it("derives owner and membership from trusted context and ignores forged input authority", async () => {
    const forged = {
      name: "FALSIFY forged owner input",
      ownerOrganizationId: foreignOrganizationId,
      ownerMembershipId: foreignMembershipId,
      createdByMembershipId: foreignMembershipId,
    };

    const result = await createCompany(platform, forged, database);
    expect(result.kind).toBe("ok");
    if (result.kind !== "ok") return;

    const rows = await database.$queryRawUnsafe<
      Array<{
        owner_organization_id: string;
        owner_membership_id: string | null;
        created_by_membership_id: string | null;
      }>
    >(
      `SELECT owner_organization_id, owner_membership_id, created_by_membership_id
         FROM crm.companies
        WHERE id = $1::uuid`,
      result.value.id,
    );

    expect(rows).toEqual([
      {
        owner_organization_id: primaryOrganizationId,
        owner_membership_id: primaryMembershipId,
        created_by_membership_id: primaryMembershipId,
      },
    ]);
  });

  it("rejects a forged cross-tenant membership context and rolls back its resource envelope", async () => {
    const forgedContext = teamContext({
      organizationId: primaryOrganizationId,
      membershipId: foreignMembershipId,
      userId: primaryUserId,
      requestId: "r6-crm-forged-membership",
    });
    const beforeResources = await resourceCount(
      primaryOrganizationId,
      "company",
    );
    const beforeOutbox = await outboxCount(primaryOrganizationId);

    const result = await createCompany(
      forgedContext,
      { name: "FALSIFY forged membership company" },
      database,
    );

    expect(result).toEqual({ kind: "error", code: "INVALID" });
    expect(
      await resourceCount(primaryOrganizationId, "company"),
    ).toBe(beforeResources);
    expect(await outboxCount(primaryOrganizationId)).toBe(beforeOutbox);
    expect(
      await tableCount(
        `SELECT count(*)::bigint AS count
           FROM crm.companies
          WHERE name = 'FALSIFY forged membership company'`,
      ),
    ).toBe(0);
  });

  it.each([
    ["contact/company", "contact", () =>
      createContact(
        platform,
        {
          companyId: fixture.foreignCompanyId,
          title: "FALSIFY cross-tenant contact",
        },
        database,
      )],
    ["lead/company", "lead", () =>
      createLead(
        platform,
        { companyId: fixture.foreignCompanyId, sourceRecordKey: "x-company" },
        database,
      )],
    ["lead/contact", "lead", () =>
      createLead(
        platform,
        { contactId: fixture.foreignContactId, sourceRecordKey: "x-contact" },
        database,
      )],
    ["lead/source", "lead", () =>
      createLead(
        platform,
        { leadSourceId: fixture.foreignSourceId, sourceRecordKey: "x-source" },
        database,
      )],
    ["extraction/source", "extraction-job", () =>
      createExtractionJob(
        platform,
        {
          leadSourceId: fixture.foreignSourceId,
          querySnapshot: { attack: true },
          requestHash: "falsify-cross-source",
        },
        database,
      )],
    ["enrichment/target-resource", "enrichment-job", () =>
      requestEnrichment(
        platform,
        {
          targetResourceId: fixture.foreignLeadResourceId,
          provider: "falsify-provider",
          requestedFields: ["title"],
          requestHash: "falsify-cross-enrichment",
        },
        database,
      )],
  ])(
    "rejects cross-tenant %s and leaves no separately registered %s resource",
    async (_name, resourceType, operation) => {
      const beforeResources = await resourceCount(
        primaryOrganizationId,
        resourceType,
      );
      const beforeOutbox = await outboxCount(primaryOrganizationId);

      const result = await operation();

      expect(result.kind).toBe("error");
      expect(
        await resourceCount(primaryOrganizationId, resourceType),
      ).toBe(beforeResources);
      expect(await outboxCount(primaryOrganizationId)).toBe(
        beforeOutbox,
      );
    },
  );

  it("rejects a staged record tied to a foreign extraction job with no child residue", async () => {
    const sourceRecordKey = "falsify-foreign-extraction-child";
    const result = await stageExtractedRecord(
      platform,
      {
        extractionJobId: fixture.foreignExtractionJobId,
        sourceRecordKey,
        rawPayload: { email: "foreign@example.invalid" },
        normalizedPayload: { email: "foreign@example.invalid" },
      },
      database,
    );

    expect(result.kind).toBe("error");
    expect(
      await tableCount(
        `SELECT count(*)::bigint AS count
           FROM crm.staged_records
          WHERE source_record_key = $1::text`,
        sourceRecordKey,
      ),
    ).toBe(0);
  });

  it("rejects enrichment facts for foreign jobs/resources with no evidence residue", async () => {
    const fieldKey = "falsify.foreign.title";
    const result = await recordEnrichmentFact(
      platform,
      {
        jobId: fixture.foreignEnrichmentJobId,
        targetResourceId: fixture.foreignLeadResourceId,
        fieldKey,
        typedValue: "foreign",
        observedAt: epoch,
      },
      database,
    );

    expect(result.kind).toBe("error");
    expect(
      await tableCount(
        `SELECT count(*)::bigint AS count
           FROM crm.enrichment_facts
          WHERE field_key = $1::text`,
        fieldKey,
      ),
    ).toBe(0);
  });

  it("rejects cross-tenant lead-list membership and keeps the list count unchanged", async () => {
    const before = await database.crmLeadList.findUniqueOrThrow({
      where: { id: fixture.ownListId },
      select: { memberCount: true },
    });

    const foreignLead = await addLeadListMember(
      platform,
      { leadListId: fixture.ownListId, leadId: fixture.foreignLeadId },
      database,
    );
    const foreignList = await addLeadListMember(
      platform,
      { leadListId: fixture.foreignListId, leadId: fixture.ownLeadId },
      database,
    );

    expect(foreignLead.kind).toBe("error");
    expect(foreignList.kind).toBe("error");

    const after = await database.crmLeadList.findUniqueOrThrow({
      where: { id: fixture.ownListId },
      select: { memberCount: true },
    });
    expect(after.memberCount).toBe(before.memberCount);
    expect(
      await tableCount(
        `SELECT count(*)::bigint AS count
           FROM crm.lead_list_members
          WHERE owner_organization_id = $1::uuid
            AND lead_id = $2::uuid`,
        primaryOrganizationId,
        fixture.foreignLeadId,
      ),
    ).toBe(0);
  });

  it("keeps duplicate list adds idempotent and the derived count exact", async () => {
    const first = await addLeadListMember(
      platform,
      { leadListId: fixture.ownListId, leadId: fixture.ownLeadId },
      database,
    );
    const second = await addLeadListMember(
      platform,
      { leadListId: fixture.ownListId, leadId: fixture.ownLeadId },
      database,
    );

    expect(first.kind).toBe("ok");
    expect(second.kind).toBe("ok");

    const live = await tableCount(
      `SELECT count(*)::bigint AS count
         FROM crm.lead_list_members
        WHERE owner_organization_id = $1::uuid
          AND lead_list_id = $2::uuid
          AND lead_id = $3::uuid
          AND removed_at IS NULL`,
      primaryOrganizationId,
      fixture.ownListId,
      fixture.ownLeadId,
    );
    const list = await database.crmLeadList.findUniqueOrThrow({
      where: { id: fixture.ownListId },
      select: { memberCount: true },
    });

    expect(live).toBe(1);
    expect(list.memberCount).toBe(1);
  });

  it("contains concurrent add/remove races without duplicate membership or count drift", async () => {
    const settled = await Promise.allSettled([
      addLeadListMember(
        platform,
        { leadListId: fixture.ownListId, leadId: fixture.ownLeadId },
        database,
      ),
      removeLeadListMember(
        platform,
        { leadListId: fixture.ownListId, leadId: fixture.ownLeadId },
        database,
      ),
    ]);

    expect(settled.every((entry) => entry.status === "fulfilled")).toBe(true);

    const live = await tableCount(
      `SELECT count(*)::bigint AS count
         FROM crm.lead_list_members
        WHERE owner_organization_id = $1::uuid
          AND lead_list_id = $2::uuid
          AND lead_id = $3::uuid
          AND removed_at IS NULL`,
      primaryOrganizationId,
      fixture.ownListId,
      fixture.ownLeadId,
    );
    const list = await database.crmLeadList.findUniqueOrThrow({
      where: { id: fixture.ownListId },
      select: { memberCount: true },
    });

    expect(live === 0 || live === 1).toBe(true);
    expect(list.memberCount).toBe(live);
  });

  it("rejects stale and illegal lifecycle transitions with zero history residue", async () => {
    const lead = mustOk(
      await createLead(
        platform,
        { companyId: fixture.ownCompanyId, sourceRecordKey: "falsify-transition" },
        database,
      ),
    );

    const illegalBefore = await tableCount(
      `SELECT count(*)::bigint AS count
         FROM crm.lead_status_history
        WHERE lead_id = $1::uuid`,
      lead.id,
    );
    const illegal = await transitionLeadLifecycle(
      platform,
      { leadId: lead.id, to: "QUALIFIED", expectedRowVersion: 1 },
      database,
    );
    expect(illegal).toEqual({ kind: "error", code: "TRANSITION_DENIED" });
    expect(
      await tableCount(
        `SELECT count(*)::bigint AS count
           FROM crm.lead_status_history
          WHERE lead_id = $1::uuid`,
        lead.id,
      ),
    ).toBe(illegalBefore);

    const first = await transitionLeadLifecycle(
      platform,
      { leadId: lead.id, to: "EXTRACTED", expectedRowVersion: 1 },
      database,
    );
    expect(first.kind).toBe("ok");

    const stale = await transitionLeadLifecycle(
      platform,
      { leadId: lead.id, to: "ENRICHMENT_PENDING", expectedRowVersion: 1 },
      database,
    );
    expect(stale).toEqual({ kind: "error", code: "STALE_WRITE" });

    const history = await tableCount(
      `SELECT count(*)::bigint AS count
         FROM crm.lead_status_history
        WHERE lead_id = $1::uuid`,
      lead.id,
    );
    expect(history).toBe(1);
  });

  it("conceals archived leads from lifecycle mutation and emits no history", async () => {
    const lead = mustOk(
      await createLead(
        platform,
        { companyId: fixture.ownCompanyId, sourceRecordKey: "falsify-archived" },
        database,
      ),
    );
    const archivedAt = new Date();
    await withCrmTenantTransaction(
      platform,
      async (transaction) => {
        await transaction.$queryRawUnsafe(
          `SELECT platform.update_r6_resource(
             $1::uuid,
             'Lead'::text,
             NULL::uuid,
             'INTERNAL'::platform."Visibility",
             'CONFIDENTIAL'::platform."Sensitivity",
             $2::timestamptz
           )`,
          lead.resourceId,
          archivedAt,
        );
        await transaction.crmLead.update({
          where: { id: lead.id },
          data: { archivedAt },
        });
      },
      database,
    );

    const result = await transitionLeadLifecycle(
      platform,
      { leadId: lead.id, to: "EXTRACTED", expectedRowVersion: 1 },
      database,
    );
    expect(result).toEqual({ kind: "error", code: "NOT_FOUND" });
    expect(
      await tableCount(
        `SELECT count(*)::bigint AS count
           FROM crm.lead_status_history
          WHERE lead_id = $1::uuid`,
        lead.id,
      ),
    ).toBe(0);
  });

  it("rejects foreign lead score and qualification writes and rolls back qualification resources", async () => {
    const scoreKey = "falsify-foreign-score";
    const score = await recordLeadScore(
      platform,
      {
        leadId: fixture.foreignLeadId,
        modelVersion: scoreKey,
        score: 99,
      },
      database,
    );
    expect(score.kind).toBe("error");
    expect(
      await tableCount(
        `SELECT count(*)::bigint AS count
           FROM crm.lead_scores
          WHERE model_version = $1::text`,
        scoreKey,
      ),
    ).toBe(0);

    const beforeResources = await resourceCount(
      primaryOrganizationId,
      "qualification",
    );
    const qualification = await recordQualification(
      platform,
      {
        leadId: fixture.foreignLeadId,
        criteriaVersion: "falsify-v1",
        answers: { attack: true },
        disposition: "QUALIFIED",
      },
      database,
    );
    expect(qualification.kind).toBe("error");
    expect(
      await resourceCount(primaryOrganizationId, "qualification"),
    ).toBe(beforeResources);
  });

  it("rejects duplicate candidates that connect resources across tenants with no resource residue", async () => {
    const beforeResources = await resourceCount(
      primaryOrganizationId,
      "duplicate-candidate",
    );
    const result = await createDuplicateCandidate(
      platform,
      {
        entityType: "lead",
        leftResourceId: fixture.ownLeadResourceId,
        rightResourceId: fixture.foreignLeadResourceId,
        confidence: 0.99,
        reasons: ["cross-tenant-attack"],
      },
      database,
    );

    expect(result.kind).toBe("error");
    expect(
      await resourceCount(primaryOrganizationId, "duplicate-candidate"),
    ).toBe(beforeResources);
  });

  it("rejects malformed UUID relationships as INVALID instead of leaking database exceptions", async () => {
    await expect(
      createContact(
        platform,
        { companyId: "not-a-uuid", title: "FALSIFY malformed id" },
        database,
      ),
    ).resolves.toEqual({ kind: "error", code: "INVALID" });
  });

  it("rejects empty normalized safety/evidence identifiers with zero resource residue", async () => {
    const suppressionBefore = await resourceCount(
      primaryOrganizationId,
      "suppression-entry",
    );
    const suppression = await createSuppressionEntry(
      platform,
      {
        channel: " ",
        normalizedDestinationHash: " ",
        reason: "falsify-empty",
        source: "test",
      },
      database,
    );
    expect(suppression).toEqual({ kind: "error", code: "INVALID" });
    expect(
      await resourceCount(primaryOrganizationId, "suppression-entry"),
    ).toBe(suppressionBefore);

    const enrichmentBefore = await resourceCount(
      primaryOrganizationId,
      "enrichment-job",
    );
    const enrichment = await requestEnrichment(
      platform,
      {
        targetResourceId: fixture.ownLeadResourceId,
        provider: " ",
        requestedFields: [],
        requestHash: " ",
      },
      database,
    );
    expect(enrichment).toEqual({ kind: "error", code: "INVALID" });
    expect(
      await resourceCount(primaryOrganizationId, "enrichment-job"),
    ).toBe(enrichmentBefore);

    const staged = await stageExtractedRecord(
      platform,
      {
        extractionJobId: fixture.ownExtractionJobId,
        sourceRecordKey: " ",
        rawPayload: {},
        normalizedPayload: {},
      },
      database,
    );
    expect(staged).toEqual({ kind: "error", code: "INVALID" });
  });

  it("executes the DNC/suppression command atomically using the canonical persisted state", async () => {
    const lead = mustOk(
      await createLead(
        platform,
        {
          companyId: fixture.ownCompanyId,
          contactId: fixture.ownContactId,
          sourceRecordKey: "falsify-dnc-canonical",
        },
        database,
      ),
    );

    const result = await suppressLead(
      platform,
      {
        leadId: lead.id,
        expectedRowVersion: 1,
        channel: "EMAIL",
        normalizedDestinationHash: "sha256:falsify-dnc",
        reason: "unsubscribe",
        source: "recipient",
      },
      database,
    );

    expect(result.kind).toBe("ok");
    if (result.kind !== "ok") return;

    const persisted = await database.crmLead.findUniqueOrThrow({
      where: { id: lead.id },
      select: { lifecycleState: true, rowVersion: true },
    });
    expect(persisted).toEqual({
      lifecycleState: "DO_NOT_CONTACT",
      rowVersion: 2,
    });
    expect(
      await tableCount(
        `SELECT count(*)::bigint AS count
           FROM crm.lead_status_history
          WHERE lead_id = $1::uuid
            AND to_state = 'DO_NOT_CONTACT'`,
        lead.id,
      ),
    ).toBe(1);
  });

  it("contains concurrent suppression races to one suppression/history transition", async () => {
    const lead = mustOk(
      await createLead(
        platform,
        { companyId: fixture.ownCompanyId, sourceRecordKey: "falsify-dnc-race" },
        database,
      ),
    );

    const command = {
      leadId: lead.id,
      expectedRowVersion: 1,
      channel: "EMAIL",
      normalizedDestinationHash: "sha256:falsify-dnc-race",
      reason: "unsubscribe",
      source: "recipient",
    } as const;

    const settled = await Promise.allSettled([
      suppressLead(platform, command, database),
      suppressLead(platform, command, database),
    ]);

    expect(settled.every((entry) => entry.status === "fulfilled")).toBe(true);
    const fulfilled = settled
      .filter((entry): entry is PromiseFulfilledResult<Awaited<ReturnType<typeof suppressLead>>> =>
        entry.status === "fulfilled",
      )
      .map((entry) => entry.value);

    expect(fulfilled.filter((result) => result.kind === "ok")).toHaveLength(1);
    expect(
      fulfilled.filter(
        (result) =>
          result.kind === "error" &&
          ["STALE_WRITE", "CONFLICT"].includes(result.code),
      ),
    ).toHaveLength(1);

    expect(
      await tableCount(
        `SELECT count(*)::bigint AS count
           FROM crm.suppression_entries
          WHERE normalized_destination_hash = $1::text`,
        command.normalizedDestinationHash,
      ),
    ).toBe(1);
    expect(
      await tableCount(
        `SELECT count(*)::bigint AS count
           FROM crm.lead_status_history
          WHERE lead_id = $1::uuid
            AND to_state = 'DO_NOT_CONTACT'`,
        lead.id,
      ),
    ).toBe(1);
  });

  it("rolls back suppression resource/domain/history residue after a rejected stale command", async () => {
    const lead = mustOk(
      await createLead(
        platform,
        { companyId: fixture.ownCompanyId, sourceRecordKey: "falsify-dnc-stale" },
        database,
      ),
    );

    const beforeResources = await resourceCount(
      primaryOrganizationId,
      "suppression-entry",
    );
    const beforeHistory = await tableCount(
      `SELECT count(*)::bigint AS count
         FROM crm.lead_status_history
        WHERE lead_id = $1::uuid`,
      lead.id,
    );
    const beforeOutbox = await outboxCount(primaryOrganizationId);

    const result = await suppressLead(
      platform,
      {
        leadId: lead.id,
        expectedRowVersion: 999,
        channel: "EMAIL",
        normalizedDestinationHash: "sha256:falsify-stale",
        reason: "stale",
        source: "test",
      },
      database,
    );

    expect(result).toEqual({ kind: "error", code: "STALE_WRITE" });
    expect(
      await resourceCount(primaryOrganizationId, "suppression-entry"),
    ).toBe(beforeResources);
    expect(
      await tableCount(
        `SELECT count(*)::bigint AS count
           FROM crm.suppression_entries
          WHERE normalized_destination_hash = 'sha256:falsify-stale'`,
      ),
    ).toBe(0);
    expect(
      await tableCount(
        `SELECT count(*)::bigint AS count
           FROM crm.lead_status_history
          WHERE lead_id = $1::uuid`,
        lead.id,
      ),
    ).toBe(beforeHistory);
    expect(await outboxCount(primaryOrganizationId)).toBe(beforeOutbox);
  });
});
