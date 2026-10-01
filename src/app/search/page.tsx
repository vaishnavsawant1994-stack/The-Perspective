import type { Metadata } from "next";
import { SearchResultsPage } from "@/components/search/search-results-page";
import { SearchRedesign } from "@/components/search/search-redesign";
import { filterSearchResults, getSearchCounts, getSearchDisplayQuery, normalizeSearchQuery, parseSearchFilter, parseSearchSort, readSearchParameter, searchSite } from "@/lib/search";
import { publishedSearch } from "@/modules/r9/projection";
import { publicSlug } from "@/modules/r9/projection";
import type { SearchResult } from "@/types";

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

export const dynamic = "force-dynamic";

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const parameters = await searchParams;
  const rawQuery = readSearchParameter(parameters.q);
  const query = normalizeSearchQuery(rawQuery) ? getSearchDisplayQuery(rawQuery) : "";
  const type = parseSearchFilter(parameters.type);
  const sort = parseSearchSort(parameters.sort);
  const published = query ? await publishedSearch(query) : [];
  const publishedResults: SearchResult[] = published.map((hit) => hit.kind === "article"
    ? {
        id: `published-article-${hit.slug}`,
        type: "article",
        title: hit.title,
        description: "Published edition",
        href: `/article/${hit.slug}`,
        score: 1,
        category: "Magazine",
        authorName: hit.author || "Published contributor",
        authorSlug: publicSlug(hit.author || "published"),
        publishedAt: hit.publishedAt || "1970-01-01T00:00:00.000Z",
        readingMinutes: 1,
        premium: false,
        breaking: false,
      }
    : {
        id: `published-magazine-${hit.slug}`,
        type: "magazine",
        title: hit.title,
        description: "Published edition",
        href: `/magazine/read/${hit.slug}`,
        score: 1,
        magazineId: hit.slug,
        issueId: hit.slug,
        issueLabel: hit.title,
        publicationDate: hit.publishedAt || "1970-01-01T00:00:00.000Z",
        featuredStory: hit.title,
        premium: false,
      });
  const seen = new Set(publishedResults.map((result) => result.href));
  const allResults = [...publishedResults, ...searchSite(query, { sort }).filter((result) => !result.href || !seen.has(result.href))];
  const filteredResults = filterSearchResults(allResults, type);
  const counts = getSearchCounts(allResults);

  return <>
    <SearchRedesign allResults={allResults} counts={counts} filteredResults={filteredResults} query={query} rawQuery={rawQuery} sort={sort} type={type} />
    <SearchResultsPage allResults={allResults} counts={counts} filteredResults={filteredResults} query={query} rawQuery={rawQuery} sort={sort} type={type} />
  </>;
}
