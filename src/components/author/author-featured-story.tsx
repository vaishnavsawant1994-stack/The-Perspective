import Image from "next/image";
import Link from "next/link";
import type { Article } from "@/types";
import { formatEditorialDate } from "@/lib/editorial-date";

export function AuthorFeaturedStory({ article }: { article: Article }) {
  const publishedAt = article.publishedAt ?? article.updatedAt;

  return <section aria-labelledby="author-featured-story-heading" className="grid gap-8 border-y border-border py-8 lg:grid-cols-[1.08fr_.92fr] lg:items-center lg:gap-12 lg:py-12">
    <div className="max-w-3xl">
      <p className="eyebrow text-accent">Featured Essay</p>
      <h2 className="type-display-md mt-5" id="author-featured-story-heading"><Link className="hover:text-accent" href={`/article/${article.slug}`}>{article.title}</Link></h2>
      <p className="type-deck mt-5 text-muted">{article.dek ?? article.excerpt}</p>
      <p className="type-meta mt-7 text-muted"><time dateTime={publishedAt}>{formatEditorialDate(publishedAt)}</time> <span aria-hidden="true">·</span> {article.readingMinutes} min read</p>
      <Link className="mt-7 inline-flex min-h-11 items-center border-b border-foreground text-sm font-bold hover:text-accent" href={`/article/${article.slug}`}>Read the essay →</Link>
    </div>
    {article.heroImage && <Link aria-label={`Read ${article.title}`} className="relative block aspect-[4/3] overflow-hidden bg-surface-subtle" href={`/article/${article.slug}`}>
      <Image alt={article.heroImage.alt} className="object-cover transition-transform duration-500 hover:scale-[1.02]" fill loading="eager" sizes="(max-width: 1024px) 100vw, 42vw" src={article.heroImage.src} />
    </Link>}
  </section>;
}
