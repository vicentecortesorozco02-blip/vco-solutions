/**
 * Central brand configuration.
 *
 * The company has no definitive name yet. Every user-visible mention of the
 * company MUST come from here so that naming, domain, contact details and
 * legal entity can be swapped in a single commit.
 *
 * Rule: never type the brand name into a component, a copy string, a metadata
 * field or a document. Import from here instead.
 */

export const brand = {
  /** Placeholder until naming is decided. Kept deliberately conspicuous. */
  name: "[BRAND]",
  /** Short form for tight spaces (mobile header, footer, og image). */
  shortName: "[BRAND]",
  /** Registered entity. Updated when the S.L. is incorporated. */
  legalName: "[BRAND] S.L.",
  /** Tax id placeholder, required on legal pages once available. */
  taxId: "[NIF PENDIENTE]",

  /** One line, used as the site-wide tagline and og:site_name suffix. */
  tagline: "Ingeniería de procesos para empresas",

  /**
   * The single sentence that explains the business. Used for meta description
   * fallbacks and structured data. Keep under 160 characters.
   */
  description:
    "Analizamos cómo trabaja tu empresa y construimos sistemas que eliminan tareas repetitivas, reducen errores y devuelven horas a tu equipo.",

  /** What we actually sell, in three words. Used by the footer and og image. */
  promise: "Menos trabajo manual",

  domain: "example.com",
  url: "https://example.com",

  email: "hola@example.com",
  phone: "",

  /** Where we operate from. Feeds Organization / LocalBusiness schema. */
  location: {
    city: "España",
    region: "",
    country: "ES",
    /** Set to true once there is a real, visitable address. */
    hasPhysicalAddress: false,
    streetAddress: "",
    postalCode: "",
  },

  /** Only list profiles that actually exist. Empty strings are filtered out. */
  social: {
    linkedin: "",
    x: "",
    github: "",
  },

  /** Language + locale. Structured so i18n can be added without a rewrite. */
  locale: "es-ES",
  language: "es",

  foundingYear: 2026,
} as const;

/** Profiles that exist, ready for schema.org `sameAs`. */
export const socialProfiles: string[] = (
  Object.values(brand.social) as string[]
).filter((value) => value.length > 0);

/**
 * The primary conversion action of the entire site.
 *
 * There is exactly one dominant CTA. Every page reuses this so the label can
 * be tested from one place and analytics stay comparable.
 */
export const primaryCta = {
  label: "Cuéntanos qué quieres automatizar",
  shortLabel: "Cuéntanos tu proceso",
  href: "/contacto",
} as const;

export const secondaryCta = {
  label: "Ver cómo trabajamos",
  href: "/metodo",
} as const;

export type Brand = typeof brand;
