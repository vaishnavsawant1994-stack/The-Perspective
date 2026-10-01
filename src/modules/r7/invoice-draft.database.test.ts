import { afterAll, beforeAll, describe, expect, it } from "vitest";

import type { PrismaClient } from "@/generated/prisma/client";
import type {
  MembershipId,
  OrganizationId,
  TenantScopedRequestContext,
  UserId,
} from "@/modules/foundation/request-context";
import { createPrismaClient } from "@/modules/persistence/client";

import { createInvoiceDraft, issueInvoice } from "./invoice-draft";

const database = createPrismaClient();
const epoch = new Date("2026-10-01T12:00:00.000Z");
const ownerId = crypto.randomUUID();
const foreignOrgId = crypto.randomUUID();
const membershipId = crypto.randomUUID();
const foreignMembershipId = crypto.randomUUID();

function team(organizationId: string, membership: string, requestId: string): TenantScopedRequestContext {
  return {
    authentication: "authenticated",
    scope: "tenant",
    requestId,
    identity: { userId: "r7-invoice-user" as UserId },
    session: {
      sessionId: ("r7-invoice-" + requestId) as never,
      issuedAt: epoch,
      expiresAt: new Date(epoch.getTime() + 60 * 60 * 1000),
      authenticationMethod: "TEST",
    },
    membership: {
      membershipId: membership as MembershipId,
      organizationId: organizationId as OrganizationId,
      surface: "TEAM",
    },
    tenant: {
      organizationId: organizationId as OrganizationId,
      membershipId: membership as MembershipId,
      surface: "TEAM",
    },
  };
}

const owner = team(ownerId, membershipId, "r7-invoice-owner");
const foreign = team(foreignOrgId, foreignMembershipId, "r7-invoice-foreign");

type Line = { quantity: number; unit: number; lineTotal: number; position: number; description?: string };

