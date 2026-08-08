import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Article } from "@/types";
import { ArticleRow } from "@/components/article/article-row";
import { EditorialSectionHeader } from "@/components/common/editorial-section-header";

export function CategoryLatest({ articles, label }: { articles:readonly Article[]; label:string }) {
  if (!articles.length) return null;
  const headingId = `latest-${label.toLowerCase()}-heading`;
  return <section aria-labelledby={headingId}><EditorialSectionHeader description={`The newest reporting from The Perspective ${label.toLowerCase()} desk.`} id={headingId} title={`Latest ${label}`} /><div>{articles.map((article) => <ArticleRow article={article} key={article.id} />)}</div><Link className="mt-7 inline-flex items-center gap-2 border-b border-foreground pb-1 text-sm font-bold hover:text-accent" href="/latest">View All Business News <ArrowRight className="size-4" /></Link></section>;
}
