import { describe, expect, it } from "vitest";

import { resolveMagazineArchiveQuery } from "./magazine-archive";

describe("magazine archive issue links", () => {
  it("resolves a known issue slug to its title for archive filtering", () => {
    expect(resolveMagazineArchiveQuery(undefined, "july-2026")).toBe("The New Capital");
  });

  it("preserves an explicit search query over an issue slug", () => {
    expect(resolveMagazineArchiveQuery("leadership", "july-2026")).toBe("leadership");
  });

  it("ignores unknown issue slugs", () => {
    expect(resolveMagazineArchiveQuery(undefined, "unknown-issue")).toBe("");
  });
});
