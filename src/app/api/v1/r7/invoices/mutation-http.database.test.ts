import { afterAll, beforeAll, describe, expect, it } from "vitest";

import {
  AccountState,
  AuthSurface,
  MembershipStatus,
  MembershipType,
  OrganizationType,
  PermissionEffect,
  RecordStatus,
  RoleScope,
} from "@/generated/prisma/client";
import { SESSION_COOKIE_NAME } from "@/modules/authentication/http/session-cookie";
import { createOpaqueToken, hashOpaqueToken } from "@/modules/authentication/crypto/tokens";
import { createPrismaClient } from "@/modules/persistence/client";

import { GET as getInvoice } from "./[invoiceId]/route";
import { POST as issueInvoiceHttp } from "./[invoiceId]/issue/route";
import { POST as createInvoiceHttp } from "./route";

const database = createPrismaClient();
const origin = "https://invoice.example.test";
const epoch = new Date("2026-10-01T12:00:00.000Z");
const ownerId = crypto.randomUUID();
const foreignOrgId = crypto.randomUUID();
const clientOrganizationId = crypto.randomUUID();

type Actor = { userId: string; membershipId: string; token: string };

async function organization(id: string, type: "PLATFORM" | "CLIENT", label: string) {
  await database.organization.create({
    data: {
      id,
      organizationType: type === "PLATFORM" ? OrganizationType.PLATFORM : OrganizationType.CLIENT,
      legalName: label,
      displayName: label,
      slug: `${label.slice(0, 12)}-${id.slice(0, 8)}`.toLowerCase(),
      status: RecordStatus.ACTIVE,
    },
  });
}

async function actor(organizationId: string, permissions: readonly string[], options?: { mfa?: boolean; issuedAt?: Date; selectMembership?: boolean }): Promise<Actor> {
  const userId = crypto.randomUUID();
  const personId = crypto.randomUUID();
  const membershipId = crypto.randomUUID();
  const email = `r7-http-${userId.slice(0, 8)}@example.test`;
  await database.person.create({
    data: { id: personId, displayName: "R7 Invoice HTTP", emailOriginal: email, emailNormalized: email },
  });
  await database.userAccount.create({
    data: { id: userId, personId, accountState: AccountState.ACTIVE, emailVerifiedAt: epoch },
  });
  await database.organizationMembership.create({
    data: {
      id: membershipId,
      organizationId,
      userAccountId: userId,
      membershipType: MembershipType.STAFF,
      status: MembershipStatus.ACTIVE,
      joinedAt: epoch,
    },
  });
  for (const key of permissions) {
    const permission = await database.permission.upsert({
      where: { key },
      create: {
        id: crypto.randomUUID(),
        key,
        domain: key.split(".")[0] ?? "invoice",
        action: key.split(".").slice(1).join(".") || "access",
        description: "R7 invoice HTTP qualification",
        riskLevel: "HIGH",
      },
      update: {},
    });
    const roleId = crypto.randomUUID();
    await database.role.create({
      data: {
        id: roleId,
        organizationId,
        key: `r7-http-${roleId.slice(0, 8)}`,
        name: "R7 Invoice HTTP",
        systemRole: false,
        defaultScope: RoleScope.ORG,
        status: RecordStatus.ACTIVE,
      },
    });
    await database.rolePermission.create({
      data: { roleId, permissionId: permission.id, effect: PermissionEffect.ALLOW, constraints: {} },
    });
    await database.membershipRole.create({
      data: {
        id: crypto.randomUUID(),
        membershipId,
        roleId,
        scope: RoleScope.ORG,
        validFrom: new Date(Date.now() - 60_000),
      },
    });
  }
  const token = createOpaqueToken();
  await database.session.create({
    data: {
      id: crypto.randomUUID(),
      userAccountId: userId,
      activeMembershipId: options?.selectMembership === false ? null : membershipId,
      tokenHash: hashOpaqueToken(token),
      surface: AuthSurface.TEAM,
      authenticationMethod: "password",
      mfaVerifiedAt: options?.mfa === false ? null : new Date(),
      issuedAt: options?.issuedAt ?? new Date(),
      expiresAt: new Date(Date.now() + 60 * 60 * 1000),
    },
  });
  return { userId, membershipId, token };
}

