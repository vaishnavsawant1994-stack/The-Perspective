import type { Magazine, MagazineIssue } from "@/types";
import { magazineCategories } from "./categories";
export const magazines: Magazine[] = [{ id: "mag-perspective-quarterly", title: "The Perspective Quarterly", slug: "perspective-quarterly", description: "Long-form reporting, photography, criticism, and new ideas.", category: magazineCategories[0], premium: false }];
export const magazineIssues: MagazineIssue[] = [{ id: "issue-001", magazineId: magazines[0].id, title: "The New Public Square", slug: "the-new-public-square", issueNumber: 1, publicationDate: "2026-09-01", pageCount: 120, status: "scheduled" }];
