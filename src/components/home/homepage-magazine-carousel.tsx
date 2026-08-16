"use client";

import { Children, useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function HomepageMagazineCarousel({ children, trailing }: { children: ReactNode; trailing: ReactNode }) {
  const pausedRef = useRef(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState<-1 | 1>(1);
  const issues = Children.toArray(children);
  const issueCount = issues.length;

  const move = useCallback((nextDirection: -1 | 1) => {
    if (!issueCount) return;
    setDirection(nextDirection);
    setActiveIndex((current) => (current + nextDirection + issueCount) % issueCount);
  }, [issueCount]);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const interval = window.setInterval(() => {
      if (!pausedRef.current && document.visibilityState === "visible") move(1);
    }, 4200);
    return () => window.clearInterval(interval);
  }, [move]);

  const visibleIssues = Array.from(
    { length: Math.min(7, issueCount) },
    (_, offset) => issues[(activeIndex + offset) % issueCount],
  );

  return <div
    className="home-mag-carousel"
    onBlur={() => { pausedRef.current = false; }}
    onFocus={() => { pausedRef.current = true; }}
    onMouseEnter={() => { pausedRef.current = true; }}
    onMouseLeave={() => { pausedRef.current = false; }}
  >
    <div className={`home-mag-carousel-window ${direction === 1 ? "is-next" : "is-previous"}`} key={`${activeIndex}-${direction}`}>
      <div aria-label="Magazine issues, upper row" className="home-mag-carousel-rail" role="region">{visibleIssues.slice(0, 4)}</div>
      <div className="home-mag-secondary-row">
        <div className="home-mag-lower-carousel">
          <div aria-label="Magazine issues, lower row" className="home-mag-carousel-rail" role="region">{visibleIssues.slice(4, 7)}</div>
          <div className="home-mag-carousel-controls">
            <button aria-label="Previous magazine issue" onClick={() => move(-1)} type="button"><ChevronLeft aria-hidden="true" /></button>
            <button aria-label="Next magazine issue" onClick={() => move(1)} type="button"><ChevronRight aria-hidden="true" /></button>
          </div>
        </div>
        {trailing}
      </div>
    </div>
  </div>;
}
