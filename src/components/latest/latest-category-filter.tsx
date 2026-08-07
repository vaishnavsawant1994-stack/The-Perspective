"use client";

import type { LatestFilterCategory } from "@/data/mock/latest";
import { cn } from "@/lib/utils";

export function LatestCategoryFilter({ categories, active, onChange }: { categories:readonly LatestFilterCategory[]; active:LatestFilterCategory; onChange:(category:LatestFilterCategory)=>void }) {
  return <div className="sticky top-0 z-30 border-y border-border bg-background/95 backdrop-blur-sm lg:top-14"><div aria-label="Filter latest stories by category" className="mx-auto flex max-w-[1360px] snap-x gap-1 overflow-x-auto px-4 [scrollbar-width:none] xs:px-5 sm:px-8 lg:px-10 xl:px-12 [&::-webkit-scrollbar]:hidden" role="toolbar">{categories.map((category) => <button aria-pressed={active === category} className={cn("min-h-12 shrink-0 snap-start border-b-2 border-transparent px-3 text-xs font-bold uppercase tracking-[.09em] text-muted transition-colors hover:text-foreground", active === category && "border-accent text-accent")} key={category} onClick={() => onChange(category)}>{category}</button>)}</div></div>;
}
