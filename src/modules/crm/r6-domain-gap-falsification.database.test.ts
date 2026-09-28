import { afterAll, describe, expect, it } from "vitest";

import { seedIds } from "../../../prisma/seed/stable-ids";
import type { MembershipId, OrganizationId, TenantScopedRequestContext, UserId } from "@/modules/foundation/request-context";
import { createPrismaClient } from "@/modules/persistence/client";

import {
  createCompany,
  createContact,
  createExtractionJob,
  createLead,
  createLeadSource,
  recordEnrichmentFact,
  requestEnrichment,
  reviewEnrichmentFact,
  reviewStagedRecord,
  stageExtractedRecord,
  updateCompany,
  updateContact,
  updateLead,
} from "./core";
import type { CrmCoreResult } from "./types";

const database = createPrismaClient();
const now = new Date("2026-09-27T18:00:00.000Z");
const organizationId = seedIds.organization.asteria;
const membershipId = seedIds.membership.asteriaAdmin;
const userId = seedIds.user.asteriaAdmin;

const context: TenantScopedRequestContext = {
  authentication: "authenticated",
  scope: "tenant",
  requestId: "r6-crm-domain-gap-falsification",
  identity: { userId: userId as UserId },
  session: {
    sessionId: "r6-crm-domain-gap-falsification" as never,
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
    organizationId: organizationId as OrganizationId,
    membershipId: membershipId as MembershipId,
    surface: "TEAM",
  },
};

function mustOk<T>(result: CrmCoreResult<T>): T {
  if (result.kind !== "ok") throw new Error("fixture failed: " + result.code);
  return result.value;
}

afterAll(async () => database.$disconnect());

