# [BRAND] — sitio corporativo

Web principal de una empresa de ingeniería de procesos: analizamos cómo trabaja
una empresa y construimos los sistemas que eliminan su trabajo manual.

La marca todavía no tiene nombre. Todo lo que la identifica vive en
`src/config/brand.ts` y se sustituye desde ahí. Ver [Naming](#naming).

## Requisitos

- Node.js 22 o superior
- npm 10 o superior

## Puesta en marcha

```bash
npm install
npm run dev          # http://localhost:3000
```

## Comandos

| Comando               | Qué hace                                                        |
| --------------------- | --------------------------------------------------------------- |
| `npm run dev`         | Servidor de desarrollo                                           |
| `npm run build`       | Build de producción                                              |
| `npm start`           | Sirve el build de producción                                     |
| `npm run lint`        | ESLint                                                           |
| `npm run typecheck`   | TypeScript sin emitir                                            |
| `npm test`            | Tests unitarios (Vitest)                                         |
| `npm run test:watch`  | Vitest en modo watch                                             |
| `npm run test:e2e`    | Playwright sobre el build de producción                          |
| `npm run verify`      | lint + typecheck + test + build. **Ejecutar antes de cada PR.**   |

`npm run test:e2e` levanta el servidor por su cuenta en el puerto 3100, pero
necesita un build reciente: ejecuta `npm run build` antes.

## Estructura

```
src/
  app/                 Rutas (App Router). Un directorio por URL.
    api/contacto/      Endpoint del formulario
    opengraph-image.tsx, sitemap.ts, robots.ts
  components/
    ui/                Primitivas: Button, Container, Section, SectionHeader, Faq…
    brand/             Logo: el único sitio que dibuja la identidad
    layout/            Header, Footer, PageHero
    sections/          Bloques de página, componibles y sin estado
    cards/             Tarjetas de solución y de caso
    diagrams/          ProcessFlow y ProcessRibbon: la firma visual
    features/          Piezas con estado: ContactForm, TimeCalculator
  config/              Identidad de marca (brand.ts, brand.css, fonts.ts) y rutas (site.ts)
  content/             Contenido tipado: soluciones, casos, método, FAQ
  lib/                 cn, seo, analytics, rate-limit, esquema de contacto
  app/globals.css      Design tokens. Única fuente de verdad visual.
docs/                  Sistema de diseño, arquitectura, contenido, decisiones
e2e/                   Pruebas de extremo a extremo
```

Documentación completa:

- [`docs/BASELINE.md`](docs/BASELINE.md) — punto de retorno estable (`baseline-v1`)
- [`docs/BRAND.md`](docs/BRAND.md) — posicionamiento, voz y sistema de identidad
- [`docs/DESIGN_SYSTEM.md`](docs/DESIGN_SYSTEM.md) — tokens y reglas visuales
- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — decisiones técnicas
- [`docs/CONTENT.md`](docs/CONTENT.md) — arquitectura de contenido y tono
- [`docs/ROADMAP.md`](docs/ROADMAP.md) — qué entra en V1 y qué viene después
- [`docs/DECISIONS.md`](docs/DECISIONS.md) — decisiones importantes y su motivo
- [`CLAUDE.md`](CLAUDE.md) — reglas obligatorias para agentes de IA

## Naming

El nombre definitivo se decidirá más adelante. Hasta entonces el sitio muestra
el marcador `[BRAND]`.

Toda la identidad vive en cuatro archivos y solo cuatro:

| Archivo | Qué controla |
| --- | --- |
| `src/config/brand.ts` | Nombre, razón social, contacto, metadatos, logotipo, favicon, espejo de la paleta |
| `src/config/brand.css` | Color de marca (dos números) y pilas tipográficas |
| `src/config/fonts.ts` | Carga de las tipografías |
| `src/components/brand/Logo.tsx` | Cómo se dibuja el logotipo |

`src/config/brand.test.ts` falla si alguien escribe el nombre, el dominio, el
correo o un color hexadecimal fuera de ahí. La guía completa, con la lista de
comprobación para aplicar la marca, está en [`docs/BRAND.md`](docs/BRAND.md).

## Variables de entorno

Copiar `.env.example` a `.env.local`. Ninguna es obligatoria en desarrollo.

| Variable               | Para qué sirve                                                     |
| ---------------------- | ------------------------------------------------------------------ |
| `NEXT_PUBLIC_SITE_URL` | Origen canónico. En Vercel se deduce solo.                          |
| `CONTACT_WEBHOOK_URL`  | Destino del formulario. Sin él, en producción el endpoint devuelve 503 y la interfaz ofrece el correo. Es deliberado: un formulario nunca debe decir que ha enviado algo que ha tirado a la basura. |

## Despliegue

Pensado para Vercel. `git push` a la rama principal despliega producción;
cualquier otra rama genera un preview.

Los despliegues de preview se marcan como `noindex` automáticamente
(`src/app/robots.ts`), para que una copia de staging no compita en buscadores
con el sitio real.

## Antes de subir cambios

```bash
npm run verify
npm run test:e2e
```

Y revisar visualmente a 390 px, 1366 px y 1920 px como mínimo. El detalle de
por qué esos anchos está en [`CLAUDE.md`](CLAUDE.md).
