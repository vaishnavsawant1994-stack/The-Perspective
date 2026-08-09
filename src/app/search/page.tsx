import type { Metadata } from "next";
import { SearchResultsPage } from "@/components/search/search-results-page";
import { filterSearchResults, getSearchCounts, getSearchDisplayQuery, normalizeSearchQuery, parseSearchFilter, parseSearchSort, readSearchParameter, searchSite } from "@/lib/search";

type SearchPageProps = {
  searchParams: Promise<{
    q?: string | string[];
    type?: string | string[];
    sort?: string | string[];
  }>;
};

const searchDescription = "Search reporting, essays, contributors, interviews and magazines from The Perspective.";

export async function generateMetadata({ searchParams }: SearchPageProps): Promise<Metadata> {
  const parameters = await searchParams;
  const query = getSearchDisplayQuery(readSearchParameter(parameters.q)).slice(0, 80);
  return {
    title: query ? `Search results for ${query}` : "Search",
    description: searchDescription,
    alternates: { canonical: "/search" },
    robots: { index: false, follow: true },
  };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const parameters = await searchParams;
  const rawQuery = readSearchParameter(parameters.q);
  const query = normalizeSearchQuery(rawQuery) ? getSearchDisplayQuery(rawQuery) : "";
  const type = parseSearchFilter(parameters.type);
  const sort = parseSearchSort(parameters.sort);
  const allResults = searchSite(query, { sort });
  const filteredResults = filterSearchResults(allResults, type);
  const counts = getSearchCounts(allResults);

  return <SearchResultsPage allResults={allResults} counts={counts} filteredResults={filteredResults} query={query} rawQuery={rawQuery} sort={sort} type={type} />;
}
