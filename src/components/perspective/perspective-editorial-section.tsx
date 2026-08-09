import Link from "next/link";
import type { PerspectiveSection } from "@/types";
import { EditorialSectionHeader } from "@/components/common/editorial-section-header";
import { PerspectiveStoryList } from "./perspective-story-list";

export function PerspectiveEditorialSection({ section }: { section: PerspectiveSection }) {
  const author = section.feature.authors[0];
  const headingId = `perspective-${section.id}-heading`;
  return <section aria-labelledby={headingId}>
    <EditorialSectionHeader id={headingId} title={section.title} />
    <div className="grid gap-10 lg:grid-cols-[.8fr_1.2fr] lg:gap-14">
      <article className="border-t border-foreground pt-6"><p className="type-meta text-accent">Featured argument</p><h3 className="type-h3 mt-4"><Link className="hover:text-accent" href={`/article/${section.feature.slug}`}>{section.feature.title}</Link></h3><p className="type-deck mt-5 text-muted">{section.feature.excerpt}</p>{author && <p className="mt-7 text-sm font-semibold">{author.name}{author.role && <span className="font-normal text-muted"> · {author.role}</span>}</p>}</article>
      <PerspectiveStoryList articles={section.supporting} />
    </div>
  </section>;
}
