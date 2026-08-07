import Link from "next/link";
import type { NavItem } from "@/config/site";

export function DesktopNavigation({ items }: { items: readonly NavItem[] }) {
  return <nav aria-label="Primary" className="hidden lg:block"><ul className="flex items-center gap-7">{items.map((item) => <li key={item.href}><Link className="text-sm font-medium transition-colors hover:text-accent" href={item.href}>{item.label}</Link></li>)}</ul></nav>;
}
