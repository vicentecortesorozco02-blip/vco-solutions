import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { routes } from "@/config/site";
import { methodName, methodPromise } from "@/content/method";

import { MethodTrack } from "./MethodTrack";

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
          eyebrow={methodName}
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

        <MethodTrack />

        <p className="type-label text-fg-subtle">
          Sin tarifas publicadas. Antes de proponer nada, medimos lo que cuesta hoy.
        </p>
      </Container>
    </Section>
  );
}
