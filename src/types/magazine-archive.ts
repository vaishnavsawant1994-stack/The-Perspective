import type { Article, MagazineIssue } from "./content";

export type MagazineArchiveFilter = "all" | "reader" | "premium";

export type MagazineArchiveState = {
  query: string;
  year?: number;
  type: MagazineArchiveFilter;
};

export type MagazineArchiveIssue = {
  issue: MagazineIssue;
  stories: readonly Article[];
};

export type MagazineArchiveCounts = {
  all: number;
  reader: number;
  premium: number;
  byYear: Readonly<Record<number, number>>;
};
