import { describe, expect, it } from "vitest";

import { assertKnownSeedOrganizations } from "./seed-safety";
import { seedIds } from "./stable-ids";

describe("deterministic seed database guard", () => {
  it("allows an empty or known deterministic seed database", () => {
    expect(() => assertKnownSeedOrganizations([])).not.toThrow();
    expect(() =>
      assertKnownSeedOrganizations([
        { id: seedIds.organization.platform, slug: "perspective-demo" },
        { id: seedIds.organization.asteria, slug: "asteria-systems-example" },
      ]),
    ).not.toThrow();
  });

  it("refuses databases containing an unknown organization", () => {
    expect(() =>
      assertKnownSeedOrganizations([
        { id: seedIds.organization.platform, slug: "perspective-demo" },
        {
          id: "00000000-0000-4000-8000-000000000001",
          slug: "real-or-unknown-organization",
        },
      ]),
    ).toThrow("real-or-unknown-organization");
  });
});
