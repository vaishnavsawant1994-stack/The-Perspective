"use client";

import { useMemo, useState } from "react";
import type { Article, MagazineIssue } from "@/types";
import { Button } from "@/components/ui/button";
import { latestFilterCategories, type LatestFilterCategory } from "@/data/mock/latest";
import { LatestCategoryFilter } from "./latest-category-filter";
import { LatestInDepth } from "./latest-in-depth";
import { LatestLead } from "./latest-lead";
import { LatestSidebar } from "./latest-sidebar";
import { LatestStoryList } from "./latest-story-list";

const initialVisibleCount = 10;
const batchSize = 8;

export function LatestFeedClient({ articles, leadArticles, inDepth, mostRead, magazineIssue }: { articles:Article[]; leadArticles:Article[]; inDepth:Article; mostRead:Article[]; magazineIssue:MagazineIssue }) {
  const [activeCategory, setActiveCategory] = useState<LatestFilterCategory>("All");
  const [visibleCount, setVisibleCount] = useState(initialVisibleCount);
  const leadIds = useMemo(() => new Set(leadArticles.map((article) => article.id)), [leadArticles]);
  const filteredArticles = useMemo(() => articles.filter((article) => article.id !== inDepth.id && (activeCategory === "All" ? !leadIds.has(article.id) : article.category.name === activeCategory)), [activeCategory, articles, inDepth.id, leadIds]);
  const visibleArticles = filteredArticles.slice(0, visibleCount);
  const beforeAnalysis = visibleArticles.slice(0, 7); const afterAnalysis = visibleArticles.slice(7);
  const lastBeforeAnalysis = beforeAnalysis.at(-1);
  const previousPublishedAt = lastBeforeAnalysis?.publishedAt ?? lastBeforeAnalysis?.updatedAt;
  const hasMore = visibleCount < filteredArticles.length;

  function changeCategory(category: LatestFilterCategory) { setActiveCategory(category); setVisibleCount(initialVisibleCount); }

  return <>
    <LatestCategoryFilter active={activeCategory} categories={latestFilterCategories} onChange={changeCategory} />
    <div className="mx-auto w-full max-w-[1360px] px-4 pb-20 pt-10 xs:px-5 sm:px-8 sm:pt-14 lg:px-10 lg:pb-28 xl:px-12">
      {activeCategory === "All" && <LatestLead articles={leadArticles} />}
      <div className="mt-10 grid gap-14 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start xl:grid-cols-[minmax(0,1fr)_22rem] xl:gap-16">
        <section aria-label={`${activeCategory} latest stories`} className="min-w-0">{filteredArticles.length ? <><LatestStoryList articles={beforeAnalysis} />{activeCategory === "All" && visibleArticles.length > 7 && <LatestInDepth article={inDepth} />}{afterAnalysis.length > 0 && <LatestStoryList articles={afterAnalysis} previousPublishedAt={previousPublishedAt} />}</> : <div className="border-y border-border py-16 text-center"><p className="eyebrow text-accent">No stories found</p><h2 className="type-h3 mt-4">There are no recent {activeCategory} stories in this demo dataset.</h2><button className="mt-7 border-b border-foreground pb-1 text-sm font-bold" onClick={() => changeCategory("All")}>Explore all latest stories →</button></div>}</section>
        <LatestSidebar issue={magazineIssue} mostRead={mostRead} />
        <div className="lg:col-start-1"><div aria-live="polite" className="mt-2 flex flex-col items-center border-t border-border pt-8 text-center"><p className="type-caption text-muted">Showing {Math.min(visibleCount, filteredArticles.length)} of {filteredArticles.length} stories</p>{hasMore ? <Button className="mt-5" onClick={() => setVisibleCount((count) => Math.min(count + batchSize, filteredArticles.length))} variant="outline">Load More Stories</Button> : filteredArticles.length > 0 && <p className="mt-5 font-serif text-xl">You’re all caught up.</p>}</div></div>
      </div>
    </div>
  </>;
}
