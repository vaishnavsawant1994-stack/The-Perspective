import type { Article } from "@/types";
import { authors } from "./authors";
import { articleCategories } from "./categories";
export const articles: Article[] = [{ id: "article-quiet-city", slug: "the-quiet-city", title: "The Quiet City Is Being Rewritten", dek: "A close look at the new rhythms shaping public space.", excerpt: "Across the world, cities are reconsidering what streets are for—and who gets to decide.", status: "published", category: articleCategories[0], authors: [authors[0]], tags: [{ id: "tag-cities", name: "Cities", slug: "cities" }], publishedAt: "2026-08-01T09:00:00.000Z", updatedAt: "2026-08-01T09:00:00.000Z", readingMinutes: 8, featured: true }];
