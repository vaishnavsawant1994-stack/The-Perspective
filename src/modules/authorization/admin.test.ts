import { describe, expect, it, vi } from "vitest";

import type {
  AuthorizedRequestContext,
  MembershipId,
  OrganizationId,
  PermissionKey,
  SessionId,
  UserId,
} from "@/modules/foundation/request-context";

import {
  createCustomAuthorizationRole,
  replaceCustomRolePermissions,
  rolePermissionFingerprint,
  updateCustomAuthorizationRole,
} from "./admin";

function authorizedContext(
  roleKeys: readonly string[],
): AuthorizedRequestContext {
  const organizationId = "11111111-1111-4111-8111-111111111111" as OrganizationId;
  const membershipId = "22222222-2222-4222-8222-222222222222" as MembershipId;
  const now = new Date("2026-09-27T06:30:00.000Z");

  return {
    authentication: "authenticated",
    scope: "authorized",
    requestId: "r5-admin-test",
    identity: { userId: "33333333-3333-4333-8333-333333333333" as UserId },
    session: {
      sessionId: "44444444-4444-4444-8444-444444444444" as SessionId,
      issuedAt: new Date(now.getTime() - 60_000),
      expiresAt: new Date(now.getTime() + 60 * 60_000),
      authenticationMethod: "password+totp",
      mfaVerifiedAt: new Date(now.getTime() - 60_000),
    },
    membership: {
      membershipId,
      organizationId,
      surface: "TEAM",
    },
    tenant: {
      membershipId,
      organizationId,
      surface: "TEAM",
    },
    authorization: {
      roleKeys,
      permissions: new Set<PermissionKey>([
        "role.manage" as PermissionKey,
        "permission.manage" as PermissionKey,
      ]),
      blockedPermissions: new Set<PermissionKey>(),
      grantPaths: [
        {
          membershipRoleId: "grant-r01",
          roleId: "role-r01",
          roleKey: roleKeys[0] ?? "R01",
          permissionKey: "role.manage" as PermissionKey,
          effect: "ALLOW",
          scope: "ORG",
          constraints: {},
          validFrom: new Date(now.getTime() - 60_000),
          validUntil: null,
        },
        {
          membershipRoleId: "grant-r01",
          roleId: "role-r01",
          roleKey: roleKeys[0] ?? "R01",
          permissionKey: "permission.manage" as PermissionKey,
          effect: "ALLOW",
          scope: "ORG",
          constraints: {},
          validFrom: new Date(now.getTime() - 60_000),
          validUntil: null,
        },
      ],
    },
  };
}

function transactionDatabase(transaction: Record<string, unknown>) {
  return {
    $transaction: vi.fn(async (callback: (tx: unknown) => unknown) =>
      callback(transaction),
    ),
  } as unknown as Parameters<typeof createCustomAuthorizationRole>[2];
}

