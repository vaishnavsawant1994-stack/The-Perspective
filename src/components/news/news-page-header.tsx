import { CategoryPageHeader } from "@/components/category/category-page-header";
import { CategorySubnav } from "@/components/category/category-subnav";

const newsNavigation = [
  { label: "Latest", href: "/latest" },
  { label: "Business", href: "/business" },
  { label: "Leadership", href: "/leadership" },
  { label: "Technology", href: "/technology" },
  { label: "Markets", href: "/topic/global-markets" },
  { label: "Global Affairs", href: "/topic/global-affairs" },
  { label: "The Perspective", href: "/perspective" },
] as const;

export function NewsPageHeader() {
  return <>
    <CategoryPageHeader description="Breaking developments, major stories and the topics shaping business, leadership, technology and the global economy." label="News" supportingLine="A wider view of what matters now." title="News" />
    <CategorySubnav items={newsNavigation} label="News" />
  </>;
}
