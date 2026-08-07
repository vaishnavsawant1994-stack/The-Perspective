"use client";

import { Check, Copy, Mail } from "lucide-react";
import { useState } from "react";

export function ArticleShareActions({ title, url }: { title: string; url: string }) {
  const [copied, setCopied] = useState(false);
  const encodedUrl = encodeURIComponent(url); const encodedTitle = encodeURIComponent(title);
  async function copyLink() {
    try { await navigator.clipboard.writeText(url); }
    catch { const input = document.createElement("textarea"); input.value = url; input.style.position = "fixed"; input.style.opacity = "0"; document.body.append(input); input.select(); document.execCommand("copy"); input.remove(); }
    setCopied(true); window.setTimeout(() => setCopied(false), 2200);
  }
  const controlClass = "inline-flex min-h-11 items-center justify-center gap-2 border border-border px-3 text-xs font-bold uppercase tracking-[.08em] transition-colors hover:border-foreground hover:bg-surface-subtle";
  return <div aria-label="Share this article" className="flex flex-wrap gap-2 xl:flex-col" role="group">
    <a aria-label="Share on LinkedIn (opens in a new tab)" className={controlClass} href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`} rel="noreferrer" target="_blank"><span aria-hidden="true" className="font-bold lowercase">in</span><span className="xl:sr-only 2xl:not-sr-only">LinkedIn</span></a>
    <a aria-label="Share on X (opens in a new tab)" className={controlClass} href={`https://x.com/intent/post?url=${encodedUrl}&text=${encodedTitle}`} rel="noreferrer" target="_blank"><span aria-hidden="true" className="font-serif text-base">X</span><span className="sr-only">Share on X</span></a>
    <a aria-label="Share by email" className={controlClass} href={`mailto:?subject=${encodedTitle}&body=${encodedUrl}`}><Mail aria-hidden="true" className="size-4" /><span className="xl:sr-only 2xl:not-sr-only">Email</span></a>
    <button aria-label="Copy article link" className={controlClass} onClick={copyLink} type="button">{copied ? <Check aria-hidden="true" className="size-4" /> : <Copy aria-hidden="true" className="size-4" />}<span>{copied ? "Copied" : "Copy"}</span></button>
    <p aria-live="polite" className="sr-only">{copied ? "Link copied" : ""}</p>
  </div>;
}