describe("R5 authorization administration", () => {
  it("produces stable role-permission fingerprints regardless of input order", () => {
    const first = rolePermissionFingerprint([
      {
        permissionKey: "team.view",
        effect: "ALLOW",
        constraints: { requireAssignment: true, allowedResourceTypes: ["team"] },
      },
      {
        permissionKey: "role.manage",
        effect: "DENY",
        constraints: {},
      },
    ]);
    const second = rolePermissionFingerprint([
      {
        permissionKey: "role.manage",
        effect: "DENY",
        constraints: {},
      },
      {
        permissionKey: "team.view",
        effect: "ALLOW",
        constraints: { allowedResourceTypes: ["team"], requireAssignment: true },
      },
    ]);

    expect(first).toBe(second);
    expect(first).toMatch(/^[a-f0-9]{64}$/u);
  });

  it("rejects invalid custom role keys before any database operation", async () => {
    const database = { $transaction: vi.fn() } as unknown as Parameters<
      typeof createCustomAuthorizationRole
    >[2];

    await expect(
      createCustomAuthorizationRole(
        authorizedContext(["R01"]),
        {
          key: "R01",
          name: "Fake super admin",
          defaultScope: "ORG",
          reason: "test",
        },
        database,
        new Date("2026-09-27T06:30:00.000Z"),
      ),
    ).resolves.toEqual({ kind: "error", code: "INVALID" });

    expect(database.$transaction).not.toHaveBeenCalled();
  });

  it("keeps system roles immutable even for authorization administrators", async () => {
    const transaction = {
      role: {
        findFirst: vi.fn().mockResolvedValue({
          id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
          key: "R01",
          name: "Super Admin",
          description: null,
          defaultScope: "ORG",
          status: "ACTIVE",
          systemRole: true,
          updatedAt: new Date("2026-09-27T06:00:00.000Z"),
        }),
      },
    };
    const database = transactionDatabase(transaction);

    const result = await updateCustomAuthorizationRole(
      authorizedContext(["R01"]),
      "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
      {
        name: "Changed",
        expectedUpdatedAt: new Date("2026-09-27T06:00:00.000Z"),
        reason: "test",
      },
      database,
      new Date("2026-09-27T06:30:00.000Z"),
    );

    expect(result).toEqual({
      kind: "error",
      code: "SYSTEM_ROLE_IMMUTABLE",
    });
  });

  it("rejects malformed or duplicate permission requests before mutation", async () => {
    const database = { $transaction: vi.fn() } as unknown as Parameters<
      typeof replaceCustomRolePermissions
    >[3];

    const result = await replaceCustomRolePermissions(
      authorizedContext(["R01"]),
      "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
      {
        expectedPermissionsHash: "0".repeat(64),
        permissions: [
          {
            permissionKey: "team.view",
            effect: "ALLOW",
            constraints: {},
          },
          {
            permissionKey: "team.view",
            effect: "DENY",
            constraints: {},
          },
        ],
        reason: "test",
      },
      database,
      new Date("2026-09-27T06:30:00.000Z"),
    );

    expect(result).toEqual({ kind: "error", code: "INVALID" });
    expect(database.$transaction).not.toHaveBeenCalled();
  });

  it("rejects client-only permissions from Team custom roles", async () => {
    const database = { $transaction: vi.fn() } as unknown as Parameters<
      typeof replaceCustomRolePermissions
    >[3];

    const result = await replaceCustomRolePermissions(
      authorizedContext(["R01"]),
      "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
      {
        expectedPermissionsHash: "0".repeat(64),
        permissions: [
          {
            permissionKey: "client.billing.pay",
            effect: "ALLOW",
            constraints: {},
          },
        ],
        reason: "test",
      },
      database,
      new Date("2026-09-27T06:30:00.000Z"),
    );

    expect(result).toEqual({ kind: "error", code: "INVALID" });
  });

  it("requires a valid current MFA-backed admin session through policy obligations", async () => {
    const context = authorizedContext(["R01"]);
    const staleContext: AuthorizedRequestContext = {
      ...context,
      session: {
        ...context.session,
        issuedAt: new Date("2026-09-27T05:00:00.000Z"),
        mfaVerifiedAt: new Date("2026-09-27T05:00:00.000Z"),
      },
    };

    const transaction = {
      organizationMembership: {
        findUnique: vi.fn().mockResolvedValue({
          id: staleContext.membership.membershipId,
          userAccountId: staleContext.identity.userId,
          organizationId: staleContext.tenant.organizationId,
          status: "ACTIVE",
          departmentId: null,
          membershipRoles: [
            {
              id: "grant-r01",
              scope: "ORG",
              validFrom: new Date("2026-09-27T05:00:00.000Z"),
              validUntil: null,
              role: {
                id: "role-r01",
                key: "R01",
                organizationId: staleContext.tenant.organizationId,
                status: "ACTIVE",
                rolePermissions: [
                  {
                    effect: "ALLOW",
                    constraints: {},
                    permission: { key: "role.manage" },
                  },
                ],
              },
            },
          ],
        }),
      },
      auditEvent: { create: vi.fn().mockResolvedValue({}) },
      role: { findFirst: vi.fn() },
    };
    const database = transactionDatabase(transaction);

    const result = await createCustomAuthorizationRole(
      staleContext,
      {
        key: "custom-test-role",
        name: "Test role",
        defaultScope: "ORG",
        reason: "security test",
      },
      database,
      new Date("2026-09-27T06:30:00.000Z"),
    );

    expect(result.kind).toBe("denied");
    if (result.kind !== "denied") throw new Error("Expected deny");
    expect(result.decision.reasonCode).toBe("OBLIGATION_REQUIRED");
    expect(transaction.role.findFirst).not.toHaveBeenCalled();
  });
});
