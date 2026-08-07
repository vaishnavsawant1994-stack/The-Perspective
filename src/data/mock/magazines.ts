import type { Magazine, MagazineIssue } from "@/types";
import { magazineCategories } from "./categories";
export const magazines: Magazine[] = [{ id:"mag-perspective", title:"The Perspective", slug:"the-perspective", description:"Ideas, leaders and stories worth keeping.", category:magazineCategories[0], premium:false }];
export const magazineIssues: MagazineIssue[] = [{ id:"issue-august-2026", magazineId:magazines[0].id, title:"The Architects of Tomorrow", slug:"august-2026", issueNumber:8, publicationDate:"2026-08-01", pageCount:156, status:"published", coverImage:{ src:"/images/articles/global-leadership.png", alt:"The August 2026 issue of The Perspective", width:1536, height:1024 } }];
export const issueStoryTitles = ["The Architects of Tomorrow", "Global 40 Under 40", "The New Capitalists", "Where Innovation Moves Next"];
