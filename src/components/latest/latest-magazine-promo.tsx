import Link from "next/link";
import type { MagazineIssue } from "@/types";
import { MagazineCover } from "@/components/magazine/magazine-cover";

export function LatestMagazinePromo({ issue }: { issue:MagazineIssue }) { return <section aria-labelledby="latest-magazine-heading" className="border-t-2 border-foreground pt-4"><p className="eyebrow text-accent">The Magazine</p><h2 className="mt-3 font-serif text-2xl" id="latest-magazine-heading">Latest Issue</h2><div className="mx-auto mt-6 max-w-[14rem]"><MagazineCover href="/magazine#inside-this-issue" issue={issue} variant="compact" /></div><p className="mt-5 font-serif text-xl leading-tight">{issue.coverHeadline}</p><Link className="mt-4 inline-flex min-h-11 items-center border-b border-foreground text-sm font-bold" href="/magazine#inside-this-issue">Explore the Issue →</Link></section>; }
