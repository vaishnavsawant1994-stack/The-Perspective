import Link from "next/link";
import type { Author } from "@/types";
import { Avatar } from "@/components/ui/avatar";

export function AuthorBio({ author }: { author: Author }) {
  const initials = author.name.split(" ").map((part) => part[0]).join("");
  return <section aria-labelledby="author-bio-heading" className="mt-12 border-y border-foreground py-8"><p className="eyebrow text-accent">About the author</p><div className="mt-5 flex items-start gap-5"><Avatar alt={author.name} className="size-16 text-base" initials={initials} src={author.avatar?.src} /><div><h2 className="font-serif text-2xl" id="author-bio-heading"><Link className="hover:text-accent" href={`/author/${author.slug}`}>{author.name}</Link></h2>{author.role && <p className="mt-1 text-xs font-bold uppercase tracking-wide text-muted">{author.role}</p>}<p className="mt-4 max-w-xl text-sm leading-6 text-muted">{author.biography}</p><Link className="mt-4 inline-block border-b border-foreground pb-1 text-sm font-bold" href={`/author/${author.slug}`}>More from {author.name} →</Link></div></div></section>;
}
