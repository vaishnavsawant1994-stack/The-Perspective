import Link from "next/link";
import { ArrowRight, BookOpen, Crown } from "lucide-react";
import type { MagazineArchiveIssue } from "@/types";
import { formatMagazineIssueDate } from "@/lib/magazine-issue-date";
import { MagazineCover } from "@/components/magazine/magazine-cover";

export function ArchiveIssueCard({ archiveIssue, latestIssueId }: { archiveIssue: MagazineArchiveIssue; latestIssueId: string }) {
  const { issue, stories } = archiveIssue;
  const readerHref = issue.readerAvailable ? `/magazine/read/${issue.slug}` : undefined;
  const primaryLabel = issue.id === latestIssueId ? "Latest Issue" : issue.premium ? "Premium Edition" : issue.readerAvailable ? "Digital Reader" : null;

  return <li className="[contain-intrinsic-size:1px_900px] [content-visibility:auto]"><article aria-labelledby={`archive-issue-${issue.id}`} className="flex h-full flex-col border-t-2 border-foreground pt-5">
    <div className="mx-auto w-full max-w-[26rem]"><MagazineCover href={readerHref} issue={issue} variant="standard" /></div>
    <div className="flex flex-1 flex-col pt-6">
      <div className="flex min-h-6 flex-wrap items-center justify-between gap-2"><p className="type-meta text-accent">{formatMagazineIssueDate(issue.publicationDate)} · Issue {String(issue.issueNumber).padStart(2, "0")}</p>{primaryLabel ? <p className="inline-flex items-center gap-1.5 text-[.62rem] font-bold uppercase tracking-[.12em] text-[#76531b]">{issue.premium ? <Crown aria-hidden="true" className="size-3.5" /> : issue.readerAvailable ? <BookOpen aria-hidden="true" className="size-3.5" /> : null}{primaryLabel}</p> : null}</div>
      <h3 className="mt-4 font-serif text-3xl leading-[.95] tracking-[-.035em] sm:text-4xl" id={`archive-issue-${issue.id}`}>{issue.coverHeadline}</h3>
      <p className="mt-4 text-sm leading-6 text-muted">{issue.description}</p>
      <p className="type-meta mt-5 text-muted">{issue.theme} · {issue.pageCount} pages</p>
      <p className="mt-3 text-xs font-semibold text-muted">{issue.readerAvailable ? "Available in the Digital Reader" : issue.premium ? "Premium status is editorial metadata; access controls are not yet active" : "Selected stories available below"}</p>
      <div className="mt-6 border-t border-border"><p className="type-meta py-3 text-muted">Explore stories</p><ul>{stories.slice(0, 2).map((story) => <li className="border-t border-border" key={story.id}><Link className="group flex min-h-14 items-center justify-between gap-4 py-3 font-serif text-lg leading-tight hover:text-accent" href={`/article/${story.slug}`}><span>{story.title}</span><ArrowRight aria-hidden="true" className="size-4 shrink-0 transition-transform group-hover:translate-x-1" /></Link></li>)}</ul></div>
      <div className="mt-auto flex flex-wrap gap-3 pt-6">{readerHref ? <Link className="inline-flex min-h-11 items-center gap-2 bg-foreground px-5 text-sm font-bold text-white hover:bg-accent" href={readerHref}>Read Digital Issue <ArrowRight aria-hidden="true" className="size-4" /></Link> : null}{issue.premium ? <Link className="inline-flex min-h-11 items-center border border-foreground px-5 text-sm font-bold hover:bg-foreground hover:text-white" href="/magazine/premium">Explore Premium</Link> : null}</div>
    </div>
  </article></li>;
}
