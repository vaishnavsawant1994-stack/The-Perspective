import Link from "next/link";
import { ArrowRight, BookOpen, Crown } from "lucide-react";
import type { MagazineIssue } from "@/types";
import { MagazineCover } from "@/components/magazine/magazine-cover";
import { getMagazineIssueArticles } from "@/data/mock/magazines";
import { formatMagazineIssueDate } from "@/lib/magazine-issue-date";
import { getMagazineReaderHref } from "@/lib/magazine-categories";

export function MagazineCategoryIssueGrid({ categoryName, issues }: { categoryName: string; issues: readonly MagazineIssue[] }) {
  return <section aria-labelledby="magazine-category-issues-heading"><header className="grid gap-6 border-t-2 border-foreground pt-4 lg:grid-cols-[.72fr_1.28fr]"><div><p className="eyebrow text-accent">Curated Shelf</p><h2 className="type-h2 mt-4" id="magazine-category-issues-heading">Issues in {categoryName}</h2></div><p className="type-deck max-w-2xl text-muted">Editions selected through explicit curation, issue themes, section identity and their canonical stories.</p></header>
    <ol className="mt-12 grid gap-x-9 gap-y-16 md:grid-cols-2 xl:grid-cols-3">{issues.map((issue) => {
      const readerHref = getMagazineReaderHref(issue);
      const stories = getMagazineIssueArticles(issue).slice(0, 2);
      return <li className="min-w-0 [contain-intrinsic-size:1px_850px] [content-visibility:auto]" key={issue.id}><article className="flex h-full min-w-0 flex-col border-t border-foreground pt-5"><div className="mx-auto w-full min-w-0 max-w-[25rem]"><MagazineCover href={readerHref ?? undefined} issue={issue} variant="standard" /></div><div className="flex min-w-0 flex-1 flex-col pt-6"><div className="flex flex-wrap items-center justify-between gap-2"><p className="type-meta text-accent">{formatMagazineIssueDate(issue.publicationDate)}</p><div className="flex flex-wrap gap-3">{readerHref ? <span className="inline-flex items-center gap-1 text-[.6rem] font-bold uppercase tracking-[.12em] text-[#76531b]"><BookOpen aria-hidden="true" className="size-3" /> Digital Reader</span> : null}{issue.premium ? <span className="inline-flex items-center gap-1 text-[.6rem] font-bold uppercase tracking-[.12em] text-[#76531b]"><Crown aria-hidden="true" className="size-3" /> Premium Edition</span> : null}</div></div><h3 className="mt-4 font-serif text-4xl leading-[.95] tracking-[-.035em]">{issue.coverHeadline}</h3><p className="mt-4 text-sm leading-6 text-muted">{issue.description}</p><p className="type-meta mt-5 text-muted">{issue.theme} · {issue.pageCount} pages</p><ul className="mt-6 border-t border-border">{stories.map((story) => <li className="border-b border-border" key={story.id}><Link className="group flex min-h-14 items-center justify-between gap-4 py-3 font-serif text-lg leading-tight hover:text-accent" href={`/article/${story.slug}`}><span>{story.title}</span><ArrowRight aria-hidden="true" className="size-4 shrink-0 transition-transform group-hover:translate-x-1" /></Link></li>)}</ul>{readerHref ? <div className="mt-auto pt-6"><Link className="inline-flex min-h-11 items-center gap-2 bg-foreground px-5 text-sm font-bold text-white hover:bg-accent" href={readerHref}>Read Digital Edition <ArrowRight aria-hidden="true" className="size-4" /></Link></div> : null}</div></article></li>;
    })}</ol>
  </section>;
}
