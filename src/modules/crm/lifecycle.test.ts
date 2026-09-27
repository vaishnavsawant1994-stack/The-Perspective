import { describe, expect, it } from "vitest";

import { canTransitionLeadLifecycle, isTerminalLeadLifecycle } from "./lifecycle";

describe("R6 CRM lead lifecycle guard", () => {
  it("allows only the frozen forward progression", () => {
    expect(canTransitionLeadLifecycle("NEW", "EXTRACTED")).toBe(true);
    expect(canTransitionLeadLifecycle("EXTRACTED", "ENRICHED")).toBe(false);
    expect(canTransitionLeadLifecycle("QUALIFICATION_PENDING", "QUALIFIED")).toBe(true);
    expect(canTransitionLeadLifecycle("QUALIFIED", "OUTREACH_READY")).toBe(true);
    expect(canTransitionLeadLifecycle("CONTACTED", "REPLIED")).toBe(true);
    expect(canTransitionLeadLifecycle("INTERESTED", "CONVERTED")).toBe(true);
  });

  it("allows suppression from nonterminal states and makes terminal states terminal", () => {
    expect(canTransitionLeadLifecycle("NEW", "DO_NOT_CONTACT")).toBe(true);
    expect(canTransitionLeadLifecycle("REPLIED", "DO_NOT_CONTACT")).toBe(true);
    expect(canTransitionLeadLifecycle("CONVERTED", "DO_NOT_CONTACT")).toBe(false);
    expect(isTerminalLeadLifecycle("DO_NOT_CONTACT")).toBe(true);
    expect(isTerminalLeadLifecycle("DISQUALIFIED")).toBe(true);
    expect(isTerminalLeadLifecycle("CONVERTED")).toBe(true);
  });

  it("rejects direct state rewrites and backward movement", () => {
    expect(canTransitionLeadLifecycle("QUALIFIED", "QUALIFIED")).toBe(false);
    expect(canTransitionLeadLifecycle("CONTACTED", "OUTREACH_READY")).toBe(false);
    expect(canTransitionLeadLifecycle("CONVERTED", "INTERESTED")).toBe(false);
  });
});
