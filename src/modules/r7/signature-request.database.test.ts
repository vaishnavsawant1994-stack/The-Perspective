import { createHash } from "node:crypto";
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
import { requestContractSignature } from "./signature-request";
import {
  SignatureProviderAmbiguousError,
  verifySignatureWebhook,
  type NormalizedSignatureEvent,
  type OutboundSignatureRequest,
  type SignatureProviderAdapter,
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
      sessionId: ("r7-send-" + requestId) as never,
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

const owner = team(ownerId, membershipId, "r7-send-owner");
const foreign = team(foreignOrgId, foreignMembershipId, "r7-send-foreign");

function providerId(request: OutboundSignatureRequest) {
  return createHash("sha256").update(request.idempotencyKey).digest("hex").slice(0, 32);
}

function trackingAdapter(calls: OutboundSignatureRequest[], mode: "ok" | "fail" | "ambiguous" = "ok"): SignatureProviderAdapter {
  return {
    provider: "test-provider",
    verifyAndNormalize: async () => null,
    submitSignatureRequest: async (request) => {
      calls.push(request);
      if (mode === "ambiguous") throw new SignatureProviderAmbiguousError();
      if (mode === "fail") return null;
      return { providerRequestId: providerId(request) };
    },
  };
}

async function verified(event: NormalizedSignatureEvent) {
  const result = await verifySignatureWebhook(
    "test-provider",
    {
      headers: {},
      rawBody: new TextEncoder().encode("{\"event\":\"signed\"}"),
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

async function fixture(options: {
  status?: string;
  signers?: readonly string[];
  optionalSigners?: readonly string[];
} = {}) {
  const status = options.status ?? "READY_FOR_SIGNATURE";
  const signers = options.signers ?? ["signer-a", "signer-b"];
  const optionalSigners = options.optionalSigners ?? [];
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
      { id: ownerId, organizationType: "PLATFORM", legalName: "R7 Send Owner", displayName: "R7 Send Owner", slug: "r7-send-owner-" + ownerId.slice(0, 8), status: "ACTIVE" },
      { id: clientOrganizationId, organizationType: "CLIENT", legalName: "R7 Send Client", displayName: "R7 Send Client", slug: "r7-send-client-" + clientOrganizationId.slice(0, 8), status: "ACTIVE" },
      { id: foreignOrgId, organizationType: "PLATFORM", legalName: "R7 Send Foreign", displayName: "R7 Send Foreign", slug: "r7-send-foreign-" + foreignOrgId.slice(0, 8), status: "ACTIVE" },
    ],
    skipDuplicates: true,
  });
  await database.organizationMembership.createMany({
    data: [
      { id: membershipId, organizationId: ownerId, userAccountId: seedIds.user.operator, membershipType: "STAFF", status: "ACTIVE", joinedAt: epoch },
      { id: foreignMembershipId, organizationId: foreignOrgId, userAccountId: seedIds.user.asteriaAdmin, membershipType: "STAFF", status: "ACTIVE", joinedAt: epoch },
    ],
    skipDuplicates: true,
  });
  await database.$transaction(async (tx) => {
    await tx.$executeRawUnsafe(
      `INSERT INTO platform.resources (
         id, resource_type, title, owner_organization_id, client_organization_id, visibility, sensitivity
       ) VALUES ($1::uuid, 'client-account', 'R7 send client', $2::uuid, $3::uuid, 'INTERNAL', 'CONFIDENTIAL')`,
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
      `INSERT INTO audit.audit_events (
         id, owner_organization_id, actor_type, action, request_id, occurred_at
       ) VALUES ($1::uuid, $2::uuid, 'SYSTEM', 'r7.contract.version.created', $3::text, $4::timestamptz)`,
      createdAudit, ownerId, "r7-send-bootstrap-" + contractId, epoch,
    );
    await tx.$executeRawUnsafe(
      `INSERT INTO commercial.contracts (
         id, resource_id, owner_organization_id, client_account_id, source_proposal_id,
         source_proposal_version_id, source_proposal_version, status, current_version
       ) VALUES ($1::uuid, $2::uuid, $3::uuid, $4::uuid, $5::uuid, $6::uuid, 1, $7::text, 1)`,
      contractId, crypto.randomUUID(), ownerId, clientAccountId, proposalId, proposalVersionId, status,
    );
    await tx.$executeRawUnsafe(
      `INSERT INTO commercial.contract_versions (
         id, owner_organization_id, contract_id, version, source_proposal_id, source_proposal_version_id,
         source_proposal_version, status, immutable, document_snapshot, document_sha256, currency,
         subtotal_minor, tax_minor, total_minor, created_audit_event_id
       ) VALUES (
         $1::uuid, $2::uuid, $3::uuid, 1, $4::uuid, $5::uuid, 1, $6::text, true,
         '{}'::jsonb, $7::char(64), 'USD', 100, 0, 100, $8::uuid
       )`,
      contractVersionId, ownerId, contractId, proposalId, proposalVersionId, status, digest, createdAudit,
    );
    for (const signerKey of signers) {
      await tx.$executeRawUnsafe(
        `INSERT INTO commercial.contract_signers (
           id, owner_organization_id, contract_id, contract_version_id, contract_version, signer_key, signer_kind, required
         ) VALUES ($1::uuid, $2::uuid, $3::uuid, $4::uuid, 1, $5::text, 'CLIENT', true)`,
        crypto.randomUUID(), ownerId, contractId, contractVersionId, signerKey,
      );
    }
    for (const signerKey of optionalSigners) {
      await tx.$executeRawUnsafe(
        `INSERT INTO commercial.contract_signers (
           id, owner_organization_id, contract_id, contract_version_id, contract_version, signer_key, signer_kind, required
         ) VALUES ($1::uuid, $2::uuid, $3::uuid, $4::uuid, 1, $5::text, 'CLIENT', false)`,
        crypto.randomUUID(), ownerId, contractId, contractVersionId, signerKey,
      );
    }
  });
  return { contractId, contractVersionId };
}

function input(graph: { contractId: string; contractVersionId: string }, idempotencyKey: string, documentSha256 = digest) {
  return {
    contractId: graph.contractId,
    expectedVersionId: graph.contractVersionId,
    expectedVersion: 1,
    expectedRowVersion: 1,
    expectedDocumentSha256: documentSha256,
    idempotencyKey,
  };
}

async function stateOf(contractVersionId: string) {
  const rows = await database.$queryRawUnsafe<Array<{
    version_status: string;
    contract_status: string;
    signed_at: Date | null;
    issued_at: Date | null;
    requests: number;
    row_version: number;
    request_status: string | null;
    events: number;
  }>>(
    `SELECT version.status AS version_status, contract.status AS contract_status,
            version.signed_at, version.issued_at, contract.row_version,
            (SELECT count(*)::int FROM commercial.signature_requests AS request
              WHERE request.contract_version_id = version.id) AS requests,
            (SELECT request.status FROM commercial.signature_requests AS request
              WHERE request.contract_version_id = version.id) AS request_status,
            (SELECT count(*)::int FROM commercial.signature_events AS event
              JOIN commercial.signature_requests AS request ON request.id = event.signature_request_id
              WHERE request.contract_version_id = version.id) AS events
       FROM commercial.contract_versions AS version
       JOIN commercial.contracts AS contract ON contract.id = version.contract_id
      WHERE version.id = $1::uuid`,
    contractVersionId,
  );
  return rows[0];
}

describe("R7 outbound signature request persistence", () => {
  beforeAll(async () => {
    const present = await database.$queryRawUnsafe<Array<{ exists: boolean | null }>>(
      `SELECT to_regprocedure('platform.reserve_r7_signature_request(uuid,uuid,uuid,uuid,integer,integer,text,text,text,text,text)') IS NOT NULL AS exists`,
    );
    expect(present[0]?.exists, "signature request functions must exist").toBe(true);
  });

  afterAll(async () => {
    await database.$disconnect();
  });

  it("sends one exact version, replays the same request, and then reconciles to SIGNED", async () => {
    const graph = await fixture();
    const calls: OutboundSignatureRequest[] = [];
    const adapter = trackingAdapter(calls);
    const key = "send-" + graph.contractId.slice(0, 8);
    const first = await requestContractSignature(owner, input(graph, key), database, adapter);
    expect(first).toMatchObject({ kind: "ok", value: { contractStatus: "OUT_FOR_SIGNATURE", replayed: false, provider: "test-provider" } });
    expect(calls).toHaveLength(1);
    expect(calls[0]).toMatchObject({
      contractId: graph.contractId,
      contractVersionId: graph.contractVersionId,
      documentSha256: digest,
      signerKeys: ["signer-a", "signer-b"],
    });
    expect(calls[0]).not.toHaveProperty("provider");
    expect((await stateOf(graph.contractVersionId))?.version_status).toBe("OUT_FOR_SIGNATURE");
    expect((await stateOf(graph.contractVersionId))?.issued_at).toBeTruthy();
    expect((await stateOf(graph.contractVersionId))?.signed_at).toBeNull();

    const replay = await requestContractSignature(owner, input(graph, key), database, adapter);
    expect(replay).toMatchObject({ kind: "ok", value: { replayed: true } });
    expect(calls).toHaveLength(1);
    expect((await stateOf(graph.contractVersionId))?.requests).toBe(1);

    const changed = await requestContractSignature(owner, { ...input(graph, key), expectedRowVersion: 2 }, database, adapter);
    expect(changed).toEqual({ kind: "error", code: "IDEMPOTENCY_CONFLICT" });
    const otherKey = await requestContractSignature(owner, input(graph, key + "-other"), database, adapter);
    expect(otherKey).toEqual({ kind: "error", code: "CONFLICT" });
    expect(calls).toHaveLength(1);

    if (first.kind !== "ok") return;
    const base = {
      providerRequestId: first.value.providerRequestId,
      contractVersionId: graph.contractVersionId,
      documentSha256: digest,
      providerOccurredAt: epoch,
    };
    const recorded = await reconcileVerifiedSignatureEvent(owner, await verified({
      ...base,
      providerEventId: "evt-a-" + graph.contractId,
      eventType: "SIGNER_COMPLETED",
      signerKey: "signer-a",
      normalizedEvidence: { signer: "signer-a" },
    }), database);
    expect(recorded).toMatchObject({ code: "SIGNER_RECORDED" });
    const signed = await reconcileVerifiedSignatureEvent(owner, await verified({
      ...base,
      providerEventId: "evt-b-" + graph.contractId,
      eventType: "SIGNER_COMPLETED",
      signerKey: "signer-b",
      normalizedEvidence: { signer: "signer-b" },
    }), database);
    expect(signed).toMatchObject({ code: "SIGNED", contractStatus: "SIGNED" });
    expect((await stateOf(graph.contractVersionId))?.version_status).toBe("SIGNED");
    expect((await stateOf(graph.contractVersionId))?.signed_at).toBeTruthy();
  });

  it("rejects digest, version, tenant, signer, and lifecycle attacks without an envelope", async () => {
    const graph = await fixture();
    const calls: OutboundSignatureRequest[] = [];
    const adapter = trackingAdapter(calls);
    const denied = [
      requestContractSignature(owner, input(graph, "digest-" + graph.contractId.slice(0, 8), otherDigest), database, adapter),
      requestContractSignature(owner, { ...input(graph, "version-" + graph.contractId.slice(0, 8)), expectedVersionId: crypto.randomUUID() }, database, adapter),
      requestContractSignature(owner, { ...input(graph, "stale-" + graph.contractId.slice(0, 8)), expectedRowVersion: 9 }, database, adapter),
      requestContractSignature(foreign, input(graph, "foreign-" + graph.contractId.slice(0, 8)), database, adapter),
    ];
    const results = await Promise.all(denied);
    expect(results.map((result) => result.kind === "error" ? result.code : result.kind)).toEqual([
      "CORRELATION_DENIED",
      "CORRELATION_DENIED",
      "STALE_WRITE",
      "NOT_FOUND",
    ]);
    expect(calls).toHaveLength(0);
    expect((await stateOf(graph.contractVersionId))?.version_status).toBe("READY_FOR_SIGNATURE");
    expect((await stateOf(graph.contractVersionId))?.requests).toBe(0);

    const empty = await fixture({ signers: [] });
    const emptyResult = await requestContractSignature(owner, input(empty, "empty-" + empty.contractId.slice(0, 8)), database, adapter);
    expect(emptyResult).toEqual({ kind: "error", code: "INELIGIBLE" });
    const draft = await fixture({ status: "DRAFT" });
    const draftResult = await requestContractSignature(owner, input(draft, "draft-" + draft.contractId.slice(0, 8)), database, adapter);
    expect(draftResult).toEqual({ kind: "error", code: "INELIGIBLE" });
    expect(calls).toHaveLength(0);
  });

  it("does not manufacture delivery when the provider fails or the outcome is ambiguous", async () => {
    const failed = await fixture({ signers: ["signer-a"] });
    const failCalls: OutboundSignatureRequest[] = [];
    const failAdapter = trackingAdapter(failCalls, "fail");
    const failKey = "fail-" + failed.contractId.slice(0, 8);
    expect(await requestContractSignature(owner, input(failed, failKey), database, failAdapter)).toEqual({
      kind: "error",
      code: "PROVIDER_FAILED",
    });
    expect(await requestContractSignature(owner, input(failed, failKey), database, failAdapter)).toEqual({
      kind: "error",
      code: "PROVIDER_FAILED",
    });
    expect(failCalls).toHaveLength(1);
    expect((await stateOf(failed.contractVersionId))?.version_status).toBe("READY_FOR_SIGNATURE");

    const ambiguous = await fixture({ signers: ["signer-a"] });
    const ambiguousCalls: OutboundSignatureRequest[] = [];
    const ambiguousAdapter = trackingAdapter(ambiguousCalls, "ambiguous");
    const ambiguousKey = "ambiguous-" + ambiguous.contractId.slice(0, 8);
    expect(await requestContractSignature(owner, input(ambiguous, ambiguousKey), database, ambiguousAdapter)).toEqual({
      kind: "error",
      code: "PROVIDER_AMBIGUOUS",
    });
    expect(await requestContractSignature(owner, input(ambiguous, ambiguousKey), database, ambiguousAdapter)).toEqual({
      kind: "error",
      code: "PROVIDER_AMBIGUOUS",
    });
    expect(ambiguousCalls).toHaveLength(1);
    expect((await stateOf(ambiguous.contractVersionId))?.version_status).toBe("READY_FOR_SIGNATURE");
    expect((await stateOf(ambiguous.contractVersionId))?.issued_at).toBeNull();
  });

  it("rolls back a reserved send and refuses runtime signature writes", async () => {
    const graph = await fixture({ signers: ["signer-a"] });
    const key = `r7:signature-request:${ownerId}:rollback-${graph.contractId.slice(0, 8)}`;
    const hash = "ef".repeat(32);
    await expect(database.$transaction(async (tx) => {
      await tx.$executeRawUnsafe(`SET LOCAL ROLE perspective_runtime`);
      await tx.$queryRaw`
        SELECT set_config('app.organization_id', ${ownerId}, true),
               set_config('app.client_organization_id', '', true)
      `;
      await tx.$queryRawUnsafe(
        `SELECT platform.reserve_r7_signature_request(
           $1::uuid, $2::uuid, $3::uuid, $4::uuid, 1, 1, $5::text,
           'test-provider', $6::text, $7::text, 'r7-send-rollback'
         )`,
        crypto.randomUUID(), crypto.randomUUID(), graph.contractId, graph.contractVersionId, digest, key, hash,
      );
      throw new Error("rollback");
    })).rejects.toThrow("rollback");
    expect((await stateOf(graph.contractVersionId))?.requests).toBe(0);
    expect((await stateOf(graph.contractVersionId))?.version_status).toBe("READY_FOR_SIGNATURE");

    await expect(database.$transaction(async (tx) => {
      await tx.$executeRawUnsafe(`SET LOCAL ROLE perspective_runtime`);
      await tx.$executeRawUnsafe(`INSERT INTO commercial.signature_requests DEFAULT VALUES`);
    })).rejects.toThrow();
    await expect(database.$transaction(async (tx) => {
      await tx.$executeRawUnsafe(`SET LOCAL ROLE perspective_runtime`);
      await tx.$executeRawUnsafe(
        `UPDATE commercial.contract_versions SET status = 'SIGNED', signed_at = now() WHERE id = $1::uuid`,
        graph.contractVersionId,
      );
    })).rejects.toThrow();
  });

  it("keeps one envelope when the same send is issued concurrently", async () => {
    const graph = await fixture({ signers: ["signer-a"] });
    const calls: OutboundSignatureRequest[] = [];
    const adapter = trackingAdapter(calls);
    const key = "race-" + graph.contractId.slice(0, 8);
    const results = await Promise.all([
      requestContractSignature(owner, input(graph, key), database, adapter),
      requestContractSignature(owner, input(graph, key), database, adapter),
    ]);
    const ok = results.filter((result) => result.kind === "ok");
    expect(ok.length).toBeGreaterThanOrEqual(1);
    expect(calls.length).toBe(1);
    expect((await stateOf(graph.contractVersionId))?.requests).toBe(1);
    expect((await stateOf(graph.contractVersionId))?.version_status).toBe("OUT_FOR_SIGNATURE");
  });

  it("does not sign a version that never reached a delivered envelope", async () => {
    const ready = await fixture({ signers: ["signer-a"] });
    const forged = await reconcileVerifiedSignatureEvent(owner, await verified({
      providerRequestId: "guessed-envelope",
      contractVersionId: ready.contractVersionId,
      documentSha256: digest,
      providerOccurredAt: epoch,
      providerEventId: "evt-unsent-" + ready.contractId,
      eventType: "SIGNER_COMPLETED",
      signerKey: "signer-a",
      normalizedEvidence: { signer: "signer-a" },
    }), database);
    expect(forged).toEqual({ kind: "error", code: "NOT_FOUND" });
    expect(await reconcileVerifiedSignatureEvent(owner, {
      provider: "test-provider",
      providerRequestId: "guessed-envelope",
      contractVersionId: ready.contractVersionId,
      documentSha256: digest,
      eventType: "SIGNER_COMPLETED",
      signerKey: "signer-a",
    }, database)).toEqual({ kind: "error", code: "UNVERIFIED_EVENT" });
    expect(await requestContractSignature(owner, input(ready, "closed-" + ready.contractId.slice(0, 8)), database)).toEqual({
      kind: "error",
      code: "PROVIDER_UNAVAILABLE",
    });
    expect((await stateOf(ready.contractVersionId))?.version_status).toBe("READY_FOR_SIGNATURE");
    expect((await stateOf(ready.contractVersionId))?.requests).toBe(0);
    expect((await stateOf(ready.contractVersionId))?.events).toBe(0);
    expect((await stateOf(ready.contractVersionId))?.signed_at).toBeNull();

    const failed = await fixture({ signers: ["signer-a"] });
    const failCalls: OutboundSignatureRequest[] = [];
    expect(await requestContractSignature(
      owner,
      input(failed, "nofail-" + failed.contractId.slice(0, 8)),
      database,
      trackingAdapter(failCalls, "fail"),
    )).toEqual({ kind: "error", code: "PROVIDER_FAILED" });
    expect(await reconcileVerifiedSignatureEvent(owner, await verified({
      providerRequestId: providerId({
        contractId: failed.contractId,
        contractVersionId: failed.contractVersionId,
        documentSha256: digest,
        signerKeys: ["signer-a"],
        idempotencyKey: "unused",
      }),
      contractVersionId: failed.contractVersionId,
      documentSha256: digest,
      providerOccurredAt: epoch,
      providerEventId: "evt-failed-" + failed.contractId,
      eventType: "SIGNER_COMPLETED",
      signerKey: "signer-a",
      normalizedEvidence: {},
    }), database)).toEqual({ kind: "error", code: "NOT_FOUND" });
    expect((await stateOf(failed.contractVersionId))?.request_status).toBe("FAILED");
    expect((await stateOf(failed.contractVersionId))?.version_status).toBe("READY_FOR_SIGNATURE");
    expect((await stateOf(failed.contractVersionId))?.events).toBe(0);

    const ambiguous = await fixture({ signers: ["signer-a"] });
    expect(await requestContractSignature(
      owner,
      input(ambiguous, "noamb-" + ambiguous.contractId.slice(0, 8)),
      database,
      trackingAdapter([], "ambiguous"),
    )).toEqual({ kind: "error", code: "PROVIDER_AMBIGUOUS" });
    expect(await reconcileVerifiedSignatureEvent(owner, await verified({
      providerRequestId: "ambiguous-envelope",
      contractVersionId: ambiguous.contractVersionId,
      documentSha256: digest,
      providerOccurredAt: epoch,
      providerEventId: "evt-ambiguous-" + ambiguous.contractId,
      eventType: "SIGNER_COMPLETED",
      signerKey: "signer-a",
      normalizedEvidence: {},
    }), database)).toEqual({ kind: "error", code: "NOT_FOUND" });
    const ambiguousState = await stateOf(ambiguous.contractVersionId);
    expect(ambiguousState?.request_status).toBe("REQUESTED");
    expect(ambiguousState?.version_status).toBe("READY_FOR_SIGNATURE");
    expect(ambiguousState?.issued_at).toBeNull();
    expect(ambiguousState?.signed_at).toBeNull();
    expect(ambiguousState?.events).toBe(0);
  });

  it("signs only after a real send and every required signer, then refuses further authority", async () => {
    const graph = await fixture({ optionalSigners: ["witness"] });
    const calls: OutboundSignatureRequest[] = [];
    const key = "life-" + graph.contractId.slice(0, 8);
    const sent = await requestContractSignature(owner, input(graph, key), database, trackingAdapter(calls));
    expect(sent.kind).toBe("ok");
    if (sent.kind !== "ok") return;
    const base = {
      providerRequestId: sent.value.providerRequestId,
      contractVersionId: graph.contractVersionId,
      documentSha256: digest,
      providerOccurredAt: epoch,
    };
    const attacks = [
      reconcileVerifiedSignatureEvent(owner, await verified({
        ...base,
        documentSha256: otherDigest,
        providerEventId: "evt-digest-" + graph.contractId,
        eventType: "SIGNER_COMPLETED",
        signerKey: "signer-a",
        normalizedEvidence: {},
      }), database),
      reconcileVerifiedSignatureEvent(owner, await verified({
        ...base,
        providerRequestId: "substituted-envelope",
        providerEventId: "evt-envelope-" + graph.contractId,
        eventType: "SIGNER_COMPLETED",
        signerKey: "signer-a",
        normalizedEvidence: {},
      }), database),
      reconcileVerifiedSignatureEvent(foreign, await verified({
        ...base,
        providerEventId: "evt-foreign-" + graph.contractId,
        eventType: "SIGNER_COMPLETED",
        signerKey: "signer-a",
        normalizedEvidence: {},
      }), database),
      reconcileVerifiedSignatureEvent(owner, await verified({
        ...base,
        providerEventId: "evt-unknown-" + graph.contractId,
        eventType: "SIGNER_COMPLETED",
        signerKey: "intruder",
        normalizedEvidence: {},
      }), database),
      verifySignatureWebhook("other-provider", {
        headers: {},
        rawBody: new TextEncoder().encode("{\"event\":\"signed\"}"),
        receivedAt: epoch,
      }, () => ({
        provider: "other-provider",
        verifyAndNormalize: async () => [{
          ...base,
          providerEventId: "evt-provider-" + graph.contractId,
          eventType: "SIGNER_COMPLETED" as const,
          signerKey: "signer-a",
          normalizedEvidence: {},
        }],
      })).then((verifiedEvent) => {
        if (verifiedEvent.kind !== "ok" || !verifiedEvent.events[0]) throw new Error("unverified");
        return reconcileVerifiedSignatureEvent(owner, verifiedEvent.events[0], database);
      }),
    ];
    expect((await Promise.all(attacks)).map((result) => result.kind === "error" ? result.code : result.kind)).toEqual([
      "CORRELATION_DENIED",
      "NOT_FOUND",
      "NOT_FOUND",
      "SIGNER_DENIED",
      "NOT_FOUND",
    ]);
    expect((await stateOf(graph.contractVersionId))?.events).toBe(0);
    expect((await stateOf(graph.contractVersionId))?.version_status).toBe("OUT_FOR_SIGNATURE");

    const witness = await reconcileVerifiedSignatureEvent(owner, await verified({
      ...base,
      providerEventId: "evt-witness-" + graph.contractId,
      eventType: "SIGNER_COMPLETED",
      signerKey: "witness",
      normalizedEvidence: { signer: "witness" },
    }), database);
    expect(witness).toMatchObject({ code: "SIGNER_RECORDED", contractStatus: "OUT_FOR_SIGNATURE" });
    const first = await reconcileVerifiedSignatureEvent(owner, await verified({
      ...base,
      providerEventId: "evt-life-a-" + graph.contractId,
      eventType: "SIGNER_COMPLETED",
      signerKey: "signer-a",
      normalizedEvidence: { signer: "signer-a" },
    }), database);
    expect(first).toMatchObject({ code: "SIGNER_RECORDED" });
    expect((await stateOf(graph.contractVersionId))?.signed_at).toBeNull();
    const replay = await requestContractSignature(owner, input(graph, key), database, trackingAdapter(calls));
    expect(replay).toMatchObject({ kind: "ok", value: { replayed: true, providerRequestId: sent.value.providerRequestId } });
    expect(calls).toHaveLength(1);

    const signed = await reconcileVerifiedSignatureEvent(owner, await verified({
      ...base,
      providerEventId: "evt-life-b-" + graph.contractId,
      eventType: "SIGNER_COMPLETED",
      signerKey: "signer-b",
      normalizedEvidence: { signer: "signer-b" },
    }), database);
    expect(signed).toMatchObject({ code: "SIGNED", contractStatus: "SIGNED" });
    const replayedEvent = await reconcileVerifiedSignatureEvent(owner, await verified({
      ...base,
      providerEventId: "evt-life-b-" + graph.contractId,
      eventType: "SIGNER_COMPLETED",
      signerKey: "signer-b",
      normalizedEvidence: { signer: "signer-b" },
    }), database);
    expect(replayedEvent).toMatchObject({ kind: "ok", code: "REPLAY" });
    const changed = await reconcileVerifiedSignatureEvent(owner, await verified({
      ...base,
      providerEventId: "evt-life-b-" + graph.contractId,
      eventType: "SIGNER_COMPLETED",
      signerKey: "signer-b",
      normalizedEvidence: { signer: "signer-b", changed: true },
    }), database);
    expect(changed).toEqual({ kind: "error", code: "EVIDENCE_CONFLICT" });
    const ignored = await reconcileVerifiedSignatureEvent(owner, await verified({
      ...base,
      providerEventId: "evt-late-" + graph.contractId,
      eventType: "REQUEST_VOIDED",
      signerKey: null,
      normalizedEvidence: {},
    }), database);
    expect(ignored).toMatchObject({ code: "IGNORED_TERMINAL", contractStatus: "SIGNED" });

    const signedState = await stateOf(graph.contractVersionId);
    expect(signedState?.version_status).toBe("SIGNED");
    expect(signedState?.contract_status).toBe("SIGNED");
    expect(signedState?.signed_at).toBeTruthy();
    expect(signedState?.requests).toBe(1);
    expect(signedState?.events).toBe(4);
    const sameKey = await requestContractSignature(
      owner,
      input(graph, key),
      database,
      trackingAdapter(calls),
    );
    expect(sameKey).toEqual({ kind: "error", code: "INELIGIBLE" });
    const again = await requestContractSignature(
      owner,
      { ...input(graph, "after-" + graph.contractId.slice(0, 8)), expectedRowVersion: signedState?.row_version ?? 0 },
      database,
      trackingAdapter(calls),
    );
    expect(again).toEqual({ kind: "error", code: "CONFLICT" });
    expect(calls).toHaveLength(1);
    expect((await stateOf(graph.contractVersionId))?.events).toBe(4);
  });

  it("voids or expires a delivered request and never promotes it to SIGNED", async () => {
    const voided = await fixture({ signers: ["signer-a"] });
    const voidCalls: OutboundSignatureRequest[] = [];
    const voidedSend = await requestContractSignature(
      owner,
      input(voided, "void-" + voided.contractId.slice(0, 8)),
      database,
      trackingAdapter(voidCalls),
    );
    expect(voidedSend.kind).toBe("ok");
    if (voidedSend.kind !== "ok") return;
    expect(await reconcileVerifiedSignatureEvent(owner, await verified({
      providerRequestId: voidedSend.value.providerRequestId,
      contractVersionId: voided.contractVersionId,
      documentSha256: digest,
      providerOccurredAt: epoch,
      providerEventId: "evt-void-" + voided.contractId,
      eventType: "REQUEST_VOIDED",
      signerKey: null,
      normalizedEvidence: {},
    }), database)).toMatchObject({ code: "VOIDED", contractStatus: "VOID" });
    expect(await reconcileVerifiedSignatureEvent(owner, await verified({
      providerRequestId: voidedSend.value.providerRequestId,
      contractVersionId: voided.contractVersionId,
      documentSha256: digest,
      providerOccurredAt: epoch,
      providerEventId: "evt-void-late-" + voided.contractId,
      eventType: "SIGNER_COMPLETED",
      signerKey: "signer-a",
      normalizedEvidence: {},
    }), database)).toMatchObject({ code: "IGNORED_TERMINAL", contractStatus: "VOID" });
    const voidState = await stateOf(voided.contractVersionId);
    expect(voidState?.signed_at).toBeNull();
    expect(voidState?.request_status).toBe("VOID");
    expect(await requestContractSignature(
      owner,
      input(voided, "void-" + voided.contractId.slice(0, 8)),
      database,
      trackingAdapter(voidCalls),
    )).toEqual({ kind: "error", code: "INELIGIBLE" });
    expect(await requestContractSignature(
      owner,
      { ...input(voided, "void-again-" + voided.contractId.slice(0, 8)), expectedRowVersion: voidState?.row_version ?? 0 },
      database,
      trackingAdapter(voidCalls),
    )).toEqual({ kind: "error", code: "CONFLICT" });
    expect(voidCalls).toHaveLength(1);

    const expired = await fixture({ signers: ["signer-a"] });
    const expiredSend = await requestContractSignature(
      owner,
      input(expired, "expire-" + expired.contractId.slice(0, 8)),
      database,
      trackingAdapter([]),
    );
    expect(expiredSend.kind).toBe("ok");
    if (expiredSend.kind !== "ok") return;
    expect(await reconcileVerifiedSignatureEvent(owner, await verified({
      providerRequestId: expiredSend.value.providerRequestId,
      contractVersionId: expired.contractVersionId,
      documentSha256: digest,
      providerOccurredAt: epoch,
      providerEventId: "evt-expire-" + expired.contractId,
      eventType: "REQUEST_EXPIRED",
      signerKey: null,
      normalizedEvidence: {},
    }), database)).toMatchObject({ code: "EXPIRED", contractStatus: "EXPIRED" });
    expect(await reconcileVerifiedSignatureEvent(owner, await verified({
      providerRequestId: expiredSend.value.providerRequestId,
      contractVersionId: expired.contractVersionId,
      documentSha256: digest,
      providerOccurredAt: epoch,
      providerEventId: "evt-expire-late-" + expired.contractId,
      eventType: "SIGNER_COMPLETED",
      signerKey: "signer-a",
      normalizedEvidence: {},
    }), database)).toMatchObject({ code: "IGNORED_TERMINAL", contractStatus: "EXPIRED" });
    expect((await stateOf(expired.contractVersionId))?.signed_at).toBeNull();
    expect((await stateOf(expired.contractVersionId))?.request_status).toBe("EXPIRED");
    expect(await requestContractSignature(
      owner,
      input(expired, "expire-" + expired.contractId.slice(0, 8)),
      database,
      trackingAdapter([]),
    )).toEqual({ kind: "error", code: "INELIGIBLE" });
  });

  it("signs once when both required signers complete concurrently after send", async () => {
    const graph = await fixture();
    const calls: OutboundSignatureRequest[] = [];
    const sent = await requestContractSignature(
      owner,
      input(graph, "both-" + graph.contractId.slice(0, 8)),
      database,
      trackingAdapter(calls),
    );
    expect(sent.kind).toBe("ok");
    if (sent.kind !== "ok") return;
    const results = await Promise.all(["signer-a", "signer-b"].map(async (signerKey) => reconcileVerifiedSignatureEvent(owner, await verified({
      providerRequestId: sent.value.providerRequestId,
      contractVersionId: graph.contractVersionId,
      documentSha256: digest,
      providerOccurredAt: epoch,
      providerEventId: "evt-both-" + signerKey + "-" + graph.contractId,
      eventType: "SIGNER_COMPLETED",
      signerKey,
      normalizedEvidence: { signer: signerKey },
    }), database)));
    expect(results.map((result) => result.kind === "ok" ? result.code : result.code).sort()).toEqual([
      "SIGNED",
      "SIGNER_RECORDED",
    ]);
    expect(calls).toHaveLength(1);
    const state = await stateOf(graph.contractVersionId);
    expect(state?.version_status).toBe("SIGNED");
    expect(state?.signed_at).toBeTruthy();
    expect(state?.requests).toBe(1);
    expect(state?.events).toBe(2);
  });
});

void (database satisfies PrismaClient);
