"use client";

import { useEffect, useRef, useState } from "react";
import type { ElementType, ReactNode } from "react";

import { cn } from "@/lib/cn";

interface RevealProps {
  children: ReactNode;
  /** Stagger within a group. Multiplied by 60ms, capped by the caller. */
  delay?: number;
  as?: ElementType;
  className?: string;
}

/**
 * Entrance animation.
 *
 * Deliberately not Framer Motion: a shared IntersectionObserver plus a CSS
 * transition costs no runtime library and cannot jank. The movement is 12px
 * and 420ms, enough to signal arrival and not enough to notice.
 *
 * `prefers-reduced-motion` is handled globally in globals.css, which collapses
 * the transition to zero while leaving the element visible.
 */
export function Reveal({ children, delay = 0, as: Tag = "div", className }: RevealProps) {
  const ref = useRef<HTMLElement | null>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    // Anything already on screen at mount appears immediately: no flash of
    // hidden above-the-fold content, no LCP penalty.
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setShown(true);
            observer.disconnect();
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.01 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag
      ref={ref}
      data-reveal=""
      style={delay ? { transitionDelay: `${Math.min(delay, 6) * 60}ms` } : undefined}
      className={cn(
        "transition-[opacity,transform] duration-[var(--duration-slow)] ease-[var(--ease-out-quart)] motion-reduce:opacity-100! motion-reduce:translate-y-0!",
        shown ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3",
        className,
      )}
    >
      {children}
    </Tag>
  );
}
