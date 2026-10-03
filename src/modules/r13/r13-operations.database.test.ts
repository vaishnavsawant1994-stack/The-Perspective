import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { MembershipStatus, MembershipType, OrganizationType, RecordStatus } from "@/generated/prisma/client";
import type { MembershipId, OrganizationId, SessionId, TenantScopedRequestContext, UserId } from "@/modules/foundation/request-context";
import { createPrismaClient } from "@/modules/persistence/client";

import { readR13, runR13, type R13Result } from "./commands";

const database = createPrismaClient();
const epoch = new Date("2026-10-03T12:00:00.000Z");
const ownerA = crypto.randomUUID();
const ownerB = crypto.randomUUID();
const userA = crypto.randomUUID();
const userB = crypto.randomUUID();
const membershipA = crypto.randomUUID();
const membershipB = crypto.randomUUID();
let sequence = 0;

function key() {
  sequence += 1;
  return `r13k${sequence.toString(36)}${crypto.randomUUID().replaceAll("-", "")}`.slice(0, 80);
}

function team(userId: string, membershipId: string, organizationId: string, requestId: string): TenantScopedRequestContext {
  return {
    authentication: "authenticated",
    scope: "tenant",
    requestId,
    identity: { userId: userId as UserId },
    session: { sessionId: requestId as SessionId, issuedAt: epoch, expiresAt: new Date(epoch.getTime() + 3600_000), authenticationMethod: "password" },
    membership: { membershipId: membershipId as MembershipId, organizationId: organizationId as OrganizationId, surface: "TEAM" },
    tenant: { membershipId: membershipId as MembershipId, organizationId: organizationId as OrganizationId, surface: "TEAM" },
  };
}

async function must(label: string, result: R13Result) {
  if (result.kind !== "ok") throw new Error(`${label}: ${JSON.stringify(result)}`);
  return result;
}

