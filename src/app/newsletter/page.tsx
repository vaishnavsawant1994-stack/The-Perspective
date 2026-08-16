import type { Metadata } from "next";
import { NewsletterHubPage } from "@/components/newsletter/newsletter-hub-page";
import { SearchResultsPage } from "@/components/search/search-results-page";
import { filterSearchResults, getSearchCounts, searchSite } from "@/lib/search";

export const metadata: Metadata = {
  title: "Newsletters & Briefings",
  description: "Choose The Perspective briefings for business, technology, leadership, markets, events, podcasts and magazine intelligence.",
  alternates: { canonical: "/newsletter" },
};

export default function NewsletterRoute() {
  const query = "newsletter";
  const allResults = searchSite(query);
  const type = "all" as const;

  return <>
    <NewsletterHubPage />
    <div id="current-newsletter-experience">
      <SearchResultsPage allResults={allResults} counts={getSearchCounts(allResults)} filteredResults={filterSearchResults(allResults, type)} query={query} rawQuery={query} sort="relevance" type={type} />
    </div>
  </>;
}
