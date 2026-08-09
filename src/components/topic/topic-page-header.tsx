import Link from "next/link";
import type { Topic } from "@/types";
import { PageContainer } from "@/components/layout/page-container";

export function TopicPageHeader({ topic, coverageCount }: { topic: Topic; coverageCount: number }) {
  return <header className="border-b border-border bg-surface">
    <PageContainer className="pb-12 pt-7 sm:pb-16 sm:pt-9 lg:pb-20" width="standard">
      <nav aria-label="Breadcrumb">
        <ol className="flex flex-wrap items-center gap-2 text-xs font-semibold text-muted">
          <li><Link className="inline-flex min-h-11 items-center hover:text-accent" href="/">Home</Link></li>
          <li aria-hidden="true">/</li>
          <li><Link className="inline-flex min-h-11 items-center hover:text-accent" href="/news">News</Link></li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="text-foreground">{topic.name}</li>
        </ol>
      </nav>
      <div className="mt-9 grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,.48fr)] lg:items-end lg:gap-16">
        <div>
          <p className="eyebrow text-accent">{topic.eyebrow}</p>
          <h1 className="type-display-lg mt-5 max-w-5xl [overflow-wrap:anywhere]">{topic.name}</h1>
        </div>
        <div className="border-t border-foreground pt-5">
          <p className="type-deck max-w-2xl text-muted">{topic.description}</p>
          <p className="type-meta mt-6 text-muted">{coverageCount} {coverageCount === 1 ? "story" : "stories"} in this editorial collection</p>
        </div>
      </div>
    </PageContainer>
  </header>;
}
