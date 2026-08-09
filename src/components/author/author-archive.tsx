"use client";

import { useState } from "react";
import type { Article } from "@/types";
import { EditorialSectionHeader } from "@/components/common/editorial-section-header";
import { PerspectiveStoryList } from "@/components/perspective/perspective-story-list";

const INITIAL_ARTICLE_COUNT = 12;
const ARTICLE_BATCH_SIZE = 10;

export function AuthorArchive({ articles, authorName }: { articles: readonly Article[]; authorName: string }) {
  const [visibleCount, setVisibleCount] = useState(INITIAL_ARTICLE_COUNT);
  const visibleArticles = articles.slice(0, visibleCount);
  const hasMore = visibleCount < articles.length;

  return <section aria-labelledby="author-archive-heading">
    <EditorialSectionHeader description={`Every published article by ${authorName}, newest first.`} id="author-archive-heading" title="All Articles" />
    <PerspectiveStoryList articles={visibleArticles} />
    {articles.length > INITIAL_ARTICLE_COUNT && <div className="mt-7 flex flex-wrap items-center justify-between gap-4">
      <p aria-live="polite" className="type-meta text-muted">Showing {visibleArticles.length} of {articles.length} articles</p>
      {hasMore && <button className="min-h-11 border-b border-foreground text-sm font-bold hover:text-accent" onClick={() => setVisibleCount((count) => Math.min(count + ARTICLE_BATCH_SIZE, articles.length))} type="button">Load more articles</button>}
    </div>}
  </section>;
}
