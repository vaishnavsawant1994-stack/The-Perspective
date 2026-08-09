import Link from "next/link";
import { PageContainer } from "@/components/layout/page-container";

export function PremiumPageHeader({ readerHref }: { readerHref: string }) {
  const navigation = [
    { label: "Latest Issue", href: "/magazine" },
    { label: "Digital Reader", href: readerHref },
    { label: "Archive", href: "/magazine/archive" },
    { label: "Premium", href: "/magazine/premium", current: true },
    { label: "Subscribe", href: "/magazine/subscribe" },
  ];

  return <header className="border-b border-foreground bg-surface">
    <PageContainer className="pb-12 pt-7 sm:pb-16 sm:pt-9 lg:pb-20" width="standard">
      <nav aria-label="Breadcrumb" className="type-meta flex items-center gap-2 text-muted"><Link className="hover:text-accent" href="/">Home</Link><span aria-hidden="true">/</span><Link className="hover:text-accent" href="/magazine">Magazine</Link><span aria-hidden="true">/</span><span aria-current="page" className="text-foreground">Premium</span></nav>
      <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1.3fr)_minmax(18rem,.7fr)] lg:items-end">
        <div><p className="eyebrow text-[#76531b]">The Perspective Magazine</p><h1 className="mt-5 font-serif text-[clamp(4rem,11vw,9.5rem)] leading-[.78] tracking-[-.07em]">Premium<br />Editions</h1></div>
        <p className="type-deck max-w-xl text-muted">Deeper interviews, long-form analysis, special issues and exclusive editorial packages—organized as a distinct collection within Magazine.</p>
      </div>
    </PageContainer>
    <PageContainer width="standard"><nav aria-label="Magazine sections" className="flex gap-7 overflow-x-auto border-t border-border py-4 [scrollbar-width:none]">{navigation.map((item) => <Link aria-current={item.current ? "page" : undefined} className={item.current ? "type-meta shrink-0 text-accent" : "type-meta shrink-0 text-muted hover:text-foreground"} href={item.href} key={item.label}>{item.label}</Link>)}</nav></PageContainer>
  </header>;
}
