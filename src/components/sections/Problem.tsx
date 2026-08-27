import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { manualTasks, problemStatement } from "@/content/manual-tasks";

/**
 * The problem, by recognition.
 *
 * No argument, no statistics: a list of mundane tasks written the way the
 * person doing them would describe them. The reader is meant to find three
 * that are theirs. Rendered as a ledger, not as cards, because twelve cards
 * would be twelve boxes competing for attention.
 */
export function Problem() {
  return (
    <Section id="problema" tone="surface" divided>
      <Container className="flex flex-col gap-12">
        <SectionHeader
          index="01"
          eyebrow={problemStatement.eyebrow}
          title={problemStatement.heading}
          lead={problemStatement.body}
        />

        <Reveal className="flex flex-col gap-6">
          <p className="text-sm text-fg-subtle">{problemStatement.kicker}</p>

          <ul className="grid grid-cols-1 border-t border-line md:grid-cols-2 md:gap-x-12 lg:gap-x-20">
            {manualTasks.map((task) => (
              <li
                key={task.id}
                className="group flex items-baseline justify-between gap-6 border-b border-line py-3.5"
              >
                <span className="text-[0.9375rem] text-fg">{task.label}</span>
                <span className="shrink-0 text-2xs uppercase tracking-[0.1em] text-fg-subtle">
                  {task.where}
                </span>
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal className="max-w-[46ch]">
          <p className="font-display text-h3 text-fg">
            Ninguna de estas tareas necesita criterio. Todas necesitan tiempo.
          </p>
        </Reveal>
      </Container>
    </Section>
  );
}
