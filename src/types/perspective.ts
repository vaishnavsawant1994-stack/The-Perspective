import type { Article, Author } from "./content";
import type { CategoryPromotion, CategorySubnavItem } from "./category";

export type PerspectiveColumnist = {
  author: Author;
  latestArticle: Article;
};

export type PerspectiveSection = {
  id: string;
  title: string;
  feature: Article;
  supporting: readonly Article[];
};

export type PerspectiveArgument = {
  label: "Point" | "Counterpoint";
  article: Article;
  summary: string;
};

export type PerspectiveContent = {
  label: string;
  title: string;
  description: string;
  supportingLine: string;
  topics: readonly CategorySubnavItem[];
  lead: { primary: Article; supporting: readonly Article[] };
  featuredColumnists: readonly PerspectiveColumnist[];
  todayArguments: readonly Article[];
  sections: readonly PerspectiveSection[];
  bigEssay: Article;
  debate: { topic: string; point: PerspectiveArgument; counterpoint: PerspectiveArgument };
  contributorSpotlight: PerspectiveColumnist;
  mostRead: readonly Article[];
  latest: readonly Article[];
  promotion: CategoryPromotion;
  newsletter: { eyebrow: string; title: string; description: string };
};
