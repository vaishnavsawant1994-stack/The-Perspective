import Image from "next/image";
import type { Article, ArticleDetail, MagazineIssue } from "@/types";
import { siteConfig } from "@/config/site";
import { ArticleBody } from "./article-body";
import { ArticleHeader } from "./article-header";
import { ArticleShareActions } from "./article-share-actions";
import { ArticleSidebar } from "./article-sidebar";
import { ArticleTableOfContents } from "./article-table-of-contents";
import { ArticleTags } from "./article-tags";
import { AuthorBio } from "./author-bio";
import { PremiumArticleBanner } from "./premium-article-banner";
import { RelatedStories } from "./related-stories";
import { ArticleRedesign } from "./article-redesign";

export function ArticleReader({ article, relatedStories, mostRead, magazineIssue }: { article: ArticleDetail; relatedStories: readonly Article[]; mostRead: readonly Article[]; magazineIssue: MagazineIssue }) {
  const author = article.authors[0]; const canonicalUrl = `${siteConfig.url}/article/${article.slug}`;
  return <><ArticleRedesign article={article} mostRead={mostRead} relatedStories={relatedStories} /><div id="current-article-experience"><article>
    <ArticleHeader article={article} />
    {article.premium && <div className="mx-auto mb-8 w-full max-w-[1360px] px-4 xs:px-5 sm:px-8 lg:px-10 xl:px-12"><PremiumArticleBanner /></div>}
    {article.heroImage && <figure className="mx-auto w-full max-w-[1536px]"><div className="relative aspect-[16/9] overflow-hidden bg-surface-subtle"><Image alt={article.heroImage.alt} className="object-cover" fill loading="eager" priority sizes="(max-width: 1536px) 100vw, 1536px" src={article.heroImage.src} /></div>{(article.imageCaption || article.imageCredit) && <figcaption className="mx-auto flex max-w-[1360px] flex-col gap-1 px-4 py-3 text-xs leading-5 text-muted xs:px-5 sm:flex-row sm:justify-between sm:px-8 lg:px-10 xl:px-12"><span>{article.imageCaption}</span><span>{article.imageCredit}</span></figcaption>}</figure>}
    <div className="mx-auto grid w-full max-w-[1360px] gap-10 px-4 py-12 xs:px-5 sm:px-8 sm:py-16 lg:px-10 xl:grid-cols-[8rem_minmax(0,43rem)_18rem] xl:gap-8 xl:px-12 2xl:grid-cols-[10rem_minmax(0,46rem)_20rem] 2xl:gap-10">
      <div className="mx-auto w-full max-w-[46rem] space-y-8 xl:sticky xl:top-20 xl:max-w-none xl:self-start"><ArticleShareActions title={article.title} url={canonicalUrl} /><ArticleTableOfContents content={article.content} /></div>
      <div className="mx-auto w-full max-w-[46rem] min-w-0 xl:max-w-none"><ArticleBody content={article.content} /><ArticleTags tags={article.tags} />{author && <AuthorBio author={author} />}<RelatedStories articles={relatedStories} /></div>
      <ArticleSidebar issue={magazineIssue} mostRead={mostRead} />
    </div>
  </article></div></>;
}
