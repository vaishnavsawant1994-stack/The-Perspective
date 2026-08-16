import type { Metadata } from "next";
import { EventsPage } from "@/components/event/events-page";
import { SearchResultsPage } from "@/components/search/search-results-page";
import { filterSearchResults, getSearchCounts, searchSite } from "@/lib/search";

export const metadata: Metadata = {
  title: "Events & Summits",
  description: "The Perspective events bring leaders, innovators and institutions together for consequential conversations.",
  alternates: { canonical: "/events" },
};

export default function EventsRoute() {
  const query = "event";
  const allResults = searchSite(query);
  const type = "all" as const;
  return <>
    <EventsPage />
    <div id="current-events-experience">
      <SearchResultsPage allResults={allResults} counts={getSearchCounts(allResults)} filteredResults={filterSearchResults(allResults, type)} query={query} rawQuery={query} sort="relevance" type={type} />
    </div>
  </>;
}
