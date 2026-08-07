import Image from "next/image";
import Link from "next/link";
import type { Article } from "@/types";
import { CategoryLabel } from "@/components/common/category-label";
import { Badge } from "@/components/ui/badge";
import { formatEditorialDate, formatEditorialTime } from "@/lib/editorial-date";

export function LatestLead({ articles }: { articles:readonly Article[] }) {
  const [lead, ...supporting] = articles; if (!lead?.heroImage) return null; const publishedAt = lead.publishedAt ?? lead.updatedAt;
  return <section aria-label="Lead latest stories" className="grid gap-10 border-b border-border pb-12 lg:grid-cols-[1.5fr_.8fr] lg:gap-12">
    <article className="group"><Link className="relative block aspect-[16/9] overflow-hidden bg-surface-subtle" href={`/article/${lead.slug}`}><Image alt={lead.heroImage.alt} className="object-cover transition-transform duration-500 group-hover:scale-[1.025]" fill loading="eager" priority sizes="(max-width: 1024px) 100vw, 62vw" src={lead.heroImage.src} /></Link><div className="pt-6"><div className="flex flex-wrap items-center gap-3"><CategoryLabel>{lead.category.name}</CategoryLabel>{lead.breaking && <Badge className="border-accent bg-accent text-white">Breaking</Badge>}</div><h2 className="type-h2 mt-4"><Link className="decoration-accent underline-offset-8 group-hover:underline" href={`/article/${lead.slug}`}>{lead.title}</Link></h2><p className="type-deck mt-5 max-w-3xl text-muted">{lead.dek ?? lead.excerpt}</p><p className="type-meta mt-6 text-muted"><time dateTime={publishedAt}>{formatEditorialDate(publishedAt)} · {formatEditorialTime(publishedAt)}</time> · {lead.readingMinutes} min read</p><Link className="mt-6 inline-block border-b border-foreground pb-1 text-sm font-bold hover:text-accent" href={`/article/${lead.slug}`}>Read Story →</Link></div></article>
    <div className="divide-y divide-border border-t border-foreground">{supporting.map((article) => { const articleDate = article.publishedAt ?? article.updatedAt; return <article className="group py-6" key={article.id}><CategoryLabel>{article.category.name}</CategoryLabel><h3 className="mt-3 font-serif text-2xl leading-tight"><Link className="group-hover:text-accent" href={`/article/${article.slug}`}>{article.title}</Link></h3><time className="type-caption mt-3 block text-muted" dateTime={articleDate}>{formatEditorialTime(articleDate)} · {article.readingMinutes} min read</time></article>; })}</div>
  </section>;
}
