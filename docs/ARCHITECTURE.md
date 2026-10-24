# Arquitectura

## 1. Stack

| Pieza          | Versión | Por qué                                                       |
| -------------- | ------- | ------------------------------------------------------------- |
| Next.js        | 16.3    | App Router, Server Components, generación estática, despliegue directo en Vercel |
| React          | 19.2    | Viene con Next                                                |
| TypeScript     | 5.x     | Sin `any` en el código propio                                 |
| Tailwind CSS   | 4.x     | Tokens nativos con `@theme`, sin archivo de configuración JS  |
| lucide-react   | —       | Iconos con importación individual                             |
| zod            | 4.x     | Un solo esquema compartido por cliente y servidor             |
| clsx + tailwind-merge | — | Composición de clases con resolución de conflictos correcta   |
| @supabase/supabase-js + @supabase/ssr | 2.x / 0.12 | Base de datos y sesión del panel privado (D-020) |

Pocas dependencias de producción. Ese número es un objetivo, no una casualidad.
Cada adición se justifica en `DECISIONS.md`.

**Sin librería de animación.** Se evaluó y no hacía falta: ver `DECISIONS.md`.

---

## 2. Capas

```
config/     → content/ → components/ → app/
     ↘ lib/ ↗
```

La dependencia va en una sola dirección. Concretamente:

- `config/` no importa nada del proyecto. Es la raíz. Contiene la identidad de
  marca (`brand.ts`, `brand.css`, `fonts.ts`) y la topología del sitio
  (`site.ts`).
- `content/` importa tipos y, para los iconos, `lucide-react`. Nunca importa
  componentes.
- `components/` importa de `content`, `config` y `lib`. Nunca de `app`.
- `app/` compone. Contiene poca lógica: rutas, metadatos y orden de secciones.
- `lib/` es transversal y no importa componentes.

Si te encuentras importando un componente desde `content/`, la abstracción está
del revés.

### Por qué esta separación

El contenido es lo que más va a cambiar en los próximos meses, y lo que
antes o después se moverá a un CMS. Manteniéndolo como datos tipados, esa
migración consiste en cambiar el origen de un array por una llamada a una API
que satisfaga la misma interfaz. Ningún componente se entera.

---

## 3. Rutas

| Ruta                  | Renderizado | Notas                                    |
| --------------------- | ----------- | ---------------------------------------- |
| `/`                   | Estático    | Ocho secciones, narrativa numerada       |
| `/soluciones`         | Estático    | Índice generado desde `content/solutions` |
| `/soluciones/[slug]`  | SSG         | `generateStaticParams` desde el contenido |
| `/casos`              | Estático    | Índice de casos                          |
| `/casos/[slug]`       | SSG         | Ídem                                     |
| `/metodo-vco`         | Estático    | El Método VCO, versión detallada         |
| `/empresa`            | Estático    | Posición, etapas comerciales, encaje     |
| `/diagnostico`        | Estático    | Calculadora + qué falta por construir    |
| `/contacto`           | Estático    | El formulario es el único cliente pesado |
| `/legal/*`            | Estático    | `noindex`                                |
| `/api/contacto`       | Dinámico    | Node.js runtime                          |
| `/panel/*`            | Dinámico    | Privado, tras sesión. Ver `LIFE_CRM.md`  |
| `/panel/suscripciones/[id]` | Dinámico | Ficha de un servicio con su historial |

La web pública vive en `app/(site)/`, con su cabecera y su pie en
`(site)/layout.tsx`. El panel vive en `app/panel/`, con su propio armazón. El
layout raíz solo pone `<html>`, `<body>` y las fuentes. `src/proxy.ts` corre
únicamente en `/panel`.

Publicar una solución o un caso nuevo es añadir un objeto al array
correspondiente. La ruta, el índice, el sitemap y los enlaces relacionados
salen solos.

---

## 4. Cliente vs servidor

Todo es Server Component salvo cuatro archivos:

| Componente        | Por qué es cliente                             |
| ----------------- | ---------------------------------------------- |
| `Header`          | Estado de scroll y menú móvil                  |
| `Reveal`          | `IntersectionObserver`                         |
| `ContactForm`     | Estado de formulario                           |
| `TimeCalculator`  | Estado de los controles                        |
| `FrontPicker`     | Qué frente está resaltado en la lista grande de la home. Sin JS la lista se lee entera |
| `AnalyticsBridge` | Un único listener delegado                     |

`Button` es deliberadamente server-safe: la instrumentación viaja como atributos
`data-analytics-*` y la recoge `AnalyticsBridge` mediante delegación. Así medir
un CTA nunca obliga a convertir una sección entera en cliente.

---

## 5. SEO

Centralizado en `src/lib/seo.ts`. Ninguna página construye metadatos a mano.

- `pageMetadata()` genera título, descripción, canónica, OpenGraph y Twitter a
  la vez, para que no puedan divergir.
