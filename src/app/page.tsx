import type { Metadata } from "next";

import { FaqSection } from "@/components/sections/FaqSection";
import { FeaturedCase } from "@/components/sections/FeaturedCase";
import { FinalCta } from "@/components/sections/FinalCta";
import { Hero } from "@/components/sections/Hero";
import { Integrations } from "@/components/sections/Integrations";
import { Method } from "@/components/sections/Method";
import { Problem } from "@/components/sections/Problem";
import { Solutions } from "@/components/sections/Solutions";
import { TimeMath } from "@/components/sections/TimeMath";
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
 * Home. Same structure as YourHotelWeb's (see D-018), told for processes.
 *
 * The narrative, in order: what we do, with proof on screen (hero) — where
 * the hours hide (fronts) — the tasks you will recognise (problem) — one
 * process changing shape (de esto, a esto) — real work we have built — the
 * arithmetic on your own numbers — the tools we connect to — how we work —
 * your objections — the ask.
 *
 * Every section answers exactly one question. A section that cannot state its
 * question in five words does not belong on this page.
 */
export default function HomePage() {
  return (
    <>
      <Hero />
      <Solutions />
      <Problem />
      <FeaturedCase />
      <Work />
      <TimeMath />
      <Integrations />
      <Method />
      <FaqSection items={generalFaq} />
      <FinalCta />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema(generalFaq)) }}
      />
    </>
  );
}
