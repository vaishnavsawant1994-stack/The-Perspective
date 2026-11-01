import { describe, expect, it } from "vitest";

import {
  r14ProductionAliases,
  supersededLegacyAliasSources,
} from "./r14-production-aliases";

describe("R14 production aliases", () => {
  it("matches the approved permanent redirect contract", () => {
    const aliases = new Map(r14ProductionAliases.map((alias) => [alias.source, alias.destination]));

    expect(aliases.get("/blogs")).toBe("/perspective");
    expect(aliases.get("/magazine/subscribe")).toBe("/subscribe");
    expect(aliases.get("/newsletter")).toBe("/newsletters");
    expect(aliases.get("/sign-in")).toBe("/login");
    expect(aliases.get("/premium")).toBe("/magazine/premium");
    expect(aliases.get("/my-perspective/saved")).toBe("/my/saved");
    expect(aliases.has("/news")).toBe(false);
  });

  it("removes legacy aliases that would shadow canonical routes", () => {
    expect(supersededLegacyAliasSources.has("/subscribe")).toBe(true);
    expect(supersededLegacyAliasSources.has("/advertise")).toBe(true);
  });
});