- Datos estructurados: `Organization` y `WebSite` en el layout; `Service` en
  cada solución; `FAQPage` en la home y en las soluciones; `BreadcrumbList` en
  todas las páginas internas.
- `sitemap.ts` se genera desde el contenido.
- `robots.ts` bloquea la indexación en previews y en cualquier entorno que no
  sea producción.
- Los breadcrumbs son visibles además de estructurados: en un sitio con
  soluciones y casos anidados son navegación real.

**Marca.** `lib/seo.ts` no contiene identidad: la lee de `config/brand.ts`. La
imagen social y `theme-color` usan `brand.colors`, un espejo hexadecimal de los
tokens para superficies que no pueden leer CSS, vigilado por `e2e/brand.spec.ts`.

**Internacionalización.** Todavía no está, pero la estructura no la impide:
`brand.locale` y `brand.language` ya están centralizados y todo el texto vive en
`content/`. Añadir inglés sería un segmento `[locale]` y un segundo juego de
archivos de contenido, sin tocar componentes.

---

## 6. Formulario de contacto

Flujo: `ContactForm` → `POST /api/contacto` → transporte configurable.

Defensas, en el orden en que se ejecutan (de más barata a más cara):

1. Límite de tamaño del cuerpo (16 kB).
2. Rate limit por IP: 5 envíos cada 10 minutos.
3. Validación con zod, la misma que usa el cliente.
4. Honeypot. Si viene relleno se responde como si todo hubiera ido bien.

**El endpoint falla en voz alta.** Sin `CONTACT_WEBHOOK_URL` configurado en
producción devuelve 503 y la interfaz ofrece el correo directo. Un formulario
que dice "recibido" mientras tira el mensaje a la basura es peor que un
formulario roto.

Limitación conocida: el rate limit vive en memoria de la instancia. Para un
sitio nuevo es suficiente; cuando el tráfico lo justifique se sustituye el
cuerpo de `rateLimit()` por un almacén compartido, manteniendo la firma.

---

## 7. Analítica

No hay ningún proveedor instalado, y eso es una decisión, no un olvido.

Lo que sí existe es el contrato: `src/lib/analytics.ts` define la lista cerrada
de eventos y una función `track()` con un único punto de registro. Añadir un
proveedor es implementar `registerAnalyticsProvider` desde un componente
cliente.

Los eventos no llevan datos personales. Nunca pases un correo, un nombre ni el
texto libre de un formulario.

Como no hay cookies, no hay banner de cookies, y la política de cookies dice
exactamente eso. Si algún día se añade medición, hay que actualizar las tres
cosas en el mismo cambio.

---

## 8. Pruebas

| Nivel     | Herramienta | Qué protege                                              |
| --------- | ----------- | -------------------------------------------------------- |
| Unitario  | Vitest      | Utilidades, esquema de contacto, rate limit               |
| Contenido | Vitest      | Slugs únicos, enlaces internos, la regla de credibilidad  |
| Marca     | Vitest      | Que la identidad no se escriba fuera de la configuración  |
| Componente| Vitest + RTL| Botón y formulario, incluida su accesibilidad             |
| E2E       | Playwright  | Rutas, navegación, menú móvil, desbordes, objetivos táctiles, formulario, sincronía de la paleta, panel cerrado sin sesión |
| Panel     | Vitest      | Fechas, recurrencias, agenda, recordatorios, dinero y validación (`lib/life`) |

Playwright ejecuta tres perfiles: móvil (390), portátil de 16" (1366) y
escritorio (1920).

No buscamos cobertura alta. Buscamos que sea imposible romper en silencio: la
navegación, el formulario, el responsive y la honestidad de las cifras.

## Rutas y datos añadidos en la transformación de 2026-10-17

- `/areas` y `/areas/[slug]`: las tres áreas de trabajo, desde
  `content/areas.ts` (prerenderizadas con `generateStaticParams`).
- `/sectores` y `/sectores/[slug]`: siete sectores, desde `content/sectors.ts`.
- `/metodo-vco`: el Método VCO. `/metodo` redirige con 308 desde
  `next.config.ts`.
- `/diagnostico`: formulario real. Esquema compartido en
  `lib/diagnosis-schema.ts`, endpoint en `app/api/diagnostico/route.ts`,
  almacenamiento en la tabla `leads` de Supabase (ver D-026) y lectura en
  `/panel/inbox` mediante `loadLeads()`.
- `lib/impact.ts`: la aritmética de los seis escenarios, sin JSX y con
  pruebas. La interfaz es `components/features/ImpactCalculator.tsx`.
- `components/ui/Select.tsx`: el desplegable propio, antes en `panel/`. Lo
  usan el panel y el formulario de diagnóstico.
- `components/ui/FormField.tsx`: etiqueta, error y pista compartidos por los
  dos formularios del sitio.

