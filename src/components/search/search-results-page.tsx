import Link from "next/link";
import type { SearchCounts, SearchFilter, SearchResult, SearchResultType, SearchSort } from "@/types";
import { CategoryNewsletter } from "@/components/category/category-newsletter";
import { EditorialSectionHeader } from "@/components/common/editorial-section-header";
import { PageContainer } from "@/components/layout/page-container";
import { buildSearchUrl, searchFilterLabels, searchResultLabels } from "@/lib/search";
import { SearchFilterBar, SearchSortForm } from "./search-controls";
import { SearchForm } from "./search-form";
import { SearchResultItem } from "./search-result";
import { SearchResultsList } from "./search-results-list";

const popularSearches = ["Artificial Intelligence", "Leadership", "Global Markets", "Productivity", "Founders", "Technology"] as const;
const exploreLinks = [
  { label: "Latest", href: "/latest" },
  { label: "News", href: "/news" },
  { label: "Business", href: "/business" },
  { label: "Leadership", href: "/leadership" },
  { label: "Technology", href: "/technology" },
  { label: "The Perspective", href: "/perspective" },
] as const;

const resultFilterByType: Readonly<Record<SearchResultType, Exclude<SearchFilter, "all">>> = {
  article: "articles",
  contributor: "contributors",
  person: "people",
  magazine: "magazines",
};

const singularResultLabels: Readonly<Record<SearchFilter, string>> = {
  all: "result",
  articles: "article",
  contributors: "contributor",
  people: "person",
  magazines: "magazine",
};

function SearchPageHeader({ rawQuery, type, sort }: { rawQuery: string; type: SearchFilter; sort: SearchSort }) {
  return <PageContainer className="pb-10 pt-10 sm:pb-14 sm:pt-14 lg:pb-16 lg:pt-18" width="standard">
    <nav aria-label="Breadcrumb"><ol className="flex items-center gap-2 text-xs text-muted"><li><Link className="hover:text-accent" href="/">Home</Link></li><li aria-hidden="true">/</li><li aria-current="page">Search</li></ol></nav>
    <header className="mt-8 border-b border-foreground pb-9 sm:pb-11"><p className="eyebrow text-accent">Search</p><h1 className="type-h1 mt-4">Search The Perspective</h1><p className="type-deck mt-5 max-w-3xl text-muted">Find reporting, essays, contributors, interviews, magazines and ideas across The Perspective.</p><SearchForm rawQuery={rawQuery} sort={sort} type={type} /></header>
  </PageContainer>;
}

function SearchDiscoverySidebar() {
  return <aside aria-label="Search discovery" className="space-y-10 lg:sticky lg:top-24">
    <section aria-labelledby="popular-searches-heading"><h2 className="border-t-2 border-foreground pt-4 text-sm font-extrabold uppercase tracking-[.12em]" id="popular-searches-heading">Popular Searches</h2><ul className="mt-4 divide-y divide-border">{popularSearches.map((query) => <li key={query}><Link className="flex min-h-11 items-center justify-between py-2 font-serif text-lg hover:text-accent" href={buildSearchUrl({ query })}>{query}<span aria-hidden="true">→</span></Link></li>)}</ul></section>
    <section aria-labelledby="explore-search-heading"><h2 className="border-t-2 border-foreground pt-4 text-sm font-extrabold uppercase tracking-[.12em]" id="explore-search-heading">Explore</h2><ul className="mt-4 grid grid-cols-2 gap-x-6 lg:grid-cols-1">{exploreLinks.map((link) => <li className="border-b border-border" key={link.href}><Link className="flex min-h-11 items-center text-sm font-semibold hover:text-accent" href={link.href}>{link.label}</Link></li>)}</ul></section>
  </aside>;
}

function SearchLanding() {
  return <PageContainer className="pb-[var(--space-section-sm)]" width="standard"><div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-16"><section aria-labelledby="search-start-heading"><EditorialSectionHeader description="Start with a subject, person, company or idea." id="search-start-heading" title="Discover the Archive" /><div className="grid gap-px bg-border sm:grid-cols-2 lg:grid-cols-3">{popularSearches.map((query) => <Link className="min-h-28 bg-background p-5 font-serif text-xl hover:bg-surface-subtle hover:text-accent" href={buildSearchUrl({ query })} key={query}>{query}<span aria-hidden="true" className="mt-5 block text-sm">Search →</span></Link>)}</div></section><SearchDiscoverySidebar /></div></PageContainer>;
}

function NoResults({ query, type, hasOtherResults, sort }: { query: string; type: SearchFilter; hasOtherResults: boolean; sort: SearchSort }) {
  const label = type === "all" ? "results" : searchFilterLabels[type].toLowerCase();
  return <section aria-labelledby="no-search-results-heading" className="border-y border-border py-12 sm:py-16"><p className="eyebrow text-accent">No {label}</p><h2 className="type-h2 mt-4 [overflow-wrap:anywhere]" id="no-search-results-heading">Nothing matched “{query}” in {label}.</h2><p className="mt-5 max-w-2xl text-base leading-7 text-muted">Check the spelling, use fewer words or try a broader subject from the suggestions below.</p>{hasOtherResults && <Link className="mt-7 inline-flex min-h-11 items-center border-b border-foreground text-sm font-bold hover:text-accent" href={buildSearchUrl({ query, sort })}>View all matching types →</Link>}<div className="mt-9 flex flex-wrap gap-3">{popularSearches.slice(0, 5).map((suggestion) => <Link className="inline-flex min-h-11 items-center border border-border px-4 text-sm font-semibold hover:border-foreground" href={buildSearchUrl({ query: suggestion })} key={suggestion}>{suggestion}</Link>)}</div><Link className="mt-8 inline-flex min-h-11 items-center border-b border-foreground text-sm font-bold hover:text-accent" href="/latest">Browse Latest →</Link></section>;
}

