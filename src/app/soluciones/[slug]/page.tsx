import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, ArrowUpRight } from "lucide-react";

import { BeforeAfter } from "@/components/diagrams/ProcessFlow";
import { PageHero } from "@/components/layout/PageHero";
import { FaqSection } from "@/components/sections/FaqSection";
import { FinalCta } from "@/components/sections/FinalCta";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { primaryCta } from "@/config/brand";
import { routes } from "@/config/site";
import {
  getRelatedSolutions,
  getSolution,
  publishedSolutions,
} from "@/content/solutions";
import {
  breadcrumbSchema,
  faqSchema,
  pageMetadata,
  serviceSchema,
} from "@/lib/seo";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return publishedSolutions.map((solution) => ({ slug: solution.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const solution = getSolution(slug);

  if (!solution) return pageMetadata({ title: "Solución no encontrada", description: "", path: routes.solution(slug), index: false });

  return pageMetadata({
    title: solution.seo.title,
    description: solution.seo.description,
    path: routes.solution(solution.slug),
  });
}

export default async function SolutionPage({ params }: PageProps) {
  const { slug } = await params;
  const solution = getSolution(slug);

  if (!solution) notFound();

  const related = getRelatedSolutions(solution.slug);
  const crumbs = [
    { name: "Inicio", path: routes.home },
    { name: "Soluciones", path: routes.solutions },
    { name: solution.title, path: routes.solution(solution.slug) },
  ];

  return (
    <>
      <PageHero
        eyebrow={solution.title}
        title={solution.heading}
        lead={solution.excerpt}
        crumbs={crumbs}
        aside={
          <div className="flex flex-col gap-5 border-t border-line pt-6 lg:border-l lg:border-t-0 lg:pl-12 lg:pt-0">
            <p className="type-label text-fg-subtle">
              El recorrido
            </p>
            <ol className="flex flex-col gap-3">
              {solution.chain.map((step, index) => (
                <li key={step} className="flex items-baseline gap-3 text-sm text-fg">
                  <span className="tnum text-2xs text-fg-subtle">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          </div>
        }
      >
        <Button
          href={primaryCta.href}
          event="cta_primary_click"
          eventLocation="solution_hero"
          eventId={solution.slug}
        >
          {primaryCta.shortLabel}
          <ArrowRight className="size-4" strokeWidth={1.75} />
        </Button>
      </PageHero>

      <Section tone="paper">
        <Container className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.4fr)] lg:gap-20">
          <SectionHeader size="side" index="01" eyebrow="El problema" title={solution.problem.title} />

          <div className="flex flex-col gap-8">
            <p className="max-w-[62ch] text-lead text-fg-muted">
              {solution.problem.body}
            </p>

            <ul className="border-t border-line">
              {solution.problem.symptoms.map((symptom) => (
                <li
                  key={symptom}
                  className="border-b border-line py-3.5 text-[0.9375rem] text-fg"
                >
                  {symptom}
                </li>
              ))}
            </ul>
          </div>
        </Container>
      </Section>

      <Section tone="surface" divided>
        <Container className="flex flex-col gap-12">
          <SectionHeader
            index="02"
            eyebrow="Antes y después"
            title="El mismo proceso, con y sin trabajo manual"
          />

          <Reveal>
            <div className="border border-line bg-bg p-6 sm:p-9 lg:p-12">
              <BeforeAfter process={solution.process} />
            </div>
          </Reveal>
        </Container>
      </Section>

      <Section tone="paper" divided>
        <Container className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.4fr)] lg:gap-20">
          <SectionHeader size="side"
            index="03"
            eyebrow="Qué construimos"
            title="Las piezas que suele tener un sistema así"
          />

          <div className="flex flex-col gap-10">
            <ul className="flex flex-col gap-5 border-t border-line pt-6">
              {solution.buildingBlocks.map((block) => (
                <li key={block} className="flex gap-4">
                  <span aria-hidden className="mt-2.5 size-1.5 shrink-0 rotate-45 bg-accent" />
                  <span className="max-w-[62ch] text-fg-muted">{block}</span>
                </li>
              ))}
            </ul>

            <div className="flex flex-col gap-4 border-t border-line pt-6">
              <p className="type-label text-fg-subtle">
                Con qué se conecta
              </p>
              <ul className="flex flex-wrap gap-2">
                {solution.integrations.map((integration) => (
                  <li
                    key={integration}
                    className="rounded-sm border border-line px-3 py-1.5 text-xs text-fg-muted"
                  >
                    {integration}
                  </li>
                ))}
              </ul>
              <p className="text-2xs text-fg-subtle">
                Trabajamos sobre las herramientas que ya tenéis. Cambiar de
                programa es una decisión vuestra, no un requisito nuestro.
              </p>
            </div>
          </div>
        </Container>
      </Section>

      <Section tone="surface" divided>
        <Container className="flex flex-col gap-12">
          <SectionHeader
            index="04"
            eyebrow="Qué cambia"
            title="Lo que se nota a las pocas semanas"
          />

          <div className="grid grid-cols-1 gap-x-16 gap-y-10 border-t border-line pt-10 md:grid-cols-3 lg:gap-x-20">
            {solution.benefits.map((benefit, index) => (
              <Reveal key={benefit.title} delay={Math.min(index, 3)} className="flex flex-col gap-3">
                <h3 className="max-w-[24ch] text-h4 font-medium text-fg">
                  {benefit.title}
                </h3>
                <p className="text-fg-muted">{benefit.body}</p>
              </Reveal>
            ))}
          </div>
        </Container>
      </Section>

      <FaqSection
        items={solution.faq}
        title={["Dudas sobre", "esta solución."]}
        lead="Si te falta alguna, escríbenos y te contestamos sin comercial de por medio."
      />

      {related.length > 0 ? (
        <Section tone="paper" divided rhythm="tight">
          <Container className="flex flex-col gap-8">
            <p className="border-t border-line pt-4 type-label text-fg-subtle">
              Relacionado
            </p>
            <ul className="grid grid-cols-1 gap-px border border-line bg-line sm:grid-cols-2">
              {related.map((entry) => (
                <li key={entry.slug}>
                  <Link
                    href={routes.solution(entry.slug)}
                    className="group flex h-full items-start justify-between gap-6 bg-bg p-7 transition-colors hover:bg-surface"
                  >
                    <span className="flex flex-col gap-2">
                      <span className="text-h4 font-medium text-fg">{entry.title}</span>
                      <span className="max-w-[46ch] text-sm text-fg-muted">
                        {entry.excerpt}
                      </span>
                    </span>
                    <ArrowUpRight
                      aria-hidden
                      className="mt-1 size-4 shrink-0 text-fg-subtle transition-transform duration-[var(--duration-base)] group-hover:translate-x-0.5"
                      strokeWidth={1.75}
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </Container>
        </Section>
      ) : null}

      <FinalCta />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            breadcrumbSchema(crumbs),
            serviceSchema({
              name: solution.title,
              description: solution.seo.description,
              path: routes.solution(solution.slug),
            }),
            faqSchema(solution.faq),
          ]),
        }}
      />
    </>
  );
}
