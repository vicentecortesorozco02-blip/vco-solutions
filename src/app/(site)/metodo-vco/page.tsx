import type { Metadata } from "next";

import { PageHero } from "@/components/layout/PageHero";
import { FaqSection } from "@/components/sections/FaqSection";
import { FinalCta } from "@/components/sections/FinalCta";
import { MethodPhases } from "@/components/sections/MethodPhases";
import { MethodTrack } from "@/components/sections/MethodTrack";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { routes } from "@/config/site";
import { methodBoundaries, methodName, methodPromise, principles } from "@/content/method";
import type { FaqItem } from "@/content/types";
import { breadcrumbSchema, faqSchema, pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: `${methodName}: cómo detectamos y aplicamos mejoras`,
  description:
    "Descubrir, detectar, priorizar, transformar y medir. La metodología con la que auditamos una empresa, ordenamos sus oportunidades por impacto y aplicamos las mejoras.",
  path: routes.method,
});

const crumbs = [
  { name: "Inicio", path: routes.home },
  { name: methodName, path: routes.method },
];

/** Qué se mira en la fase 01. Nada de esto exige informes nuevos. */
const whatWeLookAt = [
  {
    title: "Cómo entra un cliente",
    body: "Por dónde llega, quién lo atiende, cuánto se tarda en contestar y qué pasa si llega un viernes a las siete.",
  },
  {
    title: "Cómo se vende",
    body: "Qué se ofrece primero, cómo se hace un presupuesto, quién hace seguimiento y qué porcentaje acaba en respuesta.",
  },
  {
    title: "Cómo se entrega",
    body: "Los pasos desde que se acepta hasta que se cobra, con las excepciones, que suelen ser la mitad del trabajo.",
  },
  {
    title: "En qué se va el tiempo",
    body: "Las tareas repetitivas, los cuadres, los informes y las comprobaciones que nadie menciona en una reunión.",
  },
  {
    title: "Dónde está el margen",
    body: "Qué servicios y qué clientes dejan dinero cuando se cuentan las horas de verdad.",
  },
  {
    title: "Qué dicen los clientes",
    body: "Reseñas, quejas repetidas, motivos de baja y lo que pregunta la gente antes de comprar.",
  },
];

/** Cómo se ordena la lista. Las cuatro variables, no solo el impacto. */
const priorityCriteria = [
  {
    title: "Impacto económico estimado",
    body: "Qué puede rendir al mes o al año, con la hipótesis y el cálculo escritos para que puedas discutirlos.",
  },
  {
    title: "Esfuerzo",
    body: "Cuánto trabajo lleva, de tu equipo y del nuestro. Una mejora que exige tres meses de tu gente no es barata aunque no se pague en factura.",
  },
  {
    title: "Inversión",
    body: "Lo que cuesta aplicarla, incluidos los costes recurrentes que se quedan después.",
  },
  {
    title: "Rapidez",
    body: "Cuánto tarda en notarse. Una mejora pequeña que se ve en dos semanas suele ir antes que una grande que tarda seis meses.",
  },
];

const deliverables = [
  "El retrato de cómo funciona hoy tu negocio, con sus números.",
  "La lista de oportunidades detectadas, cada una con dónde ocurre y qué está costando.",
  "El orden de trabajo: impacto estimado, esfuerzo, inversión y plazo de cada una.",
  "Las mejoras aplicadas, funcionando y con el equipo formado.",
  "La comparación de indicadores antes y después, y la siguiente oportunidad priorizada.",
];

const methodFaq: FaqItem[] = [
  {
    id: "metodo-duracion",
    question: "¿Cuánto dura todo esto?",
    answer:
      "Descubrir y detectar se hacen en días, no en meses: son conversaciones y datos que ya existen. Lo que tarda es aplicar las mejoras, y eso depende de cuál se elija. Por eso se prioriza antes de empezar a trabajar.",
  },
  {
    id: "metodo-sin-software",
    question: "¿Y si la mejora no necesita software?",
    answer:
      "Se aplica igual. Una parte de lo que encontramos se arregla cambiando un texto, un orden de llamada o quién responde primero. Decirlo es parte del trabajo; vender un desarrollo que no hace falta, no.",
  },
  {
    id: "metodo-equipo",
    question: "¿Cuánto tiempo tiene que dedicar mi equipo?",
    answer:
      "En la fase de descubrir, unas pocas horas repartidas: conversaciones cortas con quien hace el trabajo. Después depende de la mejora, y se acuerda antes de empezar.",
  },
  {
    id: "metodo-confidencialidad",
    question: "¿Qué pasa con la información que compartimos?",
    answer:
      "Se trabaja con el mínimo dato necesario y con acuerdo de confidencialidad. No publicamos clientes ni resultados sin permiso escrito, que es la razón de que en esta web todavía no haya ninguno.",
  },
  {
    id: "metodo-precio",
    question: "¿Cuánto cuesta?",
    answer:
      "No publicamos tarifas porque el alcance cambia con el tamaño del negocio y con la mejora elegida. Lo que sí hacemos es presentar cada mejora con su impacto estimado y su coste al lado, para que la decisión sea tuya y con números.",
  },
];

