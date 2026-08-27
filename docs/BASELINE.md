# BASELINE V1 — arquitectura + sistema de diseño + estructura inicial

Este documento marca un **punto de retorno estable**.

El commit `feat: establish production-ready website foundation`, etiquetado como
`baseline-v1`, es la primera versión completa y verificada del sitio, tomada
**antes** de las fases de naming y branding.

Si una iteración posterior de marca, color, tipografía o diseño empeora el
proyecto, este es el estado exacto al que volver.

---

## Cómo volver aquí

```bash
git log --oneline baseline-v1 -1     # ver el commit exacto
git diff baseline-v1                 # qué ha cambiado desde entonces
git switch -c rescate baseline-v1    # abrir una rama en este punto
```

Para descartar trabajo posterior en la rama actual y volver literalmente a este
estado (**destructivo**, revisa antes que no haya nada que salvar):

```bash
git reset --hard baseline-v1
```

---

## Qué congela esta versión

**Arquitectura**

- Next.js 16 con App Router, Server Components por defecto
- Capas unidireccionales: `config → content → components → app`, con `lib`
  transversal
- Contenido como datos tipados en `src/content/`, listo para migrar a un CMS
  respetando las interfaces de `types.ts`
- Cinco dependencias de producción, cada una justificada en `DECISIONS.md`

**Sistema de diseño**

- Tokens en `src/app/globals.css` como única fuente de verdad visual
- Escala tipográfica fluida con techo en 1536 px
- Contraste medido y documentado, WCAG AA cumplido
- La firma visual del antes/después (`ProcessFlow`, `ProcessRibbon`)

**Estructura**

- 25 rutas generadas, la mayoría estáticas
- SEO completo: metadatos, canónicas, sitemap, robots, OpenGraph, datos
  estructurados
- Formulario con validación doble, rate limit y honeypot
- 42 tests unitarios y 71 pruebas e2e en tres perfiles de dispositivo

**Marca**

- Sin nombre. El sitio muestra `[BRAND]` a propósito
- Toda la identidad textual centralizada en `src/config/brand.ts`
- Todo el color de marca derivado de dos números en `globals.css`

---

## Verificaciones en el momento de congelar

| Comprobación         | Resultado                                    |
| -------------------- | -------------------------------------------- |
| `npm run lint`       | Sin errores                                   |
| `npm run typecheck`  | Sin errores                                   |
| `npm test`           | 42 de 42                                      |
| `npm run build`      | 25 rutas generadas                            |
| `npm run test:e2e`   | 71 de 71 (7 omitidas por perfil de dispositivo) |
| Barrido responsive   | 10 páginas × 10 anchos: cero desbordes         |
| Contraste            | Todos los pares de texto por encima de 4,5:1   |

---

## Lo que NO congela

Esta versión no incluye, y es deliberado:

- Nombre, logotipo ni identidad visual definitiva
- Datos identificativos reales en las páginas legales
- Transporte configurado para el formulario de contacto
- Ningún proveedor de analítica
- Ningún resultado de cliente real

Los pendientes están listados en `docs/ROADMAP.md`, en la sección "Antes de
publicar en el dominio real". Ninguno es un pendiente de código.
