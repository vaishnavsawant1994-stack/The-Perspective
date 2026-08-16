import type { Metadata } from "next";
import { HelpCenterPage } from "@/components/help/help-center-page";
import { SearchResultsPage } from "@/components/search/search-results-page";
import { filterSearchResults, getSearchCounts, searchSite } from "@/lib/search";

export const metadata: Metadata = {
  title: "Help Center",
  description: "Find answers about Perspective subscriptions, magazines, newsletters, events, accounts and editorial support.",
  alternates: { canonical: "/help" },
};

export default function HelpRoute() {
  const query = "help";
  const allResults = searchSite(query);
  const type = "all" as const;
  return <><HelpCenterPage/><div id="current-help-experience"><SearchResultsPage allResults={allResults} counts={getSearchCounts(allResults)} filteredResults={filterSearchResults(allResults,type)} query={query} rawQuery={query} sort="relevance" type={type}/></div></>;
}
