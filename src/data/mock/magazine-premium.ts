import type { MagazinePremiumPageConfig } from "@/types";

export const magazinePremiumPageConfig: MagazinePremiumPageConfig = {
  heroIssueId: "issue-global-leaders-special-2026",
  featuredArticleIds: [
    "article-50-leaders",
    "article-new-architecture-global-leadership",
    "article-leaders-certainty-disappears",
    "article-organizational-trust",
    "article-boards-accountability",
    "article-decisions-pressure",
  ],
  voiceArticleIds: [
    "article-interview-elena-rossi",
    "article-opinion-institutions-outlast-founders",
    "article-new-executive-mandate",
  ],
  benefits: [
    { id: "interviews", title: "Deeper interviews", description: "Extended conversations with executives, founders and institution builders." },
    { id: "analysis", title: "Long-form analysis", description: "Ideas developed with the space, reporting and context they require." },
    { id: "special-editions", title: "Special editions", description: "Focused packages built around consequential themes and turning points." },
    { id: "archive", title: "Premium archive", description: "A growing record of editions designed to be kept and returned to." },
    { id: "features", title: "Exclusive features", description: "Original profiles, essays and editorial collections made for Magazine." },
  ],
  themeLinks: [
    { id: "leadership", label: "Leadership", description: "Leaders, institutions and the work of durable influence.", href: "/magazine/category/leadership" },
    { id: "business", label: "Business", description: "Companies, capital and the changing architecture of growth.", href: "/magazine/category/business" },
    { id: "technology", label: "Technology", description: "Systems and ideas reshaping how organizations operate.", href: "/magazine/category/technology" },
    { id: "special-editions", label: "Special Editions", description: "Editorial packages organized around one defining subject.", href: "/magazine/category/special-editions" },
    { id: "founders", label: "Founders", description: "The choices that turn original vision into enduring institutions.", href: "/magazine/archive?q=Founders" },
    { id: "capital", label: "Capital", description: "Long-horizon investment, markets and strategic allocation.", href: "/magazine/archive?q=Capital" },
  ],
  comparison: {
    standard: ["Monthly editorial editions", "Cover stories and curated issue sections", "Selected stories from the Magazine archive"],
    premium: ["Deeper interviews and long-form analysis", "Special issues and exclusive editorial packages", "A distinct Premium archive within Magazine"],
  },
};
