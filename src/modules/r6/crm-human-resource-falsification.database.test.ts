import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { seedIds } from "../../../prisma/seed/stable-ids";
import type {
  AuthorizedRequestContext,
  MembershipId,
  OrganizationId,
  PermissionKey,
  UserId,
} from "@/modules/foundation/request-context";
import { createPrismaClient } from "@/modules/persistence/client";
import {
  createCompany,
  createExtractionJob,
  createLeadSource,
  recordEnrichmentFact,
  requestEnrichment,
  reviewEnrichmentFact,
  stageExtractedRecord,
} from "@/modules/crm/core";
import { withCrmTenantTransaction } from "@/modules/crm/persistence";
import type { CrmCoreResult } from "@/modules/crm/types";

import {
  loadR6CompanyResource,
  loadR6EnrichmentFactResource,
  loadR6StagedRecordResource,
} from "./resources";

const database = createPrismaClient();
const now = new Date("2026-09-28T04:30:00.000Z");

function context(input: {
  organizationId: string;
  membershipId: string;
  userId: string;
  requestId: string;
}): AuthorizedRequestContext {
  return {
    authentication: "authenticated",
    scope: "authorized",
    requestId: input.requestId,
    identity: { userId: input.userId as UserId },
    session: {
      sessionId: ("r6-http-resource-" + input.requestId) as never,
      issuedAt: now,
      expiresAt: new Date(now.getTime() + 3_600_000),
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
    authorization: {
      roleKeys: [],
      permissions: new Set<PermissionKey>(),
      blockedPermissions: new Set<PermissionKey>(),
      grantPaths: [],
    },
  };
}

function mustOk<T>(result: CrmCoreResult<T>): T {
  if (result.kind !== "ok") throw new Error("fixture failed: " + result.code);
  return result.value;
}

const primary = context({
  organizationId: seedIds.organization.asteria,
  membershipId: seedIds.membership.asteriaAdmin,
  userId: seedIds.user.asteriaAdmin,
  requestId: "primary",
});
const foreign = context({
  organizationId: seedIds.organization.northstar,
  membershipId: seedIds.membership.northstarAdmin,
  userId: seedIds.user.northstarAdmin,
  requestId: "foreign",
});

let fixture!: {
  ownCompanyId: string;
  ownCompanyResourceId: string;
  foreignCompanyId: string;
  ownStagedId: string;
  foreignStagedId: string;
  ownFactId: string;
  foreignFactId: string;
};

beforeAll(async () => {
  const ownCompany = mustOk(
    await createCompany(primary, { name: "HTTP loader own company" }, database),
  );
  const foreignCompany = mustOk(
    await createCompany(foreign, { name: "HTTP loader foreign company" }, database),
  );

  const ownSource = mustOk(
    await createLeadSource(
      primary,
      { sourceType: "PUBLIC_WEB", name: "HTTP loader own source" },
      database,
    ),
  );
  const ownExtraction = mustOk(
    await createExtractionJob(
      primary,
      {
        leadSourceId: ownSource.id,
        querySnapshot: { q: "own" },
        requestHash: "http-loader-own-extraction",
      },
      database,
    ),
  );
  const ownStaged = mustOk(
    await stageExtractedRecord(
      primary,
      {
        extractionJobId: ownExtraction.id,
        sourceRecordKey: "http-loader-own-staged",
        rawPayload: { evidence: "own" },
        normalizedPayload: { evidence: "own" },
      },
      database,
    ),
  );

  const foreignSource = mustOk(
    await createLeadSource(
      foreign,
      { sourceType: "PUBLIC_WEB", name: "HTTP loader foreign source" },
      database,
    ),
  );
  const foreignExtraction = mustOk(
    await createExtractionJob(
      foreign,
      {
        leadSourceId: foreignSource.id,
        querySnapshot: { q: "foreign" },
        requestHash: "http-loader-foreign-extraction",
      },
      database,
    ),
  );
  const foreignStaged = mustOk(
    await stageExtractedRecord(
      foreign,
      {
        extractionJobId: foreignExtraction.id,
        sourceRecordKey: "http-loader-foreign-staged",
        rawPayload: { evidence: "foreign" },
        normalizedPayload: { evidence: "foreign" },
      },
      database,
    ),
  );

  const ownEnrichment = mustOk(
    await requestEnrichment(
      primary,
      {
        targetResourceId: ownCompany.resourceId,
        provider: "http-loader",
        requestedFields: ["industry"],
        requestHash: "http-loader-own-enrichment",
      },
      database,
    ),
  );
  const ownFact = mustOk(
    await recordEnrichmentFact(
      primary,
      {
        jobId: ownEnrichment.id,
        targetResourceId: ownCompany.resourceId,
        fieldKey: "industry",
        typedValue: "Manufacturing",
        observedAt: now,
      },
      database,
    ),
  );

  const foreignEnrichment = mustOk(
    await requestEnrichment(
      foreign,
      {
        targetResourceId: foreignCompany.resourceId,
        provider: "http-loader",
        requestedFields: ["industry"],
        requestHash: "http-loader-foreign-enrichment",
      },
      database,
    ),
  );
  const foreignFact = mustOk(
    await recordEnrichmentFact(
      foreign,
      {
        jobId: foreignEnrichment.id,
        targetResourceId: foreignCompany.resourceId,
        fieldKey: "industry",
        typedValue: "Foreign",
        observedAt: now,
      },
      database,
    ),
  );

  fixture = {
    ownCompanyId: ownCompany.id,
    ownCompanyResourceId: ownCompany.resourceId,
    foreignCompanyId: foreignCompany.id,
    ownStagedId: ownStaged.id,
    foreignStagedId: foreignStaged.id,
    ownFactId: ownFact.id,
    foreignFactId: foreignFact.id,
  };
});

afterAll(async () => database.$disconnect());

describe("R6 CRM human-owned trusted resource loaders", () => {
  it("conceals cross-tenant company, staged-record and enrichment-fact identifiers", async () => {
    await expect(
      loadR6CompanyResource(primary, fixture.foreignCompanyId, database),
    ).resolves.toBeNull();
    await expect(
      loadR6StagedRecordResource(primary, fixture.foreignStagedId, database),
    ).resolves.toBeNull();
    await expect(
      loadR6EnrichmentFactResource(primary, fixture.foreignFactId, database),
    ).resolves.toBeNull();
  });

  it("derives staged review scope and PII sensitivity from trusted job/domain state", async () => {
    const resource = await loadR6StagedRecordResource(
      primary,
      fixture.ownStagedId,
      database,
    );
    expect(resource).toMatchObject({
      resourceType: "staged-record",
      ownerOrganizationId: seedIds.organization.asteria,
      ownerMembershipId: seedIds.membership.asteriaAdmin,
      sensitivity: "PII",
      lifecycleState: "PENDING",
      version: 1,
    });
  });

  it("derives enrichment review lifecycle from the immutable fact decision state", async () => {
    const pending = await loadR6EnrichmentFactResource(
      primary,
      fixture.ownFactId,
      database,
    );
    expect(pending).toMatchObject({
      resourceType: "enrichment-fact",
      sensitivity: "PII",
      lifecycleState: "PENDING",
      version: 1,
    });

    const result = await reviewEnrichmentFact(
      primary,
      {
        enrichmentFactId: fixture.ownFactId,
        decision: "ACCEPTED",
        expectedRowVersion: 1,
      },
      database,
    );
    expect(result.kind).toBe("ok");

    const accepted = await loadR6EnrichmentFactResource(
      primary,
      fixture.ownFactId,
      database,
    );
    expect(accepted).toMatchObject({
      lifecycleState: "ACCEPTED",
      version: 2,
    });
  });

  it("conceals an archived company only after canonical resource-envelope archival", async () => {
    const before = await loadR6CompanyResource(primary, fixture.ownCompanyId, database);
    expect(before).not.toBeNull();

    await withCrmTenantTransaction(
      primary,
      async (transaction) => {
        const row = await transaction.crmCompany.findUniqueOrThrow({
          where: { id: fixture.ownCompanyId },
        });
        await transaction.$queryRaw`
          SELECT platform.update_r6_resource(
            ${row.resourceId}::uuid,
            ${row.name}::text,
            ${row.clientOrganizationId}::uuid,
            ${row.visibility}::platform."Visibility",
            ${row.sensitivity}::platform."Sensitivity",
            ${now}::timestamptz
          )
        `;
        await transaction.crmCompany.update({
          where: { id: fixture.ownCompanyId },
          data: { archivedAt: now },
        });
      },
      database,
    );

    await expect(
      loadR6CompanyResource(primary, fixture.ownCompanyId, database),
    ).resolves.toBeNull();

    const envelope = await database.resource.findUniqueOrThrow({
      where: { id: fixture.ownCompanyResourceId },
      select: { archivedAt: true },
    });
    expect(envelope.archivedAt).toEqual(now);
  });
});
