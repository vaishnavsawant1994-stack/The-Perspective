import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { MagazineCategoryStory } from "@/types";
import { formatMagazineIssueDate } from "@/lib/magazine-issue-date";
import { cn } from "@/lib/utils";

export function MagazineCategoryStoryCard({ story, lead = false }: { story: MagazineCategoryStory; lead?: boolean }) {
  const { article, issue, sectionLabel } = story;
  const author = article.authors[0];
  return <article aria-labelledby={`magazine-story-${article.id}`} className={cn("group grid content-start border-t-2 border-foreground pt-5", lead ? "gap-7 md:grid-cols-[1.15fr_.85fr] md:items-center lg:col-span-2" : "gap-5")}>
    {article.heroImage ? <Link aria-label={`Read ${article.title}`} className={cn("relative block overflow-hidden bg-surface-subtle", lead ? "aspect-[16/10]" : "aspect-[16/9]")} href={`/article/${article.slug}`}><Image alt={article.heroImage.alt} className="object-cover transition-transform duration-500 group-hover:scale-[1.02]" fill sizes={lead ? "(max-width: 767px) 100vw, 55vw" : "(max-width: 767px) 100vw, (max-width: 1279px) 50vw, 33vw"} src={article.heroImage.src} /></Link> : null}
    <div><p className="type-meta text-accent">{formatMagazineIssueDate(issue.publicationDate)} · {sectionLabel}</p><h3 className={cn("mt-4 font-serif leading-[1.02] tracking-[-.025em]", lead ? "text-3xl sm:text-4xl lg:text-5xl" : "text-2xl sm:text-3xl")} id={`magazine-story-${article.id}`}><Link className="hover:text-accent" href={`/article/${article.slug}`}>{article.title}</Link></h3><p className="mt-4 text-sm leading-6 text-muted">{article.dek ?? article.excerpt}</p><div className="mt-5 flex flex-wrap items-center justify-between gap-3"><p className="type-meta text-muted">{author ? <>By <Link className="hover:text-accent" href={`/author/${author.slug}`}>{author.name}</Link> · </> : null}{article.readingMinutes} min read</p><Link aria-label={`Read ${article.title}`} className="inline-flex min-h-11 items-center gap-2 text-sm font-bold hover:text-accent" href={`/article/${article.slug}`}>Read Story <ArrowRight aria-hidden="true" className="size-4" /></Link></div></div>
  </article>;
}
