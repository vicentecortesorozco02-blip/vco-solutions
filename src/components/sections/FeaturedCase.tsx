import { ArrowRight } from "lucide-react";

import { BeforeAfter } from "@/components/diagrams/ProcessFlow";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { StatRow } from "@/components/ui/Figure";
import { DemonstrationBadge } from "@/components/ui/Metric";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { routes } from "@/config/site";
import { featuredCase } from "@/content/cases";

/**
 * "De esto. A esto."
 *
 * The dark block with one whole process changing shape, as YourHotelWeb shows
 * an old hotel site turning into a new one. Here what changes is a process,
 * so the panel is the before/after diagram, not a picture. The demonstration
 * label is not fine print: it is why the numbers can be trusted.
 */
export function FeaturedCase() {
  return (
    <Section id="demostracion" tone="inverse">
      <Container className="flex flex-col gap-14">
        <SectionHeader
          tone="inverse"
          title={["De esto.", "A esto."]}
          lead={`${featuredCase.title}. ${featuredCase.excerpt}`}
        />

        {/* El cambio, contado en pasos antes de dibujarlo. */}
        <StatRow
          tone="inverse"
          stats={[
            {
              label: "Pasos a mano hoy",
              value: featuredCase.process.before.steps.length,
              unit: "count",
              note: featuredCase.process.before.summary,
            },
            {
              label: "Pasos con el sistema",
              value: featuredCase.process.after.steps.length,
              unit: "count",
              note: featuredCase.process.after.summary,
            },
            {
              label: featuredCase.headline.label,
              value: featuredCase.headline.value,
              note: "cálculo ilustrativo, con las hipótesis a la vista",
            },
          ]}
        />

        <Reveal>
          <div className="rounded-2xl bg-surface p-6 text-fg sm:p-9 lg:p-12">
            <BeforeAfter process={featuredCase.process} />
          </div>
        </Reveal>

        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between lg:gap-16">
          <div className="flex max-w-[62ch] flex-col gap-3">
            <DemonstrationBadge tone="inverse" className="self-start" />
            <p className="text-sm text-fg-inverse-muted">{featuredCase.workings}</p>
          </div>
          <Button
            href={routes.case(featuredCase.slug)}
            variant="light"
            className="shrink-0 self-start lg:self-center"
            event="case_card_click"
            eventLocation="home_featured"
            eventId={featuredCase.slug}
          >
            Ver el caso entero
            <ArrowRight className="size-4" strokeWidth={2} />
          </Button>
        </div>
      </Container>
    </Section>
  );
}
