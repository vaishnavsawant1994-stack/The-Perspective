import { describe, expect, it } from "vitest";
import { getArticleDetailBySlug } from "./article-details";
import { articles } from "./articles";

describe("mock article publication details", () => {
  it.each(["market-memory", "architects-of-tomorrow", "human-purpose-ai-world", "50-leaders"])(
    "does not publish placeholder or withdrawn story %s",
    (slug) => {
      expect(getArticleDetailBySlug(slug)).toBeUndefined();
    },
  );

  it("never manufactures editorial body copy for an article without a verified detail record", () => {
    for (const article of articles) {
      const detail = getArticleDetailBySlug(article.slug);
      if (!detail) continue;
      expect(JSON.stringify(detail.content)).not.toContain("fictional August 2026 editorial edition");
    }
  });

  it("keeps a story with a complete editorial body available", () => {
    const detail = getArticleDetailBySlug("new-architecture-global-leadership");

    expect(detail?.content.length).toBeGreaterThan(0);
    expect(JSON.stringify(detail?.content)).not.toContain("fictional August 2026 editorial edition");
  });
});
