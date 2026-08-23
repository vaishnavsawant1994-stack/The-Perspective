import { describe, expect, it } from "vitest";

import {
  auditedRouteRegistry,
  getAuditedRouteByDesignId,
  resolvedRouteCollisions,
} from "./audited-route-registry";

describe("audited route registry", () => {
  it("covers every frozen design exactly once", () => {
    expect(auditedRouteRegistry).toHaveLength(153);
    expect(auditedRouteRegistry.map(({ designId }) => designId)).toEqual(
      Array.from({ length: 153 }, (_, index) => index + 1),
    );
  });

  it("assigns unique canonical route ownership", () => {
    const canonicalPaths = auditedRouteRegistry.map(
      ({ canonicalPath }) => canonicalPath,
    );

    expect(new Set(canonicalPaths).size).toBe(canonicalPaths.length);
  });

  it("keeps only the three frozen client authentication screens public", () => {
    const publicDesignIds = auditedRouteRegistry
      .filter(({ access }) => access === "public-client-auth")
      .map(({ designId }) => designId);

    expect(publicDesignIds).toEqual([75, 76, 77]);
  });

  it.each(resolvedRouteCollisions)(
    "resolves designs $designIds to independent route owners",
    ({ designIds, canonicalPaths }) => {
      const actualPaths = designIds.map(
        (designId) => getAuditedRouteByDesignId(designId)?.canonicalPath,
      );

      expect(actualPaths).toEqual(canonicalPaths);
      expect(new Set(actualPaths).size).toBe(2);
    },
  );
});
