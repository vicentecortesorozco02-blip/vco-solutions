import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { brand, primaryCta } from "@/config/brand";

/**
 * The closing ask.
 *
 * One sentence, one button, and the smallest possible commitment: describe a
 * process in two lines. Everything else on this page exists to make this
 * moment feel obvious.
 */
export function FinalCta({ index = "08" }: { index?: string }) {
  return (
    <Section id="contacto-cta" tone="paper" divided rhythm="loose">
      <Container className="flex flex-col items-start gap-8">
        <Reveal className="flex w-full flex-col gap-8">
          <div className="flex items-center gap-3 border-t border-line pt-4 text-2xs font-medium uppercase tracking-[0.16em] text-fg-subtle">
            <span className="tnum text-accent-text">{index}</span>
            <span>Empezar</span>
          </div>

          <h2 className="max-w-[18ch] font-display text-h1 font-normal tracking-[-0.015em] text-fg">
            Dinos qué tarea te está costando el tiempo.
          </h2>

          <p className="max-w-[54ch] text-lead text-fg-muted">
            Descríbela en dos líneas. Te contestamos con una opinión honesta:
            si es un caso claro, si conviene medirlo antes, o si sinceramente no
            merece la pena tocarlo.
          </p>

          <div className="flex flex-col gap-4 pt-2 sm:flex-row sm:items-center sm:gap-6">
            <Button
              href={primaryCta.href}
              size="lg"
              block
              className="sm:w-auto"
              event="cta_primary_click"
              eventLocation="final"
            >
              {primaryCta.label}
              <ArrowRight
                className="size-4 transition-transform duration-[var(--duration-base)] ease-[var(--ease-out-quart)] group-hover/btn:translate-x-0.5"
                strokeWidth={2}
              />
            </Button>

            <a
              href={`mailto:${brand.email}`}
              className="inline-flex min-h-11 w-fit items-center text-sm text-fg-muted underline decoration-line-strong underline-offset-4 transition-colors hover:text-fg hover:decoration-accent"
            >
              o escríbenos a {brand.email}
            </a>
          </div>
        </Reveal>
      </Container>
    </Section>
  );
}
