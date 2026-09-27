import { describe, expect, it } from "vitest";

import {
  resolveAuthorityFromState,
  type PersistedAuthorityState,
} from "./resolver";

const now = new Date("2026-09-27T04:30:00.000Z");

function baseState(
  overrides: Partial<PersistedAuthorityState> = {},
): PersistedAuthorityState {
  return {
    membershipId: "membership-1",
    userAccountId: "user-1",
    organizationId: "org-1",
    membershipStatus: "ACTIVE",
    membershipRoles: [
      {
        id: "membership-role-1",
        scope: "ASN",
        validFrom: new Date("2026-09-26T00:00:00.000Z"),
        validUntil: null,
        role: {
          id: "role-1",
          key: "R04",
          organizationId: "org-1",
          status: "ACTIVE",
          rolePermissions: [
            {
              effect: "ALLOW",
              constraints: {},
              permission: { key: "workspace.search" },
            },
          ],
        },
      },
    ],
    ...overrides,
  };
}

describe("R5 effective authority resolution", () => {
  it("keeps one complete same-grant path for an allowed permission", () => {
    const result = resolveAuthorityFromState(
      {
        userAccountId: "user-1",
        membershipId: "membership-1",
        organizationId: "org-1",
        surface: "TEAM",
      },
      baseState(),
      now,
    );

    expect(result.kind).toBe("resolved");
    if (result.kind !== "resolved") throw new Error("Expected resolved authority");

    expect(result.authority.roleKeys).toEqual(["R04"]);
    expect([...result.authority.permissionKeys]).toEqual(["workspace.search"]);
    expect(result.authority.grantPaths).toEqual([
      expect.objectContaining({
        membershipRoleId: "membership-role-1",
        roleId: "role-1",
        roleKey: "R04",
        permissionKey: "workspace.search",
        effect: "ALLOW",
        scope: "ASN",
      }),
    ]);
  });

  it("does not use Role.defaultScope or synthesize a broader scope", () => {
    const result = resolveAuthorityFromState(
      {
        userAccountId: "user-1",
        membershipId: "membership-1",
        organizationId: "org-1",
        surface: "TEAM",
      },
      baseState(),
      now,
    );

    expect(result.kind).toBe("resolved");
    if (result.kind !== "resolved") throw new Error("Expected resolved authority");
    expect(result.authority.grantPaths[0]?.scope).toBe("ASN");
  });

  it("fails membership resolution closed for the wrong user or organization", () => {
    for (const input of [
      {
        userAccountId: "other-user",
        membershipId: "membership-1",
        organizationId: "org-1",
        surface: "TEAM" as const,
      },
      {
        userAccountId: "user-1",
        membershipId: "membership-1",
        organizationId: "other-org",
        surface: "TEAM" as const,
      },
    ]) {
      expect(resolveAuthorityFromState(input, baseState(), now)).toMatchObject({
        kind: "denied",
        reasonCode: "MEMBERSHIP_INACTIVE",
      });
    }
  });

  it("rejects cross-tenant and expired role grants", () => {
    const state = baseState({
      membershipRoles: [
        {
          ...baseState().membershipRoles[0],
          id: "cross-tenant",
          role: {
            ...baseState().membershipRoles[0].role,
            organizationId: "org-2",
          },
        },
        {
          ...baseState().membershipRoles[0],
          id: "expired",
          validUntil: new Date("2026-09-27T04:00:00.000Z"),
        },
      ],
    });

    const result = resolveAuthorityFromState(
      {
        userAccountId: "user-1",
        membershipId: "membership-1",
        organizationId: "org-1",
        surface: "TEAM",
      },
      state,
      now,
    );

    expect(result.kind).toBe("resolved");
    if (result.kind !== "resolved") throw new Error("Expected resolved authority");
    expect(result.authority.grantPaths).toEqual([]);
    expect(result.authority.issues.map((issue) => issue.code).sort()).toEqual([
      "CROSS_TENANT_ROLE",
      "GRANT_NOT_ACTIVE",
    ]);
  });

  it("rejects an inactive role even when its grant would otherwise be valid", () => {
    const activeGrant = baseState().membershipRoles[0];
    const state = baseState({
      membershipRoles: [
        {
          ...activeGrant,
          role: {
            ...activeGrant.role,
            status: "SUSPENDED",
          },
        },
      ],
    });

    const result = resolveAuthorityFromState(
      {
        userAccountId: "user-1",
        membershipId: "membership-1",
        organizationId: "org-1",
        surface: "TEAM",
      },
      state,
      now,
    );

    expect(result.kind).toBe("resolved");
    if (result.kind !== "resolved") throw new Error("Expected resolved authority");
    expect([...result.authority.permissionKeys]).toEqual([]);
    expect(result.authority.grantPaths).toEqual([]);
    expect(result.authority.issues).toEqual([
      expect.objectContaining({
        code: "ROLE_NOT_ACTIVE",
        membershipRoleId: "membership-role-1",
        roleKey: "R04",
      }),
    ]);
  });

  it("keeps a valid ALLOW usable when another edge for the same permission is malformed", () => {
    const goodRole = baseState().membershipRoles[0];
    const state = baseState({
      membershipRoles: [
        goodRole,
        {
          ...goodRole,
          id: "membership-role-invalid",
          role: {
            ...goodRole.role,
            id: "role-invalid",
            key: "R02",
            rolePermissions: [
              {
                effect: "ALLOW",
                constraints: { scopeOverride: "ORG" },
                permission: { key: "workspace.search" },
              },
            ],
          },
        },
      ],
    });

    const result = resolveAuthorityFromState(
      {
        userAccountId: "user-1",
        membershipId: "membership-1",
        organizationId: "org-1",
        surface: "TEAM",
      },
      state,
      now,
    );

    expect(result.kind).toBe("resolved");
    if (result.kind !== "resolved") throw new Error("Expected resolved authority");
    expect([...result.authority.blockedPermissionKeys]).toEqual([
      "workspace.search",
    ]);
    expect([...result.authority.permissionKeys]).toEqual(["workspace.search"]);
    expect(result.authority.grantPaths).toHaveLength(1);
    expect(result.authority.issues).toEqual([
      expect.objectContaining({
        code: "INVALID_CONSTRAINTS",
        permissionKey: "workspace.search",
      }),
    ]);
  });

  it("leaves a malformed-only permission blocked with no usable grant path", () => {
    const goodRole = baseState().membershipRoles[0];
    const state = baseState({
      membershipRoles: [
        {
          ...goodRole,
          role: {
            ...goodRole.role,
            rolePermissions: [
              {
                effect: "ALLOW",
                constraints: { scopeOverride: "ORG" },
                permission: { key: "workspace.search" },
              },
            ],
          },
        },
      ],
    });

    const result = resolveAuthorityFromState(
      {
        userAccountId: "user-1",
        membershipId: "membership-1",
        organizationId: "org-1",
        surface: "TEAM",
      },
      state,
      now,
    );

    expect(result.kind).toBe("resolved");
    if (result.kind !== "resolved") throw new Error("Expected resolved authority");
    expect([...result.authority.permissionKeys]).toEqual([]);
    expect([...result.authority.blockedPermissionKeys]).toEqual([
      "workspace.search",
    ]);
    expect(result.authority.grantPaths).toEqual([]);
  });

  it("blocks Team permissions from a Client membership surface", () => {
    const result = resolveAuthorityFromState(
      {
        userAccountId: "user-1",
        membershipId: "membership-1",
        organizationId: "org-1",
        surface: "CLIENT",
      },
      baseState({
        membershipRoles: [
          {
            ...baseState().membershipRoles[0],
            scope: "CLIENT",
          },
        ],
      }),
      now,
    );

    expect(result.kind).toBe("resolved");
    if (result.kind !== "resolved") throw new Error("Expected resolved authority");
    expect([...result.authority.permissionKeys]).toEqual([]);
    expect(result.authority.issues).toEqual([
      expect.objectContaining({
        code: "SURFACE_MISMATCH",
        permissionKey: "workspace.search",
      }),
    ]);
  });

  it("retains explicit DENY paths for later resource-policy evaluation", () => {
    const state = baseState({
      membershipRoles: [
        {
          ...baseState().membershipRoles[0],
          role: {
            ...baseState().membershipRoles[0].role,
            rolePermissions: [
              {
                effect: "ALLOW",
                constraints: {},
                permission: { key: "workspace.search" },
              },
              {
                effect: "DENY",
                constraints: { requireOwnership: true },
                permission: { key: "workspace.search" },
              },
            ],
          },
        },
      ],
    });

    const result = resolveAuthorityFromState(
      {
        userAccountId: "user-1",
        membershipId: "membership-1",
        organizationId: "org-1",
        surface: "TEAM",
      },
      state,
      now,
    );

    expect(result.kind).toBe("resolved");
    if (result.kind !== "resolved") throw new Error("Expected resolved authority");
    expect(result.authority.grantPaths.map((grant) => grant.effect)).toEqual([
      "ALLOW",
      "DENY",
    ]);
  });
});
