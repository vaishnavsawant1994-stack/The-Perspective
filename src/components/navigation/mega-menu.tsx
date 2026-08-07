import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { MegaMenuConfig } from "@/config/site";
import { getArticleById } from "@/data/mock/articles";

export function MegaMenu({ config, label, open, onNavigate }: { config: MegaMenuConfig; label: string; open: boolean; onNavigate: () => void }) {
  const feature = getArticleById(config.featuredArticleId);
  const latest = config.latestArticleIds.map(getArticleById).filter((article) => article !== undefined);
  return <div aria-label={`${label} menu`} className={`absolute inset-x-0 top-full border-y border-border bg-surface shadow-soft transition-editorial ${open ? "visible translate-y-0 opacity-100" : "invisible -translate-y-1 opacity-0"}`}>
    <div className="mx-auto grid max-w-[1680px] grid-cols-[.8fr_1.4fr_1fr_.8fr] gap-10 px-10 py-10 xl:px-12">
      <div><p className="eyebrow mb-5 text-accent">Explore {label}</p><ul className="space-y-3">{config.links.map((link) => <li key={link.href}><Link className="text-sm font-semibold hover:text-accent" href={link.href} onClick={onNavigate}>{link.label}</Link></li>)}</ul></div>
      {feature && <Link className="group grid grid-cols-[.9fr_1fr] gap-5" href={`/${feature.category.slug}/${feature.slug}`} onClick={onNavigate}><div className="editorial-placeholder aspect-[4/3]" aria-hidden="true" /><div><p className="type-meta mb-3 text-accent">Featured</p><h3 className="type-h4 group-hover:text-accent">{feature.title}</h3><p className="mt-3 line-clamp-3 text-sm leading-6 text-muted">{feature.excerpt}</p></div></Link>}
      <div><p className="eyebrow mb-5">Latest</p><div className="divide-y divide-border">{latest.map((article) => <Link className="block py-3 first:pt-0 hover:text-accent" href={`/${article.category.slug}/${article.slug}`} key={article.id} onClick={onNavigate}><span className="type-caption text-muted">{article.readingMinutes} min read</span><h3 className="mt-1 font-serif text-lg leading-tight">{article.title}</h3></Link>)}</div></div>
      <Link className="group flex min-h-48 flex-col justify-between bg-foreground p-6 text-white" href={config.promo.href} onClick={onNavigate}><p className="eyebrow text-premium">{config.promo.eyebrow}</p><div><h3 className="font-serif text-2xl leading-tight">{config.promo.title}</h3><span className="mt-5 flex items-center gap-2 text-xs font-semibold">{config.promo.action}<ArrowUpRight className="size-3.5" /></span></div></Link>
    </div>
  </div>;
}
