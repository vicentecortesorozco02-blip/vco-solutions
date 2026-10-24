import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowRight, ArrowUpRight } from "lucide-react";

import { BeforeAfter } from "@/components/diagrams/ProcessFlow";
import { PageHero } from "@/components/layout/PageHero";
import { FinalCta } from "@/components/sections/FinalCta";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Screenshot } from "@/components/ui/Devices";
import { KindBadge, MetricValue } from "@/components/ui/Metric";
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
        eyebrow={entry.name ? `${entry.name} · ${entry.sector}` : entry.sector}
        title={entry.title}
        lead={entry.excerpt}
        crumbs={crumbs}
        aside={
          <div className="flex flex-col gap-5 border-t border-line pt-6 lg:border-l lg:border-t-0 lg:pl-12 lg:pt-0">
            <MetricValue metric={entry.headline} />
            <KindBadge kind={entry.kind} className="self-start" />
          </div>
        }
      >
        <div className="flex flex-wrap items-center gap-3">
          <Button
            href={primaryCta.href}
            event="cta_primary_click"
            eventLocation="case_hero"
            eventId={entry.slug}
          >
            {primaryCta.shortLabel}
            <ArrowRight className="size-4" strokeWidth={1.75} />
          </Button>
          {entry.url ? (
            <Button href={entry.url} variant="secondary" target="_blank">
              Ver la web en directo
              <ArrowUpRight className="size-4" strokeWidth={1.75} />
            </Button>
          ) : null}
        </div>
      </PageHero>

      {entry.gallery && entry.gallery.length > 0 ? (
        <Section tone="sunken" ariaLabel="Capturas del sistema">
          <Container className="grid grid-cols-1 gap-x-10 gap-y-14 md:grid-cols-2">
            {entry.gallery.map((shot, index) => (
              <Reveal
                key={shot.src}
                delay={Math.min(index % 2, 1)}
                className={
                  shot.device === "phone"
                    ? "flex flex-col items-center gap-5"
                    : "flex flex-col gap-5"
                }
              >
                <Screenshot
                  src={shot.src}
                  alt={shot.alt}
                  ratio={shot.device === "phone" ? "390/844" : "16/10"}
                  sizes={
                    shot.device === "phone"
                      ? "(min-width: 768px) 220px, 55vw"
                      : "(min-width: 1240px) 600px, (min-width: 768px) 48vw, 92vw"
                  }
                  className={shot.device === "phone" ? "w-[55%] max-w-[15rem]" : undefined}
                />
                <p className="type-label text-center text-fg-subtle">{shot.caption}</p>
              </Reveal>
            ))}
          </Container>
        </Section>
      ) : null}

      <Section tone="paper">
        <Container className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.4fr)] lg:gap-20">
          <SectionHeader size="side" index="01" eyebrow="El punto de partida" title="Cómo se trabajaba" />
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
          <SectionHeader size="side" index="03" eyebrow="La solución" title={entry.solution.title} />

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
          <SectionHeader
            index="04"
            eyebrow="El resultado"
            title={
              entry.kind === "demonstration" ? "Qué cambia, en números" : "Qué hace, comprobable"
            }
          />

          <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] lg:gap-20">
            <dl className="grid grid-cols-1 gap-x-10 gap-y-10 sm:grid-cols-2">
              {entry.results.map((metric) => (
                <div key={metric.label}>
                  <MetricValue metric={metric} />
                </div>
              ))}
            </dl>

            {entry.workings ? (
              <div className="flex flex-col gap-4 border-t border-line pt-6 lg:border-l lg:border-t-0 lg:pl-20 lg:pt-0">
                <p className="type-label text-fg-subtle">
                  {entry.kind === "demonstration"
                    ? "Cómo sale ese número"
                    : "Lo que todavía no está medido"}
                </p>
                <p className="text-sm text-fg-muted">{entry.workings}</p>
              </div>
            ) : null}
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
