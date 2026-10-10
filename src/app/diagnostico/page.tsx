import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";

import { TimeCalculator } from "@/components/features/TimeCalculator";
import { PageHero } from "@/components/layout/PageHero";
import { FinalCta } from "@/components/sections/FinalCta";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { primaryCta } from "@/config/brand";
import { routes } from "@/config/site";
import { breadcrumbSchema, pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "¿Cuánto trabajo podrías automatizar?",
  description:
    "Calcula cuántas horas al año consume una tarea repetitiva de tu empresa y cuánto cuesta. Aritmética simple, sobre tus propios números.",
  path: routes.diagnosis,
});

const crumbs = [
  { name: "Inicio", path: routes.home },
  { name: "Diagnóstico", path: routes.diagnosis },
];

const upcoming = [
  "Preguntas por sector, para comparar con procesos parecidos.",
  "Tipo de proceso concreto: presupuestos, facturas, informes, atención.",
  "Herramientas que ya utilizáis, para estimar el esfuerzo de integración.",
  "Un tramo estimado de qué parte del proceso es automatizable.",
  "Un informe descargable con el cálculo y las hipótesis usadas.",
];

export default function DiagnosisPage() {
  return (
    <>
      <PageHero
        eyebrow="Diagnóstico"
        title="¿Cuánto trabajo podrías automatizar?"
        lead="Empieza por una sola tarea. Pon tus números y mira cuánto suma al cabo del año: casi siempre es más de lo que parece."
        crumbs={crumbs}
      >
        <Button
          href={primaryCta.href}
          event="cta_primary_click"
          eventLocation="diagnosis_hero"
        >
          {primaryCta.shortLabel}
          <ArrowRight className="size-4" strokeWidth={1.75} />
        </Button>
      </PageHero>

      <Section tone="paper">
        <Container className="flex flex-col gap-10">
          <TimeCalculator />

          <p className="max-w-[68ch] text-sm text-fg-subtle">
            Esto es aritmética, no una estimación de ahorro. Cuánto de ese
            tiempo se puede eliminar depende del proceso, y eso solo se sabe
            mirándolo. Es exactamente lo que hacemos en las dos primeras fases.
          </p>
        </Container>
      </Section>

      <Section tone="surface" divided>
        <Container className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.3fr)] lg:gap-20">
          <SectionHeader size="side"
            index="01"
            eyebrow="En construcción"
            title="Esta herramienta va a crecer"
            lead="Preferimos publicar una calculadora honesta y pequeña antes que un cuestionario largo que finja precisión."
          />

          <div className="flex flex-col gap-6">
            <p className="type-label text-fg-subtle">
              Lo que añadiremos
            </p>
            <ul className="border-t border-line">
              {upcoming.map((item) => (
                <li
                  key={item}
                  className="border-b border-line py-3.5 text-[0.9375rem] text-fg-muted"
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </Container>
      </Section>

      <FinalCta />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema(crumbs)),
        }}
      />
    </>
  );
}
