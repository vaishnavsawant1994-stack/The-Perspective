import { afterAll, describe, expect, it } from "vitest";

import type { AuthorizedRequestContext, EffectiveAuthorizationGrant, MembershipId, OrganizationId, PermissionKey, SessionId, UserId } from "@/modules/foundation/request-context";
import { withCommercialTenantTransaction } from "@/modules/commercial/persistence";
import { createPrismaClient } from "@/modules/persistence/client";

import { getAuthorizedPayment, listAuthorizedPayments } from "./queries";

const database = createPrismaClient();
const ownerId = crypto.randomUUID();
const foreignOrgId = crypto.randomUUID();
const membershipId = crypto.randomUUID();
const epoch = new Date("2026-10-01T12:00:00.000Z");

function context(organizationId: string, permission: "payment.view" | "invoice.view"): AuthorizedRequestContext {
  const grant: EffectiveAuthorizationGrant = {
    membershipRoleId: "membership-role-r7",
    roleId: "role-r7",
    roleKey: "R07",
    permissionKey: permission as PermissionKey,
    effect: "ALLOW",
    scope: "ORG",
    constraints: {},
    validFrom: epoch,
    validUntil: null,
  };
  return {
    authentication: "authenticated",
    scope: "authorized",
    requestId: "r7-payment-read",
    identity: { userId: "r7-payment-reader" as UserId },
    session: {
      sessionId: "r7-payment-read-session" as SessionId,
      issuedAt: epoch,
      expiresAt: new Date(epoch.getTime() + 3600000),
      authenticationMethod: "TEST",
    },
    membership: { membershipId: membershipId as MembershipId, organizationId: organizationId as OrganizationId, surface: "TEAM" },
    tenant: { membershipId: membershipId as MembershipId, organizationId: organizationId as OrganizationId, surface: "TEAM" },
    authorization: {
      roleKeys: ["R07"],
      permissions: new Set([permission as PermissionKey]),
      blockedPermissions: new Set(),
      grantPaths: [grant],
    },
  };
}

describe("R7 payment read projection", () => {
  afterAll(async () => { await database.$disconnect(); });

  it("projects authorized payment fields and conceals foreign or unauthorized reads", async () => {
    const paymentId = crypto.randomUUID();
    await database.organization.createMany({
      data: [
        { id: ownerId, organizationType: "PLATFORM", legalName: "R7 Pay Read", displayName: "R7 Pay Read", slug: "r7-pay-read-" + ownerId.slice(0, 8), status: "ACTIVE" },
        { id: foreignOrgId, organizationType: "PLATFORM", legalName: "R7 Pay Read Foreign", displayName: "R7 Pay Read Foreign", slug: "r7-pay-read-f-" + foreignOrgId.slice(0, 8), status: "ACTIVE" },
      ],
      skipDuplicates: true,
    });
    const viewer = context(ownerId, "payment.view");
    await withCommercialTenantTransaction(viewer, async (tx) => {
      await tx.$executeRawUnsafe(
        `INSERT INTO commercial.payments (id, owner_organization_id, provider, status, currency, amount_minor)
         VALUES ($1::uuid, $2::uuid, 'test-provider', 'CREATED', 'USD', 40)`,
        paymentId, ownerId,
      );
    }, database);
    const listed = await listAuthorizedPayments(viewer, 50, database);
    expect(listed).toContainEqual({
      id: paymentId,
      status: "CREATED",
      currency: "USD",
      amountMinor: "40",
      provider: "test-provider",
    });
    expect(await getAuthorizedPayment(viewer, paymentId, database)).toMatchObject({ id: paymentId, amountMinor: "40" });
    expect(await getAuthorizedPayment(context(foreignOrgId, "payment.view"), paymentId, database)).toBeNull();
    expect(await getAuthorizedPayment(context(ownerId, "invoice.view"), paymentId, database)).toBeNull();
    expect(await listAuthorizedPayments(context(ownerId, "invoice.view"), 50, database)).toEqual([]);
  });
});
