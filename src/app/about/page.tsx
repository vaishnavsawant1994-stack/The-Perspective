import type { Metadata } from "next";
import { AboutPerspectivePage } from "@/components/about/about-perspective-page";
import { SearchResultsPage } from "@/components/search/search-results-page";
import { filterSearchResults, getSearchCounts, searchSite } from "@/lib/search";

export const metadata: Metadata = {
  title: "About The Perspective",
  description: "Meet the mission, people and publication ecosystem behind The Perspective's independent global journalism.",
  alternates: { canonical: "/about" },
};

export default function AboutRoute() {
  const query = "about";
  const allResults = searchSite(query);
  const type = "all" as const;

  return (
    <>
      <AboutPerspectivePage />
      <div id="current-about-experience">
        <SearchResultsPage
          allResults={allResults}
          counts={getSearchCounts(allResults)}
          filteredResults={filterSearchResults(allResults, type)}
          query={query}
          rawQuery={query}
          sort="relevance"
          type={type}
        />
      </div>
    </>
  );
}
