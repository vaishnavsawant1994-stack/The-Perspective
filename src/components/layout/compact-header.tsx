"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { siteConfig } from "@/config/site";
import { GlobalSearch } from "@/components/search/global-search";
import { cn } from "@/lib/utils";
import { DesktopNavigation } from "./desktop-navigation";
import { PageContainer } from "./page-container";

export function CompactHeader() {
  const [visible, setVisible] = useState(false);
  useEffect(() => { const update = () => setVisible(window.scrollY > 220); update(); window.addEventListener("scroll", update, { passive: true }); return () => window.removeEventListener("scroll", update); }, []);
  return <div aria-hidden={!visible} inert={!visible} className={cn("fixed inset-x-0 top-0 z-50 hidden border-b border-border bg-background/98 shadow-soft transition-transform duration-200 lg:block", visible ? "translate-y-0" : "pointer-events-none -translate-y-full")}><PageContainer className="grid h-14 grid-cols-[auto_1fr_auto] items-center gap-6"><Link className="font-serif text-lg font-semibold" href="/">THE PERSPECTIVE</Link><DesktopNavigation compact items={siteConfig.navigation} /><div className="flex items-center gap-3"><GlobalSearch compact /><Link className="bg-accent px-3 py-2 text-[.65rem] font-bold uppercase tracking-wide text-white hover:bg-accent-strong" href="/subscribe">Subscribe</Link></div></PageContainer></div>;
}
