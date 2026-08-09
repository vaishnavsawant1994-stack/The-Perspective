import Link from "next/link";
import { PageContainer } from "@/components/layout/page-container";

export function MagazinePageHeader({ readerHref }: { readerHref: string }) {
  const magazineNavigation = [
    { label: "Latest Issue", href: "/magazine#latest-issue" },
    { label: "Digital Reader", href: readerHref },
    { label: "Archive", href: "/magazine#archive" },
    { label: "Premium", href: "/magazine#premium" },
    { label: "Personal Magazines", href: "/magazine#personal-magazines" },
    { label: "Subscribe", href: "/magazine#subscribe" },
  ];
  return <header className="border-b border-foreground bg-surface">
    <PageContainer className="pb-12 pt-7 sm:pb-16 sm:pt-9 lg:pb-20" width="standard">
      <nav aria-label="Breadcrumb"><ol className="flex items-center gap-2 text-xs font-semibold text-muted"><li><Link className="inline-flex min-h-11 items-center hover:text-accent" href="/">Home</Link></li><li aria-hidden="true">/</li><li aria-current="page" className="text-foreground">Magazine</li></ol></nav>
      <div className="mt-9 grid gap-10 lg:grid-cols-[minmax(0,1.25fr)_minmax(18rem,.75fr)] lg:items-end lg:gap-16">
        <div><p className="eyebrow text-accent">The Magazine</p><h1 className="type-display-lg mt-5 max-w-5xl">The Perspective Magazine</h1></div>
        <div className="border-t border-foreground pt-5"><p className="type-deck text-muted">A curated collection of ideas, leaders and stories designed to be read, kept and returned to.</p><p className="mt-5 text-sm leading-6 text-muted">Each issue brings together original reporting, interviews, essays and perspectives around the people and forces shaping tomorrow.</p></div>
      </div>
    </PageContainer>
    <nav aria-label="Magazine sections" className="border-t border-border"><PageContainer width="standard"><ul className="flex overflow-x-auto [scrollbar-width:thin]">{magazineNavigation.map((item, index) => <li className={index === 0 ? "border-l border-border" : ""} key={item.href}><Link className="inline-flex min-h-12 whitespace-nowrap border-r border-border px-4 py-3 text-xs font-bold uppercase tracking-[.08em] hover:bg-surface-subtle hover:text-accent sm:px-5" href={item.href}>{item.label}</Link></li>)}</ul></PageContainer></nav>
  </header>;
}
