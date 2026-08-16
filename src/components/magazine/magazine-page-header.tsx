"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { PageContainer } from "@/components/layout/page-container";
import styles from "./magazine-page-header.module.css";

const categoryNavigation = [
  { label: "All issues", href: "/magazine/archive" },
  { label: "Leadership", href: "/magazine/category/leadership" },
  { label: "Business & Economy", href: "/magazine/category/business" },
  { label: "Technology", href: "/magazine/category/technology" },
  { label: "Markets & Finance", href: "/search?q=markets" },
  { label: "Culture & Lifestyle", href: "/search?q=culture&type=articles" },
  { label: "Special Editions", href: "/magazine/archive?type=special" },
] as const;

export function MagazinePageHeader({ readerHref }: { readerHref: string }) {
  const router = useRouter();
  const magazineNavigation = [
    { label: "Latest issue", href: "/magazine#latest-issue" },
    { label: "Digital reader", href: readerHref },
    { label: "Archive", href: "/magazine/archive" },
    { label: "Premium", href: "/magazine/premium" },
    { label: "Personal magazines", href: "/personal-magazines" },
    { label: "Subscribe", href: "/magazine/subscribe" },
  ];

  return (
    <header className={styles.header}>
      <PageContainer width="standard">
        <div className={styles.headingRow}>
          <div className={styles.headingCopy}>
            <p>The Magazine</p>
            <h1>The Perspective Magazine</h1>
            <div>A curated collection of original reporting, interviews and ideas designed to be read, kept and returned to.</div>
          </div>
          <nav aria-label="Explore magazine" className={styles.quickLinks}>
            <span>Explore:</span>
            {magazineNavigation.map((item, index) => <Link aria-current={index === 0 ? "page" : undefined} href={item.href} key={item.href}>{item.label}</Link>)}
          </nav>
        </div>

        <div className={styles.filterBar}>
          <nav aria-label="Browse magazine categories" className={styles.categoryScroller}>
            {categoryNavigation.map((item, index) => <Link aria-current={index === 0 ? "page" : undefined} href={item.href} key={item.label}>{item.label}</Link>)}
          </nav>
          <label className={styles.sortControl}>
            Browse by:
            <select aria-label="Browse magazine editions" defaultValue="/magazine#latest-issue" onChange={(event) => router.push(event.target.value)}>
              <option value="/magazine#latest-issue">Latest</option>
              <option value="/magazine/archive?sort=oldest">Oldest</option>
              <option value="/magazine/premium">Premium</option>
            </select>
            <ChevronDown aria-hidden="true" />
          </label>
        </div>
      </PageContainer>
    </header>
  );
}
