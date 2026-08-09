import Link from "next/link";
import type { SearchCounts, SearchFilter, SearchSort } from "@/types";
import { buildSearchUrl, searchFilterLabels, searchFilters } from "@/lib/search";
import { Button } from "@/components/ui/button";

export function SearchFilterBar({ counts, query, type, sort }: { counts: SearchCounts; query: string; type: SearchFilter; sort: SearchSort }) {
  return <nav aria-label="Search result types" className="-mx-4 overflow-x-auto px-4 xs:-mx-5 xs:px-5 sm:mx-0 sm:px-0">
    <ul className="flex min-w-max border-b border-border">
      {searchFilters.map((filter) => {
        const active = filter === type;
        return <li key={filter}><Link aria-current={active ? "page" : undefined} className={`inline-flex min-h-12 items-center border-b-2 px-4 text-sm font-semibold transition-colors ${active ? "border-accent text-foreground" : "border-transparent text-muted hover:text-foreground"}`} href={buildSearchUrl({ query, type: filter, sort })}>{searchFilterLabels[filter]} <span className="ml-2 text-xs font-normal text-muted">{counts[filter]}</span></Link></li>;
      })}
    </ul>
  </nav>;
}

export function SearchSortForm({ query, type, sort }: { query: string; type: SearchFilter; sort: SearchSort }) {
  return <form action="/search" className="flex flex-wrap items-end gap-3" method="get">
    <input name="q" type="hidden" value={query} />
    {type !== "all" && <input name="type" type="hidden" value={type} />}
    <div><label className="type-meta mb-2 block text-muted" htmlFor="search-sort">Sort by</label><select className="h-11 min-w-40 border border-border bg-background px-3 text-sm font-semibold outline-none focus:border-accent" defaultValue={sort} id="search-sort" name="sort"><option value="relevance">Relevance</option><option value="newest">Newest</option></select></div>
    <Button size="small" type="submit" variant="outline">Apply</Button>
  </form>;
}
