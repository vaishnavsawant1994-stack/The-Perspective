import type { Metadata } from "next";
import { AuthorsPage } from "@/components/author/authors-page";
import { SearchResultsPage } from "@/components/search/search-results-page";
import { siteConfig } from "@/config/site";
import { getAuthorProfileBySlug, getPublicAuthors } from "@/data/mock/author-profiles";
import { getHomepageRedesignContent } from "@/lib/homepage-redesign";
import { publicSlug, publishedCatalogue } from "@/modules/r9/projection";

const title="Authors | The Perspective";
const description="Meet The Perspective authors: editors, economists, investors, strategists and thinkers writing about leadership, business, technology, markets and society.";

export const metadata:Metadata={title:{absolute:title},description,alternates:{canonical:"/authors"},openGraph:{title,description,type:"website",url:"/authors",siteName:siteConfig.name,images:[{url:"/images/authors/ananya-mehta-featured.png",width:1122,height:1402,alt:"The Perspective Authors"}]},twitter:{card:"summary_large_image",title,description,images:["/images/authors/ananya-mehta-featured.png"]}};

export const dynamic = "force-dynamic";

export default async function AuthorsRoute(){
  const homepage=getHomepageRedesignContent();
  if(!homepage) throw new Error("Authors page requires homepage editorial content.");
  const profiles=getPublicAuthors().flatMap((author)=>{const profile=getAuthorProfileBySlug(author.slug);return profile?[profile]:[]});
  const published = await publishedCatalogue();
  const names = new Map<string, string>();
  for (const issue of published) {
    for (const article of issue.articles) {
      if (!article.author) continue;
      const slug = publicSlug(article.author);
      if (slug) names.set(slug, article.author);
    }
  }
  return <>
    {names.size > 0 ? <section aria-label="Published contributors" className="mx-auto max-w-5xl px-4 py-8"><h2 className="text-2xl font-semibold">Published contributors</h2><ul className="mt-3 grid gap-1">{[...names].map(([slug, name]) => <li key={slug}><a href={`/author/${slug}`}>{name}</a></li>)}</ul></section> : null}
    <AuthorsPage homepage={homepage} profiles={profiles}/><SearchResultsPage allResults={[]} counts={{all:0,articles:0,contributors:0,people:0,magazines:0}} filteredResults={[]} query="" rawQuery="" sort="relevance" type="contributors"/>
  </>;
}