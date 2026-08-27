import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

type Tone = "paper" | "surface" | "sunken" | "inverse";

const tones: Record<Tone, string> = {
  paper: "bg-bg text-fg",
  surface: "bg-surface text-fg",
  sunken: "bg-bg-subtle text-fg",
  inverse: "bg-inverse text-fg-inverse",
};

type Rhythm = "default" | "tight" | "loose" | "none";

const rhythms: Record<Rhythm, string> = {
  default: "py-[var(--section-y)]",
  tight: "py-[calc(var(--section-y)*0.62)]",
  loose: "py-[calc(var(--section-y)*1.25)]",
  none: "",
};

interface SectionProps {
  children: ReactNode;
  id?: string;
  tone?: Tone;
  rhythm?: Rhythm;
  /** Hairline above the section. The main device for separating tone changes. */
  divided?: boolean;
  className?: string;
  /** Accessible name for the landmark when the section has no visible heading. */
  ariaLabel?: string;
}

/**
 * Vertical rhythm and page tone.
 *
 * Sections alternate between `paper` and `surface` sparingly, and use a single
 * `inverse` block per page at most. Contrast between sections comes from a
 * hairline and a tone shift, never from a card wrapper or a gradient.
 */
export function Section({
  children,
  id,
  tone = "paper",
  rhythm = "default",
  divided = false,
  className,
  ariaLabel,
}: SectionProps) {
  return (
    <section
      id={id}
      aria-label={ariaLabel}
      className={cn(
        "relative",
        tones[tone],
        rhythms[rhythm],
        divided && (tone === "inverse" ? "border-t border-line-inverse" : "border-t border-line"),
        className,
      )}
    >
      {children}
    </section>
  );
}
