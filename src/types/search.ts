import type { ImageAsset } from "./content";

export type SearchResultType = "article" | "contributor" | "person" | "magazine";
export type SearchFilter = "all" | "articles" | "contributors" | "people" | "magazines";
export type SearchSort = "relevance" | "newest";

type SearchResultBase = {
  id: string;
  type: SearchResultType;
  title: string;
  description: string;
  href?: string;
  image?: ImageAsset;
  score: number;
};

export type ArticleSearchResult = SearchResultBase & {
  type: "article";
  href: string;
  category: string;
  subcategory?: string;
  authorName: string;
  authorSlug: string;
  publishedAt: string;
  readingMinutes: number;
  premium: boolean;
  breaking: boolean;
};

export type ContributorSearchResult = SearchResultBase & {
  type: "contributor";
  href: string;
  role?: string;
  expertise: readonly string[];
};

export type PersonSearchResult = SearchResultBase & {
  type: "person";
  personId: string;
  role?: string;
  company?: string;
  expertise: readonly string[];
  actionLabel?: "Read Interview";
};

export type MagazineSearchResult = SearchResultBase & {
  type: "magazine";
  href: string;
  magazineId: string;
  issueId: string;
  issueLabel: string;
  publicationDate: string;
  featuredStory: string;
};

export type SearchResult = ArticleSearchResult | ContributorSearchResult | PersonSearchResult | MagazineSearchResult;

export type SearchCounts = Record<SearchFilter, number>;
