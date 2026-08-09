import Link from "next/link";
import type { Article } from "@/types";
import { formatEditorialDate } from "@/lib/editorial-date";

export function PerspectiveStoryList({ articles, showExcerpt = false }: { articles: readonly Article[]; showExcerpt?: boolean }) {
  return <div className="divide-y divide-border border-b border-border">{articles.map((article) => {
    const author = article.authors[0];
    const publishedAt = article.publishedAt ?? article.updatedAt;
    return <article className="grid gap-3 py-6 sm:grid-cols-[minmax(0,1fr)_auto] sm:gap-8" key={article.id}>
      <div className="min-w-0"><p className="type-meta text-accent">{article.subcategory ?? "Opinion"}</p><h3 className="mt-2 font-serif text-[clamp(1.35rem,2vw,1.8rem)] leading-tight"><Link className="hover:text-accent" href={`/article/${article.slug}`}>{article.title}</Link></h3>{showExcerpt && <p className="mt-3 max-w-3xl text-sm leading-6 text-muted">{article.excerpt}</p>}</div>
      <div className="text-xs leading-5 text-muted sm:min-w-44 sm:pt-5 sm:text-right">{author && <p className="font-semibold text-foreground"><Link className="hover:text-accent" href={`/author/${author.slug}`}>{author.name}</Link></p>}<p><time dateTime={publishedAt}>{formatEditorialDate(publishedAt)}</time></p><p>{article.readingMinutes} min read</p></div>
    </article>;
  })}</div>;
}