async function fixture(options: {
  versionStatus?: string;
  contractStatus?: string;
  proposalCurrency?: string;
  proposalStatus?: string;
  immutable?: boolean;
  subtotal?: number;
  tax?: number;
  lines?: readonly Line[];
} = {}) {
  const versionStatus = options.versionStatus ?? "SIGNED";
  const contractStatus = options.contractStatus ?? versionStatus;
  const proposalCurrency = options.proposalCurrency ?? "USD";
  const subtotal = options.subtotal ?? 100;
  const tax = options.tax ?? 0;
  const lines = options.lines ?? [{ quantity: 2, unit: 50, lineTotal: 100, position: 1 }];
  const proposalId = crypto.randomUUID();
  const proposalVersionId = crypto.randomUUID();
  const contractId = crypto.randomUUID();
  const contractVersionId = crypto.randomUUID();
  const clientAccountId = crypto.randomUUID();
  const resourceId = crypto.randomUUID();
  const clientOrganizationId = crypto.randomUUID();
  const createdAudit = crypto.randomUUID();
  const signed = versionStatus === "SIGNED";

  await database.organization.createMany({
    data: [
      { id: ownerId, organizationType: "PLATFORM", legalName: "R7 Invoice Owner", displayName: "R7 Invoice Owner", slug: "r7-invoice-owner-" + ownerId.slice(0, 8), status: "ACTIVE" },
      { id: clientOrganizationId, organizationType: "CLIENT", legalName: "R7 Invoice Client", displayName: "R7 Invoice Client", slug: "r7-invoice-client-" + clientOrganizationId.slice(0, 8), status: "ACTIVE" },
      { id: foreignOrgId, organizationType: "PLATFORM", legalName: "R7 Invoice Foreign", displayName: "R7 Invoice Foreign", slug: "r7-invoice-foreign-" + foreignOrgId.slice(0, 8), status: "ACTIVE" },
    ],
    skipDuplicates: true,
  });
  await database.$transaction(async (tx) => {
    await tx.$executeRawUnsafe(
      `INSERT INTO platform.resources (
         id, resource_type, title, owner_organization_id, client_organization_id, visibility, sensitivity
       ) VALUES ($1::uuid, 'client-account', 'R7 invoice client', $2::uuid, $3::uuid, 'INTERNAL', 'CONFIDENTIAL')`,
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
         id, resource_id, owner_organization_id, deal_id, client_account_id, status, current_version, currency
       ) VALUES ($1::uuid, $2::uuid, $3::uuid, $4::uuid, $5::uuid, 'ACCEPTED', 1, $6::char(3))`,
      proposalId, crypto.randomUUID(), ownerId, crypto.randomUUID(), clientAccountId, proposalCurrency,
    );
    await tx.$executeRawUnsafe(
      `INSERT INTO commercial.proposal_versions (
         id, owner_organization_id, proposal_id, version, status, immutable, currency,
         subtotal_minor, tax_minor, total_minor
       ) VALUES ($1::uuid, $2::uuid, $3::uuid, 1, $4::text, $5::boolean, $6::char(3), $7::bigint, 0, $7::bigint)`,
      proposalVersionId, ownerId, proposalId, options.proposalStatus ?? "ACCEPTED", options.immutable ?? true, proposalCurrency, subtotal,
    );
    for (const line of lines) {
      await tx.$executeRawUnsafe(
        `INSERT INTO commercial.proposal_lines (
           id, owner_organization_id, proposal_version_id, description, quantity,
           unit_amount_minor, line_total_minor, position
         ) VALUES ($1::uuid, $2::uuid, $3::uuid, $4::text, $5::int, $6::bigint, $7::bigint, $8::int)`,
        crypto.randomUUID(), ownerId, proposalVersionId, line.description ?? "Signed scope", line.quantity, line.unit, line.lineTotal, line.position,
      );
    }
    await tx.$executeRawUnsafe(
      `INSERT INTO audit.audit_events (
         id, owner_organization_id, actor_type, action, request_id, occurred_at
       ) VALUES ($1::uuid, $2::uuid, 'SYSTEM', 'r7.contract.version.created', $3::text, $4::timestamptz)`,
      createdAudit, ownerId, "r7-invoice-bootstrap-" + contractId, epoch,
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
         '{}'::jsonb, $7::char(64), 'USD', $8::bigint, $9::bigint, $10::bigint, $11::uuid,
         CASE WHEN $6::text IN ('OUT_FOR_SIGNATURE','SIGNED') THEN $12::timestamptz ELSE NULL END,
         CASE WHEN $6::text = 'SIGNED' THEN $12::timestamptz ELSE NULL END
       )`,
      contractVersionId, ownerId, contractId, proposalId, proposalVersionId, versionStatus, "ab".repeat(32), subtotal, tax, subtotal + tax, createdAudit, epoch,
    );
  });
  return { contractId, contractVersionId, clientAccountId, signed };
}

function draftInput(graph: { contractId: string; contractVersionId: string }, idempotencyKey: string, version = 1) {
  return {
    contractId: graph.contractId,
    expectedContractVersionId: graph.contractVersionId,
    expectedContractVersion: version,
    idempotencyKey,
  };
}

async function stored(contractVersionId: string) {
  const rows = await database.$queryRawUnsafe<Array<{
    id: string;
    status: string;
    proposal_id: string | null;
    currency: string;
    subtotal_minor: bigint | null;
    tax_minor: bigint | null;
    total_minor: bigint;
    row_version: number;
    finalized_at: Date | null;
    lines: number;
    audits: number;
  }>>(
    `SELECT invoice.id, invoice.status, invoice.proposal_id, invoice.currency,
            invoice.subtotal_minor, invoice.tax_minor, invoice.total_minor, invoice.row_version,
            invoice.finalized_at,
            (SELECT count(*)::int FROM commercial.invoice_lines AS line WHERE line.invoice_id = invoice.id) AS lines,
            (SELECT count(*)::int FROM audit.audit_events AS event
              WHERE event.owner_organization_id = invoice.owner_organization_id
                AND event.action IN ('r7.invoice.drafted', 'r7.invoice.issued')
                AND event.redacted_diff->>'contractVersionId' = invoice.source_contract_version_id::text
                 OR event.redacted_diff->>'invoiceId' = invoice.id::text) AS audits
       FROM commercial.invoices AS invoice
      WHERE invoice.source_contract_version_id = $1::uuid`,
    contractVersionId,
  );
  return rows[0] ?? null;
}

