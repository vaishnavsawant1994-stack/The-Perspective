import Link from "next/link";
import { Search, X } from "lucide-react";
import type { MagazineArchiveCounts, MagazineArchiveState } from "@/types";
import { buildMagazineArchiveUrl, magazineArchiveFilterLabels, magazineArchiveFilters } from "@/lib/magazine-archive";

function issueLabel(count: number) {
  return `${count} ${count === 1 ? "issue" : "issues"}`;
}

export function ArchiveControls({ counts, resultCount, state, years }: { counts: MagazineArchiveCounts; resultCount: number; state: MagazineArchiveState; years: readonly number[] }) {
  const resultSummary = state.query
    ? `${issueLabel(resultCount)} matching “${state.query}”`
    : state.year
      ? `${issueLabel(resultCount)} from ${state.year}`
      : issueLabel(resultCount);

  return <div className="space-y-8">
    <form action="/magazine/archive" className="border-y border-foreground py-5" method="get" role="search">
      {state.year ? <input name="year" type="hidden" value={state.year} /> : null}
      {state.type !== "all" ? <input name="type" type="hidden" value={state.type} /> : null}
      <label className="type-label mb-3 block" htmlFor="archive-query">Search the archive</label>
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative min-w-0 flex-1"><Search aria-hidden="true" className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted" /><input className="h-13 w-full border border-foreground bg-surface pl-12 pr-4 text-base placeholder:text-muted focus:border-accent focus:outline-none" defaultValue={state.query} id="archive-query" name="q" placeholder="Search issues, themes and cover stories" type="search" /></div>
        <button className="inline-flex min-h-13 items-center justify-center bg-foreground px-7 text-sm font-bold text-white hover:bg-accent" type="submit">Search Archive</button>
        {state.query ? <Link aria-label="Clear archive search" className="inline-flex min-h-13 items-center justify-center gap-2 border border-foreground px-5 text-sm font-bold hover:bg-surface-subtle" href={buildMagazineArchiveUrl(state, { query: null })}><X aria-hidden="true" className="size-4" /> Clear</Link> : null}
      </div>
    </form>

    <nav aria-label="Archive years"><p className="type-label mb-3 text-muted">Browse by year</p><ul className="flex gap-2 overflow-x-auto pb-2 [scrollbar-width:thin]"><li><Link aria-current={!state.year ? "page" : undefined} className="inline-flex min-h-11 items-center whitespace-nowrap border border-border px-4 text-xs font-bold uppercase tracking-[.08em] hover:border-foreground aria-[current=page]:border-foreground aria-[current=page]:bg-foreground aria-[current=page]:text-white" href={buildMagazineArchiveUrl(state, { year: null })}>All Years <span className="ml-2 opacity-65">{counts.all}</span></Link></li>{years.map((year) => <li key={year}><Link aria-current={state.year === year ? "page" : undefined} className="inline-flex min-h-11 items-center whitespace-nowrap border border-border px-4 text-xs font-bold uppercase tracking-[.08em] hover:border-foreground aria-[current=page]:border-foreground aria-[current=page]:bg-foreground aria-[current=page]:text-white" href={buildMagazineArchiveUrl(state, { year })}>{year} <span className="ml-2 opacity-65">{counts.byYear[year] ?? 0}</span></Link></li>)}</ul></nav>

    <nav aria-label="Archive issue filters"><p className="type-label mb-3 text-muted">Filter editions</p><ul className="flex gap-2 overflow-x-auto pb-2 [scrollbar-width:thin]">{magazineArchiveFilters.map((filter) => <li key={filter}><Link aria-current={state.type === filter ? "page" : undefined} className="inline-flex min-h-11 items-center whitespace-nowrap border-b-2 border-border px-3 text-xs font-bold uppercase tracking-[.08em] hover:border-foreground hover:text-accent aria-[current=page]:border-accent aria-[current=page]:text-accent" href={buildMagazineArchiveUrl(state, { type: filter })}>{magazineArchiveFilterLabels[filter]} <span className="ml-2 text-muted">{counts[filter]}</span></Link></li>)}</ul></nav>

    <div aria-live="polite" className="flex flex-wrap items-center justify-between gap-4 border-t border-border pt-5"><p className="font-serif text-2xl">{resultSummary}</p><p className="type-meta text-muted">{counts.premium} Premium · {counts.reader} Digital Reader</p></div>
  </div>;
}
