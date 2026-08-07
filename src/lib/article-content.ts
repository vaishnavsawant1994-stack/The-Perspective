import type { ArticleContentBlock } from "@/types";

export function articleHeadingId(text: string) {
  return text.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export function getArticleTableOfContents(content: readonly ArticleContentBlock[]) {
  return content.flatMap((block) => block.type === "heading" && block.level === 2 ? [{ id: articleHeadingId(block.text), text: block.text }] : []);
}