describe("R7 invoice draft and issue persistence", () => {
  beforeAll(async () => {
    const present = await database.$queryRawUnsafe<Array<{ exists: boolean | null }>>(
      `SELECT to_regprocedure('platform.create_r7_invoice_draft(uuid,uuid,uuid,uuid,integer,text,text,text)') IS NOT NULL AS exists`,
    );
    expect(present[0]?.exists, "invoice draft function must exist").toBe(true);
  });

  afterAll(async () => {
    await database.$disconnect();
  });

  it("copies a signed version, replays one draft, and finalizes it once", async () => {
    const graph = await fixture({ tax: 5 });
    const key = "draft-" + graph.contractId.slice(0, 8);
    const created = await createInvoiceDraft(owner, draftInput(graph, key), database);
    expect(created).toMatchObject({
      kind: "ok",
      value: {
        status: "DRAFT",
        currency: "USD",
        subtotalMinor: "100",
        taxMinor: "5",
        totalMinor: "105",
        rowVersion: 1,
        lineCount: 1,
        replayed: false,
      },
    });
    const row = await stored(graph.contractVersionId);
    expect(row?.proposal_id).toBeNull();
    expect(row?.lines).toBe(1);
    expect(row?.finalized_at).toBeNull();

    const replay = await createInvoiceDraft(owner, draftInput(graph, key), database);
    expect(replay).toMatchObject({ kind: "ok", value: { replayed: true, invoiceId: row?.id } });
    const other = await createInvoiceDraft(owner, draftInput(graph, key + "-other"), database);
    expect(other).toEqual({ kind: "error", code: "CONFLICT" });
    const changed = await createInvoiceDraft(owner, { ...draftInput(graph, key), expectedContractVersion: 2 }, database);
    expect(changed).toEqual({ kind: "error", code: "IDEMPOTENCY_CONFLICT" });
    expect((await stored(graph.contractVersionId))?.lines).toBe(1);

    if (created.kind !== "ok") return;
    const issued = await issueInvoice(owner, {
      invoiceId: created.value.invoiceId,
      expectedRowVersion: 1,
      idempotencyKey: "issue-" + graph.contractId.slice(0, 8),
    }, database);
    expect(issued).toMatchObject({
      kind: "ok",
      value: { status: "FINALIZED", totalMinor: "105", rowVersion: 2, replayed: false },
    });
    expect((await stored(graph.contractVersionId))?.finalized_at).toBeTruthy();
    const issueReplay = await issueInvoice(owner, {
      invoiceId: created.value.invoiceId,
      expectedRowVersion: 1,
      idempotencyKey: "issue-" + graph.contractId.slice(0, 8),
    }, database);
    expect(issueReplay).toMatchObject({ kind: "ok", value: { replayed: true, rowVersion: 2 } });
    expect(await issueInvoice(owner, {
      invoiceId: created.value.invoiceId,
      expectedRowVersion: 2,
      idempotencyKey: "issue-again-" + graph.contractId.slice(0, 8),
    }, database)).toEqual({ kind: "error", code: "INELIGIBLE" });
    expect(await issueInvoice(owner, {
      invoiceId: created.value.invoiceId,
      expectedRowVersion: 1,
      idempotencyKey: "issue-stale-" + graph.contractId.slice(0, 8),
    }, database)).toEqual({ kind: "error", code: "STALE_WRITE" });
    expect((await stored(graph.contractVersionId))?.status).toBe("FINALIZED");
    expect((await stored(graph.contractVersionId))?.total_minor).toBe(BigInt(105));
  });

  it("rejects unsigned, foreign, mismatched, mixed-currency, and inconsistent sources", async () => {
    const ready = await fixture({ versionStatus: "READY_FOR_SIGNATURE", contractStatus: "READY_FOR_SIGNATURE" });
    expect(await createInvoiceDraft(owner, draftInput(ready, "ready-" + ready.contractId.slice(0, 8)), database)).toEqual({
      kind: "error",
      code: "INELIGIBLE",
    });
    const signed = await fixture();
    expect(await createInvoiceDraft(foreign, draftInput(signed, "foreign-" + signed.contractId.slice(0, 8)), database)).toEqual({
      kind: "error",
      code: "NOT_FOUND",
    });
    expect(await createInvoiceDraft(owner, {
      ...draftInput(signed, "mismatch-" + signed.contractId.slice(0, 8)),
      contractId: crypto.randomUUID(),
    }, database)).toEqual({ kind: "error", code: "CORRELATION_DENIED" });
    expect(await createInvoiceDraft(owner, draftInput(signed, "version-" + signed.contractId.slice(0, 8), 9), database)).toEqual({
      kind: "error",
      code: "CORRELATION_DENIED",
    });
    const mixed = await fixture({ proposalCurrency: "EUR" });
    expect(await createInvoiceDraft(owner, draftInput(mixed, "mixed-" + mixed.contractId.slice(0, 8)), database)).toEqual({
      kind: "error",
      code: "CORRELATION_DENIED",
    });
    const badTotal = await fixture({
      subtotal: 100,
      lines: [{ quantity: 1, unit: 40, lineTotal: 40, position: 1 }],
    });
    expect(await createInvoiceDraft(owner, draftInput(badTotal, "bad-total-" + badTotal.contractId.slice(0, 8)), database)).toEqual({
      kind: "error",
      code: "CORRELATION_DENIED",
    });
    const badLine = await fixture({
      lines: [{ quantity: 2, unit: 50, lineTotal: 90, position: 1 }],
    });
    expect(await createInvoiceDraft(owner, draftInput(badLine, "bad-line-" + badLine.contractId.slice(0, 8)), database)).toEqual({
      kind: "error",
      code: "INELIGIBLE",
    });
    const empty = await fixture({ lines: [] });
    expect(await createInvoiceDraft(owner, draftInput(empty, "empty-" + empty.contractId.slice(0, 8)), database)).toEqual({
      kind: "error",
      code: "INELIGIBLE",
    });
    const duplicatePosition = await fixture({
      subtotal: 100,
      lines: [
        { quantity: 1, unit: 40, lineTotal: 40, position: 1 },
        { quantity: 1, unit: 60, lineTotal: 60, position: 1 },
      ],
    });
    expect(await createInvoiceDraft(owner, draftInput(duplicatePosition, "dup-" + duplicatePosition.contractId.slice(0, 8)), database)).toEqual({
      kind: "error",
      code: "INELIGIBLE",
    });
    for (const graph of [ready, signed, mixed, badTotal, badLine, empty, duplicatePosition]) {
      expect(await stored(graph.contractVersionId)).toBeNull();
    }
  });

  it("rolls back a draft and refuses runtime invoice or line writes", async () => {
    const graph = await fixture();
    const key = `r7:invoice-draft:${ownerId}:rollback1`;
    await expect(database.$transaction(async (tx) => {
      await tx.$executeRawUnsafe(`SET LOCAL ROLE perspective_runtime`);
      await tx.$queryRaw`
        SELECT set_config('app.organization_id', ${ownerId}, true),
               set_config('app.client_organization_id', '', true)
      `;
      await tx.$queryRawUnsafe(
        `SELECT platform.create_r7_invoice_draft(
           $1::uuid, $2::uuid, $3::uuid, $4::uuid, 1, $5::text, $6::text, 'r7-invoice-rollback'
         )`,
        crypto.randomUUID(), crypto.randomUUID(), graph.contractId, graph.contractVersionId, key, "cd".repeat(32),
      );
      throw new Error("rollback");
    })).rejects.toThrow("rollback");
    expect(await stored(graph.contractVersionId)).toBeNull();

    const created = await createInvoiceDraft(owner, draftInput(graph, "keep-" + graph.contractId.slice(0, 8)), database);
    expect(created.kind).toBe("ok");
    await expect(database.$transaction(async (tx) => {
      await tx.$executeRawUnsafe(`SET LOCAL ROLE perspective_runtime`);
      await tx.$executeRawUnsafe(`INSERT INTO commercial.invoices DEFAULT VALUES`);
    })).rejects.toThrow();
    await expect(database.$transaction(async (tx) => {
      await tx.$executeRawUnsafe(`SET LOCAL ROLE perspective_runtime`);
      await tx.$executeRawUnsafe(`INSERT INTO commercial.invoice_lines DEFAULT VALUES`);
    })).rejects.toThrow();
    await expect(database.$transaction(async (tx) => {
      await tx.$executeRawUnsafe(`SET LOCAL ROLE perspective_runtime`);
      await tx.$executeRawUnsafe(
        `UPDATE commercial.invoices SET total_minor = 1 WHERE source_contract_version_id = $1::uuid`,
        graph.contractVersionId,
      );
    })).rejects.toThrow();
    await expect(database.$transaction(async (tx) => {
      await tx.$executeRawUnsafe(`SET LOCAL ROLE perspective_runtime`);
      await tx.$executeRawUnsafe(
        `UPDATE commercial.invoice_lines SET description = 'changed'
          WHERE invoice_id = (SELECT id FROM commercial.invoices WHERE source_contract_version_id = $1::uuid)`,
        graph.contractVersionId,
      );
    })).rejects.toThrow();
    expect((await stored(graph.contractVersionId))?.total_minor).toBe(BigInt(100));
    expect((await stored(graph.contractVersionId))?.lines).toBe(1);
  });

  it("keeps one draft and one finalization under concurrent retries", async () => {
    const graph = await fixture();
    const key = "race-" + graph.contractId.slice(0, 8);
    const created = await Promise.all([
      createInvoiceDraft(owner, draftInput(graph, key), database),
      createInvoiceDraft(owner, draftInput(graph, key), database),
    ]);
    expect(created.filter((result) => result.kind === "ok").length).toBe(2);
    expect(created.filter((result) => result.kind === "ok" && result.value.replayed).length).toBe(1);
    expect((await stored(graph.contractVersionId))?.lines).toBe(1);
    const invoiceId = created.find((result) => result.kind === "ok")?.value.invoiceId;
    const issued = await Promise.all([
      issueInvoice(owner, { invoiceId: invoiceId ?? "", expectedRowVersion: 1, idempotencyKey: "issue-race-" + graph.contractId.slice(0, 8) }, database),
      issueInvoice(owner, { invoiceId: invoiceId ?? "", expectedRowVersion: 1, idempotencyKey: "issue-race-" + graph.contractId.slice(0, 8) }, database),
    ]);
    const codes = issued.map((result) => result.kind === "ok" ? (result.value.replayed ? "REPLAY" : "ISSUED") : result.code).sort();
    expect(codes).toEqual(["ISSUED", "REPLAY"]);
    expect((await stored(graph.contractVersionId))?.status).toBe("FINALIZED");
    expect((await stored(graph.contractVersionId))?.row_version).toBe(2);
  });
});

void (database satisfies PrismaClient);
