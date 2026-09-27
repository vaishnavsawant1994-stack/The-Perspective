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

  it("pins every launch role to its exact frozen scope set", () => {
    const expectedScopes = {
      R01: ["ORG"],
      R02: ["ORG"],
      R03: ["ORG", "DEPT"],
      R04: ["DEPT", "ASN", "OWN"],
      R05: ["DEPT", "ASN", "OWN"],
      R06: ["DEPT", "ASN", "OWN"],
      R07: ["ORG", "DEPT"],
      R08: ["DEPT", "ASN", "OWN"],
      R09: ["ASN", "OWN"],
      R10: ["ASN", "OWN"],
      R11: ["DEPT", "ASN", "OWN"],
      R12: ["DEPT", "ASN", "OWN"],
      R13: ["ORG", "DEPT"],
      R14: ["ORG", "DEPT"],
      R15: ["ORG"],
      R16: ["ORG"],
      R17: ["CLIENT"],
    } as const;

    for (const [code, expected] of Object.entries(expectedScopes)) {
      expect(getLaunchRoleDefinition(code as keyof typeof expectedScopes).scopes).toEqual(
        expected,
      );
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

  it("matches every non-admin launch role to the exact frozen bundle composition", () => {
    const combine = (
      bundleKeys: readonly (keyof typeof PERMISSION_BUNDLES)[],
      extras: readonly string[] = [],
    ) =>
      [
        ...new Set([
          ...bundleKeys.flatMap((key) => [...PERMISSION_BUNDLES[key].permissions]),
          ...extras,
        ]),
      ].sort();

    const expected = {
      R03: combine(["B01", "B02", "B03", "B04", "B05"]),
      R04: combine(["B01", "B02", "B03", "B04"]),
      R05: combine(["B01", "B02", "B03"]),
      R06: combine(["B01", "B02", "B06"], ["dashboard.executive.view"]),
      R07: combine(
        ["B01", "B02", "B07", "B08", "B09"],
        ["project.manage", "project.assign", "report.view"],
      ),
      R08: combine(["B01", "B02", "B07", "B08"]),
      R09: combine(["B01", "B02", "B07"]),
      R10: combine(["B01", "B02", "B10"]),
      R11: combine(["B01", "B02", "B11"], ["approval.view"]),
      R12: combine(["B01", "B02", "B12"], ["approval.view"]),
      R13: combine(
        ["B01", "B02", "B13"],
        ["project.manage", "project.assign", "report.view"],
      ),
      R14: combine(["B01", "B02", "B14"]),
      R15: combine(["B01", "B02", "B15"], ["dashboard.executive.view"]),
      R16: combine(["B01", "B02", "B16"]),
      R17: combine(["B17"]),
    } as const;

    for (const [code, expectedPermissions] of Object.entries(expected)) {
      const role = getLaunchRoleDefinition(code as keyof typeof expected);
      expect([...role.permissions].sort(), code).toEqual(expectedPermissions);
    }
  });

  it("keeps R17 equal to the baseline B17 bundle and excludes elevated client capabilities", () => {
    const r17 = getLaunchRoleDefinition("R17");
    expect(r17.permissions).toEqual(PERMISSION_BUNDLES.B17.permissions);

    const elevatedClientPermissions = new Set(
      CLIENT_CAPABILITY_ROLES.flatMap((role) => [...role.permissions]),
    );

    for (const permissionKey of elevatedClientPermissions) {
      expect(r17.permissions, permissionKey).not.toContain(permissionKey);
      expect(PERMISSION_BUNDLES.B17.permissions, permissionKey).not.toContain(
        permissionKey,
      );
    }

    expect(r17.permissions).not.toContain("approval.client.decide");
    expect(r17.permissions).not.toContain("client.contract.sign");
    expect(r17.permissions).not.toContain("client.billing.pay");
    expect(r17.permissions).not.toContain("client.org.manage");
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

  it("pins each client capability role to the exact frozen elevated permission set", () => {
    expect(CLIENT_CAPABILITY_ROLES).toEqual([
      {
        key: "client-approver",
        name: "Client Approver",
        scope: "CLIENT",
        permissions: [
          "client.draft.review",
          "client.design.review",
          "client.media.review",
          "approval.client.decide",
        ],
      },
      {
        key: "client-signer",
        name: "Client Signer",
        scope: "CLIENT",
        permissions: ["client.contract.sign"],
      },
      {
        key: "client-billing",
        name: "Client Billing",
        scope: "CLIENT",
        permissions: ["client.billing.pay"],
      },
      {
        key: "client-admin",
        name: "Client Admin",
        scope: "CLIENT",
        permissions: ["client.org.manage"],
      },
    ]);
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