describe("R13 operations persistence", () => {
  beforeAll(async () => {
    const present = await database.$queryRawUnsafe<Array<{ exists: boolean }>>(
      `SELECT to_regprocedure('ops.r13_command(text,uuid,jsonb,uuid,uuid,text,text,text)') IS NOT NULL AS exists`,
    );
    expect(present[0]?.exists).toBe(true);
    await database.organization.createMany({ data: [
      { id: ownerA, organizationType: OrganizationType.PLATFORM, legalName: "R13 A", displayName: "R13 A", slug: `r13-a-${ownerA.slice(0, 8)}`, status: RecordStatus.ACTIVE },
      { id: ownerB, organizationType: OrganizationType.PLATFORM, legalName: "R13 B", displayName: "R13 B", slug: `r13-b-${ownerB.slice(0, 8)}`, status: RecordStatus.ACTIVE },
    ] });
    const personA = crypto.randomUUID();
    const personB = crypto.randomUUID();
    await database.person.createMany({ data: [
      { id: personA, displayName: "R13 A" },
      { id: personB, displayName: "R13 B" },
    ] });
    await database.userAccount.createMany({ data: [
      { id: userA, personId: personA, accountState: "ACTIVE", emailVerifiedAt: epoch },
      { id: userB, personId: personB, accountState: "ACTIVE", emailVerifiedAt: epoch },
    ] });
    await database.organizationMembership.createMany({ data: [
      { id: membershipA, organizationId: ownerA, userAccountId: userA, membershipType: MembershipType.STAFF, status: MembershipStatus.ACTIVE, joinedAt: epoch },
      { id: membershipB, organizationId: ownerB, userAccountId: userB, membershipType: MembershipType.STAFF, status: MembershipStatus.ACTIVE, joinedAt: epoch },
    ] });
  });

  afterAll(async () => {
    await database.$disconnect();
  });

  it("isolates settings, rejects stale and forged writes, and fails verification closed", async () => {
    const contextA = team(userA, membershipA, ownerA, "r13-a");
    const contextB = team(userB, membershipB, ownerB, "r13-b");
    const initial = await must("read", await readR13(contextA, "settings", database));
    expect(initial.value).toMatchObject({ configured: false, timezone: "UTC", expectedVersion: 0 });
    const saved = await must("save", await runR13(contextA, "update-settings", {
      timezone: "Asia/Kolkata", weekStartsOn: "MONDAY", supportLabel: "Desk A", expectedVersion: 0, reason: "Set the desk label",
    }, key(), database));
    expect(saved.value.expectedVersion).toBe(1);
    const hidden = await must("other", await readR13(contextB, "settings", database));
    expect(hidden.value).toMatchObject({ configured: false, supportLabel: null });
    const stale = await runR13(contextA, "update-settings", {
      timezone: "UTC", weekStartsOn: "SUNDAY", supportLabel: "Nope", expectedVersion: 0, reason: "Stale write attempt",
    }, key(), database);
    expect(stale).toMatchObject({ kind: "error", code: "STALE_WRITE" });
    const forged = await runR13(contextA, "update-settings", {
      timezone: "UTC", weekStartsOn: "MONDAY", supportLabel: "Desk A", expectedVersion: 1, reason: "Forged authority", verified: true,
    }, key(), database);
    expect(forged).toMatchObject({ kind: "error", code: "INVALID" });
    const decisionKey = key();
    const first = await must("declare", await runR13(contextA, "declare", { integrationType: "EMAIL", reason: "Declare email intent" }, decisionKey, database));
    expect(first.value.state).toBe("DECLARED");
    const replay = await must("replay", await runR13(contextA, "declare", { integrationType: "EMAIL", reason: "Declare email intent" }, decisionKey, database));
    expect(replay.value.replayed).toBe(true);
    const changed = await runR13(contextA, "declare", { integrationType: "STORAGE", reason: "Different payload" }, decisionKey, database);
    expect(changed).toMatchObject({ kind: "error", code: "IDEMPOTENCY_CONFLICT" });
    const foreign = await must("foreign list", await readR13(contextB, "integrations", database));
    expect(foreign.value.result).toEqual([
      { integrationType: "EMAIL", state: "UNCONFIGURED" },
      { integrationType: "PAYMENT", state: "UNCONFIGURED" },
      { integrationType: "STORAGE", state: "UNCONFIGURED" },
    ]);
    const verified = await must("verify", await runR13(contextA, "verify", { integrationType: "EMAIL", reason: "Look for a provider" }, key(), database));
    expect(verified.value).toMatchObject({ state: "DECLARED", result: "PROVIDER_UNAVAILABLE" });
    const rows = await database.$queryRawUnsafe<Array<{ state: string }>>(
      `SELECT state FROM ops.integration_declarations WHERE owner_organization_id = $1::uuid`,
      ownerA,
    );
    expect(rows.map((row) => row.state)).toEqual(["DECLARED"]);
    const blob = await database.$queryRawUnsafe<Array<{ settings: unknown }>>(
      `SELECT settings FROM iam.organizations WHERE id = $1::uuid`,
      ownerA,
    );
    expect(blob[0]?.settings).toEqual({});
    const disabled = await must("disable", await runR13(contextA, "disable", { integrationType: "EMAIL", reason: "Disable the declaration" }, key(), database));
    expect(disabled.value.state).toBe("DISABLED");
    const blocked = await runR13(contextA, "verify", { integrationType: "EMAIL", reason: "Verify while disabled" }, key(), database);
    expect(blocked).toMatchObject({ kind: "error", code: "INELIGIBLE" });
  });

  it("keeps one declaration under concurrent declare and rejects a runtime insert", async () => {
    const contextA = team(userA, membershipA, ownerA, "r13-race");
    const raceKey = key();
    const [left, right] = await Promise.all([
      runR13(contextA, "declare", { integrationType: "PAYMENT", reason: "Declare payment intent" }, raceKey, database),
      runR13(contextA, "declare", { integrationType: "PAYMENT", reason: "Declare payment intent" }, key(), database),
    ]);
    expect([left.kind, right.kind].filter((kind) => kind === "ok").length).toBeGreaterThan(0);
    const count = await database.$queryRawUnsafe<Array<{ count: number }>>(
      `SELECT count(*)::int AS count FROM ops.integration_declarations WHERE owner_organization_id = $1::uuid AND integration_type = 'PAYMENT'`,
      ownerA,
    );
    expect(count[0]?.count).toBe(1);
    await expect(database.$transaction(async (tx) => {
      await tx.$executeRawUnsafe(`SET LOCAL ROLE perspective_runtime`);
      await tx.$executeRawUnsafe(`SELECT set_config('app.organization_id', $1, true)`, ownerA);
      await tx.$executeRawUnsafe(
        `INSERT INTO ops.integration_declarations (id, owner_organization_id, integration_type, state, row_version, declared_at)
         VALUES ($1::uuid, $2::uuid, 'STORAGE', 'DECLARED', 1, now())`,
        crypto.randomUUID(), ownerA,
      );
    })).rejects.toThrow();
  });
});