describe("R6 CRM missing domain command falsification", () => {
  it("reviews a staged record without rewriting immutable provider evidence and rejects stale replay", async () => {
    const source = mustOk(await createLeadSource(context, { sourceType: "PUBLIC_WEB", name: "Gap source" }, database));
    const job = mustOk(await createExtractionJob(context, { leadSourceId: source.id, querySnapshot: { q: "gap" }, requestHash: "gap-stage" }, database));
    const staged = mustOk(await stageExtractedRecord(context, {
      extractionJobId: job.id,
      sourceRecordKey: "immutable-provider-record",
      rawPayload: { email: "provider@example.invalid" },
      normalizedPayload: { email: "provider@example.invalid" },
      provenanceUrl: "https://example.invalid/provider",
      confidence: 0.8,
    }, database));

    const before = await database.crmStagedRecord.findUniqueOrThrow({ where: { id: staged.id } });
    const reviewed = await reviewStagedRecord(context, {
      stagedRecordId: staged.id,
      decision: "APPROVED",
      expectedRowVersion: staged.rowVersion,
    }, database);
    expect(reviewed.kind).toBe("ok");

    const after = await database.crmStagedRecord.findUniqueOrThrow({ where: { id: staged.id } });
    expect(after.validationState).toBe("APPROVED");
    expect(after.reviewedByMembershipId).toBe(membershipId);
    expect(after.rawPayload).toEqual(before.rawPayload);
    expect(after.normalizedPayload).toEqual(before.normalizedPayload);
    expect(after.provenanceUrl).toBe(before.provenanceUrl);
    expect(after.confidence?.toString()).toBe(before.confidence?.toString());

    await expect(reviewStagedRecord(context, {
      stagedRecordId: staged.id,
      decision: "REJECTED",
      expectedRowVersion: staged.rowVersion,
    }, database)).resolves.toEqual({ kind: "error", code: "STALE_WRITE" });
  });

  it("accepts or rejects enrichment evidence by decision metadata without rewriting provider evidence", async () => {
    const company = mustOk(await createCompany(context, { name: "Gap enrichment company" }, database));
    const job = mustOk(await requestEnrichment(context, {
      targetResourceId: company.resourceId,
      provider: "gap-provider",
      requestedFields: ["industry"],
      requestHash: "gap-enrichment",
    }, database));
    const fact = mustOk(await recordEnrichmentFact(context, {
      jobId: job.id,
      targetResourceId: company.resourceId,
      fieldKey: "industry",
      typedValue: "Manufacturing",
      sourceUrl: "https://example.invalid/fact",
      confidence: 0.91,
      observedAt: now,
    }, database));

    const before = await database.crmEnrichmentFact.findUniqueOrThrow({ where: { id: fact.id } });
    const accepted = await reviewEnrichmentFact(context, {
      enrichmentFactId: fact.id,
      decision: "ACCEPTED",
      expectedRowVersion: fact.rowVersion,
    }, database);
    expect(accepted.kind).toBe("ok");

    const after = await database.crmEnrichmentFact.findUniqueOrThrow({ where: { id: fact.id } });
    expect(after.acceptedByMembershipId).toBe(membershipId);
    expect(after.acceptedAt).not.toBeNull();
    expect(after.rejectedAt).toBeNull();
    expect(after.typedValue).toEqual(before.typedValue);
    expect(after.sourceUrl).toBe(before.sourceUrl);
    expect(after.confidence?.toString()).toBe(before.confidence?.toString());
    expect(after.observedAt).toEqual(before.observedAt);

    await expect(reviewEnrichmentFact(context, {
      enrichmentFactId: fact.id,
      decision: "REJECTED",
      expectedRowVersion: fact.rowVersion,
    }, database)).resolves.toEqual({ kind: "error", code: "STALE_WRITE" });
  });

  it("updates only qualified business/relationship fields with optimistic concurrency", async () => {
    const company = mustOk(await createCompany(context, { name: "Before company" }, database));
    const contact = mustOk(await createContact(context, { companyId: company.id, title: "Before title" }, database));
    const lead = mustOk(await createLead(context, { companyId: company.id, contactId: contact.id, sourceRecordKey: "immutable-source-key" }, database));

    const companyUpdate = await updateCompany(context, {
      companyId: company.id,
      expectedRowVersion: company.rowVersion,
      name: "After company",
      industry: "Manufacturing",
    }, database);
    expect(companyUpdate.kind).toBe("ok");

    const contactUpdate = await updateContact(context, {
      contactId: contact.id,
      expectedRowVersion: contact.rowVersion,
      title: "After title",
      relationshipState: "ACTIVE",
      preferredChannel: "EMAIL",
    }, database);
    expect(contactUpdate.kind).toBe("ok");

    const leadUpdate = await updateLead(context, {
      leadId: lead.id,
      expectedRowVersion: lead.rowVersion,
      companyId: company.id,
      contactId: contact.id,
      leadSourceId: null,
    }, database);
    expect(leadUpdate.kind).toBe("ok");

    const persistedLead = await database.crmLead.findUniqueOrThrow({ where: { id: lead.id } });
    expect(persistedLead.sourceRecordKey).toBe("immutable-source-key");
    expect(persistedLead.lifecycleState).toBe("NEW");
    expect(persistedLead.fitScore).toBeNull();
    expect(persistedLead.consentState).toBeNull();

    await expect(updateCompany(context, {
      companyId: company.id,
      expectedRowVersion: company.rowVersion,
      name: "stale",
    }, database)).resolves.toEqual({ kind: "error", code: "STALE_WRITE" });
  });

  it("conceals cross-tenant review targets and malformed review identifiers", async () => {
    const foreignContext = {
      ...context,
      requestId: "r6-crm-gap-foreign",
      identity: { userId: seedIds.user.northstarAdmin as UserId },
      membership: {
        membershipId: seedIds.membership.northstarAdmin as MembershipId,
        organizationId: seedIds.organization.northstar as OrganizationId,
        surface: "TEAM" as const,
      },
      tenant: {
        organizationId: seedIds.organization.northstar as OrganizationId,
        membershipId: seedIds.membership.northstarAdmin as MembershipId,
        surface: "TEAM" as const,
      },
    };
    const foreignSource = mustOk(await createLeadSource(foreignContext, { sourceType: "PUBLIC_WEB", name: "Gap foreign source" }, database));
    const foreignJob = mustOk(await createExtractionJob(foreignContext, { leadSourceId: foreignSource.id, querySnapshot: {}, requestHash: "gap-foreign-stage" }, database));
    const foreignStaged = mustOk(await stageExtractedRecord(foreignContext, {
      extractionJobId: foreignJob.id,
      sourceRecordKey: "gap-foreign-record",
      rawPayload: { immutable: true },
      normalizedPayload: { immutable: true },
    }, database));

    await expect(reviewStagedRecord(context, {
      stagedRecordId: foreignStaged.id,
      decision: "APPROVED",
      expectedRowVersion: foreignStaged.rowVersion,
    }, database)).resolves.toEqual({ kind: "error", code: "NOT_FOUND" });

    await expect(reviewStagedRecord(context, {
      stagedRecordId: "not-a-uuid",
      decision: "APPROVED",
      expectedRowVersion: 1,
    }, database)).resolves.toEqual({ kind: "error", code: "INVALID" });
  });

  it("contains concurrent staged and enrichment review to exactly one human decision", async () => {
    const source = mustOk(await createLeadSource(context, { sourceType: "PUBLIC_WEB", name: "Gap review race source" }, database));
    const extraction = mustOk(await createExtractionJob(context, { leadSourceId: source.id, querySnapshot: {}, requestHash: "gap-review-race" }, database));
    const staged = mustOk(await stageExtractedRecord(context, {
      extractionJobId: extraction.id,
      sourceRecordKey: "gap-review-race-record",
      rawPayload: { evidence: "original" },
      normalizedPayload: { evidence: "original" },
    }, database));

    const stagedRace = await Promise.all([
      reviewStagedRecord(context, { stagedRecordId: staged.id, decision: "APPROVED", expectedRowVersion: staged.rowVersion }, database),
      reviewStagedRecord(context, { stagedRecordId: staged.id, decision: "REJECTED", expectedRowVersion: staged.rowVersion }, database),
    ]);
    expect(stagedRace.filter((result) => result.kind === "ok")).toHaveLength(1);
    expect(stagedRace.filter((result) => result.kind === "error")).toHaveLength(1);

    const company = mustOk(await createCompany(context, { name: "Gap fact race company" }, database));
    const job = mustOk(await requestEnrichment(context, {
      targetResourceId: company.resourceId,
      provider: "gap-race-provider",
      requestedFields: ["industry"],
      requestHash: "gap-fact-race",
    }, database));
    const fact = mustOk(await recordEnrichmentFact(context, {
      jobId: job.id,
      targetResourceId: company.resourceId,
      fieldKey: "industry",
      typedValue: "Original",
      observedAt: now,
    }, database));
    const factRace = await Promise.all([
      reviewEnrichmentFact(context, { enrichmentFactId: fact.id, decision: "ACCEPTED", expectedRowVersion: fact.rowVersion }, database),
      reviewEnrichmentFact(context, { enrichmentFactId: fact.id, decision: "REJECTED", expectedRowVersion: fact.rowVersion }, database),
    ]);
    expect(factRace.filter((result) => result.kind === "ok")).toHaveLength(1);
    expect(factRace.filter((result) => result.kind === "error")).toHaveLength(1);

    const persisted = await database.crmEnrichmentFact.findUniqueOrThrow({ where: { id: fact.id } });
    expect(Boolean(persisted.acceptedAt) !== Boolean(persisted.rejectedAt)).toBe(true);
    expect(persisted.typedValue).toEqual("Original");
  });

  it("rejects foreign relationships, malformed identifiers, and no-op updates without residue", async () => {
    const foreignCompany = mustOk(await createCompany({
      ...context,
      requestId: "r6-crm-gap-foreign-company",
      identity: { userId: seedIds.user.northstarAdmin as UserId },
      membership: { membershipId: seedIds.membership.northstarAdmin as MembershipId, organizationId: seedIds.organization.northstar as OrganizationId, surface: "TEAM" },
      tenant: { organizationId: seedIds.organization.northstar as OrganizationId, membershipId: seedIds.membership.northstarAdmin as MembershipId, surface: "TEAM" },
    }, { name: "Gap foreign relation company" }, database));

    const ownCompany = mustOk(await createCompany(context, { name: "Gap relation company" }, database));
    const ownContact = mustOk(await createContact(context, { companyId: ownCompany.id, title: "Gap relation contact" }, database));
    const ownLead = mustOk(await createLead(context, { companyId: ownCompany.id, contactId: ownContact.id, sourceRecordKey: "gap-relation-lead" }, database));

    await expect(updateContact(context, {
      contactId: ownContact.id,
      expectedRowVersion: ownContact.rowVersion,
      companyId: foreignCompany.id,
    }, database)).resolves.toEqual({ kind: "error", code: "INVALID" });

    await expect(updateLead(context, {
      leadId: ownLead.id,
      expectedRowVersion: ownLead.rowVersion,
      companyId: foreignCompany.id,
    }, database)).resolves.toEqual({ kind: "error", code: "INVALID" });

    await expect(updateLead(context, {
      leadId: ownLead.id,
      expectedRowVersion: ownLead.rowVersion,
    }, database)).resolves.toEqual({ kind: "error", code: "INVALID" });

    await expect(updateCompany(context, {
      companyId: "not-a-uuid",
      expectedRowVersion: 1,
      name: "malformed",
    }, database)).resolves.toEqual({ kind: "error", code: "INVALID" });

    const persisted = await database.crmLead.findUniqueOrThrow({ where: { id: ownLead.id } });
    expect(persisted.companyId).toBe(ownCompany.id);
    expect(persisted.rowVersion).toBe(ownLead.rowVersion);
  });

  it("conceals archived update targets and preserves protected state", async () => {
    const company = mustOk(await createCompany(context, { name: "Gap archived company" }, database));
    await database.crmCompany.update({ where: { id: company.id }, data: { archivedAt: now } });

    await expect(updateCompany(context, {
      companyId: company.id,
      expectedRowVersion: company.rowVersion,
      name: "must not mutate",
    }, database)).resolves.toEqual({ kind: "error", code: "NOT_FOUND" });

    const persisted = await database.crmCompany.findUniqueOrThrow({ where: { id: company.id } });
    expect(persisted.name).toBe("Gap archived company");
    expect(persisted.rowVersion).toBe(company.rowVersion);
  });
});
