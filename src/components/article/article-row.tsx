import Link from "next/link";
import type { Article } from "@/types";
import { CategoryLabel } from "@/components/common/category-label";
export function ArticleRow({ article }: { article: Article }) { return <article className="grid grid-cols-[1fr_auto] gap-5 border-t border-border py-5"><div><CategoryLabel>{article.category.name}</CategoryLabel><h3 className="mt-2 font-serif text-xl leading-tight hover:text-accent sm:text-2xl"><Link href={`/article/${article.slug}`}>{article.title}</Link></h3></div><time className="type-caption whitespace-nowrap pt-1 text-muted">{article.displayTime}</time></article>; }
