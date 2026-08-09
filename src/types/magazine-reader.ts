import type { ImageAsset, MagazineIssue } from "./content";

export type MagazinePageBase = {
  id: string;
  pageNumber: number;
  label: string;
  sectionId?: string;
  includeInContents?: boolean;
};

export type MagazineCoverPage = MagazinePageBase & { type: "cover"; supportingLines: readonly string[] };
export type MagazineContentsPage = MagazinePageBase & { type: "contents"; part: 1 | 2 };
export type MagazineEditorialPage = MagazinePageBase & { type: "editorial"; eyebrow: string; title: string; paragraphs: readonly string[]; signoff: string };
export type MagazineSectionPage = MagazinePageBase & { type: "section"; title: string; description: string; imageArticleId: string };
export type MagazineFeaturePage = MagazinePageBase & { type: "feature"; articleId: string; kicker?: string; introduction?: string };
export type MagazineArticlePage = MagazinePageBase & { type: "article"; articleId: string; heading?: string; paragraphs: readonly string[]; pullQuote?: string; showArticleLink?: boolean };
export type MagazineQuotePage = MagazinePageBase & { type: "quote"; quote: string; attribution: string; articleId?: string };
export type MagazineImagePage = MagazinePageBase & { type: "image"; articleId: string; title: string; caption: string; context: string };
export type MagazineEndPage = MagazinePageBase & { type: "end"; title: string; body: string };

export type MagazinePage =
  | MagazineCoverPage
  | MagazineContentsPage
  | MagazineEditorialPage
  | MagazineSectionPage
  | MagazineFeaturePage
  | MagazineArticlePage
  | MagazineQuotePage
  | MagazineImagePage
  | MagazineEndPage;

export type MagazineReaderIssue = {
  issueId: string;
  pageCount: number;
  pages: readonly MagazinePage[];
};

export type MagazineReaderArticle = {
  id: string;
  slug: string;
  title: string;
  dek?: string;
  excerpt: string;
  category: { id: string; name: string; slug: string };
  authors: readonly { id: string; name: string; slug: string }[];
  heroImage?: ImageAsset;
};

export type ResolvedMagazinePage = MagazinePage & {
  article?: MagazineReaderArticle;
  image?: ImageAsset;
};

export type MagazineReaderContentEntry = {
  id: string;
  label: string;
  pageNumber: number;
  sectionId?: string;
};

export type ResolvedMagazineReaderIssue = {
  issue: MagazineIssue;
  pageCount: number;
  pages: readonly ResolvedMagazinePage[];
  contents: readonly MagazineReaderContentEntry[];
};
