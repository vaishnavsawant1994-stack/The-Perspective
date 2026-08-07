import Link from "next/link";
import { siteConfig } from "@/config/site";
import { GlobalSearch } from "@/components/search/global-search";
import { MobileNavigation } from "./mobile-navigation";
export function MobileHeader() { return <div className="grid h-16 grid-cols-[3rem_1fr_3rem] items-center border-b border-border px-2 lg:hidden"><MobileNavigation items={siteConfig.navigation} /><Link aria-label="The Perspective home" className="truncate text-center font-serif text-lg font-semibold tracking-[-.04em] sm:text-2xl" href="/">THE PERSPECTIVE</Link><div className="flex justify-center"><GlobalSearch compact /></div></div>; }
