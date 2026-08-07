import Link from "next/link";
import { siteConfig } from "@/config/site";
import { DesktopNavigation } from "./desktop-navigation";
import { MobileNavigation } from "./mobile-navigation";
import { PageContainer } from "./page-container";

export function SiteHeader() {
  return <header className="relative z-40 border-b border-border bg-background"><PageContainer className="flex h-16 items-center justify-between lg:h-20"><Link aria-label="The Perspective home" className="font-serif text-xl font-semibold tracking-[-0.04em] sm:text-2xl" href="/">THE PERSPECTIVE</Link><DesktopNavigation items={siteConfig.navigation} /><MobileNavigation items={siteConfig.navigation} /></PageContainer></header>;
}