export default function MethodPage() {
  return (
    <>
      <PageHero
        eyebrow={methodName}
        title="Descubrir, detectar, priorizar, transformar y medir"
        lead={methodPromise}
        crumbs={crumbs}
        aside={
          <div className="flex flex-col gap-4 border-t border-line pt-6 lg:border-l lg:border-t-0 lg:pl-12 lg:pt-0">
            <p className="type-label text-fg-subtle">La idea de fondo</p>
            <p className="type-display text-h3 text-fg">Pequeños cambios, grandes resultados</p>
            <p className="text-sm text-fg-muted">
              Antes de invertir más, descubre qué puedes mejorar. Casi siempre hay crecimiento
              escondido en el día a día: oportunidades que ya se han pagado y se escapan por el
              camino.
            </p>
          </div>
        }
      />

      <Section tone="paper">
        <Container className="flex flex-col gap-12">
          <SectionHeader
            index="01"
            eyebrow="El recorrido"
            title="Las cinco fases, una por una"
            lead="Elige una fase para ver qué se hace en ella y qué te llevas al terminarla."
          />
          <MethodTrack />

          <details className="group/all border-t border-line pt-6">
            <summary className="type-label flex min-h-11 cursor-pointer list-none items-center gap-2 text-fg-subtle [&::-webkit-details-marker]:hidden">
              <span className="group-open/all:hidden">Ver las cinco fases escritas de corrido</span>
              <span className="hidden group-open/all:inline">Ocultar el detalle</span>
            </summary>
            <MethodPhases tone="default" detailed className="mt-6" />
          </details>
        </Container>
      </Section>

      <Section tone="surface" divided>
        <Container className="flex flex-col gap-12">
          <SectionHeader
            index="02"
            eyebrow="Qué analizamos"
            title="Seis sitios donde casi siempre hay algo"
            lead="Nada de esto exige que prepares informes: se mira lo que ya tienes."
          />

          <div className="grid grid-cols-1 gap-x-16 gap-y-10 border-t border-line pt-10 md:grid-cols-2 lg:grid-cols-3">
            {whatWeLookAt.map((item, index) => (
              <Reveal key={item.title} delay={Math.min(index, 4)} className="flex flex-col gap-3">
                <h3 className="max-w-[24ch] text-h4 font-medium text-fg">{item.title}</h3>
                <p className="text-fg-muted">{item.body}</p>
              </Reveal>
            ))}
          </div>
        </Container>
      </Section>

      <Section tone="paper" divided>
        <Container className="flex flex-col gap-12">
          <SectionHeader
            index="03"
            eyebrow="Cómo priorizamos"
            title="Cuatro variables, no solo el impacto"
            lead="Arriba de la lista no suele estar lo más espectacular, sino lo que más rinde por lo poco que cuesta."
          />

          <div className="grid grid-cols-1 gap-x-16 gap-y-10 border-t border-line pt-10 md:grid-cols-2">
            {priorityCriteria.map((item, index) => (
              <Reveal key={item.title} delay={Math.min(index, 3)} className="flex flex-col gap-3">
                <h3 className="max-w-[26ch] text-h4 font-medium text-fg">{item.title}</h3>
                <p className="max-w-[52ch] text-fg-muted">{item.body}</p>
              </Reveal>
            ))}
          </div>
        </Container>
      </Section>

      <Section tone="surface" divided>
        <Container className="flex flex-col gap-12 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:gap-20">
          <SectionHeader
            index="04"
            eyebrow="Qué recibes"
            title="Documentos que puedes señalar"
            lead="Si al acabar una fase no hay nada que enseñar, esa fase no ha terminado."
            size="side"
          />

          <ol className="flex flex-col border-t border-line">
            {deliverables.map((item, index) => (
              <li key={item} className="flex gap-4 border-b border-line py-5">
                <span className="tnum pt-1 text-xs text-fg-subtle">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="text-[0.9375rem] text-fg">{item}</span>
              </li>
            ))}
          </ol>
        </Container>
      </Section>

      <Section tone="paper" divided>
        <Container className="flex flex-col gap-12">
          <SectionHeader
            index="05"
            eyebrow="Lo que no hacemos"
            title="Tres cosas que no vas a encontrarte"
          />

          <div className="grid grid-cols-1 gap-x-16 gap-y-10 border-t border-line pt-10 md:grid-cols-3">
            {methodBoundaries.map((item, index) => (
              <Reveal key={item} delay={Math.min(index, 3)}>
                <p className="text-fg-muted">{item}</p>
              </Reveal>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-x-16 gap-y-10 border-t border-line pt-10 md:grid-cols-2 lg:gap-x-24">
            {principles.map((principle, index) => (
              <Reveal key={principle.title} delay={Math.min(index, 3)} className="flex flex-col gap-3">
                <h3 className="max-w-[24ch] text-h4 font-medium text-fg">{principle.title}</h3>
                <p className="max-w-[52ch] text-fg-muted">{principle.body}</p>
              </Reveal>
            ))}
          </div>
        </Container>
      </Section>

      <FaqSection items={methodFaq} />

      <FinalCta />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema(crumbs)),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema(methodFaq)) }}
      />
    </>
  );
}
