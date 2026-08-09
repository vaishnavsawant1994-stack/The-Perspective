import Link from "next/link";
import { ArrowRight, Crown } from "lucide-react";
import type { MagazineIssue } from "@/types";
import { getMagazineIssueArticles } from "@/data/mock/magazines";
import { formatMagazineIssueDate } from "@/lib/magazine-issue-date";
import { getMagazineReaderHref } from "@/lib/magazine-categories";
import { MagazineCover } from "@/components/magazine/magazine-cover";

export function PremiumIssueCatalogue({ issues }: { issues: readonly MagazineIssue[] }) {
  return <section aria-labelledby="premium-editions-heading" id="premium-editions">
    <header className="grid gap-6 border-t-2 border-foreground pt-5 lg:grid-cols-[.68fr_1.32fr]"><div><p className="eyebrow text-accent">The collection</p><h2 className="type-display-lg mt-5" id="premium-editions-heading">Premium editions</h2></div><div><p className="type-deck max-w-3xl text-muted">Two canonical editions, each assembled around one subject with interviews, analysis and stories selected for sustained reading.</p><p className="mt-4 text-sm leading-6 text-muted">Reader availability is independent from Premium status. No Premium edition is currently configured for the Digital Reader.</p></div></header>
    <ol className="mt-14 grid gap-14 lg:grid-cols-2">{issues.map((issue) => {
      const readerHref = getMagazineReaderHref(issue);
      return <li key={issue.id}><article className="grid gap-8 border-t border-border pt-6 sm:grid-cols-[12rem_minmax(0,1fr)] lg:grid-cols-[minmax(10rem,.72fr)_minmax(0,1.28fr)]"><MagazineCover href={readerHref ?? undefined} issue={issue} variant="compact" /><div><p className="type-meta inline-flex items-center gap-2 text-[#76531b]"><Crown aria-hidden="true" className="size-4" /> Premium · {formatMagazineIssueDate(issue.publicationDate)}</p><h3 className="mt-4 font-serif text-4xl leading-[.92] tracking-[-.04em]">{issue.coverHeadline}</h3><p className="mt-4 text-sm leading-6 text-muted">{issue.description}</p><p className="type-meta mt-4 text-muted">{issue.theme} · {issue.pageCount} pages</p><ul className="mt-6 border-t border-border">{getMagazineIssueArticles(issue).slice(0, 3).map((story) => <li className="border-b border-border" key={story.id}><Link className="group flex min-h-14 items-center justify-between gap-4 py-3 font-serif text-lg leading-tight hover:text-accent" href={`/article/${story.slug}`}><span>{story.title}</span><ArrowRight aria-hidden="true" className="size-4 shrink-0 transition-transform group-hover:translate-x-1" /></Link></li>)}</ul>{readerHref ? <Link className="mt-6 inline-flex min-h-11 items-center gap-2 bg-foreground px-5 text-sm font-bold text-white hover:bg-accent" href={readerHref}>Read Digital Edition <ArrowRight aria-hidden="true" className="size-4" /></Link> : <p className="type-meta mt-6 text-muted">Stories available individually · Reader edition not configured</p>}</div></article></li>;
    })}</ol>
  </section>;
}
