import Link from "next/link";
import { GlobalSearch } from "@/components/search/global-search";
import { PageContainer } from "./page-container";
export function Masthead() { return <div className="hidden border-b border-border lg:block"><PageContainer className="relative flex min-h-32 items-center justify-center py-5"><Link aria-label="The Perspective home" className="type-display-lg whitespace-nowrap text-center" href="/">The Perspective</Link><div className="absolute right-10 flex items-center gap-5 xl:right-12"><Link className="type-label hover:text-accent" href="/magazine">Magazine</Link><GlobalSearch /></div></PageContainer></div>; }
