"use client";

import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { NavItem } from "@/config/site";
import { cn } from "@/lib/utils";
import { MegaMenu } from "@/components/navigation/mega-menu";

export function DesktopNavigation({ items, compact = false }: { items: readonly NavItem[]; compact?: boolean }) {
  const pathname = usePathname();
  const [openHref, setOpenHref] = useState<string | null>(null);
  const rootRef = useRef<HTMLElement>(null);
  useEffect(() => {
    const close = (event: KeyboardEvent | PointerEvent) => {
      if (event instanceof KeyboardEvent && event.key === "Escape") setOpenHref(null);
      if (event instanceof PointerEvent && !rootRef.current?.contains(event.target as Node)) setOpenHref(null);
    };
    document.addEventListener("keydown", close); document.addEventListener("pointerdown", close);
    return () => { document.removeEventListener("keydown", close); document.removeEventListener("pointerdown", close); };
  }, []);

  return <nav ref={rootRef} aria-label={compact ? "Sticky primary" : "Primary"} className="hidden lg:block">
    <ul className={cn("flex items-center justify-center", compact ? "gap-3 xl:gap-5" : "gap-4 xl:gap-7")}>
      {items.map((item) => {
        const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
        const open = openHref === item.href;
        return <li key={item.href} onMouseEnter={() => item.megaMenu && setOpenHref(item.href)}>
          <div className="flex items-center">
            <Link aria-current={active ? "page" : undefined} className={cn("relative py-4 text-[.68rem] font-bold uppercase tracking-[.09em] transition-colors hover:text-accent", active && "text-accent after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-accent")} href={item.href} onFocus={() => item.megaMenu && setOpenHref(item.href)}>{compact && item.shortLabel ? <><span className="xl:hidden">{item.shortLabel}</span><span className="hidden xl:inline">{item.label}</span></> : item.label}</Link>
            {item.megaMenu && <button aria-label={`Open ${item.label} menu`} aria-expanded={open} className="ml-0.5 flex size-7 items-center justify-center" onClick={() => setOpenHref(item.href)}><ChevronDown aria-hidden="true" className={cn("size-3 transition-transform", open && "rotate-180")} /></button>}
          </div>
          {item.megaMenu && <MegaMenu config={item.megaMenu} label={item.label} open={open} onNavigate={() => setOpenHref(null)} />}
        </li>;
      })}
    </ul>
  </nav>;
}
