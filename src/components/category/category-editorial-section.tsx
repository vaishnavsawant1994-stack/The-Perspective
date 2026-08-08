import type { Article, CategoryEditorialSection as CategoryEditorialSectionData } from "@/types";
import { ArticleCard } from "@/components/article/article-card";
import { EditorialSectionHeader } from "@/components/common/editorial-section-header";

function TextStoryList({ articles }: { articles:readonly Article[] }) {
  return <div className="divide-y divide-border border-y border-border">{articles.map((article) => <div className="py-6" key={article.id}><ArticleCard article={article} variant="compact" /></div>)}</div>;
}

export function CategoryEditorialSection({ section }: { section:CategoryEditorialSectionData }) {
  const headingId = `${section.id}-heading`;
  return <section aria-labelledby={headingId}>
    {section.eyebrow && <p className="eyebrow mb-4 text-accent">{section.eyebrow}</p>}
    <EditorialSectionHeader actionLabel={section.actionLabel} description={section.description} href={section.href} id={headingId} links={section.links} title={section.title} />
    {section.layout === "feature-list" && <div className="grid gap-10 lg:grid-cols-[1.25fr_.75fr] lg:gap-14"><ArticleCard article={section.feature} variant="feature" /><TextStoryList articles={section.supporting} /></div>}
    {section.layout === "analysis" && <div className="grid gap-8 border-y border-border bg-surface-subtle p-5 sm:p-8 lg:grid-cols-[1.15fr_.85fr] lg:items-start"><ArticleCard article={section.feature} variant="feature" /><TextStoryList articles={section.supporting} /></div>}
    {section.layout === "people" && <><div className="max-w-5xl"><ArticleCard article={section.feature} variant="feature" /></div><div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">{section.supporting.map((article) => <ArticleCard article={article} key={article.id} />)}</div></>}
    {section.layout === "regional" && <div className="grid gap-x-7 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">{[section.feature, ...section.supporting].map((article, index) => <ArticleCard article={article} className={index === 0 ? "sm:col-span-2 lg:col-span-1" : undefined} key={article.id} />)}</div>}
  </section>;
}
