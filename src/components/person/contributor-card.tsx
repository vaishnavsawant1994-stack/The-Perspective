import Link from "next/link";
import type { PerspectiveColumnist } from "@/types";
import { Avatar } from "@/components/ui/avatar";

export function ContributorCard({ columnist }: { columnist: PerspectiveColumnist }) {
  const { author, latestArticle } = columnist;
  const initials = author.name.split(" ").map((part) => part[0]).join("").slice(0, 2);

  return <article className="flex h-full flex-col border-t border-foreground pt-5">
    <div className="flex items-center gap-3"><Avatar alt={author.name} className="size-12" initials={initials} src={author.avatar?.src} /><div><h3 className="font-serif text-xl leading-tight"><Link className="hover:text-accent" href={`/author/${author.slug}`}>{author.name}</Link></h3>{author.role && <p className="mt-1 text-xs font-semibold text-muted">{author.role}</p>}</div></div>
    {author.expertise && author.expertise.length > 0 ? <p className="mt-5 text-sm leading-6 text-muted">{author.expertise.join(", ")}.</p> : null}
    <div className="mt-5 flex-1 border-t border-border pt-4"><p className="type-meta text-muted">Latest</p><Link className="mt-2 block font-serif text-lg leading-tight hover:text-accent" href={`/article/${latestArticle.slug}`}>{latestArticle.title}</Link></div>
    <Link className="mt-5 inline-flex min-h-11 items-center text-sm font-bold hover:text-accent" href={`/author/${author.slug}`}>View Profile →</Link>
  </article>;
}
