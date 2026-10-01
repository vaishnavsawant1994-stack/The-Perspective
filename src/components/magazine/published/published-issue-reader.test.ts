import { describe, expect, it } from "vitest";

import { movePublishedPage, nextPublishedTypeSize, publishedReaderPages, type PublishedIssue } from "./published-issue-reader";

const issue: PublishedIssue = {
  slug: "the-measured-room",
  title: "The Measured Room",
  season: "Autumn",
  theme: "Proportion",
  availability: "PUBLIC",
  state: "ISSUE_PUBLISHED",
  editionNumber: 12,
  cover: { headline: "The Measured Room", dek: "A room with a rule.", alt: "A measured room" },
  articles: [
    { slug: "the-rule", title: "The Rule", author: "Mira Chen", summary: "A rule.", alt: "A rule", body: "Published body.", digest: "abc", versionId: "00000000-0000-4000-8000-000000000001" },
  ],
};

describe("published magazine reader", () => {
  it("keeps cover, contents, and the captured article in order", () => {
    const pages = publishedReaderPages(issue);
    expect(pages.map((page) => page.kind)).toEqual(["Cover", "Contents", "Article"]);
    expect(pages[2]?.body).toBe("Published body.");
  });

  it("moves by arrows and thumbnails without leaving the issue", () => {
    expect(movePublishedPage(0, 3, "previous")).toBe(0);
    expect(movePublishedPage(0, 3, "next")).toBe(1);
    expect(movePublishedPage(2, 3, "next")).toBe(2);
    expect(movePublishedPage(2, 3, "previous")).toBe(1);
    expect(movePublishedPage(0, 3, 2)).toBe(2);
  });

  it("changes type size inside the readable range and toggles fullscreen in the component contract", () => {
    expect(nextPublishedTypeSize(18, "larger")).toBe(20);
    expect(nextPublishedTypeSize(28, "larger")).toBe(28);
    expect(nextPublishedTypeSize(14, "smaller")).toBe(14);
  });
});
