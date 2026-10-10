import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { brand, primaryCta } from "@/config/brand";

const steps = [
  "Nos describes la tarea en dos líneas.",
  "Te contestamos con una opinión honesta.",
  "Si merece la pena, la medimos antes de proponer nada.",
];

/**
 * The closing ask, as YourHotelWeb closes: a headline, three steps that say
 * what happens next, and one panel with the action.
 *
 * The smallest possible commitment: describe a process in two lines.
 * Everything else on the page exists to make this moment feel obvious.
 */
export function FinalCta() {
  return (
    <Section id="contacto-cta" tone="sunken">
      <Container className="grid grid-cols-1 gap-14 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:items-end lg:gap-20">
        <div className="flex flex-col gap-10">
          <SectionHeader
            eyebrow="Empezar"
            title={["Dinos qué tarea", "te cuesta tiempo."]}
          />
          <p className="max-w-[34rem] text-lead text-fg-muted">
            Te contestamos si es un caso claro, si conviene medirlo antes o si,
            sinceramente, no merece la pena tocarlo.
          </p>
          <ol className="max-w-[34rem]">
            {steps.map((step, index) => (
              <li key={step} className="flex gap-4 border-t border-line-strong py-4 text-fg">
                <span className="tnum text-xs text-fg-subtle">{index + 1}</span>
                <span className="text-[0.9375rem]">{step}</span>
              </li>
            ))}
          </ol>
        </div>

        <Reveal>
          <div className="flex flex-col gap-6 rounded-2xl bg-surface p-7 ring-1 ring-line sm:p-9">
            <p className="type-label text-fg-subtle">Primera conversación sin coste</p>
            <p className="text-h4 font-medium text-fg">
              Cuéntanos el proceso. Si no vemos recorrido, te lo decimos.
            </p>
            <Button
              href={primaryCta.href}
              size="lg"
              block
              event="cta_primary_click"
              eventLocation="final"
            >
              {primaryCta.label}
              <ArrowRight
                className="size-4 transition-transform duration-[var(--duration-base)] ease-[var(--ease-out-soft)] group-hover/btn:translate-x-0.5"
                strokeWidth={2}
              />
            </Button>
            <a
              href={`mailto:${brand.email}`}
              className="inline-flex min-h-11 w-fit items-center self-center text-sm text-fg-muted underline decoration-line-strong underline-offset-4 transition-colors hover:text-fg hover:decoration-fg"
            >
              o escríbenos a {brand.email}
            </a>
          </div>
        </Reveal>
      </Container>
    </Section>
  );
}
