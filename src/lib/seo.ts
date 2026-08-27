import type { Metadata } from "next";

import { brand, socialProfiles } from "@/config/brand";
import { getSiteUrl, routes } from "@/config/site";

/**
 * Metadata and structured data helpers.
 *
 * Every page builds its metadata through `pageMetadata()` so that canonicals,
 * OpenGraph and Twitter cards can never drift apart, and so the brand name is
 * applied in exactly one place.
 */

interface PageMetadataInput {
  title: string;
  description: string;
  /** Path with a leading slash. Becomes the canonical URL. */
  path: string;
  /** Set false for pages that must never be indexed. */
  index?: boolean;
  type?: "website" | "article";
}

export function pageMetadata({
  title,
  description,
  path,
  index = true,
  type = "website",
}: PageMetadataInput): Metadata {
  const url = `${getSiteUrl()}${path === "/" ? "" : path}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    robots: index
      ? { index: true, follow: true }
      : { index: false, follow: false },
    openGraph: {
      type,
      url,
      title,
      description,
      siteName: brand.name,
      locale: brand.locale.replace("-", "_"),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

/** Organization schema. Emitted once, in the root layout. */
export function organizationSchema() {
  const url = getSiteUrl();

  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${url}/#organization`,
    name: brand.name,
    legalName: brand.legalName,
    url,
    description: brand.description,
    email: brand.email,
    ...(brand.phone ? { telephone: brand.phone } : {}),
    foundingDate: String(brand.foundingYear),
    areaServed: { "@type": "Country", name: "España" },
    ...(socialProfiles.length > 0 ? { sameAs: socialProfiles } : {}),
    ...(brand.location.hasPhysicalAddress
      ? {
          address: {
            "@type": "PostalAddress",
            streetAddress: brand.location.streetAddress,
            addressLocality: brand.location.city,
            postalCode: brand.location.postalCode,
            addressCountry: brand.location.country,
          },
        }
      : {}),
  };
}

export function websiteSchema() {
  const url = getSiteUrl();

  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${url}/#website`,
    url,
    name: brand.name,
    inLanguage: brand.locale,
    publisher: { "@id": `${url}/#organization` },
  };
}

export function serviceSchema(input: {
  name: string;
  description: string;
  path: string;
}) {
  const url = getSiteUrl();

  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: input.name,
    description: input.description,
    url: `${url}${input.path}`,
    serviceType: "Automatización de procesos empresariales",
    provider: { "@id": `${url}/#organization` },
    areaServed: { "@type": "Country", name: "España" },
  };
}

export function faqSchema(items: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };
}

export function breadcrumbSchema(trail: { name: string; path: string }[]) {
  const url = getSiteUrl();

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((entry, position) => ({
      "@type": "ListItem",
      position: position + 1,
      name: entry.name,
      item: `${url}${entry.path === routes.home ? "" : entry.path}`,
    })),
  };
}
