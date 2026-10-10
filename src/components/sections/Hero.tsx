import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Laptop, Phone } from "@/components/ui/Devices";
import { TitleLines } from "@/components/ui/SectionHeader";
import { brand, primaryCta, secondaryCta } from "@/config/brand";
import { realWork } from "@/content/cases";

/**
 * Hero.
 *
 * Centred headline in two tones, one dominant action, and under it the proof:
 * a system we built, on a laptop and a phone. The screens are real
 * screenshots, never a mock-up of something that does not exist.
 *
 * Nothing above the fold is animated on entry: the LCP element must paint on
 * the first frame, not after an IntersectionObserver callback.
 */
export function Hero() {
  const work = realWork[0];
  const laptop = work?.cover;
  const phone = work?.gallery?.find((shot) => shot.device === "phone");

  return (
    <section className="relative overflow-x-clip">
      <Container className="pt-[clamp(3.5rem,2rem+5vw,7.5rem)] text-center">
        {/* The label is part of the h1: it carries what the page is about. */}
        <h1>
          <span className="type-label block text-fg-subtle">{brand.tagline} </span>
          <span className="type-display mx-auto mt-6 block max-w-[17ch] text-h1 text-fg lg:max-w-none">
            <TitleLines
              title={["Menos trabajo a mano.", "Más horas para tu equipo."]}
            />
          </span>
        </h1>

        <p className="mx-auto mt-7 max-w-[36rem] text-lead text-fg-muted">
          Tu empresa tiene tareas que nadie debería seguir haciendo a mano.
          Analizamos cómo trabajáis y construimos los sistemas que las eliminan.
        </p>

        <div className="mt-9 flex flex-col items-center gap-x-7 gap-y-4 xs:flex-row xs:justify-center">
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
              className="size-4 transition-transform duration-[var(--duration-base)] ease-[var(--ease-out-soft)] group-hover/btn:translate-x-0.5"
              strokeWidth={2}
            />
          </Button>
          <Button
            href={secondaryCta.href}
            variant="quiet"
            size="lg"
            event="cta_secondary_click"
            eventLocation="hero"
          >
            {secondaryCta.label}
            <ArrowRight className="size-4" strokeWidth={2} />
          </Button>
        </div>
      </Container>

      {laptop ? (
        <div className="relative mt-14 md:mt-20">
          {/* Ground the devices: a quiet surface that starts behind the laptop. */}
          <div aria-hidden className="absolute inset-x-0 bottom-0 top-[38%] bg-bg-subtle" />

          <Container className="relative pb-14 md:pb-20">
            <div className="relative mx-auto max-w-[62rem]">
              <Laptop
                src={laptop.src}
                alt={laptop.alt}
                priority
                sizes="(min-width: 1240px) 900px, 88vw"
              />
              {phone ? (
                <Phone
                  src={phone.src}
                  alt={phone.alt}
                  sizes="(min-width: 1240px) 130px, 22vw"
                  className="absolute -bottom-[9%] right-[1%] w-[22%] sm:w-[13%]"
                />
              ) : null}
            </div>

            <p className="type-label mt-14 text-center text-fg-subtle md:mt-20">
              {work.name ? `${work.name} · ` : null}
              {laptop.caption}
            </p>
          </Container>
        </div>
      ) : null}
    </section>
  );
}
