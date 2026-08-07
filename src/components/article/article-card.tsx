import Image from "next/image";
import Link from "next/link";
import type { Article } from "@/types";
import { CategoryLabel } from "@/components/common/category-label";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type ArticleCardVariant = "feature" | "standard" | "horizontal" | "compact";
export function ArticleCard({ article, variant = "standard", priority = false, className }: { article: Article; variant?: ArticleCardVariant; priority?: boolean; className?: string }) {
  const href = `/article/${article.slug}`; const horizontal = variant === "horizontal"; const compact = variant === "compact";
  return <article className={cn("group", horizontal && "grid grid-cols-[minmax(0,1fr)_7rem] gap-4 sm:grid-cols-[minmax(0,1fr)_10rem]", className)}>
    {!compact && article.heroImage && <Link aria-label={article.title} className={cn("relative block overflow-hidden bg-surface-subtle", horizontal ? "order-2 aspect-[4/3]" : variant === "feature" ? "aspect-[16/10]" : "aspect-[4/3]")} href={href}><Image alt={article.heroImage.alt} className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.025]" fill priority={priority} sizes={horizontal ? "(max-width: 768px) 112px, 160px" : variant === "feature" ? "(max-width: 1024px) 100vw, 55vw" : "(max-width: 768px) 100vw, 33vw"} src={article.heroImage.src} /></Link>}
    <div className={cn(horizontal && "order-1", !compact && !horizontal && "pt-5")}><div className="flex flex-wrap items-center gap-3"><CategoryLabel>{article.category.name}</CategoryLabel>{article.premium && <Badge className="border-premium text-premium">Premium</Badge>}</div><h3 className={cn("mt-3 font-serif leading-[1.08] tracking-[-.025em] decoration-accent decoration-1 underline-offset-4 group-hover:underline", variant === "feature" ? "text-[clamp(1.8rem,3vw,3.4rem)]" : horizontal ? "text-xl sm:text-2xl" : compact ? "text-xl" : "text-[clamp(1.45rem,2vw,2rem)]")}><Link href={href}>{article.title}</Link></h3>{!compact && !horizontal && <p className="mt-3 text-sm leading-6 text-muted">{article.excerpt}</p>}{variant === "feature" && <p className="mt-5 type-meta text-muted">By {article.authors[0]?.name} · {article.readingMinutes} min read</p>}</div>
  </article>;
}
