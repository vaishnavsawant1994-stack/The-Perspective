import Image from "next/image";
import Link from "next/link";
import type { Article } from "@/types";
import { ArticleCard } from "@/components/article/article-card";
import { CategoryLabel } from "@/components/common/category-label";

export function CategoryLead({ primary, supporting }: { primary:Article; supporting:readonly Article[] }) {
  return <section aria-labelledby="category-lead-heading" className="grid gap-10 lg:grid-cols-[minmax(0,1.55fr)_minmax(18rem,.8fr)] lg:gap-12 xl:gap-16">
    <article className="group min-w-0">
      {primary.heroImage && <Link aria-label={`Read ${primary.title}`} className="relative block aspect-[4/3] overflow-hidden bg-surface-subtle sm:aspect-[16/10]" href={`/article/${primary.slug}`}><Image alt={primary.heroImage.alt} className="object-cover transition-transform duration-500 group-hover:scale-[1.02]" fill priority sizes="(max-width: 1024px) 100vw, 62vw" src={primary.heroImage.src} /></Link>}
      <div className="pt-6"><CategoryLabel>{primary.subcategory ?? primary.category.name}</CategoryLabel><h2 className="mt-4 max-w-4xl font-serif text-[clamp(2.25rem,4.6vw,5rem)] leading-[.96] tracking-[-.045em]" id="category-lead-heading"><Link className="decoration-accent decoration-2 underline-offset-8 group-hover:underline" href={`/article/${primary.slug}`}>{primary.title}</Link></h2><p className="type-deck mt-5 max-w-3xl text-muted">{primary.dek ?? primary.excerpt}</p><p className="type-meta mt-6 text-muted">By {primary.authors[0]?.name} · {primary.displayTime} · {primary.readingMinutes} min read</p></div>
    </article>
    <div className="divide-y divide-border border-y border-border lg:border-b-0 lg:border-t-2 lg:border-foreground">{supporting.map((article) => <div className="py-6 first:pt-6" key={article.id}><ArticleCard article={article} variant="horizontal" /></div>)}</div>
  </section>;
}
