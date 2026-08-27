import { brand } from "./brand";

/**
 * Site-level configuration: routes, navigation and canonical URL resolution.
 *
 * Routes are declared once here. The header, footer, sitemap and breadcrumbs
 * all read from this module, so adding a page is a one-line change.
 */

export const routes = {
  home: "/",
  solutions: "/soluciones",
  solution: (slug: string) => `/soluciones/${slug}`,
  cases: "/casos",
  case: (slug: string) => `/casos/${slug}`,
  method: "/metodo",
  diagnosis: "/diagnostico",
  contact: "/contacto",
  company: "/empresa",
  legal: {
    notice: "/legal/aviso-legal",
    privacy: "/legal/privacidad",
    cookies: "/legal/cookies",
  },
} as const;

export interface NavItem {
  label: string;
  href: string;
  /** Short line shown in the mobile menu and the solutions dropdown. */
  description?: string;
}

export const primaryNav: NavItem[] = [
  {
    label: "Soluciones",
    href: routes.solutions,
    description: "Qué tipo de trabajo manual eliminamos",
  },
  {
    label: "Casos",
    href: routes.cases,
    description: "Procesos completos, antes y después",
  },
  {
    label: "Cómo trabajamos",
    href: routes.method,
    description: "Las cinco fases, de la primera reunión a la medición",
  },
  {
    label: "Empresa",
    href: routes.company,
    description: "Quiénes somos y cómo entendemos este trabajo",
  },
];

export const footerNav: { title: string; items: NavItem[] }[] = [
  {
    title: "Soluciones",
    items: [
      { label: "Presupuestos automáticos", href: routes.solution("presupuestos-automaticos") },
      { label: "Automatización administrativa", href: routes.solution("automatizacion-administrativa") },
      { label: "Correo y comunicación", href: routes.solution("email-y-comunicacion") },
      { label: "Procesos comerciales", href: routes.solution("procesos-comerciales") },
      { label: "Herramientas internas", href: routes.solution("herramientas-internas") },
      { label: "IA aplicada al negocio", href: routes.solution("ia-aplicada") },
    ],
  },
  {
    title: "Empresa",
    items: [
      { label: "Cómo trabajamos", href: routes.method },
      { label: "Casos", href: routes.cases },
      { label: "Quiénes somos", href: routes.company },
      { label: "Contacto", href: routes.contact },
    ],
  },
  {
    title: "Legal",
    items: [
      { label: "Aviso legal", href: routes.legal.notice },
      { label: "Privacidad", href: routes.legal.privacy },
      { label: "Cookies", href: routes.legal.cookies },
    ],
  },
];

/**
 * Canonical origin.
 *
 * Vercel exposes VERCEL_PROJECT_PRODUCTION_URL in every environment, which
 * keeps preview deployments from emitting canonicals pointing at localhost.
 */
export function getSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit.replace(/\/$/, "");

  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (vercel) return `https://${vercel}`;

  if (process.env.NODE_ENV === "development") return "http://localhost:3000";

  return brand.url;
}

/** True only in the real production deployment. Gates analytics and indexing. */
export const isProduction =
  process.env.VERCEL_ENV === "production" || process.env.NODE_ENV === "production";
