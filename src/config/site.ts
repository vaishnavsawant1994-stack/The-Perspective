export type NavItem = { label: string; href: string };

export const siteConfig = {
  name: "The Perspective",
  description: "Independent ideas, reporting, and culture for a wider point of view.",
  url: "https://theperspective.example",
  email: "editorial@theperspective.example",
  navigation: [
    { label: "Latest", href: "/latest" }, { label: "World", href: "/world" },
    { label: "Business", href: "/business" }, { label: "Culture", href: "/culture" },
    { label: "Ideas", href: "/ideas" }, { label: "Magazine", href: "/magazine" },
  ] satisfies NavItem[],
  footerSections: [
    { title: "Explore", links: [{ label: "Archive", href: "/archive" }, { label: "Authors", href: "/authors" }, { label: "Topics", href: "/topics" }] },
    { title: "About", links: [{ label: "Our story", href: "/about" }, { label: "Contact", href: "/contact" }, { label: "Privacy", href: "/privacy" }] },
  ],
  socials: [
    { label: "Instagram", href: "https://instagram.com" },
    { label: "LinkedIn", href: "https://linkedin.com" },
  ],
} as const;
