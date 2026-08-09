"use client";

import { useState } from "react";
import type { SearchResult } from "@/types";
import { Button } from "@/components/ui/button";
import { SearchResultItem } from "./search-result";

const INITIAL_RESULT_COUNT = 10;
const RESULT_BATCH_SIZE = 10;

export function SearchResultsList({ results }: { results: readonly SearchResult[] }) {
  const [visibleCount, setVisibleCount] = useState(INITIAL_RESULT_COUNT);
  const visibleResults = results.slice(0, visibleCount);
  const hasMore = visibleCount < results.length;

  return <><ul>{visibleResults.map((result) => <li key={`${result.type}-${result.id}`}><SearchResultItem result={result} /></li>)}</ul><div aria-live="polite" className="mt-7 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-7"><p className="type-meta text-muted">{hasMore ? `Showing ${visibleResults.length} of ${results.length} results` : `Showing all ${results.length} results`}</p><Button disabled={!hasMore} onClick={() => setVisibleCount((count) => Math.min(count + RESULT_BATCH_SIZE, results.length))} variant="outline">{hasMore ? "Load More Results" : "All Results Shown"}</Button></div></>;
}
