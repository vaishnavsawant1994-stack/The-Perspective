import { afterAll, beforeAll, describe, expect, it } from "vitest";

import type { MembershipId, OrganizationId, TenantScopedRequestContext, UserId } from "@/modules/foundation/request-context";
import { createPrismaClient } from "@/modules/persistence/client";

import { createInvoiceDraft, issueInvoice } from "./invoice-draft";
import { sendInvoice } from "./invoice-send";

const database = createPrismaClient();
const epoch = new Date("2026-10-01T12:00:00.000Z");
const ownerId = crypto.randomUUID();
const foreignOrgId = crypto.randomUUID();

function team(organizationId: string, requestId: string): TenantScopedRequestContext {
  const membershipId = crypto.randomUUID();
  return {
    authentication: "authenticated",
    scope: "tenant",
    requestId,
    identity: { userId: "r7-send-user" as UserId },
    session: {
      sessionId: ("r7-send-" + requestId) as never,
      issuedAt: epoch,
      expiresAt: new Date(epoch.getTime() + 3600000),
      authenticationMethod: "TEST",
    },
    membership: { membershipId: membershipId as MembershipId, organizationId: organizationId as OrganizationId, surface: "TEAM" },
    tenant: { organizationId: organizationId as OrganizationId, membershipId: membershipId as MembershipId, surface: "TEAM" },
  };
}

const owner = team(ownerId, "r7-send-owner");
const foreign = team(foreignOrgId, "r7-send-foreign");

async function invoice(issue = true) {
  const proposalId = crypto.randomUUID();
  const proposalVersionId = crypto.randomUUID();
  const contractId = crypto.randomUUID();
  const contractVersionId = crypto.randomUUID();
  const clientAccountId = crypto.randomUUID();
  const clientOrganizationId = crypto.randomUUID();
  await database.organization.createMany({
    data: [
      { id: ownerId, organizationType: "PLATFORM", legalName: "R7 Send Owner", displayName: "R7 Send Owner", slug: "r7-send-owner-" + ownerId.slice(0, 8), status: "ACTIVE" },
      { id: clientOrganizationId, organizationType: "CLIENT", legalName: "R7 Send Client", displayName: "R7 Send Client", slug: "r7-send-client-" + clientOrganizationId.slice(0, 8), status: "ACTIVE" },
      { id: foreignOrgId, organizationType: "PLATFORM", legalName: "R7 Send Foreign", displayName: "R7 Send Foreign", slug: "r7-send-foreign-" + foreignOrgId.slice(0, 8), status: "ACTIVE" },
    ],
    skipDuplicates: true,
  });
  const resourceId = crypto.randomUUID();
  const createdAudit = crypto.randomUUID();
  await database.$transaction(async (tx) => {
    await tx.$executeRawUnsafe(`INSERT INTO platform.resources (id, resource_type, title, owner_organization_id, client_organization_id, visibility, sensitivity) VALUES ($1::uuid, 'client-account', 'R7 send client', $2::uuid, $3::uuid, 'INTERNAL', 'CONFIDENTIAL')`, resourceId, ownerId, clientOrganizationId);
    await tx.$executeRawUnsafe(`INSERT INTO commercial.client_accounts (id, resource_id, owner_organization_id, client_organization_id, visibility, sensitivity, updated_at) VALUES ($1::uuid, $2::uuid, $3::uuid, $4::uuid, 'INTERNAL', 'CONFIDENTIAL', $5::timestamptz)`, clientAccountId, resourceId, ownerId, clientOrganizationId, epoch);
    await tx.$executeRawUnsafe(`INSERT INTO commercial.proposals (id, resource_id, owner_organization_id, deal_id, client_account_id, status, current_version, currency) VALUES ($1::uuid, $2::uuid, $3::uuid, $4::uuid, $5::uuid, 'ACCEPTED', 1, 'USD')`, proposalId, crypto.randomUUID(), ownerId, crypto.randomUUID(), clientAccountId);
    await tx.$executeRawUnsafe(`INSERT INTO commercial.proposal_versions (id, owner_organization_id, proposal_id, version, status, immutable, currency, subtotal_minor, tax_minor, total_minor) VALUES ($1::uuid, $2::uuid, $3::uuid, 1, 'ACCEPTED', true, 'USD', 100, 0, 100)`, proposalVersionId, ownerId, proposalId);
    await tx.$executeRawUnsafe(`INSERT INTO commercial.proposal_lines (id, owner_organization_id, proposal_version_id, description, quantity, unit_amount_minor, line_total_minor, position) VALUES ($1::uuid, $2::uuid, $3::uuid, 'Signed scope', 2, 50, 100, 1)`, crypto.randomUUID(), ownerId, proposalVersionId);
    await tx.$executeRawUnsafe(`INSERT INTO audit.audit_events (id, owner_organization_id, actor_type, action, request_id, occurred_at) VALUES ($1::uuid, $2::uuid, 'SYSTEM', 'r7.contract.version.created', $3::text, $4::timestamptz)`, createdAudit, ownerId, "r7-send-bootstrap-" + contractId, epoch);
    await tx.$executeRawUnsafe(`INSERT INTO commercial.contracts (id, resource_id, owner_organization_id, client_account_id, source_proposal_id, source_proposal_version_id, source_proposal_version, status, current_version) VALUES ($1::uuid, $2::uuid, $3::uuid, $4::uuid, $5::uuid, $6::uuid, 1, 'SIGNED', 1)`, contractId, crypto.randomUUID(), ownerId, clientAccountId, proposalId, proposalVersionId);
    await tx.$executeRawUnsafe(`INSERT INTO commercial.contract_versions (id, owner_organization_id, contract_id, version, source_proposal_id, source_proposal_version_id, source_proposal_version, status, immutable, document_snapshot, document_sha256, currency, subtotal_minor, tax_minor, total_minor, created_audit_event_id, issued_at, signed_at) VALUES ($1::uuid, $2::uuid, $3::uuid, 1, $4::uuid, $5::uuid, 1, 'SIGNED', true, '{}'::jsonb, $6::char(64), 'USD', 100, 0, 100, $7::uuid, $8::timestamptz, $8::timestamptz)`, contractVersionId, ownerId, contractId, proposalId, proposalVersionId, "cd".repeat(32), createdAudit, epoch);
  });
  const drafted = await createInvoiceDraft(owner, {
    contractId,
    expectedContractVersionId: contractVersionId,
    expectedContractVersion: 1,
    idempotencyKey: "senddraft-" + contractId.slice(0, 8),
  }, database);
  if (drafted.kind !== "ok") throw new Error(drafted.code);
  if (!issue) return drafted.value;
  const issued = await issueInvoice(owner, {
    invoiceId: drafted.value.invoiceId,
    expectedRowVersion: drafted.value.rowVersion,
    idempotencyKey: "sendissue-" + contractId.slice(0, 8),
  }, database);
  if (issued.kind !== "ok") throw new Error(issued.code);
  return { ...drafted.value, status: "FINALIZED", rowVersion: issued.value.rowVersion, totalMinor: issued.value.totalMinor };
}

