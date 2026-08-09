"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import type { MagazineReaderContentEntry, ResolvedMagazinePage } from "@/types";
import { ReaderPageThumbnail } from "./reader-page-thumbnail";

type ReaderPanelProps = {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
};

function ReaderPanel({ title, onClose, children }: ReaderPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    closeRef.current?.focus();
    const panel = panelRef.current;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== "Tab" || !panel) return;
      const focusable = Array.from(panel.querySelectorAll<HTMLElement>('button:not([disabled]), a[href], input:not([disabled]), [tabindex]:not([tabindex="-1"])'));
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (!first || !last) return;
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => { document.removeEventListener("keydown", handleKeyDown); previousFocus?.focus(); };
  }, [onClose]);

  return <div className="fixed inset-0 z-[90] bg-black/55" onMouseDown={(event) => { if (event.currentTarget === event.target) onClose(); }}>
    <div aria-label={title} aria-modal="true" className="absolute inset-y-0 left-0 flex w-[min(92vw,25rem)] flex-col bg-[#f5f2eb] text-foreground shadow-2xl" ref={panelRef} role="dialog">
      <header className="flex min-h-16 items-center justify-between border-b border-border px-5"><h2 className="font-serif text-2xl">{title}</h2><button aria-label={`Close ${title}`} className="inline-flex size-11 items-center justify-center hover:bg-surface" onClick={onClose} ref={closeRef} type="button"><X aria-hidden="true" className="size-5" /></button></header>
      <div className="overflow-y-auto p-5">{children}</div>
    </div>
  </div>;
}

export function ReaderContentsPanel({ contents, currentPage, onClose, onSelect }: { contents: readonly MagazineReaderContentEntry[]; currentPage: number; onClose: () => void; onSelect: (page: number) => void }) {
  return <ReaderPanel onClose={onClose} title="Issue Contents"><ol>{contents.map((entry) => <li className="border-b border-border" key={entry.id}><button aria-current={currentPage === entry.pageNumber ? "page" : undefined} className="grid min-h-16 w-full grid-cols-[2.75rem_1fr] items-center gap-3 py-3 text-left hover:text-accent aria-[current=page]:text-accent" onClick={() => onSelect(entry.pageNumber)} type="button"><span className="font-serif text-xl">{String(entry.pageNumber).padStart(2, "0")}</span><span><span className="block text-[.62rem] font-bold uppercase tracking-[.13em] text-muted">{entry.sectionId ?? "Issue"}</span><span className="mt-1 block font-serif text-lg leading-tight">{entry.label}</span></span></button></li>)}</ol></ReaderPanel>;
}

export function ReaderThumbnailPanel({ pages, currentPage, onClose, onSelect }: { pages: readonly ResolvedMagazinePage[]; currentPage: number; onClose: () => void; onSelect: (page: number) => void }) {
  return <ReaderPanel onClose={onClose} title="Page Thumbnails"><ol className="grid grid-cols-2 gap-4">{pages.map((page) => <li key={page.id}><button aria-current={currentPage === page.pageNumber ? "page" : undefined} aria-label={`Go to page ${page.pageNumber}: ${page.label}`} className="w-full border-2 border-transparent p-1 text-left hover:border-accent aria-[current=page]:border-accent" onClick={() => onSelect(page.pageNumber)} type="button"><ReaderPageThumbnail page={page} /><span className="mt-2 block text-xs font-bold">{page.pageNumber} · {page.label}</span></button></li>)}</ol></ReaderPanel>;
}
