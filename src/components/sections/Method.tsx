import { ArrowRight } from "lucide-react";

import { MethodPhases } from "@/components/sections/MethodPhases";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { routes } from "@/config/site";
import { methodPromise } from "@/content/method";

/**
 * How we work.
 *
 * The single inverse block on the page. One tonal shift is a punctuation mark;
 * three would be noise.
 */
export function Method() {
  return (
    <Section id="metodo" tone="inverse">
      <Container className="flex flex-col gap-12">
        <SectionHeader
          index="04"
          eyebrow="Cómo trabajamos"
          title="Empezamos por entender, no por proponer"
          lead={methodPromise}
          tone="inverse"
          action={
            <Button
              href={routes.method}
              variant="inverse"
              event="cta_secondary_click"
              eventLocation="method"
            >
              Ver el método completo
              <ArrowRight className="size-4" strokeWidth={1.75} />
            </Button>
          }
        />

        <MethodPhases tone="inverse" />
      </Container>
    </Section>
  );
}