async function outboxCount(invoiceId: string) {
  const rows = await database.$queryRawUnsafe<Array<{ count: number; status: string; row_version: number; total_minor: bigint }>>(
    `SELECT invoice.status, invoice.row_version, invoice.total_minor,
            (SELECT count(*)::int FROM platform.outbox_events AS event
              WHERE event.event_type = 'r7.invoice.send.requested'
                AND event.payload->>'invoiceId' = invoice.id::text) AS count
       FROM commercial.invoices AS invoice WHERE invoice.id = $1::uuid`,
    invoiceId,
  );
  return rows[0];
}

describe("R7 invoice send persistence", () => {
  beforeAll(async () => {
    const present = await database.$queryRawUnsafe<Array<{ exists: boolean | null }>>(
      `SELECT to_regprocedure('platform.send_r7_invoice(uuid,uuid,uuid,uuid,integer,text,text,text)') IS NOT NULL AS exists`,
    );
    expect(present[0]?.exists).toBe(true);
  });
  afterAll(async () => { await database.$disconnect(); });

  it("queues one delivery and replays it without changing the invoice", async () => {
    const row = await invoice();
    const first = await sendInvoice(owner, { invoiceId: row.invoiceId, expectedRowVersion: row.rowVersion, idempotencyKey: "send-" + row.invoiceId.slice(0, 8) }, database);
    expect(first).toMatchObject({ kind: "ok", value: { status: "FINALIZED", delivery: "QUEUED", replayed: false, rowVersion: row.rowVersion } });
    const replay = await sendInvoice(owner, { invoiceId: row.invoiceId, expectedRowVersion: row.rowVersion, idempotencyKey: "send-" + row.invoiceId.slice(0, 8) }, database);
    expect(replay).toMatchObject({ kind: "ok", value: { replayed: true, rowVersion: row.rowVersion } });
    const conflict = await sendInvoice(owner, { invoiceId: row.invoiceId, expectedRowVersion: row.rowVersion + 1, idempotencyKey: "send-" + row.invoiceId.slice(0, 8) }, database);
    expect(conflict).toEqual({ kind: "error", code: "IDEMPOTENCY_CONFLICT" });
    const stored = await outboxCount(row.invoiceId);
    expect(stored?.count).toBe(1);
    expect(stored?.status).toBe("FINALIZED");
    expect(stored?.row_version).toBe(row.rowVersion);
    expect(stored?.total_minor).toBe(BigInt(100));
  });

  it("rejects a draft, a stale version, and a foreign tenant", async () => {
    const draft = await invoice(false);
    expect(await sendInvoice(owner, { invoiceId: draft.invoiceId, expectedRowVersion: draft.rowVersion, idempotencyKey: "draft-" + draft.invoiceId.slice(0, 8) }, database))
      .toEqual({ kind: "error", code: "INELIGIBLE" });
    const issued = await invoice();
    expect(await sendInvoice(owner, { invoiceId: issued.invoiceId, expectedRowVersion: issued.rowVersion + 3, idempotencyKey: "stale-" + issued.invoiceId.slice(0, 8) }, database))
      .toEqual({ kind: "error", code: "STALE_WRITE" });
    expect(await sendInvoice(foreign, { invoiceId: issued.invoiceId, expectedRowVersion: issued.rowVersion, idempotencyKey: "foreign-" + issued.invoiceId.slice(0, 8) }, database))
      .toEqual({ kind: "error", code: "NOT_FOUND" });
    expect((await outboxCount(issued.invoiceId))?.count).toBe(0);
    expect((await outboxCount(draft.invoiceId))?.count).toBe(0);
  });
});
