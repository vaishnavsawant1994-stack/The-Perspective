import { describe, expect, it } from "vitest";

import {
  canAdvanceRecipient,
  canTransitionCampaign,
  canTransitionConversation,
  canTransitionMeeting,
} from "./lifecycle";

describe("R6 communications lifecycle guards", () => {
  it("allows only contracted campaign transitions", () => {
    expect(canTransitionCampaign("DRAFT", "READY")).toBe(true);
    expect(canTransitionCampaign("READY", "APPROVED")).toBe(true);
    expect(canTransitionCampaign("APPROVED", "SCHEDULED")).toBe(true);
    expect(canTransitionCampaign("SCHEDULED", "RUNNING")).toBe(true);
    expect(canTransitionCampaign("DRAFT", "RUNNING")).toBe(false);
    expect(canTransitionCampaign("COMPLETED", "RUNNING")).toBe(false);
  });

  it("keeps recipient evidence monotonic and terminal outcomes terminal", () => {
    expect(canAdvanceRecipient("SENT", "OPENED")).toBe(true);
    expect(canAdvanceRecipient("OPENED", "DELIVERED")).toBe(false);
    expect(canAdvanceRecipient("OPENED", "UNSUBSCRIBED")).toBe(true);
    expect(canAdvanceRecipient("UNSUBSCRIBED", "SENT")).toBe(false);
  });

  it("guards conversation and meeting transitions", () => {
    expect(canTransitionConversation("OPEN", "RESOLVED")).toBe(true);
    expect(canTransitionConversation("RESOLVED", "REOPENED")).toBe(true);
    expect(canTransitionConversation("ARCHIVED", "OPEN")).toBe(false);

    expect(canTransitionMeeting("PROPOSED", "SCHEDULED")).toBe(true);
    expect(canTransitionMeeting("SCHEDULED", "CONFIRMED")).toBe(true);
    expect(canTransitionMeeting("CONFIRMED", "COMPLETED")).toBe(true);
    expect(canTransitionMeeting("COMPLETED", "SCHEDULED")).toBe(false);
  });
});
