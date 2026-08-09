import Link from "next/link";
import type { Tag } from "@/types";
import { getEditorialDestination } from "@/lib/editorial-destinations";

export function ArticleTags({ tags }: { tags: readonly Tag[] }) {
  return <section aria-labelledby="article-topics-heading" className="mt-12 border-t border-border pt-7"><h2 className="eyebrow" id="article-topics-heading">Topics</h2><div className="mt-4 flex flex-wrap gap-x-5 gap-y-3">{tags.map((tag) => <Link className="border-b border-border pb-1 text-sm font-semibold hover:border-accent hover:text-accent" href={getEditorialDestination(tag.name, tag.slug)} key={tag.id}>{tag.name}</Link>)}</div></section>;
}
