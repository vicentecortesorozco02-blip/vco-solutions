import Link from "next/link";

import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { routes } from "@/config/site";
import { areas, signals } from "@/content/areas";

/**
 * «Lo que no ves también te cuesta».
 *
 * Ocho situaciones que el visitante reconoce, cada una con las tres partes:
 * qué pasa, qué se está escapando y qué se hace. Sin cifras: lo que se afirma
 * es el mecanismo, no un porcentaje que nadie ha medido.
 */
export function Signals() {
  const areaName = new Map(areas.map((area) => [area.slug, area.shortTitle]));

  return (
    <Section id="senales" tone="sunken" divided>
      <Container className="flex flex-col gap-14 lg:gap-20">
        <SectionHeader
          eyebrow="Dónde se escapa el dinero"
          title={["Lo que no ves", "también te cuesta"]}
          lead="Ninguna de estas situaciones aparece en la cuenta de resultados con su nombre. Todas se pagan igual."
        />

        <Reveal>
          <ul className="grid grid-cols-1 gap-x-10 md:grid-cols-2">
            {signals.map((signal, index) => (
              <li key={signal.id} className="flex flex-col gap-4 border-t border-line-strong py-7">
                <div className="flex items-baseline gap-3">
                  <span className="tnum text-xs text-fg-subtle">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <p className="text-[1.0625rem] font-medium text-fg">{signal.situation}</p>
                </div>

                <dl className="flex flex-col gap-2.5 pl-7">
                  <div className="flex flex-col gap-0.5">
                    <dt className="type-label text-fg-subtle">La oportunidad</dt>
                    <dd className="text-sm text-fg-muted">{signal.opportunity}</dd>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <dt className="type-label text-fg-subtle">Qué se hace</dt>
                    <dd className="text-sm text-fg">{signal.fix}</dd>
                  </div>
                </dl>

                <p className="pl-7">
                  <Link
                    href={routes.area(signal.area)}
                    className="text-sm font-medium text-fg underline decoration-line-strong underline-offset-4 transition-colors hover:decoration-fg"
                  >
                    {areaName.get(signal.area)}
                  </Link>
                </p>
              </li>
            ))}
          </ul>
        </Reveal>
      </Container>
    </Section>
  );
}
