import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const apiRoot = join(process.cwd(), "src/app/api/v1/r6");

function routeSources(directory = apiRoot): string[] {
  return readdirSync(directory).flatMap((name) => {
    const path = join(directory, name);
    if (statSync(path).isDirectory()) return routeSources(path);
    return name === "route.ts" ? [readFileSync(path, "utf8")] : [];
  });
}

const providerOrWorkerOwned = [
  "addCampaignRecipient",
  "buildCampaignApprovalSnapshotInTransaction",
  "computeCampaignApprovalSnapshot",
  "evaluateDispatchSafety",
  "recordDeliveryEvent",
] as const;

describe("R6 Communications API ownership boundary", () => {
  const sources = routeSources();
  const joined = sources.join("\n");

  it("retains the already-qualified browser campaign commands", () => {
    expect(sources.some((source) => source.includes("createCampaign"))).toBe(true);
    expect(sources.some((source) => source.includes("transitionCampaign"))).toBe(true);
    expect(sources.some((source) => source.includes("queueR6CampaignLaunch"))).toBe(true);
  });

  it.each(providerOrWorkerOwned)(
    "%s is not directly callable from an R6 browser route",
    (command) => {
      expect(joined).not.toContain(command);
    },
  );

  it("does not expose generic browser creation of provider conversation/message truth", () => {
    expect(joined).not.toContain("createConversation");
    expect(joined).not.toContain("recordMessage");
    expect(joined).not.toContain("providerThreadId");
    expect(joined).not.toContain("externalEventId");
  });

  it("keeps runtime template management and general calendar authority dormant", () => {
    expect(joined).not.toContain("template.manage");
    expect(joined).not.toContain("calendar.view");
    expect(
      sources.some(
        (source) =>
          source.includes("createMessageTemplate") ||
          source.includes("updateMessageTemplate") ||
          source.includes("approveMessageTemplate"),
      ),
    ).toBe(false);
  });

  it("does not expose browser mutation of dispatch truth or recipient progression", () => {
    for (const token of [
      "campaignRecipientId",
      "eventType",
      "externalEventId",
      "payloadHash",
      'to: "RUNNING"',
      'to: "COMPLETED"',
    ]) {
      expect(joined).not.toContain(token);
    }
  });
});
