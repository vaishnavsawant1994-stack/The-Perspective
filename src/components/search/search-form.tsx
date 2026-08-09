import Link from "next/link";
import { Search, X } from "lucide-react";
import type { SearchFilter, SearchSort } from "@/types";
import { Button } from "@/components/ui/button";

export function SearchForm({ rawQuery, type, sort }: { rawQuery: string; type: SearchFilter; sort: SearchSort }) {
  return <form action="/search" className="mt-9" method="get" role="search">
    <label className="eyebrow mb-3 block text-muted" htmlFor="site-search-query">Search the archive</label>
    <div className="flex flex-col gap-3 sm:flex-row">
      <div className="relative min-w-0 flex-1">
        <Search aria-hidden="true" className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted sm:left-5" />
        <input className="h-14 w-full border border-foreground bg-background pl-12 pr-12 font-serif text-lg outline-none placeholder:text-muted focus:border-accent sm:h-16 sm:pl-14 sm:text-2xl" defaultValue={rawQuery} id="site-search-query" name="q" placeholder="Search articles, contributors, magazines and people" type="search" />
        {rawQuery && <Link aria-label="Clear search" className="absolute right-2 top-1/2 inline-flex size-11 -translate-y-1/2 items-center justify-center text-muted hover:text-accent" href="/search"><X aria-hidden="true" className="size-5" /></Link>}
      </div>
      {type !== "all" && <input name="type" type="hidden" value={type} />}
      {sort !== "relevance" && <input name="sort" type="hidden" value={sort} />}
      <Button className="h-14 px-7 sm:h-16" type="submit">Search</Button>
    </div>
  </form>;
}
