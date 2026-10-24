import type { Metadata } from "next";

import { Areas } from "@/components/sections/Areas";
import { FaqSection } from "@/components/sections/FaqSection";
import { FeaturedCase } from "@/components/sections/FeaturedCase";
import { FinalCta } from "@/components/sections/FinalCta";
import { Hero } from "@/components/sections/Hero";
import { Method } from "@/components/sections/Method";
import { Sectors } from "@/components/sections/Sectors";
import { Signals } from "@/components/sections/Signals";
import { SmallChange } from "@/components/sections/SmallChange";
import { Work } from "@/components/sections/Work";
import { brand } from "@/config/brand";
import { generalFaq } from "@/content/faq";
import { faqSchema, pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: `${brand.name} — ${brand.tagline}`,
  description: brand.description,
  path: "/",
});

/**
 * Home.
 *
 * El recorrido, en orden: qué puede cambiar en tu empresa (hero) — lo que se
 * está escapando sin que aparezca en ninguna cuenta (señales) — la aritmética
 * sobre tus propios números (mejora) — en qué áreas trabajamos — cómo
 * trabajamos — cómo se llama tu problema en tu sector — trabajo real que
 * hemos construido — tus objeciones — la conversación de veinte minutos.
 *
 * Cada sección responde a una sola pregunta. La que no pueda enunciar su
 * pregunta en cinco palabras no pinta nada en esta página.
 */
export default function HomePage() {
  return (
    <>
      <Hero />
      <Signals />
      <SmallChange />
      <Areas />
      <Method />
      <Sectors />
      <FeaturedCase />
      <Work />
      <FaqSection items={generalFaq} />
      <FinalCta />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema(generalFaq)) }}
      />
    </>
  );
}
