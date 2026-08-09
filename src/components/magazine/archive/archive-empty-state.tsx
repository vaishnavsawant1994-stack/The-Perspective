import Link from "next/link";
import { ArrowRight } from "lucide-react";

const suggestions = ["Leadership", "Technology", "Founders", "AI", "Capital"] as const;

export function ArchiveEmptyState({ query }: { query: string }) {
  return <section aria-labelledby="archive-empty-heading" className="border-y border-foreground bg-surface-subtle px-5 py-14 text-center sm:px-8 sm:py-20">
    <p className="eyebrow text-accent">No issues found</p><h2 className="type-h2 mx-auto mt-5 max-w-3xl" id="archive-empty-heading">The archive has no issue for this selection.</h2>
    <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-muted">{query ? <>We couldn&apos;t find an issue matching “{query}.” </> : null}Try clearing filters, searching another theme or choosing a different year.</p>
    <div className="mt-8"><Link className="inline-flex min-h-12 items-center gap-2 bg-foreground px-6 text-sm font-bold text-white hover:bg-accent" href="/magazine/archive">View All Issues <ArrowRight aria-hidden="true" className="size-4" /></Link></div>
    <nav aria-label="Suggested archive searches" className="mt-9"><p className="type-meta text-muted">Try a theme</p><ul className="mt-3 flex flex-wrap justify-center gap-2">{suggestions.map((suggestion) => <li key={suggestion}><Link className="inline-flex min-h-11 items-center border border-border px-4 text-sm font-semibold hover:border-foreground hover:text-accent" href={`/magazine/archive?q=${encodeURIComponent(suggestion)}`}>{suggestion}</Link></li>)}</ul></nav>
  </section>;
}
