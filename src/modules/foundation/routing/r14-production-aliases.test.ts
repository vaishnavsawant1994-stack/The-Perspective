import { describe, expect, it } from "vitest";

import { r14ProductionAliases, supersededLegacyAliasSources } from "./r14-production-aliases";

describe("R14 production aliases", () => {
  it("pins the approved permanent redirects", () => {
    expect(r14ProductionAliases).toEqual(expect.arrayContaining([
      { source: "/blogs", destination: "/perspective" },
      { source: "/magazine/subscribe", destination: "/subscribe" },
      { source: "/newsletter", destination: "/newsletters" },
      { source: "/sign-in", destination: "/login" },
      { source: "/premium", destination: "/magazine/premium" },
      { source: "/my-perspective", destination: "/my" },
      { source: "/my-perspective/support", destination: "/my/support" },
    ]));
    expect(r14ProductionAliases.some((alias) => alias.source === "/news")).toBe(false);
  });

  it("suppresses legacy aliases that would reverse canonical R14 routes", () => {
    expect(supersededLegacyAliasSources.has("/subscribe")).toBe(true);
    expect(supersededLegacyAliasSources.has("/advertise")).toBe(true);
    expect(supersededLegacyAliasSources.has("/sign-in")).toBe(true);
    expect(supersededLegacyAliasSources.has("/premium")).toBe(true);
  });
});
