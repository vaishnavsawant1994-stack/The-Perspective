import type { MagazineIssue } from "@/types";
import { EditorialSectionHeader } from "@/components/common/editorial-section-header";
import { MagazineCover } from "./magazine-cover";

function issueDate(issue: MagazineIssue) {
  return new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(issue.publicationDate));
}

export function PreviousIssues({ issues }: { issues: readonly MagazineIssue[] }) {
  return <section aria-labelledby="previous-issues-heading">
    <EditorialSectionHeader description="Recent editions from the current Perspective Magazine year." id="previous-issues-heading" title="Previous Issues" />
    <div className="grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-4 md:gap-x-7">{issues.map((issue) => <article key={issue.id}><MagazineCover issue={issue} variant="compact" /><p className="type-meta mt-5 text-[#76531b]">{issueDate(issue)}</p><h3 className="mt-2 font-serif text-xl leading-tight sm:text-2xl">{issue.coverHeadline}</h3><p className="mt-3 hidden text-sm leading-6 text-muted sm:block">{issue.description}</p></article>)}</div>
  </section>;
}
