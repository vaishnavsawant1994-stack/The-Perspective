"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import type { NavItem } from "@/config/site";
import { IconButton } from "@/components/ui/icon-button";

export function MobileNavigation({ items }: { items: readonly NavItem[] }) {
  const [open, setOpen] = useState(false);
  return <div className="lg:hidden">
    <IconButton aria-label={open ? "Close navigation" : "Open navigation"} aria-expanded={open} aria-controls="mobile-navigation" onClick={() => setOpen((value) => !value)}>{open ? <X /> : <Menu />}</IconButton>
    {open && <nav id="mobile-navigation" aria-label="Mobile primary" className="absolute inset-x-0 top-full border-b border-border bg-background px-5 py-6 shadow-soft"><ul className="grid gap-1">{items.map((item) => <li key={item.href}><Link onClick={() => setOpen(false)} className="block border-b border-border py-3 font-serif text-2xl" href={item.href}>{item.label}</Link></li>)}</ul></nav>}
  </div>;
}
