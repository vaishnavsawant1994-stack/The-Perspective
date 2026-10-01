import { afterAll, beforeAll, describe, expect, it } from "vitest";

import {
  AccountState,
  MembershipStatus,
  MembershipType,
  OrganizationType,
  RecordStatus,
} from "@/generated/prisma/client";
import type {
  AuthorizedRequestContext,
  MembershipId,
  OrganizationId,
  SessionId,
  TenantScopedRequestContext,
  UserId,
} from "@/modules/foundation/request-context";
import { createPrismaClient } from "@/modules/persistence/client";

import { decideClientVersion, resolveClientVersion, runR8Command, type R8Result } from "./commands";

const database = createPrismaClient();
const epoch = new Date("2026-10-01T12:00:00.000Z");
const ownerId = crypto.randomUUID();
const foreignOrgId = crypto.randomUUID();
const clientOrgId = crypto.randomUUID();
const staffId = crypto.randomUUID();
const foreignStaffId = crypto.randomUUID();
const clientMembershipId = crypto.randomUUID();
const clientUserId = crypto.randomUUID();
const staffUserId = crypto.randomUUID();
const personId = crypto.randomUUID();

let sequence = 0;

function key() {
  sequence += 1;
  return `r8k${sequence.toString(36)}${crypto.randomUUID().replaceAll("-", "")}`.slice(0, 80);
}

function session(id: string) {
  return {
    sessionId: id as SessionId,
    issuedAt: epoch,
    expiresAt: new Date(epoch.getTime() + 60 * 60 * 1000),
    authenticationMethod: "password",
  };
}

