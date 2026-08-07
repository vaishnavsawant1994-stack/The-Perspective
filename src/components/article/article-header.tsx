import Link from "next/link";
import type { ArticleDetail } from "@/types";
import { CategoryLabel } from "@/components/common/category-label";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { formatEditorialDate, formatEditorialTime } from "@/lib/editorial-date";

export function ArticleHeader({ article }: { article: ArticleDetail }) {
  const author = article.authors[0]; const publishedAt = article.publishedAt ?? article.updatedAt; const wasUpdated = article.updatedAt !== publishedAt;
  const initials = author?.name.split(" ").map((part) => part[0]).join("") ?? "TP";
  return <header className="mx-auto w-full max-w-[1360px] px-4 pb-10 pt-8 xs:px-5 sm:px-8 sm:pb-14 sm:pt-12 lg:px-10 xl:px-12 xl:pt-16">
    <nav aria-label="Breadcrumb" className="mb-8 overflow-hidden text-xs text-muted"><ol className="flex min-w-0 items-center gap-2 whitespace-nowrap"><li><Link className="hover:text-accent" href="/">Home</Link></li><li aria-hidden="true">/</li><li><Link className="hover:text-accent" href={`/${article.category.slug}`}>{article.category.name}</Link></li><li aria-hidden="true" className="hidden sm:list-item">/</li><li aria-current="page" className="hidden min-w-0 overflow-hidden text-ellipsis sm:list-item">{article.title}</li></ol></nav>
    <div className="flex flex-wrap items-center gap-3"><CategoryLabel>{article.articleType === "opinion" ? "Opinion" : article.category.name}</CategoryLabel>{article.breaking && <Badge className="border-accent bg-accent text-white">Breaking</Badge>}{article.premium && <Badge className="border-[#76551f] text-[#76551f]">Premium</Badge>}{article.articleType === "analysis" && <Badge>Analysis</Badge>}</div>
    <h1 className="mt-6 max-w-[65rem] font-serif text-[clamp(2.8rem,7.5vw,6.8rem)] leading-[.9] tracking-[-.055em]">{article.title}</h1>
    <p className="mt-7 max-w-[52rem] font-serif text-[clamp(1.3rem,2.4vw,2rem)] leading-[1.35] text-muted">{article.dek ?? article.excerpt}</p>
    <div className="mt-8 flex flex-col gap-5 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-center gap-3"><Avatar alt={author?.name ?? "The Perspective newsroom"} initials={initials} src={author?.avatar?.src} /><div><p className="text-sm font-bold">By {author ? <Link className="hover:text-accent" href={`/author/${author.slug}`}>{author.name}</Link> : "The Perspective newsroom"}</p>{author?.role && <p className="mt-1 text-xs text-muted">{author.role}</p>}</div></div><div className="text-xs leading-5 text-muted sm:text-right"><p><time dateTime={publishedAt}>{formatEditorialDate(publishedAt)} · {formatEditorialTime(publishedAt)}</time> · {article.readingMinutes} min read</p>{wasUpdated && <p><span>Updated </span><time dateTime={article.updatedAt}>{formatEditorialDate(article.updatedAt)}, {formatEditorialTime(article.updatedAt)}</time></p>}</div></div>
  </header>;
}
