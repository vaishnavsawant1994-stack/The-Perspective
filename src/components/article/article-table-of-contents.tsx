import type { ArticleContentBlock } from "@/types";
import { getArticleTableOfContents } from "@/lib/article-content";

export function ArticleTableOfContents({ content }: { content: readonly ArticleContentBlock[] }) {
  const headings = getArticleTableOfContents(content); if (headings.length < 3) return null;
  return <nav aria-label="In this story" className="border-t border-foreground pt-4"><p className="eyebrow">In this story</p><ol className="mt-4 space-y-3 text-sm leading-5 text-muted">{headings.map((heading,index) => <li key={heading.id}><a className="group flex gap-3 hover:text-accent" href={`#${heading.id}`}><span aria-hidden="true" className="text-accent">{String(index+1).padStart(2,"0")}</span><span className="border-b border-transparent group-hover:border-accent">{heading.text}</span></a></li>)}</ol></nav>;
}