function team(organizationId: string, membershipId: string, requestId: string): TenantScopedRequestContext {
  return {
    authentication: "authenticated",
    scope: "tenant",
    requestId,
    identity: { userId: staffUserId as UserId },
    session: session(requestId),
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

const owner = team(ownerId, staffId, "r8-owner");
const foreign = team(foreignOrgId, foreignStaffId, "r8-foreign");

function clientContext(requestId: string): AuthorizedRequestContext {
  return {
    authentication: "authenticated",
    scope: "authorized",
    requestId,
    identity: { userId: clientUserId as UserId },
    session: session(requestId),
    membership: {
      membershipId: clientMembershipId as MembershipId,
      organizationId: clientOrgId as OrganizationId,
      surface: "CLIENT",
    },
    tenant: {
      membershipId: clientMembershipId as MembershipId,
      organizationId: clientOrgId as OrganizationId,
      surface: "CLIENT",
    },
    authorization: {
      roleKeys: [],
      permissions: new Set(),
      blockedPermissions: new Set(),
      grantPaths: [],
    },
  };
}

function num(value: unknown) {
  const parsed = Number(value);
  if (!Number.isInteger(parsed)) throw new Error(`expected integer, received ${String(value)}`);
  return parsed;
}

function text(value: unknown) {
  if (typeof value !== "string" || value.length === 0) throw new Error(`expected id, received ${String(value)}`);
  return value;
}

async function must(label: string, result: R8Result) {
  if (result.kind !== "ok") throw new Error(`${label}: ${JSON.stringify(result)}`);
  return result.value;
}

async function command(actor: TenantScopedRequestContext, commandName: string, payload: Record<string, unknown>) {
  return runR8Command(actor, commandName, payload, key(), database);
}

async function count(sql: string, ...values: unknown[]) {
  const rows = await database.$queryRawUnsafe<Array<{ count: number }>>(
    `SELECT (${sql})::int AS count`,
    ...values,
  );
  return rows[0]?.count ?? 0;
}

async function projectState(projectId: string) {
  const rows = await database.$queryRawUnsafe<Array<{ state: string; row_version: number }>>(
    `SELECT state, row_version FROM production.projects WHERE id = $1::uuid`,
    projectId,
  );
  return rows[0];
}

async function acceptedProposal() {
  const proposalId = crypto.randomUUID();
  const proposalVersionId = crypto.randomUUID();
  const clientAccountId = crypto.randomUUID();
  const resourceId = crypto.randomUUID();
  await database.$transaction(async (tx) => {
    await tx.$executeRawUnsafe(
      `INSERT INTO platform.resources (
         id, resource_type, title, owner_organization_id, client_organization_id, visibility, sensitivity
       ) VALUES ($1::uuid, 'client-account', 'R8 client', $2::uuid, $3::uuid, 'INTERNAL', 'CONFIDENTIAL')`,
      resourceId, ownerId, clientOrgId,
    );
    await tx.$executeRawUnsafe(
      `INSERT INTO commercial.client_accounts (
         id, resource_id, owner_organization_id, client_organization_id, visibility, sensitivity, updated_at
       ) VALUES ($1::uuid, $2::uuid, $3::uuid, $4::uuid, 'INTERNAL', 'CONFIDENTIAL', $5::timestamptz)`,
      clientAccountId, resourceId, ownerId, clientOrgId, epoch,
    );
    await tx.$executeRawUnsafe(
      `INSERT INTO commercial.proposals (
         id, resource_id, owner_organization_id, deal_id, client_account_id, status, current_version, currency
       ) VALUES ($1::uuid, $2::uuid, $3::uuid, $4::uuid, $5::uuid, 'ACCEPTED', 1, 'USD')`,
      proposalId, crypto.randomUUID(), ownerId, crypto.randomUUID(), clientAccountId,
    );
    await tx.$executeRawUnsafe(
      `INSERT INTO commercial.proposal_versions (
         id, owner_organization_id, proposal_id, version, status, immutable, currency,
         subtotal_minor, tax_minor, total_minor
       ) VALUES ($1::uuid, $2::uuid, $3::uuid, 1, 'ACCEPTED', true, 'USD', 100, 0, 100)`,
      proposalVersionId, ownerId, proposalId,
    );
    await tx.$executeRawUnsafe(
      `INSERT INTO commercial.proposal_acceptances (
         id, owner_organization_id, client_organization_id, client_account_id, proposal_id,
         proposal_version_id, proposal_version, expected_row_version, accepted_row_version,
         actor_user_id, actor_membership_id, accepted_at, idempotency_key, request_hash, after_hash
       ) VALUES (
         $1::uuid, $2::uuid, $3::uuid, $4::uuid, $5::uuid,
         $6::uuid, 1, 1, 2,
         $7::uuid, $8::uuid, $9::timestamptz, $10::text, $11::text, $11::text
       )`,
      crypto.randomUUID(), ownerId, clientOrgId, clientAccountId, proposalId,
      proposalVersionId, clientUserId, clientMembershipId, epoch, key(), "ab".repeat(32),
    );
  });
  return proposalId;
}

describe("R8 production persistence", () => {
  beforeAll(async () => {
    const present = await database.$queryRawUnsafe<Array<{ exists: boolean | null }>>(
      `SELECT to_regprocedure('production.r8_execute(text,uuid,jsonb,uuid,uuid,text,text,text)') IS NOT NULL AS exists`,
    );
    expect(present[0]?.exists, "R8 command function must exist").toBe(true);
    await database.organization.createMany({
      data: [
        { id: ownerId, organizationType: OrganizationType.PLATFORM, legalName: "R8 Owner", displayName: "R8 Owner", slug: `r8-owner-${ownerId.slice(0, 8)}`, status: RecordStatus.ACTIVE },
        { id: foreignOrgId, organizationType: OrganizationType.PLATFORM, legalName: "R8 Foreign", displayName: "R8 Foreign", slug: `r8-foreign-${foreignOrgId.slice(0, 8)}`, status: RecordStatus.ACTIVE },
        { id: clientOrgId, organizationType: OrganizationType.CLIENT, legalName: "R8 Client", displayName: "R8 Client", slug: `r8-client-${clientOrgId.slice(0, 8)}`, status: RecordStatus.ACTIVE },
      ],
    });
    await database.person.createMany({
      data: [
        { id: personId, displayName: "R8 Credit" },
        { id: crypto.randomUUID(), displayName: "R8 Staff" },
      ],
    });
    const staffPerson = crypto.randomUUID();
    const foreignPerson = crypto.randomUUID();
    const clientPerson = crypto.randomUUID();
    await database.person.createMany({
      data: [
        { id: staffPerson, displayName: "R8 Staff User" },
        { id: foreignPerson, displayName: "R8 Foreign User" },
        { id: clientPerson, displayName: "R8 Client User" },
      ],
    });
    await database.userAccount.createMany({
      data: [
        { id: staffUserId, personId: staffPerson, accountState: AccountState.ACTIVE, emailVerifiedAt: epoch },
        { id: crypto.randomUUID(), personId: foreignPerson, accountState: AccountState.ACTIVE, emailVerifiedAt: epoch },
        { id: clientUserId, personId: clientPerson, accountState: AccountState.ACTIVE, emailVerifiedAt: epoch },
      ],
    });
    const foreignUser = (await database.userAccount.findFirstOrThrow({ where: { personId: foreignPerson } })).id;
    await database.organizationMembership.createMany({
      data: [
        { id: staffId, organizationId: ownerId, userAccountId: staffUserId, membershipType: MembershipType.STAFF, status: MembershipStatus.ACTIVE, joinedAt: epoch },
        { id: foreignStaffId, organizationId: foreignOrgId, userAccountId: foreignUser, membershipType: MembershipType.STAFF, status: MembershipStatus.ACTIVE, joinedAt: epoch },
        { id: clientMembershipId, organizationId: clientOrgId, userAccountId: clientUserId, membershipType: MembershipType.CLIENT, status: MembershipStatus.ACTIVE, joinedAt: epoch },
      ],
    });
  });

  afterAll(async () => {
    await database.$disconnect();
  });

  it("rejects direct runtime writes and keeps privileges select-only", async () => {
    const privileges = await database.$queryRawUnsafe<Array<{ insert: boolean; update: boolean; select: boolean }>>(
      `SELECT has_table_privilege('perspective_runtime', 'production.projects', 'INSERT') AS insert,
              has_table_privilege('perspective_runtime', 'production.projects', 'UPDATE') AS update,
              has_table_privilege('perspective_runtime', 'production.projects', 'SELECT') AS select`,
    );
    expect(privileges[0]).toMatchObject({ insert: false, update: false, select: true });
    await expect(database.$transaction(async (tx) => {
      await tx.$executeRawUnsafe("SET LOCAL ROLE perspective_runtime");
      await tx.$executeRawUnsafe(
        `INSERT INTO production.projects (
           id, resource_id, owner_organization_id, proposal_id, proposal_version_id,
           client_account_id, client_organization_id, title
         ) VALUES ($1::uuid, $1::uuid, $2::uuid, $1::uuid, $1::uuid, $1::uuid, $1::uuid, 'no')`,
        crypto.randomUUID(), ownerId,
      );
    })).rejects.toThrow();
  });

  it("creates one live project, replays the same command, and conflicts a changed payload", async () => {
    const proposalId = await acceptedProposal();
    const idempotencyKey = key();
    const payload = { proposalId, title: "First cut" };
    const created = await must("create", await runR8Command(owner, "create-project", payload, idempotencyKey, database));
    const replay = await must("replay", await runR8Command(owner, "create-project", payload, idempotencyKey, database));
    expect(replay.replayed).toBe(true);
    expect(replay.projectId).toBe(created.projectId);
    const changed = await runR8Command(owner, "create-project", { proposalId, title: "Other cut" }, idempotencyKey, database);
    expect(changed).toMatchObject({ kind: "error", code: "IDEMPOTENCY_CONFLICT" });
    const second = await command(owner, "create-project", { proposalId, title: "Second live" });
    expect(second).toMatchObject({ kind: "error", code: "CONFLICT" });
    expect(await count(`SELECT count(*) FROM production.projects WHERE proposal_id = $1::uuid`, proposalId)).toBe(1);
    const hidden = await command(foreign, "edit-project", { projectId: created.projectId, title: "Stolen", expectedRowVersion: 1 });
    expect(hidden).toMatchObject({ kind: "error", code: "NOT_FOUND" });
  });

  it("rolls back a project when the audit insert cannot complete", async () => {
    const proposalId = await acceptedProposal();
    const idempotencyKey = key();
    const storageKey = `r8:create-project:${ownerId}:${idempotencyKey}`;
    await database.$executeRawUnsafe(
      `INSERT INTO audit.audit_events (
         id, owner_organization_id, actor_type, action, request_id, idempotency_key, occurred_at
       ) VALUES ($1::uuid, $2::uuid, 'SYSTEM', 'r8.create-project', 'r8-rollback', $3::text, $4::timestamptz)`,
      crypto.randomUUID(), ownerId, storageKey, epoch,
    );
    const failed = await runR8Command(owner, "create-project", { proposalId, title: "Rollback" }, idempotencyKey, database);
    expect(failed).toMatchObject({ kind: "error", code: "CONFLICT" });
    expect(await count(`SELECT count(*) FROM production.projects WHERE proposal_id = $1::uuid`, proposalId)).toBe(0);
    expect(await count(
      `SELECT count(*) FROM platform.idempotency_receipts WHERE idempotency_key = $1::text AND state = 'COMPLETED'`,
      storageKey,
    )).toBe(0);
  });

  it("refuses skipped, stale, cancelled, and concurrent transitions", async () => {
    const proposalId = await acceptedProposal();
    const created = await must("create", await command(owner, "create-project", { proposalId, title: "Spine" }));
    const projectId = text(created.projectId);
    const skipped = await command(owner, "transition", { projectId, expectedState: "PROJECT_CREATED", expectedRowVersion: 1, targetState: "PUBLISHED" });
    expect(skipped).toMatchObject({ kind: "error", code: "INELIGIBLE" });
    expect((await projectState(projectId))?.state).toBe("PROJECT_CREATED");
    const stale = await command(owner, "edit-project", { projectId, title: "Renamed later", expectedRowVersion: 9 });
    expect(stale).toMatchObject({ kind: "error", code: "STALE_WRITE" });
    const cancelled = await must("cancel", await command(owner, "cancel-project", { projectId, reason: "Stopped", expectedRowVersion: 1 }));
    expect(cancelled.state).toBe("CANCELLED");
    const after = await command(owner, "transition", { projectId, expectedState: "CANCELLED", expectedRowVersion: num(cancelled.rowVersion) });
    expect(after).toMatchObject({ kind: "error", code: "INELIGIBLE" });

    const liveProposal = await acceptedProposal();
    const live = await must("live", await command(owner, "create-project", { proposalId: liveProposal, title: "Race" }));
    const liveId = text(live.projectId);
    const questionnaire = await must("iq", await command(owner, "create-questionnaire", { projectId: liveId, title: "Questions" }));
    await must("generate", await command(owner, "generate-questionnaire", {
      projectId: liveId,
      questionnaireId: questionnaire.questionnaireId,
      expectedRowVersion: 1,
    }));
    const pair = await Promise.all([
      command(owner, "transition", { projectId: liveId, expectedState: "PROJECT_CREATED", expectedRowVersion: 1 }),
      command(owner, "transition", { projectId: liveId, expectedState: "PROJECT_CREATED", expectedRowVersion: 1 }),
    ]);
    expect(pair.filter((result) => result.kind === "ok")).toHaveLength(1);
    expect((await projectState(liveId))?.state).toBe("IQ_GENERATED");
  });

  it("walks the frozen production spine without publishing or distributing", async () => {
    const proposalId = await acceptedProposal();
    const created = await must("create", await command(owner, "create-project", { proposalId, title: "Feature" }));
    const projectId = text(created.projectId);
    const otherProposal = await acceptedProposal();
    const other = await must("other", await command(owner, "create-project", { proposalId: otherProposal, title: "Other" }));
    const otherId = text(other.projectId);

    const milestone = await must("milestone", await command(owner, "create-milestone", { projectId, kind: "DRAFT_COMPLETE" }));
    const blocker = await must("blocker", await command(owner, "create-task", { projectId, title: "Blocker", priority: "HIGH" }));
    const blocked = await must("blocked", await command(owner, "create-task", {
      projectId,
      title: "Blocked",
      priority: "NORMAL",
      blockerTaskId: blocker.taskId,
      milestoneId: milestone.milestoneId,
    }));
    const foreignBlock = await command(owner, "create-task", { projectId: otherId, title: "Cross", blockerTaskId: blocker.taskId });
    expect(foreignBlock).toMatchObject({ kind: "error", code: "NOT_FOUND" });
    const foreignMilestone = await command(owner, "create-task", { projectId: otherId, title: "Cross milestone", milestoneId: milestone.milestoneId });
    expect(foreignMilestone).toMatchObject({ kind: "error", code: "NOT_FOUND" });
    expect(await command(owner, "complete-task", { taskId: blocked.taskId, expectedRowVersion: 1 })).toMatchObject({ kind: "error", code: "INELIGIBLE" });
    expect(await command(owner, "complete-milestone", { milestoneId: milestone.milestoneId, expectedRowVersion: 1 })).toMatchObject({ kind: "error", code: "INELIGIBLE" });
    await must("complete blocker", await command(owner, "complete-task", { taskId: blocker.taskId, expectedRowVersion: 1 }));
    await must("complete blocked", await command(owner, "complete-task", { taskId: blocked.taskId, expectedRowVersion: 1 }));
    await must("complete milestone", await command(owner, "complete-milestone", { milestoneId: milestone.milestoneId, expectedRowVersion: 1 }));
    expect((await projectState(projectId))?.state).toBe("PROJECT_CREATED");

    await must("member", await command(owner, "assign-member", { projectId, membershipId: staffId, projectRole: "EDITOR" }));
    const assigned = await must("assigned task", await command(owner, "create-task", { projectId, title: "Assigned" }));
    await must("assign task", await command(owner, "assign-task", { taskId: assigned.taskId, membershipId: staffId, expectedRowVersion: 1 }));
    await must("credit", await command(owner, "add-credit", { projectId, personId, creditRole: "AUTHOR" }));

    const questionnaire = await must("questionnaire", await command(owner, "create-questionnaire", { projectId, title: "Interview" }));
    const questionnaireId = text(questionnaire.questionnaireId);
    const generated = await must("generate", await command(owner, "generate-questionnaire", { questionnaireId, expectedRowVersion: 1 }));
    const sent = await must("send", await command(owner, "send-questionnaire", {
      questionnaireId,
      versionId: generated.versionId,
      expectedRowVersion: num(generated.rowVersion),
    }));
    const received = await must("receive", await command(owner, "receive-questionnaire", {
      questionnaireId,
      versionId: generated.versionId,
      body: "Answers",
      clientOrganizationId: crypto.randomUUID(),
      expectedRowVersion: num(sent.rowVersion),
    }));
    const duplicateReceive = await command(owner, "receive-questionnaire", {
      questionnaireId,
      versionId: generated.versionId,
      body: "Again",
      expectedRowVersion: num(received.rowVersion),
    });
    expect(duplicateReceive.kind).toBe("error");
    const responseClient = await database.$queryRawUnsafe<Array<{ client_organization_id: string }>>(
      `SELECT client_organization_id FROM production.questionnaire_responses WHERE questionnaire_version_id = $1::uuid`,
      generated.versionId,
    );
    expect(responseClient).toHaveLength(1);
    expect(responseClient[0]?.client_organization_id).toBe(clientOrgId);
    await must("lock", await command(owner, "lock-questionnaire", { questionnaireId, expectedRowVersion: num(received.rowVersion) }));

    let projectRow = 1;
    for (const expectedState of ["PROJECT_CREATED", "IQ_GENERATED", "IQ_SENT"] as const) {
      const moved = await must(expectedState, await command(owner, "transition", { projectId, expectedState, expectedRowVersion: projectRow }));
      projectRow = num(moved.rowVersion);
    }
    expect((await projectState(projectId))?.state).toBe("IQ_RECEIVED");

    const draft = await must("draft", await command(owner, "create-draft", { projectId }));
    const draftId = text(draft.draftId);
    const edited = await must("edit", await command(owner, "edit-draft", { draftId, body: "Draft body", expectedRowVersion: 1 }));
    const issued = await must("issue", await command(owner, "issue-draft", { draftId, expectedRowVersion: num(edited.rowVersion) }));
    const versionId = text(issued.versionId);
    const toDraft = await must("to draft", await command(owner, "transition", {
      projectId,
      expectedState: "IQ_RECEIVED",
      expectedRowVersion: projectRow,
    }));
    projectRow = num(toDraft.rowVersion);
    expect(toDraft.state).toBe("DRAFT_GENERATED");

    const review = await must("review", await command(owner, "open-review", { versionId }));
    const reviewId = text(review.reviewId);
    await must("note", await command(owner, "add-note", { reviewId, body: "internal-note-secret" }));
    const toEditorial = await must("editorial", await command(owner, "transition", {
      projectId,
      expectedState: "DRAFT_GENERATED",
      expectedRowVersion: projectRow,
    }));
    projectRow = num(toEditorial.rowVersion);
    expect(toEditorial.state).toBe("EDITORIAL_REVIEW");
    await must("resolve", await command(owner, "resolve-review", { reviewId, expectedRowVersion: 1 }));
    await must("approve", await command(owner, "editorial-approve", { versionId }));
    expect((await projectState(projectId))?.state).toBe("EDITORIAL_REVIEW");
    const toClient = await must("client review", await command(owner, "transition", {
      projectId,
      expectedState: "EDITORIAL_REVIEW",
      expectedRowVersion: projectRow,
    }));
    projectRow = num(toClient.rowVersion);
    expect(toClient.state).toBe("CLIENT_REVIEW");

    const revised = await must("revise", await command(owner, "edit-draft", { draftId, body: "Revised body", expectedRowVersion: num(issued.rowVersion) }));
    const secondIssue = await must("issue 2", await command(owner, "issue-draft", { draftId, expectedRowVersion: num(revised.rowVersion) }));
    const latestId = text(secondIssue.versionId);
    const staleDecision = await decideClientVersion(clientContext("r8-stale-client"), {
      ownerOrganizationId: ownerId,
      projectId,
      title: "Feature",
      state: "CLIENT_REVIEW",
      versionId,
      version: 1,
      body: "Draft body",
    }, "APPROVED", key(), database);
    expect(staleDecision).toMatchObject({ kind: "error", code: "INELIGIBLE" });
    const staffDecision = await command(owner, "client-decision", { versionId: latestId, decision: "APPROVED" });
    expect(staffDecision).toMatchObject({ kind: "error", code: "NOT_FOUND" });

    const secondReview = await must("review 2", await command(owner, "open-review", { versionId: latestId }));
    await must("resolve 2", await command(owner, "resolve-review", { reviewId: secondReview.reviewId, expectedRowVersion: 1 }));
    await must("approve 2", await command(owner, "editorial-approve", { versionId: latestId }));
    await must("cite", await command(owner, "add-citation", { versionId: latestId, sourceLabel: "Archive", locator: "p. 4" }));
    await must("fact", await command(owner, "record-fact-check", { versionId: latestId, status: "VERIFIED", note: "Checked" }));

    const projection = await resolveClientVersion(clientContext("r8-client-read"), latestId, database);
    expect(projection?.body).toBe("Revised body");
    expect(JSON.stringify(projection)).not.toContain("internal-note-secret");
    const decisionKey = key();
    const approved = await must("client", await decideClientVersion(clientContext("r8-client-decide"), projection!, "APPROVED", decisionKey, database));
    const replayed = await must("client replay", await decideClientVersion(clientContext("r8-client-decide"), projection!, "APPROVED", decisionKey, database));
    expect(replayed.replayed).toBe(true);
    expect(approved.decision).toBe("APPROVED");
    const duplicate = await decideClientVersion(clientContext("r8-client-again"), projection!, "REJECTED", key(), database);
    expect(duplicate).toMatchObject({ kind: "error", code: "CONFLICT" });

    const toApproval = await must("approval", await command(owner, "transition", {
      projectId,
      expectedState: "CLIENT_REVIEW",
      expectedRowVersion: projectRow,
    }));
    projectRow = num(toApproval.rowVersion);
    expect(toApproval.state).toBe("CLIENT_APPROVAL");
    const toAssets = await must("assets", await command(owner, "transition", {
      projectId,
      expectedState: "CLIENT_APPROVAL",
      expectedRowVersion: projectRow,
    }));
    projectRow = num(toAssets.rowVersion);
    expect(toAssets.state).toBe("ASSETS");

    const asset = await must("upload", await command(owner, "upload-asset", {
      projectId,
      filename: "cover.png",
      digest: "ab".repeat(32),
      byteSize: 12,
      storageKey: "caller/chosen/key",
    }));
    const assetId = text(asset.assetId);
    const storedKey = await database.$queryRawUnsafe<Array<{ storage_key: string }>>(
      `SELECT storage_key FROM production.asset_versions WHERE asset_id = $1::uuid`,
      assetId,
    );
    expect(storedKey[0]?.storage_key).toBe(`production/${ownerId}/${assetId}/1`);
    expect(await command(owner, "set-rights", { assetId, flag: "cleared", value: true, expectedRowVersion: 1 })).toMatchObject({ kind: "error", code: "CONFLICT" });
    await must("approved flag", await command(owner, "set-rights", { assetId, flag: "approved", value: true, expectedRowVersion: 1 }));
    await must("licensed flag", await command(owner, "set-rights", { assetId, flag: "licensed", value: true, expectedRowVersion: 2 }));
    await must("cleared flag", await command(owner, "set-rights", { assetId, flag: "cleared", value: true, expectedRowVersion: 3 }));
    const sameUpload = key();
    const uploadPayload = { projectId, filename: "once.png", digest: "cd".repeat(32), byteSize: 4 };
    const firstUpload = await must("upload once", await runR8Command(owner, "upload-asset", uploadPayload, sameUpload, database));
    const uploadReplay = await must("upload replay", await runR8Command(owner, "upload-asset", uploadPayload, sameUpload, database));
    expect(uploadReplay.replayed).toBe(true);
    expect(uploadReplay.assetId).toBe(firstUpload.assetId);
    expect(await runR8Command(owner, "upload-asset", { ...uploadPayload, byteSize: 9 }, sameUpload, database)).toMatchObject({ kind: "error", code: "IDEMPOTENCY_CONFLICT" });
    const secondAssetId = text(firstUpload.assetId);
    await must("second approved", await command(owner, "set-rights", { assetId: secondAssetId, flag: "approved", value: true, expectedRowVersion: 1 }));
    await must("second licensed", await command(owner, "set-rights", { assetId: secondAssetId, flag: "licensed", value: true, expectedRowVersion: 2 }));
    await must("second cleared", await command(owner, "set-rights", { assetId: secondAssetId, flag: "cleared", value: true, expectedRowVersion: 3 }));

    const toDesign = await must("design", await command(owner, "transition", { projectId, expectedState: "ASSETS", expectedRowVersion: projectRow }));
    projectRow = num(toDesign.rowVersion);
    expect(toDesign.state).toBe("DESIGN_STARTED");
    const foreignDeliverable = await command(owner, "create-deliverable", {
      projectId: otherId,
      kind: "DESIGN",
      targetType: "draft-version",
      targetId: latestId,
    });
    expect(foreignDeliverable).toMatchObject({ kind: "error", code: "NOT_FOUND" });
    const deliverable = await must("deliverable", await command(owner, "create-deliverable", {
      projectId,
      kind: "DESIGN",
      targetType: "draft-version",
      targetId: latestId,
    }));
    const toDesignReview = await must("design review", await command(owner, "transition", {
      projectId,
      expectedState: "DESIGN_STARTED",
      expectedRowVersion: projectRow,
    }));
    projectRow = num(toDesignReview.rowVersion);
    expect(toDesignReview.state).toBe("DESIGN_REVIEW");
    await must("complete design", await command(owner, "complete-deliverable", { deliverableId: deliverable.deliverableId, expectedRowVersion: 1 }));
    const toDesignApproved = await must("design approved", await command(owner, "transition", {
      projectId,
      expectedState: "DESIGN_REVIEW",
      expectedRowVersion: projectRow,
    }));
    projectRow = num(toDesignApproved.rowVersion);
    expect(toDesignApproved.state).toBe("DESIGN_APPROVED");
    for (const expectedState of ["DESIGN_APPROVED", "PUBLICATION_READY", "PUBLISHED", "DISTRIBUTION"] as const) {
      const moved = await must(expectedState, await command(owner, "transition", { projectId, expectedState, expectedRowVersion: projectRow }));
      projectRow = num(moved.rowVersion);
    }
    expect((await projectState(projectId))?.state).toBe("COMPLETED");
    expect(await command(owner, "transition", { projectId, expectedState: "COMPLETED", expectedRowVersion: projectRow })).toMatchObject({ kind: "error", code: "INELIGIBLE" });
    expect(await command(owner, "cancel-project", { projectId, reason: "Too late", expectedRowVersion: projectRow })).toMatchObject({ kind: "error", code: "INELIGIBLE" });
    expect(await count(
      `SELECT count(*) FROM platform.outbox_events WHERE event_type IN ('publication.published', 'distribution.dispatched')`,
    )).toBe(0);
  });
});
