import Link from "next/link";
import type { CategorySubnavItem } from "@/types";
import { PageContainer } from "@/components/layout/page-container";

export function CategorySubnav({ label, items }: { label:string; items:readonly CategorySubnavItem[] }) {
  return <div className="border-b border-border bg-surface">
    <PageContainer width="standard"><nav aria-label={`${label} sections`} className="overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <ul className="flex min-w-max items-center gap-7 pr-5 sm:gap-9">{items.map((item) => <li key={item.href}><Link aria-current={item.active ? "page" : undefined} className={`relative flex min-h-12 items-center whitespace-nowrap text-xs font-bold uppercase tracking-[.08em] transition-colors hover:text-accent ${item.active ? "text-accent after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-accent" : "text-muted"}`} href={item.href}>{item.label}</Link></li>)}</ul>
    </nav></PageContainer>
  </div>;
}
