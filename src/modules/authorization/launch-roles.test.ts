import { describe, expect, it } from "vitest";

import {
  CLIENT_CAPABILITY_ROLES,
  FROZEN_TEAM_ROLE_PERMISSION_KEYS,
  getLaunchRoleDefinition,
  isLaunchRoleCode,
  LAUNCH_ROLES,
  PERMISSION_BUNDLES,
  PROTECTED_PERMISSION_KEYS,
  R5_FROZEN_CONTRACT_SHA,
  R5_PERMISSION_REGISTRY_VERSION,
  ROLE_DELEGATION_CEILINGS,
} from "./launch-roles";
import {
  PERMISSION_DEFINITIONS,
  PERMISSION_REGISTRY,
} from "./registry";

describe("R5 launch role matrix", () => {
  it("pins configuration to the frozen P4-R5-G0 contract", () => {
    expect(R5_FROZEN_CONTRACT_SHA).toBe(
      "2914e76b22468137630a4d444adb5431209fb5aa",
    );
    expect(R5_PERMISSION_REGISTRY_VERSION).toBe("p4-r5-g0-2914e76b-170");
  });

  it("contains exactly B01-B17 and R01-R17", () => {
    expect(Object.keys(PERMISSION_BUNDLES)).toEqual(
      Array.from({ length: 17 }, (_, index) =>
        `B${String(index + 1).padStart(2, "0")}`,
      ),
    );
    expect(LAUNCH_ROLES.map((role) => role.code)).toEqual(
      Array.from({ length: 17 }, (_, index) =>
        `R${String(index + 1).padStart(2, "0")}`,
      ),
    );
  });

  it("freezes R01/R02 to the finite Team-role permission set", () => {
    const currentTeamRolePermissions = PERMISSION_DEFINITIONS
      .filter((definition) => definition.assignability === "TEAM_ROLE")
      .map((definition) => definition.key)
      .sort();

    expect(FROZEN_TEAM_ROLE_PERMISSION_KEYS).toHaveLength(131);
    expect([...FROZEN_TEAM_ROLE_PERMISSION_KEYS].sort()).toEqual(
      currentTeamRolePermissions,
    );
    expect(getLaunchRoleDefinition("R01").permissions).toEqual(
      FROZEN_TEAM_ROLE_PERMISSION_KEYS,
    );
    expect(getLaunchRoleDefinition("R02").permissions).toEqual(
      FROZEN_TEAM_ROLE_PERMISSION_KEYS,
    );
  });

  it("keeps role and permission administration out of R03-R17", () => {
    for (const role of LAUNCH_ROLES.filter(
      (candidate) => !["R01", "R02"].includes(candidate.code),
    )) {
      expect(role.permissions).not.toContain("role.manage");
      expect(role.permissions).not.toContain("permission.manage");
    }
  });

  it("keeps launch roles inside their permitted surfaces and scopes", () => {
    for (const role of LAUNCH_ROLES) {
      for (const permissionKey of role.permissions) {
        const definition = PERMISSION_REGISTRY.get(permissionKey);
        expect(definition, permissionKey).toBeDefined();
        if (!definition) continue;

        if (role.code === "R17") {
          expect(definition.assignability, permissionKey).toBe("CLIENT_ROLE");
        } else {
          expect(definition.assignability, permissionKey).toBe("TEAM_ROLE");
        }

        expect(
          role.scopes.some((scope) =>
            definition.permittedScopes.includes(scope),
          ),
          `${role.code} -> ${permissionKey}`,
        ).toBe(true);
      }
    }
  });

  it("keeps every client capability role CLIENT-scoped and client-only", () => {
    expect(CLIENT_CAPABILITY_ROLES.map((role) => role.key)).toEqual([
      "client-approver",
      "client-signer",
      "client-billing",
      "client-admin",
    ]);

    for (const role of CLIENT_CAPABILITY_ROLES) {
      expect(role.scope).toBe("CLIENT");
      for (const permissionKey of role.permissions) {
        expect(PERMISSION_REGISTRY.get(permissionKey)?.assignability).toBe(
          "CLIENT_ROLE",
        );
      }
    }
  });

  it("freezes the delegation ceiling between R01 and R02", () => {
    expect(ROLE_DELEGATION_CEILINGS.R01.assignableLaunchRoles).toContain("R01");
    expect(ROLE_DELEGATION_CEILINGS.R01.mayGrantR01EquivalentAuthority).toBe(
      true,
    );

    expect(ROLE_DELEGATION_CEILINGS.R02.assignableLaunchRoles).not.toContain(
      "R01",
    );
    expect(ROLE_DELEGATION_CEILINGS.R02.mayGrantR01EquivalentAuthority).toBe(
      false,
    );
  });

  it("keeps protected permissions canonical and wildcard-free", () => {
    expect(new Set(PROTECTED_PERMISSION_KEYS).size).toBe(
      PROTECTED_PERMISSION_KEYS.length,
    );

    for (const permissionKey of PROTECTED_PERMISSION_KEYS) {
      expect(PERMISSION_REGISTRY.has(permissionKey)).toBe(true);
      expect(permissionKey).not.toContain("*");
    }
  });

  it("recognizes only exact launch role codes", () => {
    expect(isLaunchRoleCode("R01")).toBe(true);
    expect(isLaunchRoleCode("R17")).toBe(true);
    expect(isLaunchRoleCode("R18")).toBe(false);
    expect(isLaunchRoleCode("ADMIN")).toBe(false);
  });
});
