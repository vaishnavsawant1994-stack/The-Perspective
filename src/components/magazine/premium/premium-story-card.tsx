import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { MagazinePremiumStory } from "@/types";
import { formatMagazineIssueDate } from "@/lib/magazine-issue-date";

export function PremiumStoryCard({ story, lead = false }: { story: MagazinePremiumStory; lead?: boolean }) {
  const { article, issue, sectionLabel } = story;
  return <article className={lead ? "grid gap-6 border-t-2 border-foreground pt-5 sm:grid-cols-[minmax(0,1.15fr)_minmax(16rem,.85fr)] sm:items-start lg:col-span-2" : "border-t border-border pt-5"}>
    {article.heroImage ? <Link aria-label={`Read ${article.title}`} className={lead ? "relative aspect-[4/3] overflow-hidden bg-surface-subtle sm:order-2" : "relative mb-6 block aspect-[16/10] overflow-hidden bg-surface-subtle"} href={`/article/${article.slug}`}><Image alt={article.heroImage.alt} className="object-cover transition-transform duration-500 hover:scale-[1.02]" fill sizes={lead ? "(max-width: 639px) 100vw, 38vw" : "(max-width: 1023px) 100vw, 32vw"} src={article.heroImage.src} /></Link> : null}
    <div className={lead ? "sm:order-1" : ""}><p className="type-meta text-[#76531b]">{sectionLabel} · {formatMagazineIssueDate(issue.publicationDate)}</p><h3 className={lead ? "mt-4 font-serif text-[clamp(2.25rem,5vw,4.5rem)] leading-[.92] tracking-[-.045em]" : "mt-4 font-serif text-3xl leading-[.98] tracking-[-.03em]"}><Link className="hover:text-accent" href={`/article/${article.slug}`}>{article.title}</Link></h3><p className="mt-4 text-sm leading-6 text-muted">{article.dek ?? article.excerpt}</p>{article.authors[0] ? <p className="type-meta mt-5 text-muted">By <Link className="font-semibold text-foreground hover:text-accent" href={`/author/${article.authors[0].slug}`}>{article.authors[0].name}</Link> · {article.readingMinutes} min read</p> : null}<Link className="mt-5 inline-flex min-h-11 items-center gap-2 border-b border-foreground text-sm font-bold hover:text-accent" href={`/article/${article.slug}`}>Read story <ArrowRight aria-hidden="true" className="size-4" /></Link></div>
  </article>;
}
