import Link from "next/link";
import type { MagazineIssue } from "@/types";
import { getArticleById } from "@/data/mock/articles";

function monthName(publicationDate: string) {
  return new Intl.DateTimeFormat("en-US", { month: "long", timeZone: "UTC" }).format(new Date(publicationDate));
}

export function ArchiveYearGroup({ issues, year }: { issues: readonly MagazineIssue[]; year: number }) {
  return <section aria-labelledby={`archive-year-${year}`} className="grid gap-5 lg:grid-cols-[9rem_minmax(0,1fr)]">
    <div><h3 className="font-serif text-4xl" id={`archive-year-${year}`}>{year}</h3><p className="type-meta mt-2 text-muted">{issues.length} {issues.length === 1 ? "issue" : "issues"}</p></div>
    <ol className="border-t-2 border-foreground">{issues.map((issue) => {
      const coverStory = getArticleById(issue.coverStoryArticleId);
      const destination = issue.readerAvailable ? `/magazine/read/${issue.slug}` : coverStory ? `/article/${coverStory.slug}` : "/magazine/archive";
      const state = issue.readerAvailable ? "Digital Reader" : issue.premium ? "Premium" : "Archive";
      return <li className="border-b border-border" key={issue.id}><Link className="grid min-h-20 grid-cols-[5.5rem_minmax(0,1fr)] items-center gap-x-4 gap-y-1 py-4 hover:text-accent sm:grid-cols-[7rem_minmax(0,1fr)_9rem_auto]" href={destination}><time className="type-meta text-muted" dateTime={issue.publicationDate}>{monthName(issue.publicationDate)}</time><span className="font-serif text-xl leading-tight sm:text-2xl">{issue.coverHeadline}</span><span className="type-meta col-start-2 text-muted sm:col-start-auto">{issue.theme}</span><span className="type-meta col-start-2 text-[#76531b] sm:col-start-auto">{state}</span></Link></li>;
    })}</ol>
  </section>;
}
