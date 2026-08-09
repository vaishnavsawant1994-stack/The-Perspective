import type { Article, ImageAsset, PersonProfile } from "./content";

export type PersonalMagazineTheme = {
  id: string;
  label: string;
  href: string;
};

export type PersonalMagazineChapter = {
  id: string;
  number: string;
  label: string;
  title: string;
  description: string;
  body: readonly string[];
  articleId?: string;
};

export type PersonalMagazineMilestone = {
  id: string;
  label: string;
  title: string;
  description: string;
};

export type PersonalMagazinePrinciple = {
  id: string;
  title: string;
  description: string;
};

export type PersonalMagazineGalleryReference = {
  id: string;
  articleId: string;
  caption: string;
};

export type PersonalMagazineHighlight =
  | { kind: "person-quote"; articleId?: string }
  | { kind: "editorial-takeaway"; text: string };

export type PersonalMagazine = {
  id: string;
  slug: string;
  personId: string;
  coverHeadline: string;
  editionLabel: string;
  publicationLabel: string;
  introduction: string;
  editorialOpening: string;
  editorialNarrative: readonly string[];
  themes: readonly PersonalMagazineTheme[];
  interviewArticleId?: string;
  featuredArticleIds: readonly string[];
  relatedArticleIds: readonly string[];
  chapters: readonly PersonalMagazineChapter[];
  milestones: readonly PersonalMagazineMilestone[];
  principles: readonly PersonalMagazinePrinciple[];
  highlight: PersonalMagazineHighlight;
  gallery: readonly PersonalMagazineGalleryReference[];
};

export type ResolvedPersonalMagazineGalleryItem = PersonalMagazineGalleryReference & {
  article: Article;
  image: ImageAsset;
};

export type ResolvedPersonalMagazineSummary = {
  magazine: PersonalMagazine;
  person: PersonProfile;
  coverImage?: ImageAsset;
};

export type ResolvedPersonalMagazineProfile = ResolvedPersonalMagazineSummary & {
  interview?: Article;
  featuredArticles: readonly Article[];
  relatedArticles: readonly Article[];
  gallery: readonly ResolvedPersonalMagazineGalleryItem[];
  relatedProfiles: readonly ResolvedPersonalMagazineSummary[];
};
