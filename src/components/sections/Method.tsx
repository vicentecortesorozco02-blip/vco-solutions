import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { routes } from "@/config/site";
import { methodPhases, methodPromise } from "@/content/method";

/**
 * How we work.
 *
 * Where YourHotelWeb shows its three plans, we show the five phases: columns
 * under a heavy rule, each with what the client receives. No prices: see
 * D-012 and the FAQ.
 */
export function Method() {
  return (
    <Section id="metodo" tone="paper">
      <Container className="flex flex-col gap-14 lg:gap-20">
        <SectionHeader
          eyebrow="Cómo trabajamos"
          title={["Cinco fases.", "Ningún salto de fe."]}
          lead={methodPromise}
          action={
            <Button
              href={routes.method}
              variant="secondary"
              event="cta_secondary_click"
              eventLocation="method"
            >
              Ver el método completo
              <ArrowRight className="size-4" strokeWidth={2} />
            </Button>
          }
        />

        <ol className="grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-5">
          {methodPhases.map((phase, index) => (
            <li key={phase.number}>
              <Reveal delay={Math.min(index, 4)} className="flex h-full flex-col gap-4 border-t-2 border-fg pt-6">
                <p className="type-label tnum text-fg-subtle">{phase.number}</p>
                {/* Five columns at lg: the verbs only fit at h4. */}
                <h3 className="type-display text-h3 text-fg lg:text-h4">{phase.title}</h3>
                <p className="text-sm text-fg-muted">{phase.summary}</p>
                <div className="mt-auto flex flex-col gap-1.5 pt-2">
                  <p className="type-label text-fg-subtle">Qué recibes</p>
                  <p className="text-sm text-fg">{phase.deliverable}</p>
                </div>
              </Reveal>
            </li>
          ))}
        </ol>

        <p className="type-label text-fg-subtle">
          Sin tarifas publicadas. Antes de construir, calculamos lo que el proceso cuesta hoy.
        </p>
      </Container>
    </Section>
  );
}
