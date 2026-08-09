export type NavLink = { label: string; href: string };
export type MegaMenuConfig = {
  links: readonly NavLink[];
  featuredArticleId: string;
  latestArticleIds: readonly string[];
  promo: { eyebrow: string; title: string; href: string; action: string };
};
export type NavItem = NavLink & { shortLabel?: string; megaMenu?: MegaMenuConfig };

const editorialPromo = {
  eyebrow: "The Quarterly",
  title: "The New Public Square",
  href: "/magazine/the-new-public-square",
  action: "Explore the issue",
} as const;

export const siteConfig = {
  name: "The Perspective",
  shortName: "TP",
  description: "Independent ideas, reporting, and culture for a wider point of view.",
  url: "https://theperspective.example",
  email: "editorial@theperspective.example",
  edition: "India Edition",
  utilityLinks: [{ label: "News", href: "/news" }, { label: "Newsletters", href: "/newsletters" }, { label: "Podcasts", href: "/podcasts" }],
  navigation: [
    { label: "Home", href: "/" },
    { label: "Latest", href: "/latest" },
    { label: "Business", href: "/business", megaMenu: { links: [{ label: "Latest Business", href: "/business" }, { label: "Companies", href: "/business/companies" }, { label: "Economy", href: "/business/economy" }, { label: "Entrepreneurship", href: "/business/entrepreneurship" }, { label: "Startups", href: "/business/startups" }, { label: "Global Business", href: "/business/global" }], featuredArticleId: "article-companies-growth-cycle", latestArticleIds: ["article-global-companies-reassess", "article-industrial-investment-strategy", "article-private-markets-financing"], promo: editorialPromo } },
    { label: "Leadership", shortLabel: "Lead", href: "/leadership", megaMenu: { links: [{ label: "Latest Leadership", href: "/leadership" }, { label: "CEOs", href: "/leadership/ceos" }, { label: "Founders", href: "/leadership/founders" }, { label: "Management", href: "/leadership/management" }, { label: "Boards & Governance", href: "/leadership/boards-governance" }, { label: "Strategy", href: "/leadership/strategy" }, { label: "Future Leaders", href: "/leadership/future-leaders" }], featuredArticleId: "article-new-architecture-global-leadership", latestArticleIds: ["article-boards-succession", "article-leaders-certainty-disappears", "article-executive-communication-discipline"], promo: editorialPromo } },
    { label: "Technology", shortLabel: "Tech", href: "/technology", megaMenu: { links: [{ label: "Latest Technology", href: "/technology" }, { label: "Artificial Intelligence", href: "/technology/ai" }, { label: "Enterprise", href: "/technology/enterprise" }, { label: "Infrastructure", href: "/technology/infrastructure" }, { label: "Cybersecurity", href: "/technology/cybersecurity" }, { label: "Startups", href: "/technology/startups" }, { label: "Future Tech", href: "/technology/future" }], featuredArticleId: "article-ai-infrastructure-race", latestArticleIds: ["article-enterprise-tech-budgets", "article-enterprise-ai-phase", "article-cybersecurity-board-priority"], promo: editorialPromo } },
    { label: "Opinion", shortLabel: "Ideas", href: "/perspective", megaMenu: { links: [{ label: "Latest Perspectives", href: "/perspective" }, { label: "Business & Economy", href: "/perspective/business" }, { label: "Leadership", href: "/perspective/leadership" }, { label: "Technology & Society", href: "/perspective/technology" }, { label: "Markets", href: "/perspective/markets" }, { label: "Culture", href: "/perspective/culture" }, { label: "Global Affairs", href: "/perspective/global-affairs" }], featuredArticleId: "article-opinion-institutions-outlast-founders", latestArticleIds: ["article-opinion-productivity", "article-opinion-fewer-strategic-priorities", "article-opinion-ai-economic-realism"], promo: { eyebrow: "The Perspective Premium", title: "Ideas require more than headlines.", href: "/premium", action: "Explore Premium" } } },
    { label: "Finance", href: "/finance" },
    { label: "Markets", href: "/markets" },
    { label: "Culture", href: "/culture", megaMenu: { links: [{ label: "Latest Culture", href: "/culture" }, { label: "Books", href: "/culture/books" }, { label: "Film", href: "/culture/film" }, { label: "Design", href: "/culture/design" }, { label: "Food", href: "/culture/food" }], featuredArticleId: "article-quiet-city", latestArticleIds: ["article-human-machine", "article-listening-leader", "article-market-memory"], promo: editorialPromo } },
    { label: "Lifestyle", shortLabel: "Life", href: "/lifestyle" },
    { label: "Magazine", shortLabel: "Mag", href: "/magazine" },
  ] satisfies readonly NavItem[],
  footerSections: [
    { title: "Explore", links: [{ label: "Latest", href: "/latest" }, { label: "News", href: "/news" }, { label: "Business", href: "/business" }, { label: "Leadership", href: "/leadership" }, { label: "Technology", href: "/technology" }, { label: "Opinion", href: "/perspective" }, { label: "Finance", href: "/finance" }, { label: "Culture", href: "/culture" }, { label: "Lifestyle", href: "/lifestyle" }] },
    { title: "Magazine", links: [{ label: "Latest Issue", href: "/magazine/latest" }, { label: "Archive", href: "/archive" }, { label: "Digital Reader", href: "/reader" }, { label: "Premium", href: "/premium" }, { label: "Personal Magazines", href: "/personal-magazines" }, { label: "Subscribe", href: "/subscribe" }] },
    { title: "Company", links: [{ label: "About", href: "/about" }, { label: "Editorial Team", href: "/team" }, { label: "Contributors", href: "/contributors" }, { label: "Careers", href: "/careers" }, { label: "Advertise", href: "/advertise" }, { label: "Contact", href: "/contact" }] },
    { title: "Legal", links: [{ label: "Privacy", href: "/privacy" }, { label: "Terms", href: "/terms" }, { label: "Cookies", href: "/cookies" }, { label: "Accessibility", href: "/accessibility" }] },
  ],
  mobileExtras: [{ label: "Premium", href: "/premium" }, { label: "Subscribe", href: "/subscribe" }, { label: "Sign In", href: "/sign-in" }],
  socials: [
    { label: "LinkedIn", href: "https://linkedin.com" }, { label: "Instagram", href: "https://instagram.com" },
    { label: "Facebook", href: "https://facebook.com" }, { label: "X", href: "https://x.com" },
    { label: "YouTube", href: "https://youtube.com" },
  ],
  popularTopics: ["Artificial Intelligence", "Global Markets", "Leadership", "Design", "Climate"],
} as const;
