import { afterAll, beforeAll, describe, expect, it } from "vitest";

import type { PrismaClient } from "@/generated/prisma/client";
import type {
  MembershipId,
  OrganizationId,
  TenantScopedRequestContext,
  UserId,
} from "@/modules/foundation/request-context";
import { createPrismaClient } from "@/modules/persistence/client";
import { seedIds } from "../../../prisma/seed/stable-ids";

import { reconcileVerifiedSignatureEvent } from "./signature-reconciliation";
import {
  verifySignatureWebhook,
  type NormalizedSignatureEvent,
  type VerifiedSignatureEvent,
} from "./signatures";

const database = createPrismaClient();
const epoch = new Date("2026-09-30T12:00:00.000Z");
const ownerId = crypto.randomUUID();
const foreignOrgId = crypto.randomUUID();
const membershipId = crypto.randomUUID();
const foreignMembershipId = crypto.randomUUID();
const digest = "ab".repeat(32);
const otherDigest = "cd".repeat(32);

function team(organizationId: string, membership: string, requestId: string): TenantScopedRequestContext {
  return {
    authentication: "authenticated",
    scope: "tenant",
    requestId,
    identity: { userId: seedIds.user.operator as UserId },
    session: {
      sessionId: ("r7-sign-" + requestId) as never,
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

const owner = team(ownerId, membershipId, "r7-sign-owner");
const foreign = team(foreignOrgId, foreignMembershipId, "r7-sign-foreign");

async function verified(event: NormalizedSignatureEvent): Promise<VerifiedSignatureEvent> {
  const result = await verifySignatureWebhook(
    "test-provider",
    {
      headers: { "x-test-signature": "valid" },
      rawBody: new TextEncoder().encode("{\"event\":\"signed\"}"),
      receivedAt: epoch,
    },
    () => ({
      provider: "test-provider",
      verifyAndNormalize: async () => [event],
    }),
  );
  if (result.kind !== "ok") throw new Error(result.code);
  const branded = result.events[0];
  if (!branded) throw new Error("missing verified event");
  return branded;
}

function event(input: Partial<NormalizedSignatureEvent> & Pick<NormalizedSignatureEvent, "providerEventId" | "providerRequestId" | "contractVersionId">): NormalizedSignatureEvent {
  return {
    documentSha256: digest,
    eventType: "SIGNER_COMPLETED",
    signerKey: "signer-a",
    providerOccurredAt: epoch,
    normalizedEvidence: { signer: input.signerKey ?? "signer-a" },
    ...input,
  };
}

async function fixture(signers: readonly string[] = ["signer-a", "signer-b"]) {
  const clientOrgId = crypto.randomUUID();
  const proposalId = crypto.randomUUID();
  const proposalVersionId = crypto.randomUUID();
  const contractId = crypto.randomUUID();
  const contractVersionId = crypto.randomUUID();
  const requestId = crypto.randomUUID();
  const clientAccountId = crypto.randomUUID();
  const resourceId = crypto.randomUUID();
  const providerRequestId = "req-" + requestId.slice(0, 8);
  const createdAudit = crypto.randomUUID();
  const requestAudit = crypto.randomUUID();

  await database.organization.createMany({
    data: [
      {
        id: ownerId,
        organizationType: "PLATFORM",
        legalName: "R7 Sign Owner",
        displayName: "R7 Sign Owner",
        slug: "r7-sign-owner-" + ownerId.slice(0, 8),
        status: "ACTIVE",
      },
      {
        id: clientOrgId,
        organizationType: "CLIENT",
        legalName: "R7 Sign Client",
        displayName: "R7 Sign Client",
        slug: "r7-sign-client-" + clientOrgId.slice(0, 8),
        status: "ACTIVE",
      },
      {
        id: foreignOrgId,
        organizationType: "PLATFORM",
        legalName: "R7 Sign Foreign",
        displayName: "R7 Sign Foreign",
        slug: "r7-sign-foreign-" + foreignOrgId.slice(0, 8),
        status: "ACTIVE",
      },
    ],
    skipDuplicates: true,
  });
  await database.organizationMembership.createMany({
    data: [
      {
        id: membershipId,
        organizationId: ownerId,
        userAccountId: seedIds.user.operator,
        membershipType: "STAFF",
        status: "ACTIVE",
        joinedAt: epoch,
      },
      {
        id: foreignMembershipId,
        organizationId: foreignOrgId,
        userAccountId: seedIds.user.asteriaAdmin,
        membershipType: "STAFF",
        status: "ACTIVE",
        joinedAt: epoch,
      },
    ],
    skipDuplicates: true,
  });

  await database.$transaction(async (tx) => {
    await tx.$executeRawUnsafe(
      `INSERT INTO platform.resources (
         id, resource_type, title, owner_organization_id, client_organization_id, visibility, sensitivity
       ) VALUES ($1::uuid, 'client-account', 'R7 sign client', $2::uuid, $3::uuid, 'INTERNAL', 'CONFIDENTIAL')`,
      resourceId,
      ownerId,
      clientOrgId,
    );
    await tx.$executeRawUnsafe(
      `INSERT INTO commercial.client_accounts (
         id, resource_id, owner_organization_id, client_organization_id, visibility, sensitivity, updated_at
       ) VALUES ($1::uuid, $2::uuid, $3::uuid, $4::uuid, 'INTERNAL', 'CONFIDENTIAL', $5::timestamptz)`,
      clientAccountId,
      resourceId,
      ownerId,
      clientOrgId,
      epoch,
    );
    await tx.$executeRawUnsafe(
      `INSERT INTO commercial.proposals (
         id, resource_id, owner_organization_id, deal_id, client_account_id, status, current_version, currency
       ) VALUES ($1::uuid, $2::uuid, $3::uuid, $4::uuid, $5::uuid, 'ACCEPTED', 1, 'USD')`,
      proposalId,
      crypto.randomUUID(),
      ownerId,
      crypto.randomUUID(),
      clientAccountId,
    );
    await tx.$executeRawUnsafe(
      `INSERT INTO commercial.proposal_versions (
         id, owner_organization_id, proposal_id, version, status, immutable, currency,
         subtotal_minor, tax_minor, total_minor
       ) VALUES ($1::uuid, $2::uuid, $3::uuid, 1, 'ACCEPTED', true, 'USD', 100, 0, 100)`,
      proposalVersionId,
      ownerId,
      proposalId,
    );
    await tx.$executeRawUnsafe(
      `INSERT INTO audit.audit_events (
         id, owner_organization_id, actor_type, action, request_id, occurred_at
       ) VALUES
         ($1::uuid, $3::uuid, 'SYSTEM', 'r7.contract.version.created', 'r7-sign-bootstrap', $4::timestamptz),
         ($2::uuid, $3::uuid, 'SYSTEM', 'r7.signature.request.created', 'r7-sign-bootstrap-request', $4::timestamptz)`,
      createdAudit,
      requestAudit,
      ownerId,
      epoch,
    );
    await tx.$executeRawUnsafe(
      `INSERT INTO commercial.contracts (
         id, resource_id, owner_organization_id, client_account_id, source_proposal_id,
         source_proposal_version_id, source_proposal_version, status, current_version
       ) VALUES ($1::uuid, $2::uuid, $3::uuid, $4::uuid, $5::uuid, $6::uuid, 1, 'OUT_FOR_SIGNATURE', 1)`,
      contractId,
      crypto.randomUUID(),
      ownerId,
      clientAccountId,
      proposalId,
      proposalVersionId,
    );
    await tx.$executeRawUnsafe(
      `INSERT INTO commercial.contract_versions (
         id, owner_organization_id, contract_id, version, source_proposal_id, source_proposal_version_id,
         source_proposal_version, status, immutable, document_snapshot, document_sha256, currency,
         subtotal_minor, tax_minor, total_minor, created_audit_event_id, issued_at
       ) VALUES (
         $1::uuid, $2::uuid, $3::uuid, 1, $4::uuid, $5::uuid, 1, 'OUT_FOR_SIGNATURE', true,
         '{}'::jsonb, $6::char(64), 'USD', 100, 0, 100, $7::uuid, $8::timestamptz
       )`,
      contractVersionId,
      ownerId,
      contractId,
      proposalId,
      proposalVersionId,
      digest,
      createdAudit,
      epoch,
    );
    for (const signerKey of signers) {
      await tx.$executeRawUnsafe(
        `INSERT INTO commercial.contract_signers (
           id, owner_organization_id, contract_id, contract_version_id, contract_version, signer_key, signer_kind, required
         ) VALUES ($1::uuid, $2::uuid, $3::uuid, $4::uuid, 1, $5::text, 'CLIENT', true)`,
        crypto.randomUUID(),
        ownerId,
        contractId,
        contractVersionId,
        signerKey,
      );
    }
    await tx.$executeRawUnsafe(
      `INSERT INTO commercial.signature_requests (
         id, owner_organization_id, contract_id, contract_version_id, contract_version, provider,
         provider_request_id, status, document_sha256, idempotency_key, request_hash, audit_event_id
       ) VALUES (
         $1::uuid, $2::uuid, $3::uuid, $4::uuid, 1, 'test-provider', $5::text, 'SENT',
         $6::char(64), $7::text, $8::char(64), $9::uuid
       )`,
      requestId,
      ownerId,
      contractId,
      contractVersionId,
      providerRequestId,
      digest,
      "r7:signature-request:" + requestId,
      digest,
      requestAudit,
    );
  });

  return { contractId, contractVersionId, providerRequestId, requestId };
}

async function statusOf(contractVersionId: string) {
  const rows = await database.$queryRawUnsafe<Array<{ status: string; signed_at: Date | null }>>(
    `SELECT status, signed_at FROM commercial.contract_versions WHERE id = $1::uuid`,
    contractVersionId,
  );
  return rows[0];
}

async function eventCount(providerEventId: string) {
  const rows = await database.$queryRawUnsafe<Array<{ count: bigint }>>(
    `SELECT count(*)::bigint AS count FROM commercial.signature_events WHERE provider_event_id = $1::text`,
    providerEventId,
  );
  return Number(rows[0]?.count ?? 0);
}

describe("R7 signature reconciliation persistence", () => {
  beforeAll(async () => {
    const present = await database.$queryRawUnsafe<Array<{ exists: boolean | null }>>(
      `SELECT to_regprocedure('platform.reconcile_r7_signature_event(uuid,uuid,text,text,text,uuid,text,text,text,timestamptz,jsonb,timestamptz,timestamptz)') IS NOT NULL AS exists`,
    );
    expect(present[0]?.exists, "reconciliation function must exist after migrate").toBe(true);
  });

  afterAll(async () => {
    await database.$disconnect();
  });

  it("signs only after every required signer and replays without a second transition", async () => {
    const graph = await fixture();
    const first = await reconcileVerifiedSignatureEvent(owner, await verified(event({
      providerEventId: "evt-a-" + graph.requestId,
      providerRequestId: graph.providerRequestId,
      contractVersionId: graph.contractVersionId,
      signerKey: "signer-a",
    })), database);
    expect(first).toMatchObject({ kind: "ok", code: "SIGNER_RECORDED" });
    expect((await statusOf(graph.contractVersionId))?.status).toBe("OUT_FOR_SIGNATURE");

    const duplicateSigner = await reconcileVerifiedSignatureEvent(owner, await verified(event({
      providerEventId: "evt-a2-" + graph.requestId,
      providerRequestId: graph.providerRequestId,
      contractVersionId: graph.contractVersionId,
      signerKey: "signer-a",
      normalizedEvidence: { signer: "signer-a", duplicate: true },
    })), database);
    expect(duplicateSigner).toMatchObject({ kind: "ok", code: "SIGNER_RECORDED" });
    expect((await statusOf(graph.contractVersionId))?.status).toBe("OUT_FOR_SIGNATURE");

    const second = await reconcileVerifiedSignatureEvent(owner, await verified(event({
      providerEventId: "evt-b-" + graph.requestId,
      providerRequestId: graph.providerRequestId,
      contractVersionId: graph.contractVersionId,
      signerKey: "signer-b",
      normalizedEvidence: { signer: "signer-b" },
    })), database);
    expect(second).toMatchObject({ kind: "ok", code: "SIGNED", contractStatus: "SIGNED" });
    expect((await statusOf(graph.contractVersionId))?.signed_at).toBeTruthy();

    const replay = await reconcileVerifiedSignatureEvent(owner, await verified(event({
      providerEventId: "evt-b-" + graph.requestId,
      providerRequestId: graph.providerRequestId,
      contractVersionId: graph.contractVersionId,
      signerKey: "signer-b",
      normalizedEvidence: { signer: "signer-b" },
    })), database);
    expect(replay).toMatchObject({ kind: "ok", code: "REPLAY", priorCode: "SIGNED" });
    expect(await eventCount("evt-b-" + graph.requestId)).toBe(1);
    const auditRows = await database.$queryRawUnsafe<Array<{ count: bigint }>>(
      `SELECT count(*)::bigint AS count
         FROM audit.audit_events
        WHERE action = 'r7.signature.reconciled'
          AND owner_organization_id = $1::uuid
          AND redacted_diff->>'providerEventId' = $2::text
          AND redacted_diff->>'outcome' = 'SIGNED'
          AND redacted_diff->>'documentSha256' = $3::text`,
      ownerId,
      "evt-b-" + graph.requestId,
      digest,
    );
    expect(Number(auditRows[0]?.count ?? 0)).toBe(1);

    const lateVoid = await reconcileVerifiedSignatureEvent(owner, await verified(event({
      providerEventId: "evt-void-" + graph.requestId,
      providerRequestId: graph.providerRequestId,
      contractVersionId: graph.contractVersionId,
      eventType: "REQUEST_VOIDED",
      signerKey: null,
      normalizedEvidence: { reason: "late" },
    })), database);
    expect(lateVoid).toMatchObject({ kind: "ok", code: "IGNORED_TERMINAL" });
    expect((await statusOf(graph.contractVersionId))?.status).toBe("SIGNED");
  });

  it("rejects correlation, signer, digest, tenant and changed-evidence attacks with no SIGNED residue", async () => {
    const graph = await fixture(["signer-a"]);
    const denied = [
      event({
        providerEventId: "evt-digest-" + graph.requestId,
        providerRequestId: graph.providerRequestId,
        contractVersionId: graph.contractVersionId,
        documentSha256: otherDigest,
      }),
      event({
        providerEventId: "evt-version-" + graph.requestId,
        providerRequestId: graph.providerRequestId,
        contractVersionId: crypto.randomUUID(),
      }),
      event({
        providerEventId: "evt-signer-" + graph.requestId,
        providerRequestId: graph.providerRequestId,
        contractVersionId: graph.contractVersionId,
        signerKey: "intruder",
        normalizedEvidence: { signer: "intruder" },
      }),
      event({
        providerEventId: "evt-request-" + graph.requestId,
        providerRequestId: "missing-request",
        contractVersionId: graph.contractVersionId,
      }),
    ];
    const codes = [];
    for (const candidate of denied) {
      const result = await reconcileVerifiedSignatureEvent(owner, await verified(candidate), database);
      codes.push(result.kind === "error" ? result.code : result.code);
      expect(result.kind).toBe("error");
    }
    expect(codes).toEqual([
      "CORRELATION_DENIED",
      "CORRELATION_DENIED",
      "SIGNER_DENIED",
      "NOT_FOUND",
    ]);

    const foreignResult = await reconcileVerifiedSignatureEvent(foreign, await verified(event({
      providerEventId: "evt-foreign-" + graph.requestId,
      providerRequestId: graph.providerRequestId,
      contractVersionId: graph.contractVersionId,
    })), database);
    expect(foreignResult).toEqual({ kind: "error", code: "NOT_FOUND" });
    expect((await statusOf(graph.contractVersionId))?.status).toBe("OUT_FOR_SIGNATURE");
    expect((await statusOf(graph.contractVersionId))?.signed_at).toBeNull();

    const accepted = await reconcileVerifiedSignatureEvent(owner, await verified(event({
      providerEventId: "evt-ok-" + graph.requestId,
      providerRequestId: graph.providerRequestId,
      contractVersionId: graph.contractVersionId,
    })), database);
    expect(accepted).toMatchObject({ code: "SIGNED" });

    const conflict = await reconcileVerifiedSignatureEvent(owner, await verified(event({
      providerEventId: "evt-ok-" + graph.requestId,
      providerRequestId: graph.providerRequestId,
      contractVersionId: graph.contractVersionId,
      normalizedEvidence: { signer: "signer-a", changed: true },
    })), database);
    expect(conflict).toEqual({ kind: "error", code: "EVIDENCE_CONFLICT" });
    expect(await eventCount("evt-ok-" + graph.requestId)).toBe(1);
    expect((await statusOf(graph.contractVersionId))?.status).toBe("SIGNED");
  });

  it("rolls back a failed reconciliation and refuses runtime table writes", async () => {
    const graph = await fixture(["signer-a"]);
    const providerEventId = "evt-rollback-" + graph.requestId;
    await expect(database.$transaction(async (tx) => {
      await tx.$executeRawUnsafe(`SET LOCAL ROLE perspective_runtime`);
      await tx.$queryRaw`
        SELECT set_config('app.organization_id', ${ownerId}, true),
               set_config('app.client_organization_id', '', true)
      `;
      await tx.$queryRawUnsafe(
        `SELECT platform.reconcile_r7_signature_event(
           $1::uuid, $2::uuid, 'test-provider', $3::text, $4::text, $5::uuid, $6::text,
           'SIGNER_COMPLETED', 'signer-a', $7::timestamptz, '{"signer":"signer-a"}'::jsonb,
           $7::timestamptz, $7::timestamptz
         )`,
        crypto.randomUUID(),
        crypto.randomUUID(),
        providerEventId,
        graph.providerRequestId,
        graph.contractVersionId,
        digest,
        epoch,
      );
      throw new Error("rollback");
    })).rejects.toThrow("rollback");
    expect(await eventCount(providerEventId)).toBe(0);
    expect((await statusOf(graph.contractVersionId))?.status).toBe("OUT_FOR_SIGNATURE");

    await expect(database.$transaction(async (tx) => {
      await tx.$executeRawUnsafe(`SET LOCAL ROLE perspective_runtime`);
      await tx.$executeRawUnsafe(
        `UPDATE commercial.contract_versions SET status = 'SIGNED', signed_at = now() WHERE id = $1::uuid`,
        graph.contractVersionId,
      );
    })).rejects.toThrow();
    await expect(database.$transaction(async (tx) => {
      await tx.$executeRawUnsafe(`SET LOCAL ROLE perspective_runtime`);
      await tx.$executeRawUnsafe(`INSERT INTO commercial.signature_events DEFAULT VALUES`);
    })).rejects.toThrow();
    expect((await statusOf(graph.contractVersionId))?.status).toBe("OUT_FOR_SIGNATURE");
  });

  it("signs once when distinct required signers complete concurrently", async () => {
    const graph = await fixture(["signer-a", "signer-b"]);
    const results = await Promise.all([
      reconcileVerifiedSignatureEvent(owner, await verified(event({
        providerEventId: "evt-conc-a-" + graph.requestId,
        providerRequestId: graph.providerRequestId,
        contractVersionId: graph.contractVersionId,
        signerKey: "signer-a",
      })), database),
      reconcileVerifiedSignatureEvent(owner, await verified(event({
        providerEventId: "evt-conc-b-" + graph.requestId,
        providerRequestId: graph.providerRequestId,
        contractVersionId: graph.contractVersionId,
        signerKey: "signer-b",
        normalizedEvidence: { signer: "signer-b" },
      })), database),
    ]);
    expect(results.map((result) => result.kind === "ok" ? result.code : result.code).sort()).toEqual([
      "SIGNED",
      "SIGNER_RECORDED",
    ]);
    expect(await eventCount("evt-conc-a-" + graph.requestId)).toBe(1);
    expect(await eventCount("evt-conc-b-" + graph.requestId)).toBe(1);
    expect((await statusOf(graph.contractVersionId))?.status).toBe("SIGNED");
    expect((await statusOf(graph.contractVersionId))?.signed_at).toBeTruthy();
  });

  it("keeps one canonical outcome when the same final event is reconciled concurrently", async () => {
    const graph = await fixture(["signer-a"]);
    const providerEventId = "evt-race-" + graph.requestId;
    const branded = await verified(event({
      providerEventId,
      providerRequestId: graph.providerRequestId,
      contractVersionId: graph.contractVersionId,
    }));
    const results = await Promise.all([
      reconcileVerifiedSignatureEvent(owner, branded, database),
      reconcileVerifiedSignatureEvent(owner, branded, database),
    ]);
    const codes = results.map((result) => result.kind === "ok" ? result.code : result.code).sort();
    expect(codes).toEqual(["REPLAY", "SIGNED"]);
    expect(await eventCount(providerEventId)).toBe(1);
    expect((await statusOf(graph.contractVersionId))?.status).toBe("SIGNED");
  });
});

void (database satisfies PrismaClient);
