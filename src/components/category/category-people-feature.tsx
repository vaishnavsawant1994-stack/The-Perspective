import Image from "next/image";
import Link from "next/link";
import type { CategoryPeopleFeatureContent } from "@/types";
import { CategoryLabel } from "@/components/common/category-label";
import { EditorialSectionHeader } from "@/components/common/editorial-section-header";
import { PersonFeature } from "@/components/person/person-feature";

export function CategoryPeopleFeature({ content }: { content: CategoryPeopleFeatureContent }) {
  const headingId = `${content.id}-heading`;

  return <section aria-labelledby={headingId}>
    <EditorialSectionHeader description={content.description} id={headingId} title={content.title} />
    <div className="grid gap-10 xl:grid-cols-[1.45fr_.55fr] xl:gap-12">
      <PersonFeature href={content.featured.href} label={content.featured.label ?? "Featured Interview"} person={content.featured.person} />
      <div className="grid gap-7 border-t border-border pt-7 sm:grid-cols-2 xl:grid-cols-1 xl:border-l xl:border-t-0 xl:pl-8 xl:pt-0">
        {content.supporting.map(({ person, href, label }) => <article className="grid grid-cols-[5.5rem_1fr] gap-4" key={person.id}>
          <Link className="relative aspect-[4/5] overflow-hidden bg-surface-subtle" href={href}>
            {person.portrait && <Image alt={person.portrait.alt} className="object-cover transition-transform duration-500 hover:scale-[1.03]" fill sizes="88px" src={person.portrait.src} />}
          </Link>
          <div className="self-center">
            <CategoryLabel>{label ?? "Interview"}</CategoryLabel>
            <h3 className="mt-2 font-serif text-xl font-bold leading-tight"><Link className="hover:text-accent" href={href}>{person.name}</Link></h3>
            <p className="mt-1 text-xs leading-relaxed text-muted">{person.title}, {person.company}</p>
          </div>
        </article>)}
      </div>
    </div>
  </section>;
}
