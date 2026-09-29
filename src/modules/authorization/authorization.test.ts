import { describe, expect, it } from "vitest";

import {
  getPermissionDefinition,
  isCanonicalPermissionKey,
  PERMISSION_DEFINITIONS,
  PERMISSION_REGISTRY,
} from "./registry";
import { parseRolePermissionConstraints } from "./constraints";

describe("R5 authorization registry", () => {
  it("preserves the 170-key R5 baseline plus the single G0-approved R7 key", () => {
    const r5Baseline = PERMISSION_DEFINITIONS.filter(
      (permission) => permission.key !== "proposal.accept",
    );

    expect(r5Baseline).toHaveLength(170);
    expect(PERMISSION_DEFINITIONS).toHaveLength(171);
    expect(PERMISSION_REGISTRY.size).toBe(171);
    expect(new Set(PERMISSION_DEFINITIONS.map((permission) => permission.key)).size).toBe(171);
    expect(PERMISSION_REGISTRY.has("proposal.accept")).toBe(true);
  });

  it("keeps wildcard permissions out of the canonical registry", () => {
    expect(
      PERMISSION_DEFINITIONS.some((permission) => permission.key.includes("*")),
    ).toBe(false);
  });

  it("keeps Client-role and self-service authority separated", () => {
    for (const permission of PERMISSION_DEFINITIONS) {
      if (permission.assignability === "CLIENT_ROLE") {
        expect(permission.surface).toBe("CLIENT");
        expect(permission.permittedScopes).toContain("CLIENT");
      }

      if (permission.assignability === "SELF_ONLY") {
        expect(permission.surface.startsWith("SELF_")).toBe(true);
      }
    }
  });

  it("recognizes exact permission keys only", () => {
    expect(isCanonicalPermissionKey("role.manage")).toBe(true);
    expect(isCanonicalPermissionKey("permission.manage")).toBe(true);
    expect(isCanonicalPermissionKey("client.task.complete")).toBe(true);
    expect(isCanonicalPermissionKey("client.approval.decide")).toBe(false);
    expect(isCanonicalPermissionKey("role.*")).toBe(false);
  });

  it("returns frozen metadata for a canonical permission", () => {
    expect(getPermissionDefinition("approval.client.decide")).toMatchObject({
      surface: "CLIENT",
      risk: "HIGH",
      assignability: "CLIENT_ROLE",
      permittedScopes: ["CLIENT"],
      requiresFieldPolicy: true,
      requiresWorkflowPolicy: true,
    });
  });
});

describe("R5 role-permission constraints", () => {
  it("accepts the frozen typed constraint families", () => {
    expect(
      parseRolePermissionConstraints({
        allowedResourceTypes: ["project"],
        maximumSensitivity: "CONFIDENTIAL",
        requireAssignment: true,
        deniedFieldGroups: ["financial"],
        requireReason: true,
        noSelfAction: true,
      }),
    ).toEqual({
      valid: true,
      constraints: {
        allowedResourceTypes: ["project"],
        maximumSensitivity: "CONFIDENTIAL",
        requireAssignment: true,
        deniedFieldGroups: ["financial"],
        requireReason: true,
        noSelfAction: true,
      },
    });
  });

  it("fails closed for unknown constraint keys", () => {
    const result = parseRolePermissionConstraints({
      scopeOverride: "ORG",
    });

    expect(result.valid).toBe(false);
    if (result.valid) throw new Error("Expected invalid constraint payload");
    expect(result.issues.join(" ")).toContain("Unrecognized key");
  });

  it("fails closed for malformed constraint values", () => {
    const result = parseRolePermissionConstraints({
      requireOwnership: "yes",
    });

    expect(result.valid).toBe(false);
  });

  it("treats missing constraints as the empty constraint object", () => {
    expect(parseRolePermissionConstraints(undefined)).toEqual({
      valid: true,
      constraints: {},
    });
  });
});
