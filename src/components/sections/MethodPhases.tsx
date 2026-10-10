import { Reveal } from "@/components/ui/Reveal";
import { methodPhases } from "@/content/method";
import { cn } from "@/lib/cn";

/**
 * The five phases.
 *
 * Rendered as a document: a number, a verb, a sentence, and the artefact the
 * client ends up holding. The `detailed` variant adds the activities and is
 * used on the method page; the home page shows the compact form so the section
 * stays readable in one pass.
 */
export function MethodPhases({
  tone = "inverse",
  detailed = false,
  className,
}: {
  tone?: "inverse" | "default";
  detailed?: boolean;
  className?: string;
}) {
  const inverse = tone === "inverse";

  return (
    <ol
      className={cn(
        "border-t",
        inverse ? "border-line-inverse" : "border-line",
        className,
      )}
    >
      {methodPhases.map((phase, index) => (
        <li
          key={phase.number}
          className={cn(
            "border-b",
            inverse ? "border-line-inverse" : "border-line",
          )}
        >
          <Reveal
            delay={Math.min(index, 4)}
            className={cn(
              "grid grid-cols-1 gap-4 py-7 lg:grid-cols-[4rem_minmax(0,1.05fr)_minmax(0,1fr)] lg:gap-10 lg:py-9",
              detailed && "lg:grid-cols-[4rem_minmax(0,1fr)_minmax(0,1.15fr)]",
            )}
          >
            <p
              className={cn(
                "tnum text-2xs font-medium tracking-[0.16em]",
                inverse ? "text-fg-inverse-muted" : "text-accent-text",
              )}
            >
              {phase.number}
            </p>

            <div className="flex flex-col gap-2">
              <h3
                className={cn(
                  "type-display text-h3",
                  inverse ? "text-fg-inverse" : "text-fg",
                )}
              >
                {phase.title}
              </h3>
              <p
                className={cn(
                  "max-w-[42ch] text-sm",
                  inverse ? "text-fg-inverse-muted" : "text-fg-muted",
                )}
              >
                {phase.summary}
              </p>
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <p
                  className={cn(
                    "type-label",
                    inverse ? "text-fg-inverse-muted" : "text-fg-subtle",
                  )}
                >
                  Qué recibes
                </p>
                <p
                  className={cn(
                    "max-w-[46ch] text-sm",
                    inverse ? "text-fg-inverse" : "text-fg",
                  )}
                >
                  {phase.deliverable}
                </p>
              </div>

              {detailed ? (
                <ul className="flex flex-col gap-2 pt-1">
                  {phase.detail.map((item) => (
                    <li
                      key={item}
                      className={cn(
                        "flex gap-3 text-sm",
                        inverse ? "text-fg-inverse-muted" : "text-fg-muted",
                      )}
                    >
                      <span
                        aria-hidden
                        className="mt-2 size-1 shrink-0 rounded-full bg-accent"
                      />
                      <span className="max-w-[52ch]">{item}</span>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          </Reveal>
        </li>
      ))}
    </ol>
  );
}
