import Image from "next/image";
import Link from "next/link";
import type { PerspectiveContent } from "@/types";
import { CategoryLabel } from "@/components/common/category-label";
import { OpinionCard } from "@/components/article/opinion-card";

export function PerspectiveLead({ lead }: { lead: PerspectiveContent["lead"] }) {
  const primaryAuthor = lead.primary.authors[0];
  return <section aria-labelledby="perspective-lead-heading" className="grid gap-12 border-y border-foreground py-8 lg:grid-cols-[1.35fr_.65fr] lg:gap-14 lg:py-12">
    <article className="group">
      {lead.primary.heroImage && <Link className="relative block aspect-[16/9] overflow-hidden bg-surface-subtle" href={`/article/${lead.primary.slug}`}><Image alt={lead.primary.heroImage.alt} className="object-cover grayscale-[20%] transition-transform duration-500 group-hover:scale-[1.015]" fill priority sizes="(max-width: 1024px) 100vw, 60vw" src={lead.primary.heroImage.src} /></Link>}
      <CategoryLabel className="mt-6">Opinion</CategoryLabel>
      <h2 className="type-h1 mt-4 max-w-5xl" id="perspective-lead-heading"><Link className="decoration-accent decoration-2 underline-offset-8 group-hover:underline" href={`/article/${lead.primary.slug}`}>{lead.primary.title}</Link></h2>
      <p className="type-deck mt-5 max-w-3xl text-muted">{lead.primary.dek ?? lead.primary.excerpt}</p>
      {primaryAuthor && <p className="mt-6 text-sm font-semibold">By <Link className="underline decoration-border-dark underline-offset-2 hover:text-accent" href={`/author/${primaryAuthor.slug}`}>{primaryAuthor.name}</Link>{primaryAuthor.role && <span className="font-normal text-muted"> · {primaryAuthor.role}</span>}</p>}
    </article>
    <div className="space-y-9">{lead.supporting.map((article) => <OpinionCard article={article} key={article.id} />)}</div>
  </section>;
}
