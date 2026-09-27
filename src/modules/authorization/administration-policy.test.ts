import { describe, expect, it } from "vitest";

import {
  approvedClientCapabilityRoleKeys,
  assessClientCapabilityAssignment,
  assessLaunchRoleAssignment,
  assessRolePermissionSetMutation,
  frozenLaunchRolePermissionSet,
  isR01EquivalentPermissionSet,
} from "./administration-policy";
import {
  FROZEN_TEAM_ROLE_PERMISSION_KEYS,
  getLaunchRoleDefinition,
} from "./launch-roles";

describe("R5 delegation and anti-escalation policy", () => {
  it("allows R01 to assign frozen launch roles within their approved scope", () => {
    expect(
      assessLaunchRoleAssignment({
        actorRoleKeys: ["R01"],
        actorMembershipId: "actor",
        targetMembershipId: "target",
        targetRoleCode: "R17",
        scope: "CLIENT",
      }),
    ).toEqual({ allowed: true, actorRole: "R01" });
  });

  it("prevents R02 from assigning R01", () => {
    expect(
      assessLaunchRoleAssignment({
        actorRoleKeys: ["R02"],
        actorMembershipId: "actor",
        targetMembershipId: "target",
        targetRoleCode: "R01",
        scope: "ORG",
      }),
    ).toMatchObject({
      allowed: false,
      reason: "ROLE_ABOVE_CEILING",
      actorRole: "R02",
    });
  });

  it("prevents self-assignment even for R01", () => {
    expect(
      assessLaunchRoleAssignment({
        actorRoleKeys: ["R01"],
        actorMembershipId: "actor",
        targetMembershipId: "actor",
        targetRoleCode: "R02",
        scope: "ORG",
      }),
    ).toMatchObject({
      allowed: false,
      reason: "SELF_ESCALATION_DENIED",
    });
  });

  it("rejects a launch-role scope not present in the frozen matrix", () => {
    expect(
      assessLaunchRoleAssignment({
        actorRoleKeys: ["R01"],
        actorMembershipId: "actor",
        targetMembershipId: "target",
        targetRoleCode: "R09",
        scope: "ORG",
      }),
    ).toMatchObject({
      allowed: false,
      reason: "ROLE_SCOPE_DENIED",
    });
  });

  it("requires R01/R02 delegation authority", () => {
    expect(
      assessLaunchRoleAssignment({
        actorRoleKeys: ["R16"],
        actorMembershipId: "actor",
        targetMembershipId: "target",
        targetRoleCode: "R09",
        scope: "OWN",
      }),
    ).toMatchObject({
      allowed: false,
      reason: "DELEGATION_AUTHORITY_REQUIRED",
    });
  });

  it("keeps client capability assignment on exact approved templates", () => {
    expect(approvedClientCapabilityRoleKeys()).toEqual([
      "client-approver",
      "client-signer",
      "client-billing",
      "client-admin",
    ]);

    expect(
      assessClientCapabilityAssignment({
        actorRoleKeys: ["R02"],
        actorMembershipId: "actor",
        targetMembershipId: "client-member",
        capabilityRoleKey: "client-signer",
      }),
    ).toEqual({ allowed: true, actorRole: "R02" });

    expect(
      assessClientCapabilityAssignment({
        actorRoleKeys: ["R02"],
        actorMembershipId: "actor",
        targetMembershipId: "client-member",
        capabilityRoleKey: "client-super-admin",
      }),
    ).toMatchObject({
      allowed: false,
      reason: "CLIENT_CAPABILITY_TEMPLATE_REQUIRED",
    });
  });

  it("prevents runtime mutation of the frozen R01-R17 launch roles", () => {
    expect(
      assessRolePermissionSetMutation({
        actorRoleKeys: ["R01"],
        targetRoleKey: "R16",
        targetSurface: "TEAM",
        permissionKeys: ["team.view"],
      }),
    ).toMatchObject({
      allowed: false,
      reason: "FROZEN_LAUNCH_ROLE",
    });
  });

  it("keeps role.manage and permission.manage out of custom Team roles", () => {
    for (const permissionKey of ["role.manage", "permission.manage"]) {
      expect(
        assessRolePermissionSetMutation({
          actorRoleKeys: ["R01"],
          targetRoleKey: "custom-security",
          targetSurface: "TEAM",
          permissionKeys: ["team.view", permissionKey],
        }),
      ).toMatchObject({
        allowed: false,
        reason: "ACCESS_ADMIN_PERMISSION_RESERVED",
      });
    }
  });

  it("rejects Client or SELF permissions from custom Team roles", () => {
    expect(
      assessRolePermissionSetMutation({
        actorRoleKeys: ["R01"],
        targetRoleKey: "custom-team",
        targetSurface: "TEAM",
        permissionKeys: ["client.project.view"],
      }),
    ).toMatchObject({
      allowed: false,
      reason: "PERMISSION_ASSIGNABILITY_DENIED",
    });

    expect(
      assessRolePermissionSetMutation({
        actorRoleKeys: ["R01"],
        targetRoleKey: "custom-team",
        targetSurface: "TEAM",
        permissionKeys: ["staff.auth.signin"],
      }),
    ).toMatchObject({
      allowed: false,
      reason: "PERMISSION_ASSIGNABILITY_DENIED",
    });
  });

  it("requires exact permission membership for Client capability roles", () => {
    expect(
      assessRolePermissionSetMutation({
        actorRoleKeys: ["R01"],
        targetRoleKey: "client-signer",
        targetSurface: "CLIENT",
        permissionKeys: ["client.contract.sign"],
      }),
    ).toEqual({ allowed: true, actorRole: "R01" });

    expect(
      assessRolePermissionSetMutation({
        actorRoleKeys: ["R01"],
        targetRoleKey: "client-signer",
        targetSurface: "CLIENT",
        permissionKeys: ["client.contract.sign", "client.billing.pay"],
      }),
    ).toMatchObject({
      allowed: false,
      reason: "CLIENT_CAPABILITY_TEMPLATE_REQUIRED",
    });
  });

  it("recognizes the finite frozen R01-equivalent Team permission set", () => {
    expect(
      isR01EquivalentPermissionSet([...FROZEN_TEAM_ROLE_PERMISSION_KEYS]),
    ).toBe(true);
    expect(
      isR01EquivalentPermissionSet(
        [...FROZEN_TEAM_ROLE_PERMISSION_KEYS].filter(
          (permission) => permission !== "permission.manage",
        ),
      ),
    ).toBe(false);

    expect(frozenLaunchRolePermissionSet("R01")).toEqual(
      new Set(getLaunchRoleDefinition("R01").permissions),
    );
  });
});
