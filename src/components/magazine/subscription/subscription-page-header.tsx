import Link from "next/link";
import { PageContainer } from "@/components/layout/page-container";

export function SubscriptionPageHeader({ readerHref }: { readerHref: string }) {
  const navigation = [
    { label: "Magazine", href: "/magazine" },
    { label: "Premium", href: "/magazine/premium" },
    { label: "Archive", href: "/magazine/archive" },
    { label: "Digital Reader", href: readerHref },
    { label: "Subscribe", href: "/magazine/subscribe", current: true },
  ];

  return <header className="border-b border-foreground bg-surface">
    <PageContainer className="pb-12 pt-7 sm:pb-16 sm:pt-9 lg:pb-20" width="standard">
      <nav aria-label="Breadcrumb" className="type-meta flex items-center gap-2 text-muted"><Link className="hover:text-accent" href="/">Home</Link><span aria-hidden="true">/</span><Link className="hover:text-accent" href="/magazine">Magazine</Link><span aria-hidden="true">/</span><span aria-current="page" className="text-foreground">Subscribe</span></nav>
      <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(18rem,.65fr)] lg:items-end">
        <div><p className="eyebrow text-accent">Subscribe</p><h1 className="mt-5 max-w-5xl font-serif text-[clamp(3.6rem,9vw,8.4rem)] leading-[.82] tracking-[-.065em]">Choose How You Read The Perspective</h1></div>
        <div><p className="type-deck text-muted">From daily editorial coverage to complete digital Magazine and Premium access, choose the experience that fits how deeply you want to read.</p><p className="mt-5 font-serif text-xl">Thoughtful journalism. Complete issues. Deeper editions.</p></div>
      </div>
    </PageContainer>
    <PageContainer width="standard"><nav aria-label="Magazine sections" className="flex gap-7 overflow-x-auto border-t border-border py-4 [scrollbar-width:none]">{navigation.map((item) => <Link aria-current={item.current ? "page" : undefined} className={item.current ? "type-meta shrink-0 text-accent" : "type-meta shrink-0 text-muted hover:text-foreground"} href={item.href} key={item.label}>{item.label}</Link>)}</nav></PageContainer>
  </header>;
}
