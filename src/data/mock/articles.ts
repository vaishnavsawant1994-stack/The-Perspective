import type { Article } from "@/types";
import { authors } from "./authors";
import { articleCategories } from "./categories";

const base = { status: "published" as const, authors: [authors[0]], tags: [], updatedAt: "2026-08-01T09:00:00.000Z", publishedAt: "2026-08-01T09:00:00.000Z" };
export const articles: Article[] = [
  { ...base, id: "article-quiet-city", slug: "the-quiet-city", title: "The Quiet City Is Being Rewritten", dek: "A close look at the new rhythms shaping public space.", excerpt: "Cities are reconsidering what streets are for—and who gets to decide.", category: articleCategories[0], readingMinutes: 8, featured: true },
  { ...base, id: "article-purpose-capital", slug: "capital-with-a-longer-memory", title: "Capital With a Longer Memory", excerpt: "A generation of investors is challenging the tyranny of the quarterly horizon.", category: articleCategories[1], readingMinutes: 11 },
  { ...base, id: "article-market-memory", slug: "what-markets-choose-to-remember", title: "What Markets Choose to Remember", excerpt: "The stories economies tell themselves can matter as much as the numbers.", category: articleCategories[0], readingMinutes: 7 },
  { ...base, id: "article-founders-second-act", slug: "the-founders-second-act", title: "The Founder’s Second Act", excerpt: "After scale comes the harder question: what is the company actually for?", category: articleCategories[1], readingMinutes: 6 },
  { ...base, id: "article-listening-leader", slug: "the-leader-who-listens", title: "The Leader Who Listens Before Speaking", excerpt: "Inside the quiet discipline reshaping high-performing organizations.", category: articleCategories[1], readingMinutes: 9 },
  { ...base, id: "article-human-machine", slug: "the-human-shape-of-machines", title: "The Human Shape of Our Machines", excerpt: "Technology reflects more of its makers than its polished surfaces suggest.", category: articleCategories[0], readingMinutes: 10 },
];

export function getArticleById(id: string) { return articles.find((article) => article.id === id); }
