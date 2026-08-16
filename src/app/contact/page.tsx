import type { Metadata } from "next";
import { ContactPerspectivePage } from "@/components/contact/contact-perspective-page";
import { SearchResultsPage } from "@/components/search/search-results-page";
import { filterSearchResults, getSearchCounts, searchSite } from "@/lib/search";

export const metadata: Metadata = {
  title: "Contact The Perspective",
  description: "Contact The Perspective for editorial enquiries, story pitches, Personal Magazines, partnerships, events, press and reader support.",
  alternates: { canonical: "/contact" },
};

export default function ContactRoute() {
  const query = "contact";
  const allResults = searchSite(query);
  const type = "all" as const;

  return <>
    <ContactPerspectivePage />
    <div id="current-contact-experience">
      <SearchResultsPage allResults={allResults} counts={getSearchCounts(allResults)} filteredResults={filterSearchResults(allResults, type)} query={query} rawQuery={query} sort="relevance" type={type} />
    </div>
  </>;
}
