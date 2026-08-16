import Link from "next/link";
import type { MagazineIssue } from "@/types";
import { buttonVariants } from "@/components/ui/button";
import { PageContainer } from "@/components/layout/page-container";
import { cn } from "@/lib/utils";
import { MagazineCover } from "./magazine-cover";

function issueDate(issue: MagazineIssue) {
  return new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(issue.publicationDate));
}

export function LatestIssueHero({ issue }: { issue: MagazineIssue }) {
  const readerHref = issue.readerAvailable ? `/magazine/read/${issue.slug}` : "/magazine#digital-reader";
  return <div className="bg-foreground text-white" id="latest-issue"><PageContainer className="section-space-lg" width="standard"><section aria-labelledby="latest-issue-heading" className="grid gap-12 md:grid-cols-[minmax(15rem,.72fr)_minmax(0,1.28fr)] md:items-center lg:gap-20">
    <div className="mx-auto w-[78%] max-w-[30rem] md:w-full"><MagazineCover href={readerHref} issue={issue} priority variant="large" /></div>
    <div><p className="type-meta text-premium">{issueDate(issue)} · Issue {String(issue.issueNumber).padStart(2, "0")} / 2026</p><h2 className="type-display-lg mt-5 max-w-4xl" id="latest-issue-heading">{issue.coverHeadline}</h2><p className="type-deck mt-7 max-w-2xl text-white/65">{issue.description}</p><p className="type-meta mt-6 text-white/55">The Perspective · {issue.pageCount} pages · {issue.theme}</p><div className="mt-9 flex flex-wrap gap-3"><Link className={buttonVariants({ variant: "premium", size: "large" })} href={readerHref}>Read Latest Issue</Link><Link className={cn(buttonVariants({ variant: "outline", size: "large" }), "border-white text-white hover:bg-white hover:text-foreground")} href="/magazine#magazine-contents">Explore Stories</Link></div></div>
  </section></PageContainer></div>;
}
