import type { Metric as MetricData } from "@/content/types";
import { cn } from "@/lib/cn";

interface MetricProps {
  metric: MetricData;
  size?: "md" | "lg";
  tone?: "default" | "inverse";
  className?: string;
}

/**
 * A single figure.
 *
 * Credibility rule enforced in the type system: every figure declares its
 * provenance. Illustrative figures are marked in the UI, not quietly passed
 * off as client results. If that makes a number less impressive, good.
 */
export function MetricValue({ metric, size = "md", tone = "default", className }: MetricProps) {
  const inverse = tone === "inverse";

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <p
        className={cn(
          "tnum font-display font-normal tracking-[-0.02em]",
          size === "lg" ? "text-metric" : "text-h2",
          inverse ? "text-fg-inverse" : "text-fg",
        )}
      >
        {metric.value}
        {metric.unit ? (
          <span
            className={cn(
              "ml-1.5 align-baseline font-sans text-[0.42em] font-medium tracking-normal",
              inverse ? "text-fg-inverse-muted" : "text-fg-subtle",
            )}
          >
            {metric.unit}
          </span>
        ) : null}
      </p>

      <p
        className={cn(
          "text-sm",
          inverse ? "text-fg-inverse-muted" : "text-fg-muted",
        )}
      >
        {metric.label}
      </p>

      {metric.provenance === "measured" && metric.source ? (
        <p className={cn("text-2xs", inverse ? "text-fg-inverse-muted" : "text-fg-subtle")}>
          {metric.source}
        </p>
      ) : null}
    </div>
  );
}

/**
 * Explicit label for content that is a worked example rather than a client
 * result. Used wherever a demonstration appears.
 */
export function DemonstrationBadge({
  tone = "default",
  className,
}: {
  tone?: "default" | "inverse";
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-2xs font-medium uppercase tracking-[0.14em]",
        tone === "inverse"
          ? "border-line-inverse text-fg-inverse-muted"
          : "border-line-strong text-fg-muted",
        className,
      )}
    >
      <span aria-hidden className="size-1.5 rounded-full bg-accent" />
      Demostración
    </span>
  );
}
