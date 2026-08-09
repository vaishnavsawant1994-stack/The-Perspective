import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { NewsTopicCluster } from "@/types";

export function TopicCluster({ topic }: { topic: NewsTopicCluster }) {
  return <article className="border-t border-foreground py-6 sm:py-7">
    <h3 className="font-serif text-2xl leading-tight sm:text-3xl"><Link className="hover:text-accent" href={topic.href}>{topic.label}</Link></h3>
    <p className="mt-3 max-w-xl text-sm leading-6 text-muted">{topic.description}</p>
    <ul className="mt-5 divide-y divide-border">{topic.articles.map((article) => <li key={article.id}><Link className="flex min-h-12 items-center py-2 font-serif text-lg leading-tight hover:text-accent" href={`/article/${article.slug}`}>{article.title}</Link></li>)}</ul>
    <Link className="mt-5 inline-flex min-h-11 items-center gap-2 border-b border-foreground text-sm font-bold hover:text-accent" href={topic.href}>Explore {topic.label} <ArrowRight aria-hidden="true" className="size-4" /></Link>
  </article>;
}
