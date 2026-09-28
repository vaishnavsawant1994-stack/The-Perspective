import { describe, expect, it } from "vitest";

import { canonicalCommsEvidenceHash } from "./snapshot";

describe("canonical communications evidence hash", () => {
  it("is stable across object key order but changes when evidence changes", () => {
    const first = canonicalCommsEvidenceHash({
      campaignId: "campaign-1",
      schedule: { hour: 9, timezone: "UTC" },
      recipients: [{ id: "recipient-1", currentStep: 1 }],
    });
    const reordered = canonicalCommsEvidenceHash({
      recipients: [{ currentStep: 1, id: "recipient-1" }],
      schedule: { timezone: "UTC", hour: 9 },
      campaignId: "campaign-1",
    });
    const changed = canonicalCommsEvidenceHash({
      campaignId: "campaign-1",
      schedule: { hour: 10, timezone: "UTC" },
      recipients: [{ id: "recipient-1", currentStep: 1 }],
    });

    expect(reordered).toBe(first);
    expect(changed).not.toBe(first);
  });
});
