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
  utilityLinks: [{ label: "Newsletters", href: "/newsletters" }, { label: "Podcasts", href: "/podcasts" }],
  navigation: [
    { label: "Home", href: "/" },
    { label: "Latest", href: "/latest" },
    { label: "Business", href: "/business", megaMenu: { links: [{ label: "Latest Business", href: "/business" }, { label: "Companies", href: "/business/companies" }, { label: "Economy", href: "/business/economy" }, { label: "Entrepreneurship", href: "/business/entrepreneurship" }, { label: "Startups", href: "/business/startups" }, { label: "Global Business", href: "/business/global" }], featuredArticleId: "article-companies-growth-cycle", latestArticleIds: ["article-global-companies-reassess", "article-industrial-investment-strategy", "article-private-markets-financing"], promo: editorialPromo } },
    { label: "Leadership", shortLabel: "Lead", href: "/leadership", megaMenu: { links: [{ label: "Leadership", href: "/leadership" }, { label: "Profiles", href: "/leadership/profiles" }, { label: "Strategy", href: "/leadership/strategy" }, { label: "Work", href: "/leadership/work" }, { label: "Conversations", href: "/leadership/conversations" }], featuredArticleId: "article-listening-leader", latestArticleIds: ["article-founders-second-act", "article-purpose-capital", "article-market-memory"], promo: editorialPromo } },
    { label: "Technology", shortLabel: "Tech", href: "/technology", megaMenu: { links: [{ label: "Latest Technology", href: "/technology" }, { label: "Artificial Intelligence", href: "/technology/ai" }, { label: "Innovation", href: "/technology/innovation" }, { label: "Science", href: "/technology/science" }, { label: "Future", href: "/technology/future" }], featuredArticleId: "article-human-machine", latestArticleIds: ["article-quiet-city", "article-listening-leader", "article-purpose-capital"], promo: editorialPromo } },
    { label: "Finance", href: "/finance" },
    { label: "Markets", href: "/markets" },
    { label: "Culture", href: "/culture", megaMenu: { links: [{ label: "Latest Culture", href: "/culture" }, { label: "Books", href: "/culture/books" }, { label: "Film", href: "/culture/film" }, { label: "Design", href: "/culture/design" }, { label: "Food", href: "/culture/food" }], featuredArticleId: "article-quiet-city", latestArticleIds: ["article-human-machine", "article-listening-leader", "article-market-memory"], promo: editorialPromo } },
    { label: "Lifestyle", shortLabel: "Life", href: "/lifestyle" },
    { label: "Magazine", shortLabel: "Mag", href: "/magazine" },
  ] satisfies readonly NavItem[],
  footerSections: [
    { title: "Explore", links: [{ label: "Latest", href: "/latest" }, { label: "Business", href: "/business" }, { label: "Leadership", href: "/leadership" }, { label: "Technology", href: "/technology" }, { label: "Finance", href: "/finance" }, { label: "Culture", href: "/culture" }, { label: "Lifestyle", href: "/lifestyle" }] },
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
