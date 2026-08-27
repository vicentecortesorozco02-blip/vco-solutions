import { ArrowRight } from "lucide-react";

import { ProcessRibbon } from "@/components/diagrams/ProcessRibbon";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { brand, primaryCta, secondaryCta } from "@/config/brand";

/**
 * Hero.
 *
 * One idea, one dominant action. The headline names the reader's problem
 * instead of describing our capabilities, and the diagram carries the argument
 * so the copy can stay short.
 *
 * Nothing above the fold is animated on entry: the LCP element must paint on
 * the first frame, not after an IntersectionObserver callback.
 */
export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 u-grid-field opacity-70"
      />

      <Container className="relative pb-[calc(var(--section-y)*0.85)] pt-[clamp(3rem,1.5rem+5vw,6.5rem)]">
        <div className="flex max-w-[54rem] flex-col gap-7">
          <p className="text-2xs font-medium uppercase tracking-[0.18em] text-fg-subtle">
            {brand.tagline}
          </p>

          <h1 className="max-w-[17ch] font-display text-h1 font-normal tracking-[-0.015em] text-fg">
            Tu empresa tiene tareas que nadie debería seguir haciendo a mano.
          </h1>

          <p className="max-w-[56ch] text-lead text-fg-muted">
            Analizamos cómo trabaja tu empresa y construimos los sistemas que
            eliminan ese trabajo repetitivo. Menos errores, más capacidad y horas
            que vuelven a tu equipo.
          </p>

          <div className="flex flex-col gap-4 pt-2">
            <div className="flex flex-col gap-3 xs:flex-row xs:flex-wrap xs:items-center">
              <Button
                href={primaryCta.href}
                size="lg"
                block
                className="xs:w-auto"
                event="cta_primary_click"
                eventLocation="hero"
              >
                {primaryCta.label}
                <ArrowRight
                  className="size-4 transition-transform duration-[var(--duration-base)] ease-[var(--ease-out-quart)] group-hover/btn:translate-x-0.5"
                  strokeWidth={2}
                />
              </Button>

              <Button
                href={secondaryCta.href}
                variant="secondary"
                size="lg"
                block
                className="xs:w-auto"
                event="cta_secondary_click"
                eventLocation="hero"
              >
                {secondaryCta.label}
              </Button>
            </div>

            <p className="text-sm text-fg-subtle">
              La primera conversación no cuesta nada. Si no vemos recorrido, te lo
              decimos.
            </p>
          </div>
        </div>

        <Reveal className="mt-[clamp(3rem,2rem+3.5vw,5rem)]">
          <ProcessRibbon
            caption="Ejemplo: una solicitud de presupuesto que entra por correo"
            manual={{
              title: "Hoy",
              cost: "≈ 25 min de una persona",
              nodes: [
                { label: "Correo" },
                { label: "Alguien lo lee" },
                { label: "Busca tarifas" },
                { label: "Calcula" },
                { label: "Monta el PDF" },
                { label: "Responde" },
              ],
            }}
            automated={{
              title: "Con el sistema",
              cost: "≈ 2 min de revisión",
              nodes: [
                { label: "Correo", kind: "edge" },
                { label: "Sistema", kind: "system" },
                { label: "Presupuesto enviado" },
              ],
            }}
          />
        </Reveal>
      </Container>
    </section>
  );
}
