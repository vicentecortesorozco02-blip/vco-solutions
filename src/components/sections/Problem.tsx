import { ArrowRight } from "lucide-react";

import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { manualTasks, problemStatement } from "@/content/manual-tasks";

/**
 * The problem, by recognition.
 *
 * No argument, no statistics: a numbered list of mundane tasks written the way
 * the person doing them would describe them. The reader is meant to find three
 * that are theirs, then do the arithmetic in the next section.
 */
export function Problem() {
  return (
    <Section id="problema" tone="sunken">
      <Container className="flex flex-col gap-14 lg:gap-20">
        <SectionHeader
          eyebrow={problemStatement.eyebrow}
          title={problemStatement.heading}
          lead={problemStatement.body}
        />

        <Reveal>
          <ol className="grid grid-cols-1 gap-x-8 sm:grid-cols-2 lg:grid-cols-4">
            {manualTasks.map((task, index) => (
              <li
                key={task.id}
                className="flex gap-3 border-t border-line-strong py-5"
              >
                <span className="tnum pt-0.5 text-xs text-fg-subtle">{index + 1}</span>
                <span className="flex flex-col gap-1">
                  <span className="text-[0.9375rem] font-medium text-fg">{task.label}</span>
                  <span className="text-sm text-fg-muted">{task.where}</span>
                </span>
              </li>
            ))}
          </ol>
        </Reveal>

        <div className="flex flex-col gap-3 border-t border-line-strong pt-6 sm:flex-row sm:items-center sm:gap-6">
          <p className="text-[0.9375rem] text-fg-muted">
            Ninguna de estas tareas necesita criterio. Todas necesitan tiempo.
          </p>
          <a
            href="#calculo"
            className="group/btn inline-flex min-h-11 items-center gap-2 text-sm font-medium text-fg underline-offset-4 hover:underline"
          >
            {problemStatement.kicker}
            <ArrowRight
              aria-hidden
              className="size-4 transition-transform duration-[var(--duration-base)] group-hover/btn:translate-x-0.5"
              strokeWidth={2}
            />
          </a>
        </div>
      </Container>
    </Section>
  );
}
