import Link from "next/link";
import { siteConfig } from "@/config/site";
import { PageContainer } from "./page-container";

export function SiteFooter() {
  return <footer className="border-t border-border bg-foreground py-12 text-white sm:py-16"><PageContainer><div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4"><div className="lg:col-span-2"><Link className="font-serif text-2xl" href="/">THE PERSPECTIVE</Link><p className="mt-4 max-w-md text-sm leading-6 text-white/65">{siteConfig.description}</p></div>{siteConfig.footerSections.map((section) => <nav aria-label={`${section.title} links`} key={section.title}><h2 className="eyebrow mb-4 text-white/50">{section.title}</h2><ul className="space-y-3 text-sm">{section.links.map((link) => <li key={link.href}><Link className="hover:text-white/70" href={link.href}>{link.label}</Link></li>)}</ul></nav>)}</div><div className="mt-12 flex flex-col gap-4 border-t border-white/15 pt-6 text-xs text-white/50 sm:flex-row sm:items-center sm:justify-between"><p>© {new Date().getFullYear()} {siteConfig.name}</p><div className="flex gap-5">{siteConfig.socials.map((social) => <a key={social.label} href={social.href} rel="noreferrer" target="_blank">{social.label}<span className="sr-only"> (opens in a new tab)</span></a>)}</div></div></PageContainer></footer>;
}
