import Link from "next/link";
import type { MagazineCategory } from "@/types";
import { PageContainer } from "@/components/layout/page-container";
import { getMagazineCategoryHref } from "@/lib/magazine-categories";

export function MagazineCategoryHeader({ category, categories, issueCount, storyCount }: { category: MagazineCategory; categories: readonly MagazineCategory[]; issueCount: number; storyCount: number }) {
  return <header className="border-b border-foreground bg-surface">
    <PageContainer className="pb-12 pt-7 sm:pb-16 sm:pt-9 lg:pb-20" width="standard">
      <nav aria-label="Breadcrumb"><ol className="flex flex-wrap items-center gap-2 text-xs font-semibold text-muted"><li><Link className="inline-flex min-h-11 items-center hover:text-accent" href="/">Home</Link></li><li aria-hidden="true">/</li><li><Link className="inline-flex min-h-11 items-center hover:text-accent" href="/magazine">Magazine</Link></li><li aria-hidden="true">/</li><li aria-current="page" className="py-3 text-foreground">{category.name}</li></ol></nav>
      <div className="mt-9 grid gap-10 lg:grid-cols-[minmax(0,1.25fr)_minmax(18rem,.75fr)] lg:items-end lg:gap-16">
        <div><p className="eyebrow text-accent">Magazine Category</p><h1 className="type-display-lg mt-5 max-w-5xl">{category.name}</h1><p className="type-meta mt-7 text-[#76531b]">{issueCount} {issueCount === 1 ? "issue" : "issues"} · {storyCount} {storyCount === 1 ? "story" : "stories"}</p></div>
        <div className="border-t border-foreground pt-5"><p className="type-deck text-muted">{category.description}</p><p className="mt-5 text-sm leading-6 text-muted">{category.supportingLine}</p></div>
      </div>
    </PageContainer>
    <nav aria-label="Magazine categories" className="border-t border-border"><PageContainer width="standard"><ul className="flex overflow-x-auto [scrollbar-width:thin]">{categories.map((item, index) => <li className={index === 0 ? "border-l border-border" : ""} key={item.id}><Link aria-current={item.id === category.id ? "page" : undefined} className="inline-flex min-h-12 whitespace-nowrap border-r border-border px-4 py-3 text-xs font-bold uppercase tracking-[.08em] hover:bg-surface-subtle hover:text-accent aria-[current=page]:bg-foreground aria-[current=page]:text-white sm:px-5" href={getMagazineCategoryHref(item)}>{item.name}</Link></li>)}</ul></PageContainer></nav>
  </header>;
}
