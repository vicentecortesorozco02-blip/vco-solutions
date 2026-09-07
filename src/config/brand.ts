/**
 * IDENTIDAD DE MARCA — fuente única de verdad textual.
 *
 * Toda mención visible de la marca sale de aquí, de modo que nombre, dominio,
 * contacto y razón social se sustituyen en un solo commit.
 *
 * Regla: nunca escribas el nombre, el dominio, el correo ni un color de marca
 * dentro de un componente, un texto, un metadato o un documento. Impórtalo.
 *
 * La marca vive en tres archivos y solo tres:
 *
 *   src/config/brand.ts    identidad textual y valores que el CSS no sirve  (este)
 *   src/config/brand.css   color de marca y familias tipográficas
 *   src/config/fonts.ts    carga de las tipografías
 *
 * Guía completa: docs/BRAND.md
 */

export const brand = {
  // --- Nombre -------------------------------------------------------------
  /** companyName. */
  name: "VCO Solutions",
  /**
   * Forma corta para espacios estrechos: cabecera móvil, pie, imagen social.
   * «Solutions» es la parte prescindible: lo que identifica es VCO.
   */
  shortName: "VCO",
  /** Razón social. Pendiente de la certificación negativa del RMC. */
  legalName: "VCO Solutions S.L.",
  /** Obligatorio en las páginas legales. No borrar el marcador sin el dato. */
  taxId: "[NIF PENDIENTE]",

  // --- Mensaje ------------------------------------------------------------
  /** Una línea. Se usa como lema del sitio y en el pie. */
  tagline: "Ingeniería de procesos para empresas",

  /**
   * La frase que explica el negocio. Alimenta las descripciones por defecto y
   * los datos estructurados. Máximo 160 caracteres.
   */
  description:
    "Analizamos cómo trabaja tu empresa y construimos sistemas que eliminan tareas repetitivas, reducen errores y devuelven horas a tu equipo.",

  /** Lo que se vende, en tres palabras. Pie e imagen social. */
  promise: "Menos trabajo manual",

  // --- Contacto y dominio -------------------------------------------------
  domain: "vcosolutions.es",
  /** website. Origen canónico de producción. */
  url: "https://vcosolutions.es",
  email: "hola@vcosolutions.es",
  phone: "",

  /** Alimenta el esquema Organization / LocalBusiness. */
  location: {
    city: "España",
    region: "",
    country: "ES",
    /** true solo cuando exista una dirección real y visitable. */
    hasPhysicalAddress: false,
    streetAddress: "",
    postalCode: "",
  },

  /** Solo perfiles que existan de verdad. Los vacíos se filtran. */
  social: {
    linkedin: "",
    x: "",
    github: "",
  },

  // --- Idioma -------------------------------------------------------------
  locale: "es-ES",
  language: "es",

  foundingYear: 2026,

  // --- Metadatos ----------------------------------------------------------
  /**
   * Valores de metadatos que dependen de la marca. El resto de la lógica de
   * SEO vive en src/lib/seo.ts y no debería necesitar tocarse al rebrandear.
   */
  metadata: {
    /** Cuenta de X sin la arroba. Vacío mientras no exista. */
    twitterHandle: "",
    /** Texto alternativo de la imagen social. */
    ogImageAlt: "VCO Solutions — ingeniería de procesos para empresas",
  },

  // --- Logotipo -----------------------------------------------------------
  /**
   * Configuración del sistema de logotipo. Ver src/components/brand/Logo.tsx.
   *
   * Hoy el símbolo es un rombo geométrico dibujado en CSS y la marca denominativa
   * es tipográfica. Es un marcador honesto, no un logotipo: no hay identidad
   * que representar todavía.
   *
   * Cuando exista el logotipo real:
   *   1. Coloca los SVG en public/marca/ (símbolo y, si procede, lockup).
   *   2. Pon `hasCustomAsset: true` y rellena las rutas.
   *   3. Logo.tsx sirve el asset en lugar del marcador. Ningún otro archivo
   *      cambia: cabecera, pie e imagen social lo consumen a través de él.
   */
  logo: {
    hasCustomAsset: false,
    /** Ruta pública del isotipo, p. ej. "/marca/simbolo.svg". */
    symbolSrc: null as string | null,
    /** Ruta pública del logotipo completo, si el lockup no se compone. */
    lockupSrc: null as string | null,
    /** Proporción del asset, para reservar espacio y evitar CLS. */
    aspectRatio: 1,
  },

  /**
   * Favicon. Hoy no hay ninguno, a propósito: el del andamiaje era el logotipo
   * de Next.js y no puede publicarse como identidad propia.
   *
   * Para añadirlo cuando exista la marca, basta con crear el archivo:
   *   src/app/icon.svg          icono principal (Next lo detecta solo)
   *   src/app/apple-icon.png    180x180, opcional
   * No hay que registrar nada aquí ni en el layout: es convención de Next.
   */
  favicon: {
    present: false,
  },

  /**
   * Tipografía. Las familias se cargan en src/config/fonts.ts y se declaran
   * como pilas en src/config/brand.css. Estos nombres son solo para la
   * documentación y la interfaz de administración futura.
   */
  typography: {
    sans: "Instrument Sans",
    display: "Instrument Serif",
  },

  /**
   * ESPEJO de la paleta, en hexadecimal.
   *
   * La fuente de verdad del color es src/config/brand.css: el producto usa
   * tokens y nunca estos valores. Existen solo para las superficies que no
   * pueden leer CSS —la imagen social se genera en un worker, y `theme-color`
   * es un metadato— y por eso hay que regenerarlos al cambiar la marca.
   *
   * Regenerar: ver docs/BRAND.md, "Sincronizar la paleta". Hay una prueba e2e
   * que compara estos valores con los tokens reales y falla si se desvían.
   */
  colors: {
    bg: "#fcfbf9",
    surface: "#ffffff",
    inverse: "#0d0a08",
    fg: "#181412",
    fgMuted: "#5e5a56",
    fgSubtle: "#716c68",
    line: "#e1deda",
    accent: "#ac522d",
    accentFg: "#fffdfa",
  },
} as const;

/** Perfiles que existen, listos para `sameAs` de schema.org. */
export const socialProfiles: string[] = (
  Object.values(brand.social) as string[]
).filter((value) => value.length > 0);

/**
 * La acción de conversión principal de todo el sitio.
 *
 * Hay exactamente un CTA dominante. Todas las páginas lo reutilizan para que
 * el texto se pueda probar desde un único sitio y la analítica sea comparable.
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
