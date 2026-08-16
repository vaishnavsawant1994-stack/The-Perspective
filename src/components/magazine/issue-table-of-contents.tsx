import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { ResolvedMagazineIssueSection } from "@/types";
import { EditorialSectionHeader } from "@/components/common/editorial-section-header";
import styles from "./issue-table-of-contents.module.css";

export function IssueTableOfContents({ sections }: { sections: readonly ResolvedMagazineIssueSection[] }) {
  return (
    <section aria-labelledby="explore-issue-heading">
      <EditorialSectionHeader
        description="A print-inspired table of contents across the desks and ideas inside this edition."
        id="explore-issue-heading"
        title="Explore the Issue"
      />
      <div className={styles.sectionRow}>
        {sections.map((section) => (
          <section aria-labelledby={`issue-section-${section.id}`} className={styles.issueSection} key={section.id}>
            <header>
              <h3 id={`issue-section-${section.id}`}>{section.label}</h3>
              <Link href={section.href}>Explore <ArrowRight aria-hidden="true" /></Link>
            </header>
            <ol>
              {section.articles.map((article, index) => (
                <li key={article.id}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <div>
                    <Link href={`/article/${article.slug}`}>{article.title}</Link>
                    {article.authors[0] ? <p>By <Link href={`/author/${article.authors[0].slug}`}>{article.authors[0].name}</Link></p> : null}
                  </div>
                </li>
              ))}
            </ol>
          </section>
        ))}
      </div>
    </section>
  );
}
