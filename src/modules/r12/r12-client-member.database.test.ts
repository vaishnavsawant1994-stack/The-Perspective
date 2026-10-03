import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { AccountState, MembershipStatus, MembershipType, OrganizationType, RecordStatus } from "@/generated/prisma/client";
import type { AuthorizedRequestContext, MembershipId, OrganizationId, SessionId, TenantScopedRequestContext, UserId } from "@/modules/foundation/request-context";
import { createPrismaClient } from "@/modules/persistence/client";

import { readR12Client, readR12Member, runR12Client, runR12Member, runR12Team, runR12Worker, type R12Result } from "./commands";

const database = createPrismaClient();
const epoch = new Date("2026-10-03T12:00:00.000Z");
const ownerId = crypto.randomUUID();
const clientOrgA = crypto.randomUUID();
const clientOrgB = crypto.randomUUID();
const staffId = crypto.randomUUID();
const staffUserId = crypto.randomUUID();
const userA = crypto.randomUUID();
const userB = crypto.randomUUID();
const memberA = crypto.randomUUID();
const memberB = crypto.randomUUID();
const membershipA = crypto.randomUUID();
const membershipB = crypto.randomUUID();
let sequence = 0;

function key() {
  sequence += 1;
  return `r12k${sequence.toString(36)}${crypto.randomUUID().replaceAll("-", "")}`.slice(0, 80);
}

function team(): TenantScopedRequestContext {
  return {
    authentication: "authenticated",
    scope: "tenant",
    requestId: "r12-team",
    identity: { userId: staffUserId as UserId },
    session: { sessionId: "r12-team" as SessionId, issuedAt: epoch, expiresAt: new Date(epoch.getTime() + 3600_000), authenticationMethod: "password" },
    membership: { membershipId: staffId as MembershipId, organizationId: ownerId as OrganizationId, surface: "TEAM" },
    tenant: { membershipId: staffId as MembershipId, organizationId: ownerId as OrganizationId, surface: "TEAM" },
  };
}

function client(userId: string, membershipId: string, organizationId: string, requestId: string): AuthorizedRequestContext {
  return {
    authentication: "authenticated",
    scope: "authorized",
    requestId,
    identity: { userId: userId as UserId },
    session: { sessionId: requestId as SessionId, issuedAt: epoch, expiresAt: new Date(epoch.getTime() + 3600_000), authenticationMethod: "password" },
    membership: { membershipId: membershipId as MembershipId, organizationId: organizationId as OrganizationId, surface: "CLIENT" },
    tenant: { membershipId: membershipId as MembershipId, organizationId: organizationId as OrganizationId, surface: "CLIENT" },
    authorization: { roleKeys: [], permissions: new Set(), blockedPermissions: new Set(), grantPaths: [] },
  };
}

async function must(label: string, result: R12Result & { token?: string }) {
  if (result.kind !== "ok") throw new Error(`${label}: ${JSON.stringify(result)}`);
  return result;
}

async function account(name: string, clientOrgId: string) {
  const id = crypto.randomUUID();
  const resourceId = crypto.randomUUID();
  await database.$executeRawUnsafe(
    `INSERT INTO platform.resources (id, resource_type, title, owner_organization_id, client_organization_id, visibility, sensitivity)
     VALUES ($1::uuid, 'client-account', $2, $3::uuid, $4::uuid, 'INTERNAL', 'CONFIDENTIAL')`,
    resourceId, name, ownerId, clientOrgId,
  );
  await database.$executeRawUnsafe(
    `INSERT INTO commercial.client_accounts (id, resource_id, owner_organization_id, client_organization_id, visibility, sensitivity, updated_at)
     VALUES ($1::uuid, $2::uuid, $3::uuid, $4::uuid, 'INTERNAL', 'CONFIDENTIAL', $5::timestamptz)`,
    id, resourceId, ownerId, clientOrgId, epoch,
  );
  return id;
}

