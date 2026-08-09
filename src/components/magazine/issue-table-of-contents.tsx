import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { ResolvedMagazineIssueSection } from "@/types";
import { EditorialSectionHeader } from "@/components/common/editorial-section-header";

export function IssueTableOfContents({ sections }: { sections: readonly ResolvedMagazineIssueSection[] }) {
  return <section aria-labelledby="explore-issue-heading">
    <EditorialSectionHeader description="A print-inspired table of contents across the desks and ideas inside this edition." id="explore-issue-heading" title="Explore the Issue" />
    <div className="grid gap-x-12 gap-y-12 lg:grid-cols-2">{sections.map((section) => <section aria-labelledby={`issue-section-${section.id}`} className="border-t border-foreground pt-5" key={section.id}><div className="flex items-center justify-between gap-5"><h3 className="eyebrow" id={`issue-section-${section.id}`}>{section.label}</h3><Link className="inline-flex min-h-11 items-center gap-1 text-xs font-bold hover:text-accent" href={section.href}>Explore <ArrowRight aria-hidden="true" className="size-3.5" /></Link></div><ol className="mt-2">{section.articles.map((article, index) => <li className="grid grid-cols-[2.5rem_minmax(0,1fr)] gap-4 border-b border-border py-5" key={article.id}><span className="font-serif text-xl text-accent">{String(index + 1).padStart(2, "0")}</span><div><Link className="font-serif text-xl leading-tight hover:text-accent sm:text-2xl" href={`/article/${article.slug}`}>{article.title}</Link>{article.authors[0] ? <p className="type-meta mt-3 text-muted">By <Link className="hover:text-accent" href={`/author/${article.authors[0].slug}`}>{article.authors[0].name}</Link></p> : null}</div></li>)}</ol></section>)}</div>
  </section>;
}
