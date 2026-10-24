import { ArrowRight, ArrowUpRight } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Screenshot } from "@/components/ui/Devices";
import { KindBadge } from "@/components/ui/Metric";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { routes } from "@/config/site";
import { realWork } from "@/content/cases";

/**
 * Real work, on real screens.
 *
 * YourHotelWeb shows four hotel sites; we show the screens of the systems we
 * have built. Two staggered columns, as there. Every screenshot is of the real
 * thing and its caption says when the data on screen is sample data.
 *
 * Renders nothing if there is no real work to show: an empty "Trabajos" block
 * would be worse than none.
 */
export function Work() {
  const work = realWork[0];
  if (!work) return null;

  const shots = (work.gallery ?? []).filter((shot) => shot.device === "laptop").slice(0, 4);

  return (
    <Section id="trabajos" tone="paper">
      <Container className="flex flex-col gap-14 lg:gap-20">
        <SectionHeader
          eyebrow="Trabajo real"
          title={["Lo construimos", "antes de vendértelo."]}
          lead={work.excerpt}
          action={
            <div className="flex flex-wrap items-center gap-3">
              <Button
                href={routes.case(work.slug)}
                variant="secondary"
                event="case_card_click"
                eventLocation="home_work"
                eventId={work.slug}
              >
                Ver el proyecto
                <ArrowRight className="size-4" strokeWidth={2} />
              </Button>
              {work.url ? (
                <Button href={work.url} variant="quiet" target="_blank">
                  Visitar la web
                  <ArrowUpRight className="size-4" strokeWidth={2} />
                </Button>
              ) : null}
            </div>
          }
        />

        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <p className="type-display text-h3 text-fg">{work.name ?? work.title}</p>
            <KindBadge kind={work.kind} />
          </div>
          <div className="grid grid-cols-1 gap-x-10 gap-y-14 md:grid-cols-2">
            {shots.map((shot, index) => (
              <Reveal
                key={shot.src}
                delay={index % 2}
                className={index % 2 === 1 ? "md:mt-24" : undefined}
              >
                <figure className="flex flex-col gap-5">
                  <Screenshot
                    src={shot.src}
                    alt={shot.alt}
                    sizes="(min-width: 1240px) 600px, (min-width: 768px) 48vw, 92vw"
                  />
                  <figcaption className="type-label text-fg-subtle">{shot.caption}</figcaption>
                </figure>
              </Reveal>
            ))}
          </div>
        </div>
      </Container>
    </Section>
  );
}