async function graph(createdByMembershipId: string, options?: { versionStatus?: string; contractStatus?: string }) {
  const versionStatus = options?.versionStatus ?? "SIGNED";
  const contractStatus = options?.contractStatus ?? versionStatus;
  const proposalId = crypto.randomUUID();
  const proposalVersionId = crypto.randomUUID();
  const contractId = crypto.randomUUID();
  const contractVersionId = crypto.randomUUID();
  const clientAccountId = crypto.randomUUID();
  const createdAudit = crypto.randomUUID();
  await database.$transaction(async (tx) => {
    const resourceId = crypto.randomUUID();
    await tx.$executeRawUnsafe(
      `INSERT INTO platform.resources (
         id, resource_type, title, owner_organization_id, client_organization_id, visibility, sensitivity
       ) VALUES ($1::uuid, 'client-account', 'R7 invoice http client', $2::uuid, $3::uuid, 'INTERNAL', 'CONFIDENTIAL')`,
      resourceId, ownerId, clientOrganizationId,
    );
    await tx.$executeRawUnsafe(
      `INSERT INTO commercial.client_accounts (
         id, resource_id, owner_organization_id, client_organization_id, visibility, sensitivity, updated_at
       ) VALUES ($1::uuid, $2::uuid, $3::uuid, $4::uuid, 'INTERNAL', 'CONFIDENTIAL', $5::timestamptz)`,
      clientAccountId, resourceId, ownerId, clientOrganizationId, epoch,
    );
    await tx.$executeRawUnsafe(
      `INSERT INTO commercial.proposals (
         id, resource_id, owner_organization_id, deal_id, client_account_id, status, current_version,
         currency, created_by_membership_id
       ) VALUES ($1::uuid, $2::uuid, $3::uuid, $4::uuid, $5::uuid, 'ACCEPTED', 1, 'USD', $6::uuid)`,
      proposalId, crypto.randomUUID(), ownerId, crypto.randomUUID(), clientAccountId, createdByMembershipId,
    );
    await tx.$executeRawUnsafe(
      `INSERT INTO commercial.proposal_versions (
         id, owner_organization_id, proposal_id, version, status, immutable, currency,
         subtotal_minor, tax_minor, total_minor
       ) VALUES ($1::uuid, $2::uuid, $3::uuid, 1, 'ACCEPTED', true, 'USD', 100, 5, 105)`,
      proposalVersionId, ownerId, proposalId,
    );
    await tx.$executeRawUnsafe(
      `INSERT INTO commercial.proposal_lines (
         id, owner_organization_id, proposal_version_id, description, quantity,
         unit_amount_minor, line_total_minor, position
       ) VALUES ($1::uuid, $2::uuid, $3::uuid, 'Signed scope', 2, 50, 100, 1)`,
      crypto.randomUUID(), ownerId, proposalVersionId,
    );
    await tx.$executeRawUnsafe(
      `INSERT INTO audit.audit_events (
         id, owner_organization_id, actor_type, action, request_id, occurred_at
       ) VALUES ($1::uuid, $2::uuid, 'SYSTEM', 'r7.contract.version.created', $3::text, $4::timestamptz)`,
      createdAudit, ownerId, "r7-invoice-http-" + contractId, epoch,
    );
    await tx.$executeRawUnsafe(
      `INSERT INTO commercial.contracts (
         id, resource_id, owner_organization_id, client_account_id, source_proposal_id,
         source_proposal_version_id, source_proposal_version, status, current_version
       ) VALUES ($1::uuid, $2::uuid, $3::uuid, $4::uuid, $5::uuid, $6::uuid, 1, $7::text, 1)`,
      contractId, crypto.randomUUID(), ownerId, clientAccountId, proposalId, proposalVersionId, contractStatus,
    );
    await tx.$executeRawUnsafe(
      `INSERT INTO commercial.contract_versions (
         id, owner_organization_id, contract_id, version, source_proposal_id, source_proposal_version_id,
         source_proposal_version, status, immutable, document_snapshot, document_sha256, currency,
         subtotal_minor, tax_minor, total_minor, created_audit_event_id, issued_at, signed_at
       ) VALUES (
         $1::uuid, $2::uuid, $3::uuid, 1, $4::uuid, $5::uuid, 1, $6::text, true,
         '{}'::jsonb, $7::char(64), 'USD', 100, 5, 105, $8::uuid,
         CASE WHEN $6::text IN ('OUT_FOR_SIGNATURE','SIGNED') THEN $9::timestamptz ELSE NULL END,
         CASE WHEN $6::text = 'SIGNED' THEN $9::timestamptz ELSE NULL END
       )`,
      contractVersionId, ownerId, contractId, proposalId, proposalVersionId, versionStatus, "ab".repeat(32), createdAudit, epoch,
    );
  });
  return { contractId, contractVersionId };
}

