import { ArrowRight } from "lucide-react";

import { SolutionCard } from "@/components/cards/SolutionCard";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { routes } from "@/config/site";
import { solutionSummaries } from "@/content/solutions";

/**
 * What we take off the table.
 *
 * Categories are outcome-led, never technology-led. The list is generated from
 * content, so a seventh category is a data change and not a layout change.
 */
export function Solutions() {
  return (
    <Section id="soluciones" tone="paper" divided>
      <Container className="flex flex-col gap-12">
        <SectionHeader
          index="03"
          eyebrow="Qué eliminamos"
          title="Seis frentes donde casi siempre hay horas escondidas"
          lead="Cada uno empieza por el mismo sitio: un proceso concreto, medido, con su antes y su después."
          action={
            <Button
              href={routes.solutions}
              variant="secondary"
              event="cta_secondary_click"
              eventLocation="solutions"
            >
              Ver todas las soluciones
              <ArrowRight className="size-4" strokeWidth={1.75} />
            </Button>
          }
        />

        <Reveal>
          <div className="grid grid-cols-1 gap-px border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
            {solutionSummaries.map((solution) => (
              <SolutionCard key={solution.slug} solution={solution} />
            ))}
          </div>
        </Reveal>
      </Container>
    </Section>
  );
}
