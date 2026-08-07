import Link from "next/link";
import type { MagazineIssue } from "@/types";
import { MagazineCover } from "@/components/magazine/magazine-cover";

export function LatestMagazinePromo({ issue }: { issue:MagazineIssue }) { return <section aria-labelledby="latest-magazine-heading" className="border-t-2 border-foreground pt-4"><p className="eyebrow text-accent">The Magazine</p><h2 className="mt-3 font-serif text-2xl" id="latest-magazine-heading">August 2026</h2><div className="mx-auto mt-6 max-w-[14rem]"><MagazineCover compact issue={issue} /></div><p className="mt-5 font-serif text-xl leading-tight">The Architects of Tomorrow</p><Link className="mt-4 inline-block border-b border-foreground pb-1 text-sm font-bold" href={`/magazine/${issue.slug}`}>Read the Issue →</Link></section>; }
