import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";

import { BeforeAfter } from "@/components/diagrams/ProcessFlow";
import { PageHero } from "@/components/layout/PageHero";
import { FinalCta } from "@/components/sections/FinalCta";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { DemonstrationBadge, MetricValue } from "@/components/ui/Metric";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { primaryCta } from "@/config/brand";
import { routes } from "@/config/site";
import { getCase, publishedCases } from "@/content/cases";
import { breadcrumbSchema, pageMetadata } from "@/lib/seo";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return publishedCases.map((entry) => ({ slug: entry.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const entry = getCase(slug);

  if (!entry) {
    return pageMetadata({
      title: "Caso no encontrado",
      description: "",
      path: routes.case(slug),
      index: false,
    });
  }

  return pageMetadata({
    title: entry.seo.title,
    description: entry.seo.description,
    path: routes.case(entry.slug),
    type: "article",
  });
}

export default async function CasePage({ params }: PageProps) {
  const { slug } = await params;
  const entry = getCase(slug);

  if (!entry) notFound();

  const crumbs = [
    { name: "Inicio", path: routes.home },
    { name: "Casos", path: routes.cases },
    { name: entry.title, path: routes.case(entry.slug) },
  ];

  return (
    <>
      <PageHero
        eyebrow={entry.sector}
        title={entry.title}
        lead={entry.excerpt}
        crumbs={crumbs}
        aside={
          <div className="flex flex-col gap-5 border-t border-line pt-6 lg:border-l lg:border-t-0 lg:pl-12 lg:pt-0">
            <MetricValue metric={entry.headline} />
            {entry.kind === "demonstration" ? (
              <DemonstrationBadge className="self-start" />
            ) : null}
          </div>
        }
      >
        <Button
          href={primaryCta.href}
          event="cta_primary_click"
          eventLocation="case_hero"
          eventId={entry.slug}
        >
          {primaryCta.shortLabel}
          <ArrowRight className="size-4" strokeWidth={1.75} />
        </Button>
      </PageHero>

      <Section tone="paper">
        <Container className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.4fr)] lg:gap-20">
          <SectionHeader index="01" eyebrow="El punto de partida" title="Cómo se trabajaba" />
          <p className="max-w-[64ch] text-lead text-fg-muted">{entry.situation}</p>
        </Container>
      </Section>

      <Section tone="surface" divided>
        <Container className="flex flex-col gap-12">
          <SectionHeader
            index="02"
            eyebrow="Antes y después"
            title="El proceso, paso a paso"
          />
          <Reveal>
            <div className="border border-line bg-bg p-6 sm:p-9 lg:p-12">
              <BeforeAfter process={entry.process} />
            </div>
          </Reveal>
        </Container>
      </Section>

      <Section tone="paper" divided>
        <Container className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.4fr)] lg:gap-20">
          <SectionHeader index="03" eyebrow="La solución" title={entry.solution.title} />

          <div className="flex flex-col gap-8">
            <p className="max-w-[64ch] text-lead text-fg-muted">{entry.solution.body}</p>

            <ul className="grid grid-cols-1 gap-x-12 border-t border-line sm:grid-cols-2">
              {entry.solution.components.map((component) => (
                <li
                  key={component}
                  className="border-b border-line py-3 text-sm text-fg"
                >
                  {component}
                </li>
              ))}
            </ul>
          </div>
        </Container>
      </Section>

      <Section tone="surface" divided>
        <Container className="flex flex-col gap-12">
          <SectionHeader index="04" eyebrow="El resultado" title="Qué cambia, en números" />

          <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] lg:gap-20">
            <dl className="grid grid-cols-2 gap-x-10 gap-y-10">
              {entry.results.map((metric) => (
                <div key={metric.label}>
                  <MetricValue metric={metric} />
                </div>
              ))}
            </dl>

            {entry.workings ? (
              <div className="flex flex-col gap-4 border-t border-line pt-6 lg:border-l lg:border-t-0 lg:pl-20 lg:pt-0">
                <p className="text-2xs font-medium uppercase tracking-[0.16em] text-fg-subtle">
                  Cómo sale ese número
                </p>
                <p className="text-sm text-fg-muted">{entry.workings}</p>
              </div>
            ) : null}
          </div>
        </Container>
      </Section>

      <FinalCta index="05" />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema(crumbs)),
        }}
      />
    </>
  );
}
