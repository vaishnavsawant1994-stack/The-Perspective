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
import { reconcileVerifiedPaymentEvent } from "./payment-reconciliation";
import {
  verifyPaymentWebhook,
  type NormalizedPaymentEvent,
} from "./payments";

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
    identity: { userId: "r7-payment-user" as UserId },
    session: {
      sessionId: ("r7-payment-" + requestId) as never,
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

const owner = team(ownerId, membershipId, "r7-payment-owner");
const foreign = team(foreignOrgId, foreignMembershipId, "r7-payment-foreign");

async function verified(event: NormalizedPaymentEvent) {
  const result = await verifyPaymentWebhook(
    "test-provider",
    {
      headers: {},
      rawBody: new TextEncoder().encode("{\"event\":\"paid\"}"),
      receivedAt: epoch,
    },
    () => ({
      provider: "test-provider",
      verifyAndNormalize: async () => [event],
    }),
  );
  if (result.kind !== "ok" || !result.events[0]) throw new Error("unverified");
  return result.events[0];
}

async function invoiceGraph(issue = true) {
  const proposalId = crypto.randomUUID();
  const proposalVersionId = crypto.randomUUID();
  const contractId = crypto.randomUUID();
  const contractVersionId = crypto.randomUUID();
  const clientAccountId = crypto.randomUUID();
  const resourceId = crypto.randomUUID();
  const clientOrganizationId = crypto.randomUUID();
  const createdAudit = crypto.randomUUID();
  await database.organization.createMany({
    data: [
      { id: ownerId, organizationType: "PLATFORM", legalName: "R7 Payment Owner", displayName: "R7 Payment Owner", slug: "r7-pay-owner-" + ownerId.slice(0, 8), status: "ACTIVE" },
      { id: clientOrganizationId, organizationType: "CLIENT", legalName: "R7 Payment Client", displayName: "R7 Payment Client", slug: "r7-pay-client-" + clientOrganizationId.slice(0, 8), status: "ACTIVE" },
      { id: foreignOrgId, organizationType: "PLATFORM", legalName: "R7 Payment Foreign", displayName: "R7 Payment Foreign", slug: "r7-pay-foreign-" + foreignOrgId.slice(0, 8), status: "ACTIVE" },
    ],
    skipDuplicates: true,
  });
  await database.$transaction(async (tx) => {
    await tx.$executeRawUnsafe(
      `INSERT INTO platform.resources (
         id, resource_type, title, owner_organization_id, client_organization_id, visibility, sensitivity
       ) VALUES ($1::uuid, 'client-account', 'R7 payment client', $2::uuid, $3::uuid, 'INTERNAL', 'CONFIDENTIAL')`,
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
      createdAudit, ownerId, "r7-payment-bootstrap-" + contractId, epoch,
    );
    await tx.$executeRawUnsafe(
      `INSERT INTO commercial.contracts (
         id, resource_id, owner_organization_id, client_account_id, source_proposal_id,
         source_proposal_version_id, source_proposal_version, status, current_version
       ) VALUES ($1::uuid, $2::uuid, $3::uuid, $4::uuid, $5::uuid, $6::uuid, 1, 'SIGNED', 1)`,
      contractId, crypto.randomUUID(), ownerId, clientAccountId, proposalId, proposalVersionId,
    );
    await tx.$executeRawUnsafe(
      `INSERT INTO commercial.contract_versions (
         id, owner_organization_id, contract_id, version, source_proposal_id, source_proposal_version_id,
         source_proposal_version, status, immutable, document_snapshot, document_sha256, currency,
         subtotal_minor, tax_minor, total_minor, created_audit_event_id, issued_at, signed_at
       ) VALUES (
         $1::uuid, $2::uuid, $3::uuid, 1, $4::uuid, $5::uuid, 1, 'SIGNED', true,
         '{}'::jsonb, $6::char(64), 'USD', 100, 0, 100, $7::uuid, $8::timestamptz, $8::timestamptz
       )`,
      contractVersionId, ownerId, contractId, proposalId, proposalVersionId, "ab".repeat(32), createdAudit, epoch,
    );
  });
  const key = "paydraft-" + contractId.slice(0, 8);
  const drafted = await createInvoiceDraft(owner, {
    contractId,
    expectedContractVersionId: contractVersionId,
    expectedContractVersion: 1,
    idempotencyKey: key,
  }, database);
  if (drafted.kind !== "ok") throw new Error(drafted.code);
  if (!issue) return { invoiceId: drafted.value.invoiceId, contractId };
  const issued = await issueInvoice(owner, {
    invoiceId: drafted.value.invoiceId,
    expectedRowVersion: drafted.value.rowVersion,
    idempotencyKey: "payissue-" + contractId.slice(0, 8),
  }, database);
  if (issued.kind !== "ok") throw new Error(issued.code);
  return { invoiceId: drafted.value.invoiceId, contractId };
}

function finalizedInvoice() {
  return invoiceGraph(true);
}

function event(invoiceId: string, providerEventId: string, amountMinor: number, eventType: NormalizedPaymentEvent["eventType"] = "PAYMENT_SUCCEEDED", currency = "USD"): NormalizedPaymentEvent {
  return {
    providerEventId,
    invoiceId,
    currency,
    amountMinor,
    eventType,
    providerOccurredAt: epoch,
    normalizedEvidence: { providerEventId, amountMinor },
  };
}

async function money(invoiceId: string) {
  const rows = await database.$queryRawUnsafe<Array<{
    status: string;
    allocated_minor: bigint;
    payments: number;
    ledger: number;
  }>>(
    `SELECT invoice.status, invoice.allocated_minor,
            (SELECT count(*)::int FROM commercial.payments AS payment
              WHERE payment.invoice_id = invoice.id AND payment.status = 'SUCCEEDED') AS payments,
            (SELECT count(*)::int FROM commercial.ledger_entries AS entry
              WHERE entry.invoice_id = invoice.id) AS ledger
       FROM commercial.invoices AS invoice
      WHERE invoice.id = $1::uuid`,
    invoiceId,
  );
  return rows[0];
}

describe("R7 payment reconciliation persistence", () => {
  beforeAll(async () => {
    const present = await database.$queryRawUnsafe<Array<{ exists: boolean | null }>>(
      `SELECT to_regprocedure('platform.reconcile_r7_payment_event(uuid,uuid,uuid,text,text,uuid,text,bigint,text,jsonb,timestamptz)') IS NOT NULL AS exists`,
    );
    expect(present[0]?.exists, "payment reconciliation function must exist").toBe(true);
  });

  afterAll(async () => {
    await database.$disconnect();
  });

  it("allocates a finalized invoice once and replays the same provider event", async () => {
    const graph = await finalizedInvoice();
    const first = await reconcileVerifiedPaymentEvent(owner, await verified(event(graph.invoiceId, "evt-a-" + graph.contractId, 40)), database);
    expect(first).toMatchObject({
      kind: "ok",
      code: "ALLOCATED",
      invoiceStatus: "PARTIALLY_PAID",
      paymentStatus: "SUCCEEDED",
      allocatedMinor: "40",
    });
    const second = await reconcileVerifiedPaymentEvent(owner, await verified(event(graph.invoiceId, "evt-b-" + graph.contractId, 60)), database);
    expect(second).toMatchObject({ kind: "ok", code: "PAID", invoiceStatus: "PAID", allocatedMinor: "100" });
    const replay = await reconcileVerifiedPaymentEvent(owner, await verified(event(graph.invoiceId, "evt-b-" + graph.contractId, 60)), database);
    expect(replay).toMatchObject({ kind: "ok", code: "REPLAY", invoiceStatus: "PAID", allocatedMinor: "100" });
    const state = await money(graph.invoiceId);
    expect(state?.status).toBe("PAID");
    expect(state?.allocated_minor).toBe(BigInt(100));
    expect(state?.payments).toBe(2);
    expect(state?.ledger).toBe(2);

    const conflict = await reconcileVerifiedPaymentEvent(owner, await verified(event(graph.invoiceId, "evt-a-" + graph.contractId, 41)), database);
    expect(conflict).toEqual({ kind: "error", code: "EVIDENCE_CONFLICT" });
    expect((await money(graph.invoiceId))?.ledger).toBe(2);
  });

  it("rejects over-allocation, foreign, draft, currency, and non-money events", async () => {
    const graph = await finalizedInvoice();
    const over = await reconcileVerifiedPaymentEvent(owner, await verified(event(graph.invoiceId, "evt-over-" + graph.contractId, 101)), database);
    expect(over).toEqual({ kind: "error", code: "OVER_ALLOCATION" });
    expect((await money(graph.invoiceId))?.allocated_minor).toBe(BigInt(0));
    expect((await money(graph.invoiceId))?.ledger).toBe(0);

    const foreignResult = await reconcileVerifiedPaymentEvent(foreign, await verified(event(graph.invoiceId, "evt-foreign-" + graph.contractId, 10)), database);
    expect(foreignResult).toEqual({ kind: "error", code: "NOT_FOUND" });
    const currency = await reconcileVerifiedPaymentEvent(owner, await verified(event(graph.invoiceId, "evt-eur-" + graph.contractId, 10, "PAYMENT_SUCCEEDED", "EUR")), database);
    expect(currency).toEqual({ kind: "error", code: "CORRELATION_DENIED" });
    const failed = await reconcileVerifiedPaymentEvent(owner, await verified(event(graph.invoiceId, "evt-fail-" + graph.contractId, 10, "PAYMENT_FAILED")), database);
    expect(failed).toMatchObject({ kind: "ok", code: "RECORDED", paymentStatus: "FAILED", invoiceStatus: "FINALIZED", allocatedMinor: "0" });
    expect((await money(graph.invoiceId))?.status).toBe("FINALIZED");
    expect((await money(graph.invoiceId))?.ledger).toBe(0);

    const draft = await invoiceGraph(false);
    const unpaid = await reconcileVerifiedPaymentEvent(owner, await verified(event(draft.invoiceId, "evt-draft-" + draft.contractId, 10)), database);
    expect(unpaid).toEqual({ kind: "error", code: "INELIGIBLE" });
    expect((await money(draft.invoiceId))?.status).toBe("DRAFT");
    expect((await money(draft.invoiceId))?.ledger).toBe(0);
  });

  it("does not let runtime set SUCCEEDED, PAID, or ledger money", async () => {
    const graph = await finalizedInvoice();
    await expect(database.$transaction(async (tx) => {
      await tx.$executeRawUnsafe(`SET LOCAL ROLE perspective_runtime`);
      await tx.$executeRawUnsafe(
        `UPDATE commercial.invoices SET status = 'PAID', allocated_minor = total_minor WHERE id = $1::uuid`,
        graph.invoiceId,
      );
    })).rejects.toThrow();
    await expect(database.$transaction(async (tx) => {
      await tx.$executeRawUnsafe(`SET LOCAL ROLE perspective_runtime`);
      await tx.$executeRawUnsafe(
        `INSERT INTO commercial.payments (
           id, owner_organization_id, invoice_id, provider, provider_event_id, status, currency, amount_minor, event_hash
         ) VALUES ($1::uuid, $2::uuid, $3::uuid, 'test-provider', 'runtime-evt', 'SUCCEEDED', 'USD', 100, $4::char(64))`,
        crypto.randomUUID(), ownerId, graph.invoiceId, "ab".repeat(32),
      );
    })).rejects.toThrow();
    await expect(database.$transaction(async (tx) => {
      await tx.$executeRawUnsafe(`SET LOCAL ROLE perspective_runtime`);
      await tx.$executeRawUnsafe(`INSERT INTO commercial.ledger_entries DEFAULT VALUES`);
    })).rejects.toThrow();
    expect((await money(graph.invoiceId))?.status).toBe("FINALIZED");
    expect((await money(graph.invoiceId))?.ledger).toBe(0);
  });

  it("keeps one ledger entry when the same succeeded event is reconciled concurrently", async () => {
    const graph = await finalizedInvoice();
    const branded = await verified(event(graph.invoiceId, "evt-race-" + graph.contractId, 100));
    const results = await Promise.all([
      reconcileVerifiedPaymentEvent(owner, branded, database),
      reconcileVerifiedPaymentEvent(owner, branded, database),
    ]);
    const codes = results.map((result) => result.kind === "ok" ? result.code : result.code).sort();
    expect(codes).toEqual(["PAID", "REPLAY"]);
    expect((await money(graph.invoiceId))?.ledger).toBe(1);
    expect((await money(graph.invoiceId))?.status).toBe("PAID");
  });
});

void (database satisfies PrismaClient);