function request(path: string, token: string | undefined, body: unknown, key?: string, requestOrigin = origin) {
  const headers = new Headers({ origin: requestOrigin, "content-type": "application/json" });
  if (token) headers.set("cookie", `${SESSION_COOKIE_NAME}=${token}`);
  if (key) headers.set("idempotency-key", key);
  return new Request(`${origin}${path}`, { method: "POST", headers, body: JSON.stringify(body) });
}

async function stored(contractVersionId: string) {
  const rows = await database.$queryRawUnsafe<Array<{
    id: string;
    status: string;
    currency: string;
    subtotal_minor: bigint | null;
    tax_minor: bigint | null;
    total_minor: bigint;
    row_version: number;
    proposal_id: string | null;
    lines: number;
    drafted: number;
    issued: number;
  }>>(
    `SELECT invoice.id, invoice.status, invoice.currency, invoice.subtotal_minor, invoice.tax_minor,
            invoice.total_minor, invoice.row_version, invoice.proposal_id,
            (SELECT count(*)::int FROM commercial.invoice_lines AS line WHERE line.invoice_id = invoice.id) AS lines,
            (SELECT count(*)::int FROM audit.audit_events AS event
              WHERE event.owner_organization_id = invoice.owner_organization_id
                AND event.action = 'r7.invoice.drafted'
                AND event.redacted_diff->>'contractVersionId' = invoice.source_contract_version_id::text) AS drafted,
            (SELECT count(*)::int FROM audit.audit_events AS event
              WHERE event.owner_organization_id = invoice.owner_organization_id
                AND event.action = 'r7.invoice.issued'
                AND event.redacted_diff->>'invoiceId' = invoice.id::text) AS issued
       FROM commercial.invoices AS invoice
      WHERE invoice.source_contract_version_id = $1::uuid`,
    contractVersionId,
  );
  return rows[0] ?? null;
}

