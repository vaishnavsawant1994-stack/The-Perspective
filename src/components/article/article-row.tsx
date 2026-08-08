import Link from "next/link";
import type { Article } from "@/types";
import { CategoryLabel } from "@/components/common/category-label";
import { formatEditorialTime } from "@/lib/editorial-date";
export function ArticleRow({ article }: { article: Article }) { const publishedAt = article.publishedAt ?? article.updatedAt; return <article className="grid grid-cols-[minmax(0,1fr)_auto] gap-5 border-t border-border py-5"><div className="min-w-0"><CategoryLabel>{article.subcategory ?? article.category.name}</CategoryLabel><h3 className="mt-2 font-serif text-xl leading-tight hover:text-accent sm:text-2xl"><Link href={`/article/${article.slug}`}>{article.title}</Link></h3></div><time className="type-caption whitespace-nowrap pt-1 text-muted" dateTime={publishedAt}>{formatEditorialTime(publishedAt)}</time></article>; }
