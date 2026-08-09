import Link from "next/link";
import type { MagazineIssue } from "@/types";
import { getMagazineIssueArticles } from "@/data/mock/magazines";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { MagazineCover } from "./magazine-cover";

function issueDate(issue: MagazineIssue) {
  return new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(issue.publicationDate));
}

export function MagazineIssueFeature({ issue }: { issue: MagazineIssue }) {
  const stories = getMagazineIssueArticles(issue).slice(0, 4);
  return <div className="grid gap-12 lg:grid-cols-[.72fr_1.28fr] lg:items-center">
    <div className="mx-auto w-full max-w-sm"><MagazineCover href="/magazine#inside-this-issue" issue={issue} /></div>
    <div><p className="type-meta text-premium">Issue {String(issue.issueNumber).padStart(2, "0")} · {issueDate(issue)}</p><h3 className="type-display-lg mt-5 max-w-3xl">{issue.coverHeadline}</h3><p className="type-deck mt-6 max-w-2xl text-white/65">{issue.description}</p><div className="mt-8 flex flex-wrap gap-3"><Link className={buttonVariants({ variant: "premium" })} href="/magazine#inside-this-issue">Explore Stories</Link><Link className={cn(buttonVariants({ variant: "outline" }), "border-white text-white hover:bg-white hover:text-foreground")} href="/magazine">View Magazine</Link><Link className={cn(buttonVariants({ variant: "ghost" }), "text-white hover:bg-white/10")} href="/magazine#archive">Browse Archive</Link></div><div className="mt-10 grid gap-x-8 border-t border-white/20 sm:grid-cols-2">{stories.map((article) => <Link className="border-b border-white/15 py-4 font-serif text-lg hover:text-premium" href={`/article/${article.slug}`} key={article.id}>{article.title}</Link>)}</div></div>
  </div>;
}
