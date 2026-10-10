/**
 * Tools we have actually built integrations with.
 *
 * Credibility rule: a name goes in this list only when there is working code
 * of ours that talks to it, in a system that exists. No aspirational logos,
 * no "compatible with" lists copied from a vendor page. Today every entry
 * comes from YourHotelWeb (see content/cases.ts).
 *
 * Names are set as plain text, never as brand logos: we do not have
 * permission to use the marks, and the disclaimer below says so.
 */

export interface Integration {
  name: string;
  /** What our code does with it, in a few words. Shown as a tooltip-free note. */
  use: string;
}

export const integrations: Integration[] = [
  { name: "Gmail", use: "Leer respuestas y dejarlas en su ficha" },
  { name: "Stripe", use: "Cobrar en plazos con tarjeta" },
  { name: "Supabase", use: "Base de datos y acceso del equipo" },
  { name: "Vercel", use: "Publicación y tareas programadas" },
  { name: "Booking.com", use: "Puntuación y opiniones del hotel, vía Apify" },
];

export const integrationsNote = {
  other: "¿Usas otra herramienta? En el análisis vemos cómo conectarla.",
  disclaimer:
    "Herramientas con las que ya hemos construido integraciones en sistemas propios. Los nombres y marcas pertenecen a sus propietarios; no implican colaboración ni certificación.",
};
