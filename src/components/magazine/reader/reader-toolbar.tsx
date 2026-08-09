import Link from "next/link";
import { ArrowLeft, BookOpen, Grid2X2, Maximize2, Minimize2, ZoomIn, ZoomOut } from "lucide-react";
import { formatMagazineIssueDate } from "@/lib/magazine-issue-date";
import type { MagazineIssue } from "@/types";

type ReaderToolbarProps = {
  issue: MagazineIssue;
  currentPage: number;
  pageCount: number;
  currentSection: string;
  zoom: number;
  fitMode: "page" | "width";
  fullscreenSupported: boolean;
  isFullscreen: boolean;
  onContents: () => void;
  onThumbnails: () => void;
  onZoomOut: () => void;
  onZoomIn: () => void;
  onFitMode: (mode: "page" | "width") => void;
  onFullscreen: () => void;
  onPageJump: (page: number) => void;
};

export function ReaderToolbar(props: ReaderToolbarProps) {
  const { issue, currentPage, pageCount, currentSection, zoom, fitMode, fullscreenSupported, isFullscreen } = props;
  const issueDate = formatMagazineIssueDate(issue.publicationDate);
  return <header className="reader-toolbar">
    <div className="flex min-w-0 items-center gap-3">
      <Link aria-label="Back to Magazine" className="reader-tool-button shrink-0" href="/magazine"><ArrowLeft aria-hidden="true" className="size-4" /><span className="hidden sm:inline">Magazine</span></Link>
      <div className="hidden min-w-0 border-l border-white/20 pl-3 sm:block"><p className="truncate font-serif text-base leading-none sm:text-lg">{issue.title}</p><p className="mt-1 hidden text-[.6rem] font-bold uppercase tracking-[.12em] text-white/55 sm:block">{issueDate} · {currentSection}</p></div>
    </div>

    <div className="hidden items-center justify-center gap-1 lg:flex">
      <button className="reader-tool-button" onClick={props.onContents} type="button"><BookOpen aria-hidden="true" className="size-4" /> Contents</button>
      <button className="reader-tool-button" onClick={props.onThumbnails} type="button"><Grid2X2 aria-hidden="true" className="size-4" /> Pages</button>
      <span aria-hidden="true" className="mx-2 h-6 w-px bg-white/20" />
      <button aria-label="Zoom out" className="reader-icon-button" disabled={zoom <= 75} onClick={props.onZoomOut} title="Zoom out" type="button"><ZoomOut aria-hidden="true" className="size-4" /></button>
      <output aria-label={`Zoom ${zoom} percent`} className="w-12 text-center text-xs font-bold">{zoom}%</output>
      <button aria-label="Zoom in" className="reader-icon-button" disabled={zoom >= 150} onClick={props.onZoomIn} title="Zoom in" type="button"><ZoomIn aria-hidden="true" className="size-4" /></button>
      <button aria-pressed={fitMode === "page"} className="reader-tool-button ml-2" onClick={() => props.onFitMode("page")} type="button">Fit Page</button>
      <button aria-pressed={fitMode === "width"} className="reader-tool-button" onClick={() => props.onFitMode("width")} type="button">Fit Width</button>
      {fullscreenSupported ? <button aria-label={isFullscreen ? "Exit full screen" : "Enter full screen"} className="reader-icon-button ml-2" onClick={props.onFullscreen} title={isFullscreen ? "Exit full screen" : "Enter full screen"} type="button">{isFullscreen ? <Minimize2 aria-hidden="true" className="size-4" /> : <Maximize2 aria-hidden="true" className="size-4" />}</button> : null}
    </div>

    <div className="flex items-center justify-end gap-1 sm:gap-2">
      <button aria-label="Open contents" className="reader-icon-button reader-mobile-tool" onClick={props.onContents} type="button"><BookOpen aria-hidden="true" className="size-4" /></button>
      <button aria-label="Open page thumbnails" className="reader-icon-button reader-mobile-tool" onClick={props.onThumbnails} type="button"><Grid2X2 aria-hidden="true" className="size-4" /></button>
      <form className="hidden items-center gap-1 md:flex" onSubmit={(event) => { event.preventDefault(); const data = new FormData(event.currentTarget); props.onPageJump(Number(data.get("page"))); }}><label className="sr-only" htmlFor="reader-page-jump">Jump to page</label><input className="h-9 w-11 border border-white/25 bg-transparent px-2 text-center text-xs" defaultValue={currentPage} id="reader-page-jump" key={currentPage} max={pageCount} min={1} name="page" type="number" /><span className="text-xs text-white/55">/ {pageCount}</span></form>
      <p className="whitespace-nowrap text-xs font-bold md:hidden"><span className="sr-only">Page </span>{currentPage}<span aria-hidden="true"> / </span><span className="sr-only"> of </span>{pageCount}</p>
      <Link className="reader-tool-button reader-text-view-tool" href={`/magazine/read/${issue.slug}?view=text&page=${currentPage}`}>Text View</Link>
    </div>
  </header>;
}