function TopMatchCard({ result }: { result: SearchResult }) {
  const label = searchResultLabels[result.type];
  const actionLabel = result.type === "person" && result.actionLabel ? result.actionLabel : `Open ${label}`;
  return <article className="border-t border-foreground py-5"><p className="type-meta text-accent">{label}</p><h3 className="mt-3 font-serif text-2xl leading-tight">{result.href ? <Link className="hover:text-accent" href={result.href}>{result.title}</Link> : result.title}</h3><p className="mt-3 line-clamp-3 text-sm leading-6 text-muted">{result.description}</p>{result.href && <Link aria-label={`${actionLabel}: ${result.title}`} className="mt-4 inline-flex min-h-11 items-center border-b border-foreground text-sm font-bold hover:text-accent" href={result.href}>{actionLabel} →</Link>}</article>;
}

function SearchGroup({ query, results, sort, type }: { query: string; results: readonly SearchResult[]; sort: SearchSort; type: SearchResultType }) {
  if (results.length === 0) return null;
  const filter = resultFilterByType[type];
  return <section aria-labelledby={`search-${filter}-heading`}><EditorialSectionHeader actionLabel={`View all ${searchFilterLabels[filter]}`} href={buildSearchUrl({ query, type: filter, sort })} id={`search-${filter}-heading`} title={searchFilterLabels[filter]} /><ul>{results.map((result) => <li key={`${result.type}-${result.id}`}><SearchResultItem result={result} /></li>)}</ul></section>;
}

function MixedResults({ query, results, sort }: { query: string; results: readonly SearchResult[]; sort: SearchSort }) {
  const topMatches = sort === "relevance" ? results.filter((result) => result.score >= 90).slice(0, 3) : [];
  const topIds = new Set(topMatches.map((result) => `${result.type}-${result.id}`));
  const remaining = results.filter((result) => !topIds.has(`${result.type}-${result.id}`));
  const group = (type: SearchResultType, limit: number) => remaining.filter((result) => result.type === type).slice(0, limit);

  return <div className="space-y-[var(--space-section-sm)]">{topMatches.length > 0 && <section aria-labelledby="top-search-matches-heading"><EditorialSectionHeader description="The strongest matches across the current edition." id="top-search-matches-heading" title="Top Matches" /><div className="grid gap-7 md:grid-cols-3">{topMatches.map((result) => <TopMatchCard key={`${result.type}-${result.id}`} result={result} />)}</div></section>}<SearchGroup query={query} results={group("article", 7)} sort={sort} type="article" /><SearchGroup query={query} results={group("contributor", 4)} sort={sort} type="contributor" /><SearchGroup query={query} results={group("person", 4)} sort={sort} type="person" /><SearchGroup query={query} results={group("magazine", 3)} sort={sort} type="magazine" /></div>;
}

function FilteredResults({ results, type }: { results: readonly SearchResult[]; type: Exclude<SearchFilter, "all"> }) {
  return <section aria-labelledby="filtered-search-results-heading"><EditorialSectionHeader description="Results are ordered by the selected search preference." id="filtered-search-results-heading" title={searchFilterLabels[type]} />{results.length > 10 ? <SearchResultsList results={results} /> : <ul>{results.map((result) => <li key={`${result.type}-${result.id}`}><SearchResultItem result={result} /></li>)}</ul>}</section>;
}

export function SearchResultsPage({ rawQuery, query, type, sort, allResults, filteredResults, counts }: { rawQuery: string; query: string; type: SearchFilter; sort: SearchSort; allResults: readonly SearchResult[]; filteredResults: readonly SearchResult[]; counts: SearchCounts }) {
  const resultLabel = filteredResults.length === 1 ? singularResultLabels[type] : type === "all" ? "results" : searchFilterLabels[type].toLowerCase();
  const resultSummary = `${filteredResults.length} ${resultLabel} for “${query}”`;
  return <><SearchPageHeader rawQuery={rawQuery} sort={sort} type={type} />{!query ? <SearchLanding /> : <><PageContainer className="pb-10" width="standard"><section aria-labelledby="search-summary-heading"><div className="flex flex-col justify-between gap-5 border-b border-border pb-6 lg:flex-row lg:items-end"><div className="min-w-0"><p className="eyebrow text-accent">Search Results</p><h2 className="type-h2 mt-3 [overflow-wrap:anywhere]" id="search-summary-heading">{resultSummary}</h2></div><SearchSortForm query={query} sort={sort} type={type} /></div><div className="pt-5"><SearchFilterBar counts={counts} query={query} sort={sort} type={type} /></div></section></PageContainer><PageContainer className="pb-[var(--space-section-sm)] pt-4" width="standard"><div className="grid gap-14 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-16"><div className="min-w-0">{filteredResults.length === 0 ? <NoResults hasOtherResults={allResults.length > 0} query={query} sort={sort} type={type} /> : type === "all" ? <MixedResults query={query} results={allResults} sort={sort} /> : <FilteredResults results={filteredResults} type={type} />}</div><SearchDiscoverySidebar /></div></PageContainer></>}<div className="bg-surface"><PageContainer className="section-space" width="standard"><CategoryNewsletter description="Reporting, essays and ideas worth your attention—selected from across The Perspective." eyebrow="Search, then stay informed" title="The Perspective Briefing" /></PageContainer></div></>;
}