async function project(accountId: string, clientOrgId: string, title: string, state: string) {
  const id = crypto.randomUUID();
  const workId = crypto.randomUUID();
  const draftId = crypto.randomUUID();
  const versionId = crypto.randomUUID();
  await database.$executeRawUnsafe(
    `INSERT INTO production.projects (
       id, resource_id, owner_organization_id, proposal_id, proposal_version_id, client_account_id,
       client_organization_id, title, state
     ) VALUES ($1::uuid, $1::uuid, $2::uuid, $1::uuid, $1::uuid, $3::uuid, $4::uuid, $5, $6)`,
    id, ownerId, accountId, clientOrgId, title, state,
  );
  await database.$executeRawUnsafe(
    `INSERT INTO production.editorial_works (id, resource_id, owner_organization_id, project_id) VALUES ($1::uuid, $1::uuid, $2::uuid, $3::uuid)`,
    workId, ownerId, id,
  );
  await database.$executeRawUnsafe(
    `INSERT INTO production.drafts (id, owner_organization_id, work_id, body) VALUES ($1::uuid, $2::uuid, $3::uuid, 'Internal staff note should not be a separate field')`,
    draftId, ownerId, workId,
  );
  await database.$executeRawUnsafe(
    `INSERT INTO production.draft_versions (id, owner_organization_id, draft_id, version_number, body, digest, issued_at)
     VALUES ($1::uuid, $2::uuid, $3::uuid, 1, 'Client visible draft', 'digest', now())`,
    versionId, ownerId, draftId,
  );
  await database.$executeRawUnsafe(
    `INSERT INTO production.editorial_approvals (id, owner_organization_id, draft_version_id, actor_membership_id, approved_at)
     VALUES ($1::uuid, $2::uuid, $3::uuid, $4::uuid, now())`,
    crypto.randomUUID(), ownerId, versionId, staffId,
  );
  return { id, versionId };
}

