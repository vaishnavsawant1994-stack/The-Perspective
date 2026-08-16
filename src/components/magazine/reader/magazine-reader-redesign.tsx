"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Bookmark,
  BookOpen,
  Check,
  ChevronLeft,
  ChevronRight,
  Columns2,
  Download,
  Expand,
  FileText,
  Grid2X2,
  List,
  Maximize2,
  Minus,
  Plus,
  Printer,
  Share2,
} from "lucide-react";
import { MagazineCover } from "@/components/magazine/magazine-cover";
import { NewsletterForm } from "@/components/layout/newsletter-form";
import { formatMagazineIssueDate } from "@/lib/magazine-issue-date";
import type { MagazineIssue, ResolvedMagazinePage, ResolvedMagazineReaderIssue } from "@/types";
import { ReaderPageRenderer } from "./reader-page-renderer";
import styles from "./magazine-reader-redesign.module.css";

type Props = {
  initialPage: number;
  previousIssues: readonly MagazineIssue[];
  reader: ResolvedMagazineReaderIssue;
};

function getPreviewImage(page: ResolvedMagazinePage, fallback?: MagazineIssue["coverImage"]) {
  return page.image ?? page.article?.heroImage ?? fallback;
}

export function MagazineReaderRedesign({ initialPage, previousIssues, reader }: Props) {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [panel, setPanel] = useState<"thumbnails" | "contents">("thumbnails");
  const [zoom, setZoom] = useState(100);
  const [fit, setFit] = useState<"page" | "width">("page");
  const [spread, setSpread] = useState<"single" | "two">("single");
  const [saved, setSaved] = useState(false);
  const [shareStatus, setShareStatus] = useState("Share");
  const shellRef = useRef<HTMLElement>(null);
  const page = reader.pages[currentPage - 1] ?? reader.pages[0];
  const nextSpreadPage = spread === "two" ? reader.pages[currentPage] : undefined;
  const progress = Math.round((currentPage / reader.pageCount) * 100);
  const issueDate = formatMagazineIssueDate(reader.issue.publicationDate);

  const stories = useMemo(() => {
    const seen = new Set<string>();
    return reader.pages.flatMap((entry) => {
      if (!entry.article || seen.has(entry.article.id)) return [];
      seen.add(entry.article.id);
      return [{ page: entry.pageNumber, article: entry.article, image: getPreviewImage(entry, reader.issue.coverImage) }];
    }).slice(0, 8);
  }, [reader]);

  const goToPage = useCallback((requested: number) => {
    setCurrentPage(Math.min(reader.pageCount, Math.max(1, requested)));
  }, [reader.pageCount]);

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLElement && ["INPUT", "TEXTAREA", "SELECT"].includes(event.target.tagName)) return;
      if (event.key === "ArrowRight") goToPage(currentPage + 1);
      if (event.key === "ArrowLeft") goToPage(currentPage - 1);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [currentPage, goToPage]);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setSaved(window.localStorage.getItem(`perspective-saved-${reader.issue.slug}`) === "true"));
    return () => window.cancelAnimationFrame(frame);
  }, [reader.issue.slug]);

  function toggleSaved() {
    const next = !saved;
    setSaved(next);
    window.localStorage.setItem(`perspective-saved-${reader.issue.slug}`, String(next));
  }

  async function toggleFullscreen() {
    if (!shellRef.current) return;
    if (document.fullscreenElement) await document.exitFullscreen();
    else await shellRef.current.requestFullscreen();
  }

  async function shareIssue() {
    const url = `${window.location.origin}${window.location.pathname}?page=${currentPage}`;
    if (navigator.share) await navigator.share({ title: reader.issue.title, text: reader.issue.description, url });
    else await navigator.clipboard.writeText(url);
    setShareStatus("Copied");
    window.setTimeout(() => setShareStatus("Share"), 1600);
  }

  const visibleFilmstrip = reader.pages;

  return (
    <div className={styles.page}>
      <div aria-label="Breaking news" className={styles.breakingBar}>
        <strong>Breaking</strong>
        <Link href="/article/markets-optimism">Markets assess a changing rate outlook</Link><i aria-hidden="true" />
        <Link href="/article/industrial-investment-strategy">Industrial investment moves back to the center of strategy</Link><i aria-hidden="true" />
        <Link href="/article/global-computing-capacity">Computing capacity becomes a global priority</Link>
        <span><b aria-hidden="true" /> Live</span>
      </div>
      <section aria-label={`${reader.issue.title} digital magazine reader`} className={styles.readerShell} ref={shellRef}>
        <header className={styles.readerToolbar}>
          <Link className={styles.backLink} href="/magazine"><ArrowLeft aria-hidden="true" /> Back to Magazine</Link>
          <div className={styles.issueIdentity}><b>The Perspective — {issueDate}</b><span>{reader.issue.title}</span></div>
          <div className={styles.progressGroup}>
            <strong>Page {currentPage} / {reader.pageCount}</strong>
            <input aria-label="Magazine reading progress" max={reader.pageCount} min="1" onChange={(event) => goToPage(Number(event.target.value))} type="range" value={currentPage} />
            <span>{progress}%</span>
          </div>
          <div className={styles.toolbarActions}>
            <button aria-pressed={panel === "contents"} onClick={() => setPanel("contents")} type="button"><List aria-hidden="true" /> Contents</button>
            <button aria-pressed={panel === "thumbnails"} onClick={() => setPanel("thumbnails")} type="button"><Grid2X2 aria-hidden="true" /> Thumbnails</button>
            <Link href={`/magazine/read/${reader.issue.slug}?view=text&page=${currentPage}`}><FileText aria-hidden="true" /> Text View</Link>
            <Link className={styles.subscribeButton} href="/magazine/subscribe">Subscribe</Link>
          </div>
        </header>

        <div className={styles.workspace}>
          <aside className={styles.leftRail}>
            <div className={styles.panelTabs}>
              <button aria-pressed={panel === "thumbnails"} onClick={() => setPanel("thumbnails")} type="button">Thumbnails</button>
              <button aria-pressed={panel === "contents"} onClick={() => setPanel("contents")} type="button">Contents</button>
            </div>
            {panel === "thumbnails" ? (
              <ol className={styles.verticalPages}>
                {reader.pages.map((entry) => {
                  const image = getPreviewImage(entry, reader.issue.coverImage);
                  return <li key={entry.id}><button aria-current={entry.pageNumber === currentPage ? "page" : undefined} onClick={() => goToPage(entry.pageNumber)} type="button"><span>{image ? <Image alt="" fill sizes="64px" src={image.src} /> : <FileText aria-hidden="true" />}</span><b>{entry.pageNumber}</b><em>{entry.label}</em></button></li>;
                })}
              </ol>
            ) : (
              <ol className={styles.contentsList}>{reader.contents.map((entry) => <li key={entry.id}><button aria-current={entry.pageNumber === currentPage ? "page" : undefined} onClick={() => goToPage(entry.pageNumber)} type="button"><span>{String(entry.pageNumber).padStart(2, "0")}</span><b>{entry.label}</b></button></li>)}</ol>
            )}
            <button className={styles.downloadButton} onClick={() => window.print()} type="button"><Download aria-hidden="true" /> Download issue</button>
          </aside>

          <div className={styles.canvasArea} data-fit={fit} data-spread={spread}>
            <button aria-label="Previous page" className={`${styles.pageArrow} ${styles.previous}`} disabled={currentPage === 1} onClick={() => goToPage(currentPage - 1)} type="button"><ChevronLeft aria-hidden="true" /></button>
            <div className={styles.canvasScroller}>
              <div className={styles.canvasSpread} style={{ transform: `scale(${zoom / 100})` }}>
                <div className={styles.canvasPage}><ReaderPageRenderer contents={reader.contents} issue={reader.issue} page={page} pageCount={reader.pageCount} /></div>
                {nextSpreadPage ? <div className={styles.canvasPage}><ReaderPageRenderer contents={reader.contents} issue={reader.issue} page={nextSpreadPage} pageCount={reader.pageCount} /></div> : null}
              </div>
            </div>
            <button aria-label="Next page" className={`${styles.pageArrow} ${styles.next}`} disabled={currentPage === reader.pageCount} onClick={() => goToPage(currentPage + 1)} type="button"><ChevronRight aria-hidden="true" /></button>
          </div>

          <aside aria-label="Reader tools" className={styles.toolsRail}>
            <button disabled={zoom >= 150} onClick={() => setZoom((value) => Math.min(150, value + 10))} type="button"><Plus aria-hidden="true" /> Zoom in</button>
            <button disabled={zoom <= 70} onClick={() => setZoom((value) => Math.max(70, value - 10))} type="button"><Minus aria-hidden="true" /> Zoom out</button>
            <button aria-pressed={fit === "page"} onClick={() => { setFit("page"); setZoom(100); }} type="button"><Maximize2 aria-hidden="true" /> Fit page</button>
            <button aria-pressed={fit === "width"} onClick={() => { setFit("width"); setZoom(100); }} type="button"><Expand aria-hidden="true" /> Fit width</button>
            <hr />
            <button aria-pressed={spread === "single"} onClick={() => setSpread("single")} type="button"><BookOpen aria-hidden="true" /> Single page</button>
            <button aria-pressed={spread === "two"} onClick={() => setSpread("two")} type="button"><Columns2 aria-hidden="true" /> Two page</button>
            <button onClick={toggleFullscreen} type="button"><Expand aria-hidden="true" /> Fullscreen</button>
            <hr />
            <button onClick={shareIssue} type="button"><Share2 aria-hidden="true" /> {shareStatus}</button>
            <button aria-pressed={saved} onClick={toggleSaved} type="button">{saved ? <Check aria-hidden="true" /> : <Bookmark aria-hidden="true" />} {saved ? "Saved" : "Save issue"}</button>
            <button onClick={() => window.print()} type="button"><Printer aria-hidden="true" /> Print</button>
          </aside>
        </div>

        <nav aria-label="Magazine page thumbnails" className={styles.filmstrip}>
          <button aria-label="Previous page" disabled={currentPage === 1} onClick={() => goToPage(currentPage - 1)} type="button"><ChevronLeft aria-hidden="true" /></button>
          <ol>{visibleFilmstrip.map((entry) => { const image = getPreviewImage(entry, reader.issue.coverImage); return <li key={entry.id}><button aria-current={entry.pageNumber === currentPage ? "page" : undefined} onClick={() => goToPage(entry.pageNumber)} type="button"><span>{image ? <Image alt="" fill sizes="54px" src={image.src} /> : null}</span><b>{entry.pageNumber}</b></button></li>; })}</ol>
          <button aria-label="Next page" disabled={currentPage === reader.pageCount} onClick={() => goToPage(currentPage + 1)} type="button"><ChevronRight aria-hidden="true" /></button>
        </nav>
      </section>

      <section aria-label="Issue facts" className={styles.issueFacts}>
        <article><FileText aria-hidden="true" /><div><b>{reader.pageCount}</b><span>Pages</span><p>Premium stories and in-depth analysis</p></div></article>
        <article><BookOpen aria-hidden="true" /><div><b>12</b><span>Contributors</span><p>Leadership, business and technology voices</p></div></article>
        <article><Maximize2 aria-hidden="true" /><div><b>45</b><span>Min read time</span><p>Curated insight for busy professionals</p></div></article>
        <article className={styles.factPromo}><MagazineCover issue={reader.issue} variant="compact" /><div><b>Enjoy unlimited access</b><p>Subscribe to read every premium issue.</p><Link href="/magazine/subscribe">Subscribe now</Link></div></article>
      </section>

      <section aria-labelledby="reader-inside-heading" className={styles.insideSection}>
        <header><h2 id="reader-inside-heading">Inside this issue</h2><span aria-hidden="true" /></header>
        <div className={styles.storyGrid}>{stories.map(({ article, image, page: storyPage }, index) => <Link className={styles.storyCard} href={`/article/${article.slug}`} key={article.id}>{image ? <Image alt={image.alt} fill sizes="(max-width: 720px) 100vw, 25vw" src={image.src} /> : null}<div className={styles.storyShade} /><div className={styles.storyCopy}><small>{String(storyPage).padStart(2, "0")} · {article.category.name}</small><h3>{article.title}</h3><p>{article.excerpt}</p>{index === 0 ? <em>Cover story</em> : null}</div></Link>)}</div>
      </section>

      <section className={styles.readerCtas}>
        <article><FileText aria-hidden="true" /><div><h2>Read in Text View</h2><p>Prefer reading without distraction? Switch to the clean, accessible text edition.</p><Link href={`/magazine/read/${reader.issue.slug}?view=text`}>Open Text View</Link></div></article>
        <article><Download aria-hidden="true" /><div><h2>Never miss an issue</h2><p>Get every new edition and the best stories delivered instantly.</p><NewsletterForm buttonLabel="Subscribe" label="Magazine issue newsletter" theme="light" /></div></article>
      </section>

      <section aria-labelledby="more-issues-heading" className={styles.moreIssues}>
        <header><h2 id="more-issues-heading">Explore more issues</h2><Link href="/magazine/archive">View all issues <ArrowRight aria-hidden="true" /></Link></header>
        <div>{previousIssues.slice(0, 6).map((issue) => <article key={issue.id}><MagazineCover href={issue.readerAvailable ? `/magazine/read/${issue.slug}` : `/magazine/archive?issue=${issue.slug}`} issue={issue} variant="compact" /><time dateTime={issue.publicationDate}>{formatMagazineIssueDate(issue.publicationDate)}</time><h3>{issue.title}</h3><p>{issue.pageCount} pages</p></article>)}</div>
      </section>

      <section className={styles.briefing}>
        <div><span>Read The Perspective Briefing</span><p>The best stories, interviews and insights—delivered to your inbox every week.</p></div>
        <NewsletterForm buttonLabel="Subscribe" label="Perspective briefing" theme="light" />
      </section>

      <section aria-labelledby="original-reader-heading" className={styles.originalIntro}>
        <p>Complete edition</p><h2 id="original-reader-heading">Original digital reader</h2><span>The current page-by-page edition remains available below, exactly as requested.</span>
      </section>
    </div>
  );
}
