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
  areas: "/areas",
  area: (slug: string) => `/areas/${slug}`,
  sectors: "/sectores",
  sector: (slug: string) => `/sectores/${slug}`,
  method: "/metodo-vco",
  diagnosis: "/diagnostico",
  contact: "/contacto",
  company: "/empresa",
  legal: {
    notice: "/legal/aviso-legal",
    privacy: "/legal/privacidad",
    cookies: "/legal/cookies",
  },
} as const;

/**
 * The private panel (Life CRM). Never linked from the public site, never in
 * the sitemap, blocked in robots.txt and behind sign-in.
 */
export const panelRoutes = {
  home: "/panel",
  signIn: "/panel/acceso",
  calendar: "/panel/calendario",
  tasks: "/panel/tareas",
  projects: "/panel/proyectos",
  project: (id: string) => `/panel/proyectos/${id}`,
  university: "/panel/universidad",
  money: "/panel/dinero",
  subscriptions: "/panel/suscripciones",
  subscription: (id: string) => `/panel/suscripciones/${id}`,
  domains: "/panel/dominios",
  contacts: "/panel/contactos",
  documents: "/panel/documentos",
  ai: "/panel/ia",
  dates: "/panel/fechas",
  inbox: "/panel/inbox",
  settings: "/panel/ajustes",
  /** Exportación a Obsidian: la lee `npm run obsidian`, no el navegador. */
  obsidian: "/panel/obsidian",
} as const;

/** The panel sidebar. Ten entries, no more: see docs/LIFE_CRM.md. */
export const panelNav = [
  { key: "home", label: "Inicio", href: panelRoutes.home },
  { key: "calendar", label: "Calendario", href: panelRoutes.calendar },
  { key: "tasks", label: "Tareas", href: panelRoutes.tasks },
  { key: "projects", label: "Proyectos", href: panelRoutes.projects },
  { key: "university", label: "Universidad", href: panelRoutes.university },
  { key: "money", label: "Dinero", href: panelRoutes.money },
  { key: "subscriptions", label: "Suscripciones", href: panelRoutes.subscriptions },
  { key: "domains", label: "Dominios", href: panelRoutes.domains },
  { key: "contacts", label: "Contactos", href: panelRoutes.contacts },
  { key: "documents", label: "Documentos", href: panelRoutes.documents },
] as const;

export type PanelNavKey = (typeof panelNav)[number]["key"];

export interface NavItem {
  label: string;
  href: string;
  /** Short line shown in the mobile menu and the solutions dropdown. */
  description?: string;
}

export const primaryNav: NavItem[] = [
  {
    label: "Qué mejoramos",
    href: routes.areas,
    description: "Crecimiento comercial, experiencia del cliente, eficiencia",
  },
  {
    label: "Sectores",
    href: routes.sectors,
    description: "Lo que se repite en tu tipo de negocio",
  },
  {
    label: "Método VCO",
    href: routes.method,
    description: "Las cinco fases, de descubrir a medir",
  },
  {
    label: "Casos",
    href: routes.cases,
    description: "Trabajo real y demostraciones, con el cálculo a la vista",
  },
  {
    label: "Empresa",
    href: routes.company,
    description: "Quiénes somos y cómo entendemos este trabajo",
  },
];

export const footerNav: { title: string; items: NavItem[] }[] = [
  {
    title: "Qué mejoramos",
    items: [
      { label: "Crecimiento comercial", href: routes.area("crecimiento-comercial") },
      { label: "Experiencia del cliente", href: routes.area("experiencia-cliente") },
      { label: "Eficiencia y rentabilidad", href: routes.area("eficiencia-rentabilidad") },
      { label: "Soluciones concretas", href: routes.solutions },
      { label: "Sectores", href: routes.sectors },
    ],
  },
  {
    title: "Empresa",
    items: [
      { label: "Método VCO", href: routes.method },
      { label: "Diagnóstico de potencial", href: routes.diagnosis },
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
