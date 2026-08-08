import Image from "next/image";
import Link from "next/link";
import type { Article } from "@/types";
import { CategoryLabel } from "@/components/common/category-label";

export function CategoryInDepth({ article }: { article:Article }) {
  if (!article.heroImage) return null;
  return <section aria-labelledby="category-in-depth-heading" className="bg-foreground p-5 text-white sm:p-8 lg:p-12">
    <p className="eyebrow text-premium">Business Analysis</p>
    <article className="mt-5 grid gap-8 lg:grid-cols-[1.15fr_.85fr] lg:items-center lg:gap-12">
      <Link className="relative block aspect-[16/10] overflow-hidden bg-white/10" href={`/article/${article.slug}`}><Image alt={article.heroImage.alt} className="object-cover transition-transform duration-500 hover:scale-[1.02]" fill sizes="(max-width: 1024px) 100vw, 55vw" src={article.heroImage.src} /></Link>
      <div><CategoryLabel className="text-premium">In Depth</CategoryLabel><h2 className="type-h2 mt-5" id="category-in-depth-heading"><Link className="hover:text-premium" href={`/article/${article.slug}`}>{article.title}</Link></h2><p className="type-deck mt-6 text-white/70">{article.dek ?? article.excerpt}</p><p className="type-meta mt-6 text-white/55">By {article.authors[0]?.name} · {article.readingMinutes} min read</p><Link className="mt-8 inline-block border-b border-white pb-1 text-sm font-bold hover:text-premium" href={`/article/${article.slug}`}>Read the Analysis →</Link></div>
    </article>
  </section>;
}
