import Link from "next/link";
import { ArrowRight, BookOpen, Crown } from "lucide-react";
import type { MagazineCategory, MagazineCategoryStory, MagazineIssue } from "@/types";
import { PageContainer } from "@/components/layout/page-container";
import { MagazineCover } from "@/components/magazine/magazine-cover";
import { buttonVariants } from "@/components/ui/button";
import { formatMagazineIssueDate } from "@/lib/magazine-issue-date";
import { getMagazineReaderHref } from "@/lib/magazine-categories";
import { cn } from "@/lib/utils";

export function MagazineCategoryFeaturedIssue({ category, issue, stories }: { category: MagazineCategory; issue: MagazineIssue; stories: readonly MagazineCategoryStory[] }) {
  const readerHref = getMagazineReaderHref(issue);
  return <div className="bg-foreground text-white"><PageContainer className="section-space-lg" width="standard"><section aria-labelledby="magazine-category-featured-issue" className="grid gap-12 md:grid-cols-[minmax(14rem,.68fr)_minmax(0,1.32fr)] md:items-center lg:grid-cols-[minmax(17rem,.6fr)_minmax(0,1.4fr)] lg:gap-20">
    <div className="mx-auto w-[78%] max-w-[28rem] md:w-full"><MagazineCover href={readerHref ?? undefined} issue={issue} priority variant="large" /></div>
    <div><div className="flex flex-wrap items-center gap-3"><p className="eyebrow text-premium">Featured Issue</p>{issue.premium ? <p className="inline-flex items-center gap-1.5 text-[.64rem] font-bold uppercase tracking-[.12em] text-premium"><Crown aria-hidden="true" className="size-3.5" /> Premium Edition</p> : null}{readerHref ? <p className="inline-flex items-center gap-1.5 text-[.64rem] font-bold uppercase tracking-[.12em] text-white/70"><BookOpen aria-hidden="true" className="size-3.5" /> Digital Reader</p> : null}</div><p className="type-meta mt-5 text-white/55">{formatMagazineIssueDate(issue.publicationDate)} · Issue {String(issue.issueNumber).padStart(2, "0")}</p><h2 className="type-display-lg mt-5 max-w-4xl" id="magazine-category-featured-issue">{issue.coverHeadline}</h2><p className="type-deck mt-7 max-w-3xl text-white/65">{issue.description}</p><p className="type-meta mt-6 text-premium">{issue.theme} · {issue.pageCount} pages</p>
      <div className="mt-8 border-t border-white/20"><p className="type-meta py-3 text-white/60">Important stories in this edition</p><ul>{stories.map(({ article, sectionLabel }) => <li className="border-t border-white/15" key={article.id}><Link className="group flex min-h-14 items-center justify-between gap-5 py-3 font-serif text-lg leading-tight hover:text-premium sm:text-xl" href={`/article/${article.slug}`}><span><span className="mr-3 font-sans text-[.62rem] font-bold uppercase tracking-[.12em] text-white/70">{sectionLabel}</span>{article.title}</span><ArrowRight aria-hidden="true" className="size-4 shrink-0 transition-transform group-hover:translate-x-1" /></Link></li>)}</ul></div>
      <div className="mt-8 flex flex-wrap gap-3"><Link className={buttonVariants({ variant: "premium", size: "large" })} href="#featured-stories">Explore Issue Stories <ArrowRight aria-hidden="true" className="size-4" /></Link>{readerHref ? <Link className={cn(buttonVariants({ variant: "outline", size: "large" }), "border-white text-white hover:bg-white hover:text-foreground")} href={readerHref}><BookOpen aria-hidden="true" className="size-4" /> Read Digital Issue</Link> : <Link className={cn(buttonVariants({ variant: "outline", size: "large" }), "border-white text-white hover:bg-white hover:text-foreground")} href={`/magazine/archive?q=${encodeURIComponent(category.archiveQuery)}`}>Browse Archive</Link>}</div>
    </div>
  </section></PageContainer></div>;
}
