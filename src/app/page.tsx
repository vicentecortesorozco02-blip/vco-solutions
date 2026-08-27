import type { Metadata } from "next";

import { FaqSection } from "@/components/sections/FaqSection";
import { FeaturedCase } from "@/components/sections/FeaturedCase";
import { FinalCta } from "@/components/sections/FinalCta";
import { Hero } from "@/components/sections/Hero";
import { Method } from "@/components/sections/Method";
import { Principles } from "@/components/sections/Principles";
import { Problem } from "@/components/sections/Problem";
import { Solutions } from "@/components/sections/Solutions";
import { TimeMath } from "@/components/sections/TimeMath";
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
 * The narrative, in order: you have this problem (01) — here is what it costs
 * you (02) — here is what we take off the table (03) — here is how we work
 * (04) — here is one process end to end (05) — here is why us (06) — here are
 * your objections (07) — here is the ask (08).
 *
 * Every section answers exactly one question. A section that cannot state its
 * question in five words does not belong on this page.
 */
export default function HomePage() {
  return (
    <>
      <Hero />
      <Problem />
      <TimeMath />
      <Solutions />
      <Method />
      <FeaturedCase />
      <Principles />
      <FaqSection items={generalFaq} />
      <FinalCta />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema(generalFaq)) }}
      />
    </>
  );
}
