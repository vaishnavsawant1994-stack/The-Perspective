import Image from "next/image";
import Link from "next/link";
import { LockKeyhole } from "lucide-react";
import type { Article } from "@/types";
import { CategoryLabel } from "@/components/common/category-label";
import { Badge } from "@/components/ui/badge";
import { formatEditorialTime } from "@/lib/editorial-date";

export function LatestStoryRow({ article }: { article:Article }) {
  const publishedAt = article.publishedAt ?? article.updatedAt;
  return <article className="group grid grid-cols-[6.5rem_minmax(0,1fr)] gap-4 border-b border-border py-6 sm:grid-cols-[11rem_minmax(0,1fr)] sm:gap-6 lg:grid-cols-[14rem_minmax(0,1fr)]">
    {article.heroImage && <Link aria-label={`Read ${article.title}`} className="relative aspect-[4/3] overflow-hidden bg-surface-subtle" href={`/article/${article.slug}`}><Image alt={article.heroImage.alt} className="object-cover transition-transform duration-500 group-hover:scale-[1.025]" fill sizes="(max-width: 640px) 104px, (max-width: 1024px) 176px, 224px" src={article.heroImage.src} /></Link>}
    <div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><CategoryLabel>{article.category.name}</CategoryLabel>{article.breaking && <Badge className="border-accent bg-accent text-white">Breaking</Badge>}{article.premium && <Badge className="gap-1 border-[#76551f] text-[#76551f]"><LockKeyhole className="size-3" />Premium</Badge>}</div><h3 className="mt-2 font-serif text-xl leading-[1.08] tracking-[-.02em] sm:text-2xl lg:text-[1.7rem]"><Link className="decoration-accent underline-offset-4 group-hover:underline" href={`/article/${article.slug}`}>{article.title}</Link></h3><p className="mt-3 hidden text-sm leading-6 text-muted sm:block">{article.excerpt}</p><p className="mt-4 text-[.65rem] font-semibold uppercase tracking-[.07em] text-muted"><span className="hidden sm:inline">By {article.authors[0]?.name} · </span><time dateTime={publishedAt}>{formatEditorialTime(publishedAt)}</time> · {article.readingMinutes} min read</p></div>
  </article>;
}
