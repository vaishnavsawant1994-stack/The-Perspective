import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Topic } from "@/types";
import { EditorialSectionHeader } from "@/components/common/editorial-section-header";

export function RelatedTopics({ topics }: { topics: readonly Topic[] }) {
  if (topics.length === 0) return null;
  return <section aria-labelledby="related-topics-heading">
    <EditorialSectionHeader description="Continue through adjacent subjects covered across The Perspective." id="related-topics-heading" title="Related Topics" />
    <div className="grid border-b border-border sm:grid-cols-2 xl:grid-cols-4">
      {topics.map((topic, index) => <article className={`border-t border-border py-6 sm:px-6 ${index % 2 === 0 ? "sm:border-r" : ""} xl:border-r xl:first:pl-0 xl:last:border-r-0 xl:last:pr-0`} key={topic.id}>
        <h3 className="font-serif text-2xl leading-tight"><Link className="hover:text-accent" href={`/topic/${topic.slug}`}>{topic.name}</Link></h3>
        <p className="mt-3 text-sm leading-6 text-muted">{topic.shortDescription}</p>
        <Link className="mt-5 inline-flex min-h-11 items-center gap-2 text-sm font-bold hover:text-accent" href={`/topic/${topic.slug}`}>Explore topic <ArrowRight aria-hidden="true" className="size-4" /></Link>
      </article>)}
    </div>
  </section>;
}
