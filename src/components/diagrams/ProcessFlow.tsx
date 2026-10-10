import { ArrowDown, ArrowRight } from "lucide-react";

import type { FlowActor, ProcessComparison, ProcessSide } from "@/content/types";
import { cn } from "@/lib/cn";

/**
 * The signature visual of the brand.
 *
 * A process is drawn as a rail of steps. Who performs each step is encoded in
 * the marker, and the two sides differ in more than colour: the manual rail is
 * dashed and its labels are muted, the automated rail is solid and crisp. The
 * comparison should read before a single word is processed.
 *
 * Accessibility: the actor is exposed as text for screen readers, the steps
 * are an ordered list, and nothing depends on colour alone.
 */

const actorLabel: Record<FlowActor, string> = {
  person: "Una persona",
  system: "El sistema",
  trigger: "Entrada",
  outcome: "Resultado",
};

function Marker({ actor, muted }: { actor: FlowActor; muted: boolean }) {
  const shared = "relative z-10 block shrink-0 transition-colors";

  if (actor === "trigger") {
    return (
      <span
        aria-hidden
        className={cn(
          shared,
          "size-[0.6875rem] rounded-full border-[1.5px] bg-surface",
          muted ? "border-line-strong" : "border-fg",
        )}
      />
    );
  }

  if (actor === "outcome") {
    return (
      <span
        aria-hidden
        className={cn(shared, "size-[0.6875rem] rotate-45 rounded-[1px] bg-accent")}
      />
    );
  }

  if (actor === "system") {
    return (
      <span
        aria-hidden
        className={cn(shared, "size-[0.6875rem] rounded-[1px] bg-accent")}
      />
    );
  }

  return (
    <span
      aria-hidden
      className={cn(
        shared,
        "size-[0.6875rem] rounded-[1px] border",
        muted ? "border-fg-subtle bg-bg-sunken" : "border-fg bg-surface",
      )}
    />
  );
}

interface FlowColumnProps {
  side: ProcessSide;
  /** The manual side is rendered quieter and with a dashed rail. */
  variant: "manual" | "automated";
  className?: string;
}

export function FlowColumn({ side, variant, className }: FlowColumnProps) {
  const manual = variant === "manual";

  return (
    <div className={cn("flex flex-col", className)}>
      <p
        className={cn(
          "type-label",
          manual ? "text-fg-subtle" : "text-accent-text",
        )}
      >
        {side.title}
      </p>

      <ol className="relative mt-6 flex flex-col gap-4">
        {/* The rail. Dashed for a process held together by people. */}
        <span
          aria-hidden
          className={cn(
            "absolute left-[0.3125rem] top-2 bottom-2 w-px",
            manual
              ? "bg-[repeating-linear-gradient(to_bottom,var(--color-line-strong)_0_3px,transparent_3px_7px)]"
              : "bg-line-strong",
          )}
        />

        {side.steps.map((step) => (
          <li key={step.id} className="flex items-start gap-3.5">
            <span className="mt-[0.4375rem] flex">
              <Marker actor={step.actor} muted={manual} />
            </span>

            <span className="flex min-w-0 flex-col gap-0.5">
              <span
                className={cn(
                  "text-sm leading-snug",
                  manual ? "text-fg-muted" : "text-fg",
                  step.actor === "outcome" && "font-medium text-fg",
                )}
              >
                <span className="sr-only">{actorLabel[step.actor]}: </span>
                {step.label}
              </span>
              {step.note ? (
                <span className="tnum text-2xs text-fg-subtle">{step.note}</span>
              ) : null}
            </span>
          </li>
        ))}
      </ol>

      <p
        className={cn(
          "mt-6 border-t pt-4 text-sm",
          manual ? "border-line text-fg-muted" : "border-line text-fg",
        )}
      >
        {side.summary}
      </p>
    </div>
  );
}

interface BeforeAfterProps {
  process: ProcessComparison;
  className?: string;
}

/**
 * Side by side on tablet and up, stacked on phones with the arrow rotating to
 * point down. The divider is a hairline, not a card border.
 */
export function BeforeAfter({ process, className }: BeforeAfterProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-8 md:grid-cols-[1fr_auto_1fr] md:gap-0",
        className,
      )}
    >
      <FlowColumn side={process.before} variant="manual" className="md:pr-8 lg:pr-12" />

      <div
        aria-hidden
        className="flex items-center justify-center md:w-16 md:flex-col md:gap-4"
      >
        <span className="hidden w-px flex-1 bg-line md:block" />
        <span className="flex size-9 items-center justify-center rounded-full border border-line text-fg-muted">
          <ArrowRight className="hidden size-4 md:block" strokeWidth={1.75} />
          <ArrowDown className="size-4 md:hidden" strokeWidth={1.75} />
        </span>
        <span className="hidden w-px flex-1 bg-line md:block" />
      </div>

      <FlowColumn
        side={process.after}
        variant="automated"
        className="md:pl-8 lg:pl-12"
      />
    </div>
  );
}
