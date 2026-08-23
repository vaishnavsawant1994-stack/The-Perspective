import { createHash } from "node:crypto";

const DNS_NAMESPACE = "6ba7b810-9dad-11d1-80b4-00c04fd430c8";

function uuidToBytes(uuid: string) {
  return Buffer.from(uuid.replaceAll("-", ""), "hex");
}

function bytesToUuid(bytes: Buffer) {
  const value = bytes.toString("hex");
  return [
    value.slice(0, 8),
    value.slice(8, 12),
    value.slice(12, 16),
    value.slice(16, 20),
    value.slice(20, 32),
  ].join("-");
}

export function stableId(key: string) {
  if (!key.trim()) {
    throw new Error("A deterministic seed key must not be empty.");
  }

  const hash = createHash("sha1")
    .update(uuidToBytes(DNS_NAMESPACE))
    .update(`the-perspective:${key}`, "utf8")
    .digest();

  hash[6] = (hash[6] & 0x0f) | 0x50;
  hash[8] = (hash[8] & 0x3f) | 0x80;

  return bytesToUuid(hash.subarray(0, 16));
}

export const DEMO_EPOCH = new Date("2026-01-15T10:00:00.000Z");

export const seedIds = {
  organization: {
    platform: stableId("org:perspective-platform"),
    asteria: stableId("org:asteria-systems"),
    northstar: stableId("org:northstar-labs"),
  },
  person: {
    operator: stableId("person:platform-operator"),
    asteriaAdmin: stableId("person:asteria-admin"),
    northstarAdmin: stableId("person:northstar-admin"),
  },
  user: {
    operator: stableId("user:platform-operator"),
    asteriaAdmin: stableId("user:asteria-admin"),
    northstarAdmin: stableId("user:northstar-admin"),
  },
  department: {
    operations: stableId("department:platform-operations"),
  },
  membership: {
    operator: stableId("membership:platform-operator"),
    asteriaAdmin: stableId("membership:asteria-admin"),
    northstarAdmin: stableId("membership:northstar-admin"),
  },
  role: {
    platformAdmin: stableId("role:platform-admin"),
    asteriaClientAdmin: stableId("role:asteria-client-admin"),
    northstarClientAdmin: stableId("role:northstar-client-admin"),
  },
  permission: {
    workspaceView: stableId("permission:workspace-view"),
    resourceRead: stableId("permission:resource-read"),
  },
  membershipRole: {
    operator: stableId("membership-role:platform-operator"),
    asteriaAdmin: stableId("membership-role:asteria-admin"),
    northstarAdmin: stableId("membership-role:northstar-admin"),
  },
  resource: {
    asteriaShared: stableId("resource:asteria-shared-report"),
    northstarShared: stableId("resource:northstar-shared-report"),
    asteriaInternal: stableId("resource:asteria-internal-note"),
  },
  idempotency: stableId("idempotency:seed-baseline"),
  outbox: stableId("outbox:seed-baseline"),
  outboxAttempt1: stableId("outbox-attempt:seed-baseline:1"),
  outboxAttempt2: stableId("outbox-attempt:seed-baseline:2"),
  callback: stableId("callback:seed-baseline"),
  callbackAttempt: stableId("callback-attempt:seed-baseline:1"),
  automationRunOriginal: stableId("automation-run:seed-original"),
  automationRunRetry: stableId("automation-run:seed-retry"),
  automationAttemptOriginal: stableId("automation-attempt:seed-original"),
  automationAttemptRetry: stableId("automation-attempt:seed-retry"),
  incident: stableId("incident:seed-resolved"),
  incidentEventOpened: stableId("incident-event:seed-opened"),
  incidentEventResolved: stableId("incident-event:seed-resolved"),
  reconciliationRun: stableId("reconciliation:seed-baseline"),
  reconciliationFinding: stableId("reconciliation-finding:seed-baseline"),
  auditEvent: stableId("audit:seed-baseline"),
} as const;

export const allowedSeedOrganizationIds = new Set(
  Object.values(seedIds.organization),
);
