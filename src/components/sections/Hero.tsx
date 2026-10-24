import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { CompareBars, FigureNote, StatRow } from "@/components/ui/Figure";
import { TitleLines } from "@/components/ui/SectionHeader";
import { brand, primaryCta, secondaryCta } from "@/config/brand";

/**
 * Hero.
 *
 * Titular en dos tonos, una sola acción dominante y, debajo, la idea entera
 * en números en vez de en párrafos: cien oportunidades al mes, cinco puntos
 * más de conversión y lo que eso significa al año.
 *
 * Las cifras son aritmética sobre un ejemplo y lo dicen; el visitante puede
 * rehacerla con las suyas en la sección siguiente. Nada aquí se anima al
 * entrar: el elemento más grande tiene que pintar en el primer fotograma.
 */

const LEADS = 100;
const TICKET = 300;
const NOW = 20;
const BETTER = 25;

const salesNow = (LEADS * NOW) / 100;
const salesBetter = (LEADS * BETTER) / 100;
const revenueNow = salesNow * TICKET;
const revenueBetter = salesBetter * TICKET;

export function Hero() {
  return (
    <section className="relative overflow-x-clip">
      <Container className="pt-[clamp(3rem,1.5rem+4vw,5.5rem)] text-center">
        {/* La etiqueta es parte del h1: dice de qué va la página. */}
        <h1>
          <span className="type-label block text-fg-subtle">{brand.tagline} </span>
          <span className="type-display mx-auto mt-6 block max-w-[17ch] text-h1 text-fg lg:max-w-none">
            <TitleLines title={["Tu empresa tiene más potencial", "del que imaginas."]} />
          </span>
        </h1>

        <p className="mx-auto mt-7 max-w-[40rem] text-lead text-fg-muted">
          Analizamos cómo funciona tu negocio, encontramos las oportunidades que estás dejando
          escapar y aplicamos mejoras para vender más, trabajar mejor y atender mejor.
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

      {/* La promesa, en números. */}
      <div className="relative mt-11 md:mt-14">
        <div aria-hidden className="absolute inset-x-0 top-[22%] bottom-0 bg-bg-subtle" />

        <Container className="relative pb-14 md:pb-20">
          <div className="mx-auto flex max-w-[62rem] flex-col gap-10 rounded-2xl bg-surface p-7 ring-1 ring-line sm:p-10 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:items-start lg:gap-16">
            <div className="flex flex-col gap-6 text-left">
              <p className="type-label text-fg-subtle">Ejemplo con números redondos</p>
              <p className="text-h4 text-fg">
                Una empresa recibe {LEADS} solicitudes al mes y cierra el {NOW} %. Cerrar cinco de
                cada cien más no exige ni una solicitud nueva.
              </p>
              <CompareBars
                caption={`Ventas al mes sobre ${LEADS} solicitudes`}
                unit="count"
                bars={[
                  { label: `Hoy, al ${NOW} %`, value: salesNow },
                  { label: `Al ${BETTER} %`, value: salesBetter, tone: "accent" },
                ]}
              />
            </div>

            <div className="flex flex-col gap-6 text-left">
              <StatRow
                stats={[
                  { label: "Factura hoy", value: revenueNow, unit: "eur", note: "al mes" },
                  {
                    label: "Con la mejora",
                    value: revenueBetter,
                    unit: "eur",
                    note: "al mes",
                  },
                  {
                    label: "Diferencia",
                    value: (revenueBetter - revenueNow) * 12,
                    unit: "eur",
                    note: "al año",
                  },
                ]}
              />
              <FigureNote>
                {LEADS} solicitudes × ({BETTER} % − {NOW} %) = 5 ventas más al mes, a {TICKET} € de
                ticket medio. Es facturación, no beneficio: el margen se aplica aparte.{" "}
                <Link
                  href="#mejora"
                  className="text-fg underline decoration-line-strong underline-offset-4 transition-colors hover:decoration-fg"
                >
                  Haz la cuenta con tus números
                </Link>
                .
              </FigureNote>
            </div>
          </div>
        </Container>
      </div>
    </section>
  );
}
