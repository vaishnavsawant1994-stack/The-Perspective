import { describe, expect, it } from "vitest";

import { magazineIssues } from "@/data/mock/magazines";
import { getMagazineIssueDiscoveryHref } from "./magazine-categories";

describe("magazine issue discovery links", () => {
  it("opens a configured reader when reader content exists", () => {
    const issue = magazineIssues.find(({ slug }) => slug === "august-2026");
    expect(issue).toBeDefined();
    expect(getMagazineIssueDiscoveryHref(issue!)).toBe("/magazine/read/august-2026");
  });

  it("opens the archive record when no reader is configured", () => {
    const issue = magazineIssues.find(({ slug }) => slug === "july-2026");
    expect(issue).toBeDefined();
    expect(getMagazineIssueDiscoveryHref(issue!)).toBe("/magazine/archive?issue=july-2026");
  });
});
