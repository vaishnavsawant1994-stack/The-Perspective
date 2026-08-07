"use client";

import Link from "next/link";
import { ChevronDown, Menu, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { NavItem, NavLink } from "@/config/site";
import { siteConfig } from "@/config/site";
import { IconButton } from "@/components/ui/icon-button";

function MobileNavSection({ item, onNavigate }: { item: NavItem; onNavigate: () => void }) {
  const [expanded, setExpanded] = useState(false); const panelId = `mobile-${item.label.toLowerCase().replaceAll(" ", "-")}`;
  return <li className="border-b border-white/15"><div className="flex items-center justify-between"><Link className="flex-1 py-4 font-serif text-2xl" href={item.href} onClick={onNavigate}>{item.label}</Link>{item.megaMenu && <button aria-controls={panelId} aria-expanded={expanded} aria-label={`Show ${item.label} sections`} className="flex size-12 items-center justify-center" onClick={() => setExpanded((value) => !value)}><ChevronDown className={`size-4 transition-transform ${expanded ? "rotate-180" : ""}`} /></button>}</div>{item.megaMenu && expanded && <ul id={panelId} className="grid grid-cols-2 gap-x-4 gap-y-1 pb-5">{item.megaMenu.links.map((link: NavLink) => <li key={link.href}><Link className="block py-2 text-sm text-white/70" href={link.href} onClick={onNavigate}>{link.label}</Link></li>)}</ul>}</li>;
}

export function MobileNavigation({ items }: { items: readonly NavItem[] }) {
  const [open, setOpen] = useState(false); const triggerRef = useRef<HTMLButtonElement>(null); const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => { if (!open) return; const trigger = triggerRef.current; document.body.dataset.scrollLocked = "true"; closeRef.current?.focus(); const escape = (event: KeyboardEvent) => { if (event.key === "Escape") setOpen(false); }; document.addEventListener("keydown", escape); return () => { delete document.body.dataset.scrollLocked; document.removeEventListener("keydown", escape); trigger?.focus(); }; }, [open]);
  return <>
    <IconButton ref={triggerRef} aria-label="Open navigation" aria-expanded={open} aria-controls="mobile-navigation" className="border-0" onClick={() => setOpen(true)}><Menu /></IconButton>
    {open && <div id="mobile-navigation" role="dialog" aria-modal="true" aria-label="Site navigation" className="fixed inset-0 z-[110] overflow-y-auto bg-foreground text-white"><div className="mx-auto max-w-3xl px-5 pb-12"><div className="sticky top-0 z-10 flex h-17 items-center justify-between border-b border-white/20 bg-foreground"><span className="font-serif text-xl">THE PERSPECTIVE</span><IconButton ref={closeRef} aria-label="Close navigation" className="border-white/25 hover:bg-white/10" onClick={() => setOpen(false)}><X /></IconButton></div><nav aria-label="Mobile primary"><ul>{items.map((item) => <MobileNavSection item={item} key={item.href} onNavigate={() => setOpen(false)} />)}</ul></nav><div className="grid grid-cols-3 gap-2 border-b border-white/20 py-6">{siteConfig.mobileExtras.map((link) => <Link className="text-center text-xs font-bold uppercase tracking-wide text-premium" href={link.href} key={link.href} onClick={() => setOpen(false)}>{link.label}</Link>)}</div><div className="mt-8 flex flex-wrap gap-x-5 gap-y-3 text-xs text-white/60">{siteConfig.socials.map((social) => <a href={social.href} key={social.label} rel="noreferrer" target="_blank">{social.label}</a>)}</div></div></div>}
  </>;
}
