import { Fragment } from "react";
import type { Article } from "@/types";
import { editorialDayKey, formatEditorialDay } from "@/lib/editorial-date";
import { LatestStoryRow } from "./latest-story-row";

function dayLabel(value: string) {
  const key = editorialDayKey(value);
  if (key === "2026-08-07") return "Today";
  if (key === "2026-08-06") return "Yesterday";
  return "Older";
}

export function LatestStoryList({ articles, previousPublishedAt }: { articles: readonly Article[]; previousPublishedAt?: string }) {
  return <>{articles.map((article, index) => { const publishedAt = article.publishedAt ?? article.updatedAt; const previousArticle = index > 0 ? articles[index - 1] : undefined; const comparisonDate = previousArticle ? previousArticle.publishedAt ?? previousArticle.updatedAt : previousPublishedAt; const showHeading = !comparisonDate || editorialDayKey(publishedAt) !== editorialDayKey(comparisonDate); return <Fragment key={article.id}>{showHeading && <div className="flex items-baseline justify-between border-b border-foreground pb-3 pt-8"><h2 className="eyebrow">{dayLabel(publishedAt)}</h2><time className="type-caption text-muted" dateTime={publishedAt}>{formatEditorialDay(publishedAt)}</time></div>}<LatestStoryRow article={article} /></Fragment>; })}</>;
}
