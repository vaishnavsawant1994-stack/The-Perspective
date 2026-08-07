"use client";

import Link from "next/link";
import { Search, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { articles } from "@/data/mock/articles";
import { magazines } from "@/data/mock/magazines";
import { people } from "@/data/mock/people";
import { siteConfig } from "@/config/site";
import { IconButton } from "@/components/ui/icon-button";

export function GlobalSearch({ compact = false }: { compact?: boolean }) {
  const [open, setOpen] = useState(false); const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null); const triggerRef = useRef<HTMLButtonElement>(null);
  useEffect(() => { if (!open) return; const trigger = triggerRef.current; const previous = document.body.dataset.scrollLocked; document.body.dataset.scrollLocked = "true"; inputRef.current?.focus(); const escape = (event: KeyboardEvent) => { if (event.key === "Escape") setOpen(false); }; document.addEventListener("keydown", escape); return () => { if (previous) document.body.dataset.scrollLocked = previous; else delete document.body.dataset.scrollLocked; document.removeEventListener("keydown", escape); trigger?.focus(); }; }, [open]);
  const results = useMemo(() => { const term = query.trim().toLowerCase(); if (!term) return []; return [
    ...articles.filter((item) => `${item.title} ${item.excerpt}`.toLowerCase().includes(term)).map((item) => ({ id: item.id, type: "Article", title: item.title, href: `/article/${item.slug}` })),
    ...magazines.filter((item) => item.title.toLowerCase().includes(term)).map((item) => ({ id: item.id, type: "Magazine", title: item.title, href: `/magazine/${item.slug}` })),
    ...people.filter((item) => `${item.name} ${item.headline}`.toLowerCase().includes(term)).map((item) => ({ id: item.id, type: "Person", title: item.name, href: `/people/${item.slug}` })),
  ].slice(0, 7); }, [query]);
  return <>
    <button ref={triggerRef} aria-label="Search" aria-haspopup="dialog" aria-expanded={open} className="flex min-h-11 items-center gap-2 text-xs font-bold uppercase tracking-[.09em] hover:text-accent" onClick={() => setOpen(true)}><Search aria-hidden="true" className="size-4" />{!compact && <span className="hidden xl:inline">Search</span>}</button>
    {open && <div aria-modal="true" role="dialog" aria-label="Search The Perspective" className="fixed inset-0 z-[100] overflow-y-auto bg-background/98">
      <div className="mx-auto min-h-full max-w-5xl px-5 py-6 sm:px-8 sm:py-10"><div className="flex items-center justify-between border-b border-border pb-5"><p className="font-serif text-xl">THE PERSPECTIVE</p><IconButton aria-label="Close search" onClick={() => setOpen(false)}><X /></IconButton></div>
        <div className="relative mt-12"><Search aria-hidden="true" className="absolute left-0 top-1/2 size-6 -translate-y-1/2 text-muted" /><label htmlFor="global-search" className="sr-only">Search articles, magazines, and people</label><input ref={inputRef} id="global-search" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search The Perspective" className="w-full border-0 border-b-2 border-foreground bg-transparent py-5 pl-10 pr-3 font-serif text-2xl outline-none placeholder:text-muted sm:text-4xl" /></div>
        {!query.trim() ? <div className="mt-12 grid gap-10 md:grid-cols-2"><div><h2 className="eyebrow mb-5 text-accent">Trending now</h2>{articles.slice(0, 3).map((article) => <Link className="block border-t border-border py-4 font-serif text-xl hover:text-accent" href={`/article/${article.slug}`} key={article.id} onClick={() => setOpen(false)}>{article.title}</Link>)}</div><div><h2 className="eyebrow mb-5 text-accent">Popular topics</h2><div className="flex flex-wrap gap-2">{siteConfig.popularTopics.map((topic) => <button className="border border-border px-4 py-2 text-sm hover:border-foreground" key={topic} onClick={() => setQuery(topic)}>{topic}</button>)}</div></div></div> : <div className="mt-10"><p aria-live="polite" className="eyebrow mb-5 text-muted">{results.length ? `${results.length} suggestion${results.length === 1 ? "" : "s"}` : "No results"}</p>{results.length ? <div className="divide-y divide-border">{results.map((result) => <Link className="flex items-baseline justify-between gap-5 py-5 hover:text-accent" href={result.href} key={result.id} onClick={() => setOpen(false)}><span className="font-serif text-xl sm:text-2xl">{result.title}</span><span className="type-meta text-muted">{result.type}</span></Link>)}</div> : <p className="type-body-lg text-muted">Try a broader term or explore one of the popular topics.</p>}</div>}
      </div>
    </div>}
  </>;
}
