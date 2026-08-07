import { siteConfig } from "@/config/site";
import { CompactHeader } from "./compact-header";
import { DesktopNavigation } from "./desktop-navigation";
import { Masthead } from "./masthead";
import { MobileHeader } from "./mobile-header";
import { PageContainer } from "./page-container";
import { UtilityBar } from "./utility-bar";

export function SiteHeader() { return <><header className="relative z-40 bg-background"><UtilityBar /><Masthead /><MobileHeader /><div className="hidden border-b border-foreground lg:block"><PageContainer><DesktopNavigation items={siteConfig.navigation} /></PageContainer></div></header><CompactHeader /></>; }
