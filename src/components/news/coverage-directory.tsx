import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { NewsCoverageDestination } from "@/types";
import { EditorialSectionHeader } from "@/components/common/editorial-section-header";

export function CoverageDirectory({ destinations }: { destinations: readonly NewsCoverageDestination[] }) {
  return <section aria-labelledby="news-coverage-heading">
    <EditorialSectionHeader description="The Perspective's principal desks and editorial viewpoints." id="news-coverage-heading" title="Around The Perspective" />
    <div className="grid gap-px bg-border md:grid-cols-2">{destinations.map((destination) => <article className="flex min-h-52 flex-col justify-between bg-background p-6 sm:p-8" key={destination.href}><div><p className="eyebrow text-accent">Coverage</p><h3 className="mt-4 font-serif text-3xl">{destination.label}</h3><p className="mt-4 max-w-md text-sm leading-6 text-muted">{destination.description}</p></div><Link className="mt-7 inline-flex min-h-11 w-fit items-center gap-2 border-b border-foreground text-sm font-bold hover:text-accent" href={destination.href}>Explore {destination.label} <ArrowRight aria-hidden="true" className="size-4" /></Link></article>)}</div>
  </section>;
}
