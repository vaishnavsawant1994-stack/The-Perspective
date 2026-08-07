import type { MagazineIssue } from "@/types";
import { MagazineIssueFeature } from "@/components/magazine/magazine-issue-feature";
import { PageContainer } from "@/components/layout/page-container";
export function MagazineSpotlight({ issue }: { issue:MagazineIssue }) { return <div className="bg-foreground text-white"><PageContainer className="section-space-lg"><section aria-labelledby="magazine-heading"><header className="mb-12 border-t-2 border-white pt-4"><h2 className="text-sm font-extrabold uppercase tracking-[.12em]" id="magazine-heading">The Magazine</h2><p className="mt-3 font-serif text-xl text-white/55">Ideas, leaders and stories worth keeping.</p></header><MagazineIssueFeature issue={issue} /></section></PageContainer></div>; }
