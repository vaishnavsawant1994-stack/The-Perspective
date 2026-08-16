import type { Metadata } from "next";
import { AuthorsPage } from "@/components/author/authors-page";
import { SearchResultsPage } from "@/components/search/search-results-page";
import { siteConfig } from "@/config/site";
import { getAuthorProfileBySlug, getPublicAuthors } from "@/data/mock/author-profiles";
import { getHomepageRedesignContent } from "@/lib/homepage-redesign";

const title="Authors | The Perspective";
const description="Meet The Perspective authors: editors, economists, investors, strategists and thinkers writing about leadership, business, technology, markets and society.";

export const metadata:Metadata={title:{absolute:title},description,alternates:{canonical:"/authors"},openGraph:{title,description,type:"website",url:"/authors",siteName:siteConfig.name,images:[{url:"/images/authors/ananya-mehta-featured.png",width:1122,height:1402,alt:"The Perspective Authors"}]},twitter:{card:"summary_large_image",title,description,images:["/images/authors/ananya-mehta-featured.png"]}};

export default function AuthorsRoute(){
  const homepage=getHomepageRedesignContent();
  if(!homepage) throw new Error("Authors page requires homepage editorial content.");
  const profiles=getPublicAuthors().flatMap((author)=>{const profile=getAuthorProfileBySlug(author.slug);return profile?[profile]:[]});
  return <><AuthorsPage homepage={homepage} profiles={profiles}/><SearchResultsPage allResults={[]} counts={{all:0,articles:0,contributors:0,people:0,magazines:0}} filteredResults={[]} query="" rawQuery="" sort="relevance" type="contributors"/></>;
}
