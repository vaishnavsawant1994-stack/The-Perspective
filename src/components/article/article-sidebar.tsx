import type { Article, MagazineIssue } from "@/types";
import { RankedStory } from "./ranked-story";
import { NewsletterForm } from "@/components/layout/newsletter-form";
import { LatestMagazinePromo } from "@/components/latest/latest-magazine-promo";

export function ArticleSidebar({ issue, mostRead }: { issue: MagazineIssue; mostRead: readonly Article[] }) {
  return <aside aria-label="More from The Perspective" className="mx-auto w-full max-w-[46rem] space-y-12 xl:max-w-none xl:pt-0"><section aria-labelledby="article-most-read-heading"><h2 className="border-t-2 border-foreground pt-4 text-sm font-extrabold uppercase tracking-[.12em]" id="article-most-read-heading">Most Read</h2><div className="mt-3">{mostRead.map((article,index) => <RankedStory article={article} key={article.id} rank={index+1} />)}</div></section><LatestMagazinePromo issue={issue} /><section aria-labelledby="article-briefing-heading" className="border-t-2 border-foreground bg-surface-subtle p-6"><h2 className="font-serif text-2xl" id="article-briefing-heading">The Perspective Briefing</h2><p className="mt-3 text-sm leading-6 text-muted">Insight worth starting your day with, across business, leadership, technology and global ideas.</p><div className="mt-6"><NewsletterForm buttonLabel="Join the Briefing" label="Email address" theme="light" /></div></section></aside>;
}
