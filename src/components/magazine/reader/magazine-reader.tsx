"use client";

import type { CSSProperties } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { formatMagazineIssueDate } from "@/lib/magazine-issue-date";
import type { ResolvedMagazineReaderIssue } from "@/types";
import { ReaderContentsPanel, ReaderThumbnailPanel } from "./reader-panels";
import { ReaderPageRenderer } from "./reader-page-renderer";
import { ReaderToolbar } from "./reader-toolbar";

export function MagazineReader({ reader, initialPage }: { reader: ResolvedMagazineReaderIssue; initialPage: number }) {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [contentsOpen, setContentsOpen] = useState(false);
  const [thumbnailsOpen, setThumbnailsOpen] = useState(false);
  const [zoom, setZoom] = useState(100);
  const [fitMode, setFitMode] = useState<"page" | "width">("page");
  const [fullscreenSupported, setFullscreenSupported] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const readerRef = useRef<HTMLDivElement>(null);

  const page = reader.pages[currentPage - 1] ?? reader.pages[0];
  const section = reader.issue.sectionGroups.find((group) => group.id === page.sectionId)?.label ?? page.label;
  const progress = Math.round((currentPage / reader.pageCount) * 100);
  const issueDate = formatMagazineIssueDate(reader.issue.publicationDate);

  const goToPage = useCallback((requestedPage: number) => {
    const nextPage = Number.isFinite(requestedPage) ? Math.min(reader.pageCount, Math.max(1, Math.round(requestedPage))) : 1;
    setCurrentPage(nextPage);
    setContentsOpen(false);
    setThumbnailsOpen(false);
  }, [reader.pageCount]);

  const openContents = useCallback(() => setContentsOpen(true), []);
  const closeContents = useCallback(() => setContentsOpen(false), []);
  const openThumbnails = useCallback(() => setThumbnailsOpen(true), []);
  const closeThumbnails = useCallback(() => setThumbnailsOpen(false), []);
  const previousPage = useCallback(() => setCurrentPage((value) => Math.max(1, value - 1)), []);
  const nextPage = useCallback(() => setCurrentPage((value) => Math.min(reader.pageCount, value + 1)), [reader.pageCount]);

  useEffect(() => {
    const url = new URL(window.location.href);
    url.searchParams.delete("view");
    if (currentPage === 1) url.searchParams.delete("page");
    else url.searchParams.set("page", String(currentPage));
    window.history.replaceState(window.history.state, "", url);
  }, [currentPage]);

  useEffect(() => {
    const capabilityFrame = window.requestAnimationFrame(() => setFullscreenSupported(Boolean(document.fullscreenEnabled)));
    const updateFullscreen = () => setIsFullscreen(document.fullscreenElement === readerRef.current);
    document.addEventListener("fullscreenchange", updateFullscreen);
    return () => { window.cancelAnimationFrame(capabilityFrame); document.removeEventListener("fullscreenchange", updateFullscreen); };
  }, []);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const target = event.target;
      if (target instanceof HTMLElement && (target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName))) return;
      if (contentsOpen || thumbnailsOpen) return;
      if (["ArrowRight", "PageDown"].includes(event.key)) { event.preventDefault(); nextPage(); }
      else if (["ArrowLeft", "PageUp"].includes(event.key)) { event.preventDefault(); previousPage(); }
      else if (event.key === "Home") { event.preventDefault(); goToPage(1); }
      else if (event.key === "End") { event.preventDefault(); goToPage(reader.pageCount); }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [contentsOpen, goToPage, nextPage, previousPage, reader.pageCount, thumbnailsOpen]);

  async function toggleFullscreen() {
    if (!readerRef.current || !fullscreenSupported) return;
    if (document.fullscreenElement) await document.exitFullscreen();
    else await readerRef.current.requestFullscreen();
  }

  const canvasStyle = {
    "--reader-scale": String(zoom / 100),
    "--reader-zoom-space": `${Math.max(0, (zoom - 100) * 8)}px`,
  } as CSSProperties;

  return <div className="reader-root" data-reader-shell ref={readerRef}>
    <h1 className="sr-only">{reader.issue.title} — {issueDate} | The Perspective Magazine</h1>
    <ReaderToolbar currentPage={currentPage} currentSection={section} fitMode={fitMode} fullscreenSupported={fullscreenSupported} isFullscreen={isFullscreen} issue={reader.issue} onContents={openContents} onFitMode={setFitMode} onFullscreen={toggleFullscreen} onPageJump={goToPage} onThumbnails={openThumbnails} onZoomIn={() => setZoom((value) => Math.min(150, value + 25))} onZoomOut={() => setZoom((value) => Math.max(75, value - 25))} pageCount={reader.pageCount} zoom={zoom} />
    <div aria-hidden="true" className="h-0.5 bg-white/10"><div className="h-full bg-[#d5a955] transition-[width] motion-reduce:transition-none" style={{ width: `${progress}%` }} /></div>

    <div className="reader-workspace">
      <button aria-label="Previous page" className="reader-side-navigation reader-side-previous" disabled={currentPage === 1} onClick={previousPage} type="button"><ChevronLeft aria-hidden="true" className="size-7" /></button>
      <div aria-label="Magazine page viewport" className="reader-stage" data-fit={fitMode} role="region" style={canvasStyle} tabIndex={0}>
        <div className="reader-canvas-space"><div className="reader-canvas-transform" key={page.id}><ReaderPageRenderer contents={reader.contents} issue={reader.issue} page={page} pageCount={reader.pageCount} /></div></div>
      </div>
      <button aria-label="Next page" className="reader-side-navigation reader-side-next" disabled={currentPage === reader.pageCount} onClick={nextPage} type="button"><ChevronRight aria-hidden="true" className="size-7" /></button>
    </div>

    <nav aria-label="Page navigation" className="reader-bottom-navigation"><button className="reader-bottom-button" disabled={currentPage === 1} onClick={previousPage} type="button"><ChevronLeft aria-hidden="true" className="size-4" /> Previous</button><div className="text-center"><p aria-live="polite" className="text-xs font-bold">Page {currentPage} of {reader.pageCount}</p><p className="mt-1 text-[.6rem] uppercase tracking-[.12em] text-white/55">{page.label} · {progress}%</p></div><button className="reader-bottom-button" disabled={currentPage === reader.pageCount} onClick={nextPage} type="button">Next <ChevronRight aria-hidden="true" className="size-4" /></button></nav>
    <div aria-live="polite" className="sr-only">Page {currentPage} of {reader.pageCount} — {page.label}</div>
    {contentsOpen ? <ReaderContentsPanel contents={reader.contents} currentPage={currentPage} onClose={closeContents} onSelect={goToPage} /> : null}
    {thumbnailsOpen ? <ReaderThumbnailPanel currentPage={currentPage} onClose={closeThumbnails} onSelect={goToPage} pages={reader.pages} /> : null}
  </div>;
}
