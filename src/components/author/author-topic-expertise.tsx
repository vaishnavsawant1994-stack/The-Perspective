import Link from "next/link";
import type { AuthorTopic } from "@/types";
import { EditorialSectionHeader } from "@/components/common/editorial-section-header";

export function AuthorTopicExpertise({ topics }: { topics: readonly AuthorTopic[] }) {
  return <section aria-labelledby="author-topics-heading">
    <EditorialSectionHeader description="The subjects and questions at the center of this contributor’s work." id="author-topics-heading" title="Writes About" />
    <div className="grid border-b border-border sm:grid-cols-2 lg:grid-cols-3">
      {topics.map((topic, index) => <article className={`border-t border-border py-6 sm:px-6 ${index % 2 === 0 ? "sm:border-r" : ""} lg:border-r lg:first:pl-0 lg:last:border-r-0 lg:last:pr-0`} key={topic.slug}>
        <h3 className="font-serif text-2xl"><Link className="hover:text-accent" href={`/topic/${topic.slug}`}>{topic.name}</Link></h3>
        <p className="mt-3 text-sm leading-6 text-muted">{topic.description}</p>
      </article>)}
    </div>
  </section>;
}
