import Link from "next/link";
import { PageContainer } from "@/components/layout/page-container";

export function ArchivePageHeader({ readerHref }: { readerHref: string }) {
  const archiveNavigation: readonly { label: string; href: string; current?: boolean }[] = [
    { label: "Latest Issue", href: "/magazine" },
    { label: "Archive", href: "/magazine/archive", current: true },
    { label: "Digital Reader", href: readerHref },
    { label: "Premium", href: "/magazine/premium" },
    { label: "Subscribe", href: "/magazine#subscribe" },
  ];
  return <header className="border-b border-foreground bg-surface">
    <PageContainer className="pb-12 pt-7 sm:pb-16 sm:pt-9 lg:pb-20" width="standard">
      <nav aria-label="Breadcrumb"><ol className="flex flex-wrap items-center gap-2 text-xs font-semibold text-muted"><li><Link className="inline-flex min-h-11 items-center hover:text-accent" href="/">Home</Link></li><li aria-hidden="true">/</li><li><Link className="inline-flex min-h-11 items-center hover:text-accent" href="/magazine">Magazine</Link></li><li aria-hidden="true">/</li><li aria-current="page" className="py-3 text-foreground">Archive</li></ol></nav>
      <div className="mt-9 grid gap-10 lg:grid-cols-[minmax(0,1.25fr)_minmax(18rem,.75fr)] lg:items-end lg:gap-16">
        <div><p className="eyebrow text-accent">The Archive</p><h1 className="type-display-lg mt-5 max-w-5xl">Magazine Archive</h1></div>
        <div className="border-t border-foreground pt-5"><p className="type-deck text-muted">Explore past issues, cover stories, interviews and special editions from The Perspective.</p><p className="mt-5 text-sm leading-6 text-muted">A growing record of the leaders, companies, technologies and ideas shaping each moment.</p></div>
      </div>
    </PageContainer>
    <nav aria-label="Magazine archive sections" className="border-t border-border"><PageContainer width="standard"><ul className="flex overflow-x-auto [scrollbar-width:thin]">{archiveNavigation.map((item, index) => <li className={index === 0 ? "border-l border-border" : ""} key={item.href}><Link aria-current={item.current ? "page" : undefined} className="inline-flex min-h-12 whitespace-nowrap border-r border-border px-4 py-3 text-xs font-bold uppercase tracking-[.08em] hover:bg-surface-subtle hover:text-accent aria-[current=page]:bg-foreground aria-[current=page]:text-white sm:px-5" href={item.href}>{item.label}</Link></li>)}</ul></PageContainer></nav>
  </header>;
}
