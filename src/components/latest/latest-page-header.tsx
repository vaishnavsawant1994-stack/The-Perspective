import Link from "next/link";
import { PageContainer } from "@/components/layout/page-container";

export function LatestPageHeader() {
  return <PageContainer className="pb-10 pt-10 sm:pb-14 sm:pt-14 lg:pb-16 lg:pt-20" width="standard">
    <nav aria-label="Breadcrumb"><ol className="flex items-center gap-2 text-xs text-muted"><li><Link className="hover:text-accent" href="/">Home</Link></li><li aria-hidden="true">/</li><li aria-current="page">Latest</li></ol></nav>
    <div className="mt-8 grid gap-8 lg:grid-cols-[1.35fr_.65fr] lg:items-end"><div><p className="eyebrow text-accent">Latest</p><h1 className="type-display-lg mt-4">Latest News</h1></div><div><p className="type-deck text-muted">Breaking developments, reporting, analysis and ideas from The Perspective newsroom.</p><p className="type-meta mt-5 text-muted">Latest updates · August 7, 2026</p></div></div>
  </PageContainer>;
}
