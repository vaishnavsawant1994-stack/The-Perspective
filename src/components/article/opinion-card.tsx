import Link from "next/link";
import type { Article } from "@/types";
import { Avatar } from "@/components/ui/avatar";

export function OpinionCard({ article, compact = false }: { article: Article; compact?: boolean }) {
  const author = article.authors[0];
  const initials = author?.name.split(" ").map((part) => part[0]).join("").slice(0, 2) ?? "TP";

  return <article className="border-t border-border pt-5">
    {author && <div className="flex items-center gap-3"><Avatar alt={author.name} initials={initials} src={author.avatar?.src} /><div><p className="text-sm font-semibold"><Link className="hover:text-accent" href={`/author/${author.slug}`}>{author.name}</Link></p>{author.role && <p className="type-caption text-muted">{author.role}</p>}</div></div>}
    <h3 className={`mt-5 font-serif leading-tight ${compact ? "text-xl" : "text-2xl"}`}><Link className="hover:text-accent" href={`/article/${article.slug}`}>{article.title}</Link></h3>
    {!compact && <p className="mt-4 text-sm leading-6 text-muted">{article.excerpt}</p>}
  </article>;
}