describe("R7 invoice mutation HTTP against PostgreSQL", () => {
  let finance: Actor;
  let editor: Actor;
  let viewer: Actor;
  let foreign: Actor;
  let unselected: Actor;
  let staleSession: Actor;

  beforeAll(async () => {
    process.env.PERSPECTIVE_AUTH_BOUNDARY_MODE = "sessions";
    process.env.PERSPECTIVE_PUBLIC_APP_ORIGIN = origin;
    process.env.PERSPECTIVE_AUTH_DATA_KEY = Buffer.alloc(32, 9).toString("base64");
    process.env.PERSPECTIVE_AUTH_KEY_VERSION = "1";
    await organization(ownerId, "PLATFORM", "r7invhttp");
    await organization(foreignOrgId, "PLATFORM", "r7invforeign");
    await organization(clientOrganizationId, "CLIENT", "r7invclient");
    const permissions = ["invoice.view", "invoice.edit", "invoice.issue"] as const;
    finance = await actor(ownerId, permissions);
    editor = await actor(ownerId, ["invoice.edit"]);
    viewer = await actor(ownerId, ["invoice.view"]);
    foreign = await actor(foreignOrgId, permissions);
    unselected = await actor(ownerId, permissions, { selectMembership: false });
    staleSession = await actor(ownerId, permissions, { issuedAt: new Date(Date.now() - 20 * 60 * 1000) });
  });

  afterAll(async () => {
    await database.$disconnect();
  });

  it("creates, replays, and refuses forged money through the HTTP command", async () => {
    const signed = await graph(finance.membershipId);
    const key = `draft-${signed.contractId.slice(0, 8)}`;
    const body = {
      contractId: signed.contractId,
      expectedContractVersionId: signed.contractVersionId,
      expectedContractVersion: 1,
    };
    const created = await createInvoiceHttp(request("/api/v1/r7/invoices", finance.token, body, key));
    expect(created.status).toBe(201);
    const createdBody = await created.json() as { invoice: { status: string; currency: string; subtotalMinor: string; taxMinor: string; totalMinor: string; replayed: boolean; invoiceId: string } };
    expect(createdBody.invoice).toMatchObject({
      status: "DRAFT",
      currency: "USD",
      subtotalMinor: "100",
      taxMinor: "5",
      totalMinor: "105",
      replayed: false,
    });
    const replay = await createInvoiceHttp(request("/api/v1/r7/invoices", finance.token, body, key));
    expect(replay.status).toBe(200);
    expect(await replay.json()).toMatchObject({ invoice: { invoiceId: createdBody.invoice.invoiceId, replayed: true } });
    const conflict = await createInvoiceHttp(request("/api/v1/r7/invoices", finance.token, body, `other-${signed.contractId.slice(0, 8)}`));
    expect(conflict.status).toBe(409);
    const row = await stored(signed.contractVersionId);
    expect(row).toMatchObject({ status: "DRAFT", proposal_id: null, lines: 1, drafted: 1, total_minor: BigInt(105) });

    expect((await createInvoiceHttp(request("/api/v1/r7/invoices", finance.token, { ...body, currency: "EUR", totalMinor: "1" }, key))).status).toBe(400);
    expect((await createInvoiceHttp(request("/api/v1/r7/invoices", undefined, body, key))).status).toBe(401);
    expect((await createInvoiceHttp(request("/api/v1/r7/invoices", "not-a-session", body, key))).status).toBe(401);
    expect((await createInvoiceHttp(request("/api/v1/r7/invoices", unselected.token, body, key))).status).toBe(403);
    expect((await createInvoiceHttp(request("/api/v1/r7/invoices", viewer.token, body, `view-${signed.contractId.slice(0, 8)}`))).status).toBe(403);
    expect((await createInvoiceHttp(request("/api/v1/r7/invoices", finance.token, body, key, "https://evil.example"))).status).toBe(403);
    expect((await createInvoiceHttp(request("/api/v1/r7/invoices", foreign.token, body, `foreign-${signed.contractId.slice(0, 8)}`))).status).toBe(404);
    const other = await graph(finance.membershipId);
    const mismatch = await createInvoiceHttp(request("/api/v1/r7/invoices", finance.token, {
      contractId: other.contractId,
      expectedContractVersionId: other.contractVersionId,
      expectedContractVersion: 1,
    }, key));
    expect(mismatch.status).toBe(409);
    expect(await stored(other.contractVersionId)).toBeNull();
    expect(await stored(signed.contractVersionId)).toMatchObject({ lines: 1, total_minor: BigInt(105) });
  });

  it("leaves no invoice when the contract version is not eligible", async () => {
    const unsigned = await graph(finance.membershipId, { versionStatus: "READY_FOR_SIGNATURE", contractStatus: "READY_FOR_SIGNATURE" });
    const result = await createInvoiceHttp(request(
      "/api/v1/r7/invoices",
      finance.token,
      {
        contractId: unsigned.contractId,
        expectedContractVersionId: unsigned.contractVersionId,
        expectedContractVersion: 1,
      },
      `unsigned-${unsigned.contractId.slice(0, 8)}`,
    ));
    expect(result.status).toBe(409);
    expect(await stored(unsigned.contractVersionId)).toBeNull();
  });

  it("issues one draft, replays, and denies finalized, stale, unauthenticated, and cross-tenant mutation", async () => {
    const signed = await graph(finance.membershipId);
    const draftKey = `issue-draft-${signed.contractId.slice(0, 8)}`;
    const created = await createInvoiceHttp(request("/api/v1/r7/invoices", editor.token, {
      contractId: signed.contractId,
      expectedContractVersionId: signed.contractVersionId,
      expectedContractVersion: 1,
    }, draftKey));
    expect(created.status).toBe(201);
    const invoiceId = ((await created.json()) as { invoice: { invoiceId: string } }).invoice.invoiceId;
    const issueBody = { expectedRowVersion: 1, reason: "Issue the signed engagement" };
    const issueKey = `issue-${signed.contractId.slice(0, 8)}`;
    const path = `/api/v1/r7/invoices/${invoiceId}/issue`;

    expect((await issueInvoiceHttp(request(path, editor.token, issueBody, issueKey), { params: Promise.resolve({ invoiceId }) })).status).toBe(404);
    expect((await stored(signed.contractVersionId))?.status).toBe("DRAFT");
    expect((await issueInvoiceHttp(request(path, finance.token, { ...issueBody, expectedRowVersion: 9 }, issueKey), { params: Promise.resolve({ invoiceId }) })).status).toBe(409);
    expect((await stored(signed.contractVersionId))?.row_version).toBe(1);

    const noMfa = await actor(ownerId, ["invoice.view", "invoice.edit", "invoice.issue"], { mfa: false });
    expect((await issueInvoiceHttp(request(path, noMfa.token, issueBody, issueKey), { params: Promise.resolve({ invoiceId }) })).status).toBe(404);
    expect((await issueInvoiceHttp(request(path, staleSession.token, issueBody, issueKey), { params: Promise.resolve({ invoiceId }) })).status).toBe(404);
    expect((await stored(signed.contractVersionId))?.status).toBe("DRAFT");

    const issued = await issueInvoiceHttp(request(path, finance.token, issueBody, issueKey), { params: Promise.resolve({ invoiceId }) });
    expect(issued.status).toBe(200);
    expect(await issued.json()).toMatchObject({ invoice: { status: "FINALIZED", totalMinor: "105", rowVersion: 2, replayed: false } });
    const replay = await issueInvoiceHttp(request(path, finance.token, issueBody, issueKey), { params: Promise.resolve({ invoiceId }) });
    expect(replay.status).toBe(200);
    expect(await replay.json()).toMatchObject({ invoice: { replayed: true, rowVersion: 2 } });
    expect((await issueInvoiceHttp(request(path, finance.token, issueBody, `again-${signed.contractId.slice(0, 8)}`), { params: Promise.resolve({ invoiceId }) })).status).toBe(404);
    expect((await issueInvoiceHttp(request(path, foreign.token, issueBody, `foreign-issue-${signed.contractId.slice(0, 8)}`), { params: Promise.resolve({ invoiceId }) })).status).toBe(404);

    const row = await stored(signed.contractVersionId);
    expect(row).toMatchObject({ status: "FINALIZED", total_minor: BigInt(105), row_version: 2, lines: 1, issued: 1 });
    const detail = await getInvoice(
      new Request(`${origin}/api/v1/r7/invoices/${invoiceId}`, { headers: { cookie: `${SESSION_COOKIE_NAME}=${finance.token}` } }),
      { params: Promise.resolve({ invoiceId }) },
    );
    expect(detail.status).toBe(200);
    const detailBody = await detail.json() as { invoice: Record<string, unknown> };
    expect(detailBody.invoice).toMatchObject({ id: invoiceId, status: "FINALIZED", currency: "USD", totalMinor: "105" });
    expect(detailBody.invoice).not.toHaveProperty("subtotalMinor");
    const hidden = await getInvoice(
      new Request(`${origin}/api/v1/r7/invoices/${invoiceId}`, { headers: { cookie: `${SESSION_COOKIE_NAME}=${foreign.token}` } }),
      { params: Promise.resolve({ invoiceId }) },
    );
    expect(hidden.status).toBe(404);

    await expect(database.$transaction(async (tx) => {
      await tx.$executeRawUnsafe(`SET LOCAL ROLE perspective_runtime`);
      await tx.$executeRawUnsafe(
        `UPDATE commercial.invoices SET total_minor = 1 WHERE id = $1::uuid`,
        invoiceId,
      );
    })).rejects.toThrow();
    expect((await stored(signed.contractVersionId))?.total_minor).toBe(BigInt(105));
  });

  it("keeps one invoice under concurrent HTTP creates and one finalization under concurrent issue", async () => {
    const signed = await graph(finance.membershipId);
    const body = {
      contractId: signed.contractId,
      expectedContractVersionId: signed.contractVersionId,
      expectedContractVersion: 1,
    };
    const key = `race-${signed.contractId.slice(0, 8)}`;
    const created = await Promise.all([
      createInvoiceHttp(request("/api/v1/r7/invoices", finance.token, body, key)),
      createInvoiceHttp(request("/api/v1/r7/invoices", finance.token, body, key)),
    ]);
    expect(created.map((result) => result.status).sort()).toEqual([200, 201]);
    const payloads = await Promise.all(created.map(async (result) => result.json() as Promise<{ invoice: { invoiceId: string; replayed: boolean } }>));
    expect(new Set(payloads.map((payload) => payload.invoice.invoiceId)).size).toBe(1);
    expect(payloads.filter((payload) => payload.invoice.replayed)).toHaveLength(1);
    const invoiceId = payloads[0]?.invoice.invoiceId ?? "";
    const issueKey = `race-issue-${signed.contractId.slice(0, 8)}`;
    const issueBody = { expectedRowVersion: 1, reason: "Issue the signed engagement" };
    const issued = await Promise.all([
      issueInvoiceHttp(request(`/api/v1/r7/invoices/${invoiceId}/issue`, finance.token, issueBody, issueKey), { params: Promise.resolve({ invoiceId }) }),
      issueInvoiceHttp(request(`/api/v1/r7/invoices/${invoiceId}/issue`, finance.token, issueBody, issueKey), { params: Promise.resolve({ invoiceId }) }),
    ]);
    expect(issued.every((result) => result.status === 200)).toBe(true);
    const issuePayloads = await Promise.all(issued.map(async (result) => result.json() as Promise<{ invoice: { replayed: boolean; status: string } }>));
    expect(issuePayloads.filter((payload) => payload.invoice.replayed)).toHaveLength(1);
    expect(issuePayloads.every((payload) => payload.invoice.status === "FINALIZED")).toBe(true);
    expect((await stored(signed.contractVersionId))?.row_version).toBe(2);
  });
});
