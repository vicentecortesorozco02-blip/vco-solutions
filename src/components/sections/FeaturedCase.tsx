import { ArrowRight } from "lucide-react";

import { BeforeAfter } from "@/components/diagrams/ProcessFlow";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { DemonstrationBadge, MetricValue } from "@/components/ui/Metric";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { routes } from "@/config/site";
import { featuredCase } from "@/content/cases";

/**
 * One process, end to end.
 *
 * The page has argued that time is hiding in ordinary tasks. Here it shows a
 * whole process changing shape, with the arithmetic printed underneath. The
 * demonstration label is not fine print: it is the reason the numbers can be
 * trusted.
 */
export function FeaturedCase() {
  return (
    <Section id="demostracion" tone="surface" divided>
      <Container className="flex flex-col gap-12">
        <SectionHeader
          index="05"
          eyebrow="Un proceso completo"
          title={featuredCase.title}
          lead={featuredCase.excerpt}
          action={
            <Button
              href={routes.case(featuredCase.slug)}
              variant="secondary"
              event="case_card_click"
              eventLocation="home_featured"
              eventId={featuredCase.slug}
            >
              Ver el caso entero
              <ArrowRight className="size-4" strokeWidth={1.75} />
            </Button>
          }
        />

        <Reveal>
          <div className="border border-line bg-bg p-6 sm:p-9 lg:p-12">
            <BeforeAfter process={featuredCase.process} />
          </div>
        </Reveal>

        <Reveal className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] lg:gap-16">
          <dl className="grid grid-cols-2 gap-x-10 gap-y-10">
            {featuredCase.results.map((metric) => (
              <div key={metric.label}>
                <MetricValue metric={metric} />
              </div>
            ))}
          </dl>

          <div className="flex flex-col gap-4 border-t border-line pt-6 lg:border-l lg:border-t-0 lg:pl-16 lg:pt-0">
            <DemonstrationBadge className="self-start" />
            <p className="text-sm text-fg-muted">{featuredCase.workings}</p>
            <p className="text-sm text-fg-muted">
              Todavía no publicamos resultados de clientes porque no los hay que
              publicar. Cuando los haya, llevarán nombre y método de medición.
            </p>
          </div>
        </Reveal>
      </Container>
    </Section>
  );
}