describe("R12 client and member persistence", () => {
  let accountA = "";
  let accountB = "";
  let tokenA = "";
  let versionA = "";

  beforeAll(async () => {
    const present = await database.$queryRawUnsafe<Array<{ exists: boolean }>>(
      `SELECT to_regprocedure('portal.r12_client_read(uuid,text,jsonb)') IS NOT NULL AS exists`,
    );
    expect(present[0]?.exists).toBe(true);
    await database.organization.createMany({ data: [
      { id: ownerId, organizationType: OrganizationType.PLATFORM, legalName: "R12 Owner", displayName: "R12 Owner", slug: `r12-owner-${ownerId.slice(0, 8)}`, status: RecordStatus.ACTIVE },
      { id: clientOrgA, organizationType: OrganizationType.CLIENT, legalName: "R12 Client A", displayName: "R12 Client A", slug: `r12-a-${clientOrgA.slice(0, 8)}`, status: RecordStatus.ACTIVE },
      { id: clientOrgB, organizationType: OrganizationType.CLIENT, legalName: "R12 Client B", displayName: "R12 Client B", slug: `r12-b-${clientOrgB.slice(0, 8)}`, status: RecordStatus.ACTIVE },
    ] });
    const people = [staffUserId, userA, userB, memberA, memberB].map((id, index) => ({
      personId: crypto.randomUUID(),
      userId: id,
      email: index === 0 ? "r12-staff@example.test" : `r12-${index}@example.test`,
    }));
    await database.person.createMany({ data: people.map((person) => ({ id: person.personId, displayName: person.email, emailOriginal: person.email, emailNormalized: person.email })) });
    await database.userAccount.createMany({ data: people.map((person) => ({ id: person.userId, personId: person.personId, accountState: AccountState.ACTIVE, emailVerifiedAt: epoch })) });
    await database.organizationMembership.createMany({ data: [
      { id: staffId, organizationId: ownerId, userAccountId: staffUserId, membershipType: MembershipType.STAFF, status: MembershipStatus.ACTIVE, joinedAt: epoch },
      { id: membershipA, organizationId: clientOrgA, userAccountId: userA, membershipType: MembershipType.CLIENT, status: MembershipStatus.ACTIVE, joinedAt: epoch },
      { id: membershipB, organizationId: clientOrgB, userAccountId: userB, membershipType: MembershipType.CLIENT, status: MembershipStatus.ACTIVE, joinedAt: epoch },
    ] });
    accountA = await account("Account A", clientOrgA);
    accountB = await account("Account B", clientOrgB);
    const invitedA = await must("invite a", await runR12Team(team(), "invite", { clientAccountId: accountA, email: "r12-1@example.test" }, key(), database));
    const invitedB = await must("invite b", await runR12Team(team(), "invite", { clientAccountId: accountB, email: "r12-2@example.test" }, key(), database));
    tokenA = invitedA.token ?? "";
    expect(tokenA.length).toBeGreaterThan(32);
    await must("accept a", await runR12Client(client(userA, membershipA, clientOrgA, "accept-a"), "accept", { token: tokenA }, key(), database));
    await must("accept b", await runR12Client(client(userB, membershipB, clientOrgB, "accept-b"), "accept", { token: invitedB.token }, key(), database));
    const visible = await project(accountA, clientOrgA, "Visible project", "CLIENT_REVIEW");
    versionA = visible.versionId;
    await project(accountB, clientOrgB, "Hidden project", "CLIENT_REVIEW");
    const publicationId = crypto.randomUUID();
    await database.$executeRawUnsafe(
      `INSERT INTO production.publications (id, resource_id, owner_organization_id, title, slug) VALUES ($1::uuid, $1::uuid, $2::uuid, 'R12', 'r12')`,
      publicationId, ownerId,
    );
    await database.$executeRawUnsafe(
      `INSERT INTO production.issues (id, resource_id, owner_organization_id, publication_id, edition_number, slug, title, season, theme, state, availability)
       VALUES ($1::uuid, $1::uuid, $2::uuid, $3::uuid, 1, 'visible-issue', 'Visible issue', 'Winter', 'Access', 'ISSUE_PUBLISHED', 'PREMIUM'),
              ($4::uuid, $4::uuid, $2::uuid, $3::uuid, 2, 'draft-issue', 'Draft issue', 'Winter', 'Hidden', 'ISSUE_DRAFT', 'PREMIUM')`,
      crypto.randomUUID(), ownerId, publicationId, crypto.randomUUID(),
    );
  });

  afterAll(async () => {
    await database.$disconnect();
  });

  it("isolates two clients in the same organization and hides internal fields", async () => {
    const home = await must("home", await readR12Client(client(userA, membershipA, clientOrgA, "home"), "dashboard", {}, database));
    expect(Object.keys(home.value.result as object).sort()).toEqual(["approvalCount", "invoiceCount", "projectCount"]);
    expect(JSON.stringify(home.value)).not.toMatch(/health|margin|notes|accountManager/u);
    const projects = await must("projects", await readR12Client(client(userA, membershipA, clientOrgA, "projects"), "projects", {}, database));
    const titles = (projects.value.result as Array<{ title: string }>).map((item) => item.title);
    expect(titles).toEqual(["Visible project"]);
    expect(titles).not.toContain("Hidden project");
    const hiddenId = await database.$queryRawUnsafe<Array<{ id: string }>>(
      `SELECT id::text FROM production.projects WHERE title = 'Hidden project'`,
    );
    const hidden = await readR12Client(client(userA, membershipA, clientOrgA, "hidden"), "project", { projectId: hiddenId[0]?.id }, database);
    expect(hidden).toMatchObject({ kind: "error", code: "NOT_FOUND" });
    const again = await runR12Client(client(userA, membershipA, clientOrgA, "replay-accept"), "accept", { token: tokenA }, key(), database);
    expect(again).toMatchObject({ kind: "error", code: "NOT_FOUND" });
  });

  it("binds approval to the current version and allows one decision", async () => {
    const stale = await runR12Client(client(userA, membershipA, clientOrgA, "stale"), "decide", { versionId: versionA, decision: "APPROVED", expectedVersion: 2 }, key(), database);
    expect(stale).toMatchObject({ kind: "error", code: "STALE_WRITE" });
    const foreign = await runR12Client(client(userB, membershipB, clientOrgB, "foreign-decide"), "decide", { versionId: versionA, decision: "APPROVED", expectedVersion: 1 }, key(), database);
    expect(foreign).toMatchObject({ kind: "error", code: "NOT_FOUND" });
    const decisionKey = key();
    const [first, second] = await Promise.all([
      runR12Client(client(userA, membershipA, clientOrgA, "decide-1"), "decide", { versionId: versionA, decision: "APPROVED", expectedVersion: 1 }, decisionKey, database),
      runR12Client(client(userA, membershipA, clientOrgA, "decide-2"), "decide", { versionId: versionA, decision: "APPROVED", expectedVersion: 1 }, decisionKey, database),
    ]);
    const outcomes = [first, second].map((result) => result.kind === "ok" ? result.value.code : result.code);
    expect(outcomes.filter((code) => code === "CREATED" || code === "REPLAY").length).toBeGreaterThan(0);
    expect(outcomes.every((code) => ["CREATED", "REPLAY", "CONFLICT", "INELIGIBLE", "NOT_FOUND"].includes(String(code)))).toBe(true);
    const rows = await database.$queryRawUnsafe<Array<{ count: number }>>(
      `SELECT count(*)::int AS count FROM production.client_approvals WHERE draft_version_id = $1::uuid`,
      versionA,
    );
    expect(rows[0]?.count).toBe(1);
    const changed = await runR12Client(client(userA, membershipA, clientOrgA, "changed"), "decide", { versionId: versionA, decision: "REJECTED", expectedVersion: 1 }, decisionKey, database);
    expect(changed).toMatchObject({ kind: "error", code: "IDEMPOTENCY_CONFLICT" });
  });

  it("shows an issued invoice without finance internals and does not touch commercial subscriptions", async () => {
    const proposalId = crypto.randomUUID();
    const proposalVersionId = crypto.randomUUID();
    const contractId = crypto.randomUUID();
    const contractVersionId = crypto.randomUUID();
    const auditId = crypto.randomUUID();
    const hash = "cd".repeat(32);
    await database.$transaction(async (tx) => {
      await tx.$executeRawUnsafe(`INSERT INTO commercial.proposals (id, resource_id, owner_organization_id, deal_id, client_account_id, status, current_version, currency) VALUES ($1::uuid, $2::uuid, $3::uuid, $4::uuid, $5::uuid, 'ACCEPTED', 1, 'USD')`, proposalId, crypto.randomUUID(), ownerId, crypto.randomUUID(), accountA);
      await tx.$executeRawUnsafe(`INSERT INTO commercial.proposal_versions (id, owner_organization_id, proposal_id, version, status, immutable, currency, subtotal_minor, tax_minor, total_minor) VALUES ($1::uuid, $2::uuid, $3::uuid, 1, 'ACCEPTED', true, 'USD', 100, 0, 100)`, proposalVersionId, ownerId, proposalId);
      await tx.$executeRawUnsafe(`INSERT INTO audit.audit_events (id, owner_organization_id, actor_type, action, request_id, occurred_at) VALUES ($1::uuid, $2::uuid, 'SYSTEM', 'r12.contract.bootstrap', $3, $4::timestamptz)`, auditId, ownerId, `r12-bootstrap-${contractId}`, epoch);
      await tx.$executeRawUnsafe(`INSERT INTO commercial.contracts (id, resource_id, owner_organization_id, client_account_id, source_proposal_id, source_proposal_version_id, source_proposal_version, status, current_version) VALUES ($1::uuid, $2::uuid, $3::uuid, $4::uuid, $5::uuid, $6::uuid, 1, 'SIGNED', 1)`, contractId, crypto.randomUUID(), ownerId, accountA, proposalId, proposalVersionId);
      await tx.$executeRawUnsafe(`INSERT INTO commercial.contract_versions (id, owner_organization_id, contract_id, version, source_proposal_id, source_proposal_version_id, source_proposal_version, status, immutable, document_snapshot, document_sha256, currency, subtotal_minor, tax_minor, total_minor, created_audit_event_id, issued_at, signed_at) VALUES ($1::uuid, $2::uuid, $3::uuid, 1, $4::uuid, $5::uuid, 1, 'SIGNED', true, '{"internalNote":"staff only"}'::jsonb, $6::char(64), 'USD', 100, 0, 100, $7::uuid, $8::timestamptz, $8::timestamptz)`, contractVersionId, ownerId, contractId, proposalId, proposalVersionId, hash, auditId, epoch);
      await tx.$executeRawUnsafe(`INSERT INTO commercial.invoices (id, resource_id, owner_organization_id, client_account_id, status, currency, total_minor, allocated_minor, finalized_at, source_contract_id, source_contract_version_id, source_contract_version, subtotal_minor, tax_minor, idempotency_key, request_hash) VALUES ($1::uuid, $1::uuid, $2::uuid, $3::uuid, 'FINALIZED', 'USD', 100, 0, now(), $4::uuid, $5::uuid, 1, 100, 0, $6, $7)`, crypto.randomUUID(), ownerId, accountA, contractId, contractVersionId, `r12-invoice-${key()}`, hash);
      await tx.$executeRawUnsafe(`INSERT INTO commercial.invoices (id, resource_id, owner_organization_id, client_account_id, status, currency, total_minor) VALUES ($1::uuid, $1::uuid, $2::uuid, $3::uuid, 'DRAFT', 'USD', 50)`, crypto.randomUUID(), ownerId, accountA);
    });
    const invoices = await must("invoices", await readR12Client(client(userA, membershipA, clientOrgA, "invoices"), "invoices", {}, database));
    const rows = invoices.value.result as Array<Record<string, unknown>>;
    expect(rows).toHaveLength(1);
    expect(Object.keys(rows[0] ?? {}).sort()).toEqual(["currency", "id", "paymentState", "status", "totalMinor"]);
    expect(JSON.stringify(rows)).not.toMatch(/internalNote|source_contract|subtotal/u);
    const contracts = await must("contracts", await readR12Client(client(userA, membershipA, clientOrgA, "contracts"), "contracts", {}, database));
    expect(Object.keys((contracts.value.result as Array<Record<string, unknown>>)[0] ?? {}).sort()).toEqual(["id", "status", "version"]);
    const other = await must("other invoices", await readR12Client(client(userB, membershipB, clientOrgB, "invoices-b"), "invoices", {}, database));
    expect(other.value.result).toEqual([]);
  });

  it("fails checkout closed, hides drafts, and revokes only the caller's entitlement", async () => {
    const before = await database.$queryRawUnsafe<Array<{ count: number }>>(`SELECT count(*)::int AS count FROM commercial.subscriptions`);
    const published = await database.$queryRawUnsafe<Array<{ id: string }>>(`SELECT id::text FROM production.issues WHERE slug = 'visible-issue'`);
    const draft = await database.$queryRawUnsafe<Array<{ id: string }>>(`SELECT id::text FROM production.issues WHERE slug = 'draft-issue'`);
    const offer = await must("offer", await runR12Worker("open-offer", {
      organizationId: ownerId, code: `premium-${key()}`, currency: "USD", amountMinor: 2500, interval: "MONTH", entitlementKey: published[0]?.id,
    }, key(), database));
    const forged = await runR12Member(memberA, "checkout", { offerId: offer.value.offerId, amount: 1 }, key(), "forged", database);
    expect(forged).toMatchObject({ kind: "error", code: "INVALID" });
    const checkout = await must("checkout", await runR12Member(memberA, "checkout", { offerId: offer.value.offerId }, key(), "checkout", database));
    expect(checkout.value.state).toBe("PROVIDER_UNAVAILABLE");
    const after = await database.$queryRawUnsafe<Array<{ count: number }>>(`SELECT count(*)::int AS count FROM commercial.subscriptions`);
    expect(after[0]?.count).toBe(before[0]?.count);
    const deniedDraft = await runR12Worker("grant", { organizationId: ownerId, userId: memberA, issueId: draft[0]?.id }, key(), database);
    expect(deniedDraft).toMatchObject({ kind: "error", code: "NOT_FOUND" });
    const granted = await must("grant", await runR12Worker("grant", { organizationId: ownerId, userId: memberA, issueId: published[0]?.id }, key(), database));
    const library = await must("library", await readR12Member(memberA, "library", {}, database));
    expect(library.value.result).toEqual([{ id: published[0]?.id, slug: "visible-issue", title: "Visible issue" }]);
    const otherLibrary = await must("other library", await readR12Member(memberB, "library", {}, database));
    expect(otherLibrary.value.result).toEqual([]);
    const hiddenIssue = await readR12Member(memberB, "issue", { issueId: published[0]?.id }, database);
    expect(hiddenIssue).toMatchObject({ kind: "error", code: "NOT_FOUND" });
    await database.$executeRawUnsafe(
      `INSERT INTO commercial.entitlements (id, owner_organization_id, subject_type, subject_id, entitlement_key, source_type, source_id, active)
       VALUES ($1::uuid, $2::uuid, 'USER', $3::uuid, $4, 'MANUAL', $1::uuid, true)`,
      crypto.randomUUID(), ownerId, memberA, draft[0]?.id,
    );
    const draftRead = await readR12Member(memberA, "issue", { issueId: draft[0]?.id }, database);
    expect(draftRead).toMatchObject({ kind: "error", code: "NOT_FOUND" });
    const cancelled = await must("cancel", await runR12Member(memberA, "cancel", { entitlementId: granted.value.entitlementId }, key(), "cancel", database));
    expect(cancelled.value.state).toBe("REVOKED");
    const gone = await readR12Member(memberA, "issue", { issueId: published[0]?.id }, database);
    expect(gone).toMatchObject({ kind: "error", code: "NOT_FOUND" });
  });

  it("denies a runtime insert under forced RLS", async () => {
    await expect(database.$transaction(async (tx) => {
      await tx.$executeRawUnsafe(`SET LOCAL ROLE perspective_runtime`);
      await tx.$executeRawUnsafe(`SELECT set_config('app.organization_id', $1, true)`, ownerId);
      await tx.$executeRawUnsafe(
        `INSERT INTO portal.access_grants (id, owner_organization_id, client_account_id, client_organization_id, email_normalized, token_hash, state, expires_at, created_by)
         VALUES ($1::uuid, $2::uuid, $3::uuid, $4::uuid, 'x@example.test', $5, 'INVITED', now() + interval '1 day', $6::uuid)`,
        crypto.randomUUID(), ownerId, accountA, clientOrgA, "ab".repeat(32), staffId,
      );
    })).rejects.toThrow();
  });
});
