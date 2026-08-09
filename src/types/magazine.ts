import type { Article, Magazine, MagazineIssue, MagazineIssueSection, PersonProfile } from "./content";

export type ResolvedMagazineIssueSection = Omit<MagazineIssueSection, "articleIds"> & {
  articles: readonly Article[];
};

export type MagazineLandingContent = {
  magazine: Magazine;
  latestIssue: MagazineIssue;
  coverStory: Article;
  issueHighlights: readonly Article[];
  issueSections: readonly ResolvedMagazineIssueSection[];
  previousIssues: readonly MagazineIssue[];
  premiumIssue: MagazineIssue;
  personalMagazineProfiles: readonly PersonProfile[];
};
