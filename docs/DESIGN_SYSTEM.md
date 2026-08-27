# Sistema de diseño

Fuente de verdad: `src/app/globals.css`. Este documento explica el porqué; el
archivo manda sobre los valores.

Regla única: **si un componente contiene un color, un tamaño, un radio o una
duración escritos a mano, está mal.**

---

## 1. Intención visual

La referencia no es una landing de SaaS. Es un **documento técnico bien
compuesto**: papel cálido, tinta, retículas, numeración de secciones, una sola
tinta de color.

Queremos que la sensación sea "esta gente entiende procesos", no "esta gente
hace cosas con IA". Por eso:

- Los bloques se separan con filetes de 1 px y cambios de tono, no con tarjetas
  flotantes ni sombras.
- La rejilla es visible como estructura, no como decoración.
- Hay un único momento de contraste fuerte por página (el bloque oscuro del
  método). Dos serían ruido.
- Ninguna forma es gratuita: los diagramas explican, no adornan.

---

## 2. Color

### Marca

Toda la rampa de marca deriva de dos números en `@theme`:

```css
--brand-h: 42;      /* ángulo de tono OKLCH */
--brand-c: 0.115;   /* croma de referencia */
```

Cambiar esos dos valores reskinea el sitio entero. Es el punto de cambio único
que exige la fase de branding pendiente.

El acento actual es un cobre cálido. Se eligió por descarte razonado: el azul y
el morado son el uniforme de las consultoras de IA, y no queremos parecernos.

### Neutros

Rampa `ink-*` cálida, de `ink-0` (blanco) a `ink-950`. El fondo del sitio no es
blanco puro: es `ink-25`, un papel muy claro. El blanco puro se reserva para
superficies que deben leerse como "encima" del papel.

### Tokens semánticos

Nunca uses `ink-600` en un componente. Usa el token semántico:

| Token             | Uso                                              |
| ----------------- | ------------------------------------------------ |
| `bg`              | Fondo de página                                  |
| `bg-subtle`       | Secciones alternas, pie                          |
| `bg-sunken`       | Fondos hundidos, estados activos                 |
| `surface`         | Superficie elevada sobre el papel                |
| `inverse`         | El bloque oscuro                                 |
| `fg`              | Texto principal                                  |
| `fg-muted`        | Texto secundario y párrafos largos               |
| `fg-subtle`       | Etiquetas, notas al pie, unidades                |
| `line`            | Filete estándar (decorativo)                     |
| `line-soft`       | Retícula de fondo                                |
| `line-strong`     | Filete de énfasis                                |
| `line-field`      | Borde de controles interactivos                  |
| `accent`          | Acción principal y marcadores de "sistema"       |
| `accent-text`     | Acento sobre papel para texto (más oscuro)       |
| `critical`        | Errores de formulario                            |
| `positive`        | Reservado, aún sin uso                           |

### Contraste medido

Medido en el navegador sobre el sitio construido, no estimado:

| Par                          | Ratio    | Requisito |
| ---------------------------- | -------- | --------- |
| `fg` sobre `bg`              | 17,7:1   | 4,5:1     |
| `fg-muted` sobre `bg`        | 6,6:1    | 4,5:1     |
| `fg-subtle` sobre `bg`       | 5,0:1    | 4,5:1     |
| `accent-text` sobre `bg`     | 7,1:1    | 4,5:1     |
| `critical` sobre `bg`        | 6,2:1    | 4,5:1     |
| `accent-fg` sobre `accent`   | 5,2:1    | 4,5:1     |
| `fg-inverse-muted` sobre `inverse` | 8,4:1 | 4,5:1   |
| `line-field` sobre `surface` | 3,4:1    | 3:1 (1.4.11) |

`fg-subtle` estaba en 4,23:1 con `ink-500` y se oscureció expresamente hasta
pasar el umbral: se usa en etiquetas de 11-14 px, que son texto normal a
efectos de WCAG. `line` no llega a 3:1 y por eso **no puede usarse como borde
de un control**: para eso está `line-field`.

Si añades un token de texto o de borde interactivo, mídelo antes de usarlo.

---

## 3. Tipografía

Dos familias, ambas variables, ambas servidas desde el propio dominio por
`next/font`.

- **Instrument Serif** — solo display: `h1`, títulos de sección, cifras
  grandes. Aporta la voz editorial.
- **Instrument Sans** — todo lo que hay que leer de verdad: párrafos, interfaz,
  etiquetas, navegación.

No hay monoespaciada. La sensación "técnica" la dan las mayúsculas espaciadas y
las cifras tabulares, no una fuente de terminal.

### Escala

Toda la escala usa `clamp()` y **alcanza su techo alrededor de 1536 px**. Es la
decisión que hace que un portátil de 16" se sienta diseñado y no reducido:

| Token         | Móvil (360) | 16" (1366) | Techo  |
| ------------- | ----------- | ---------- | ------ |
| `text-h1`     | 38 px       | 60 px      | 64 px  |
| `text-h2`     | 30 px       | 45 px      | 46 px  |
| `text-h3`     | 21 px       | 26 px      | 27 px  |
| `text-metric` | 36 px       | 56 px      | 60 px  |
| `text-lead`   | 17 px       | 20 px      | 21 px  |

Cuerpo fijo en 16 px con interlineado 1.65. No se reduce en móvil.

### Reglas

- Máximo dos pesos por familia en una vista.
- `text-wrap: balance` en titulares, `pretty` en párrafos: ya está en la base.
- Medida de lectura entre 46 y 64 caracteres. Los `max-w-[NNch]` del código son
  eso, no una casualidad.
- Cifras que deben alinearse: clase `tnum`.
- Cualquier clave nueva en `--text-*` hay que registrarla en `src/lib/cn.ts`.

---

## 4. Espaciado y ritmo

Dos tokens gobiernan el ritmo de todo el sitio:

```css
--section-y: clamp(4.5rem, 3rem + 5vw, 8.5rem);  /* aire vertical entre secciones */
--gutter:    clamp(1.25rem, 0.85rem + 1.6vw, 2.5rem);  /* margen lateral */
```

`Section` aplica el primero (`tight` = 62 %, `loose` = 125 %). `Container`
aplica el segundo. **No pongas `px-*` ni `py-*` a una sección**: usa los
componentes.

Dentro de un bloque, la escala de Tailwind (múltiplos de 4 px) es suficiente.

## 5. Anchos

| Token                 | Valor  | Uso                              |
| --------------------- | ------ | -------------------------------- |
| `--container-content`  | 736 px | Texto largo: legal, artículos     |
| `--container-page`     | 1240 px| La rejilla principal              |
| `--container-wide`     | 1440 px| Paneles a sangre                  |

A 2560 px el contenido **no se estira**: se queda en 1240 px y crece el aire.
Es deliberado: una línea de texto de 2000 px no se lee.

---

## 6. Bordes, radios y elevación

- Radios contenidos: 2, 4, 8, 12, 16 px. Nada redondeado como una pastilla,
  salvo distintivos y el marcador circular de los diagramas.
- **La elevación se expresa con filetes, no con sombras.** Existen
  `--shadow-raise` y `--shadow-pop` para superficies genuinamente flotantes;
  hoy no los usa nadie, y eso es buena señal.
- Las rejillas de tarjetas usan `gap-px` sobre fondo `line`: el hueco es el
  filete. Así seis tarjetas se leen como una tabla y no como seis objetos.

---

## 7. Movimiento

Presupuesto de animación reducido y con función.

| Token               | Valor | Uso                                   |
| ------------------- | ----- | ------------------------------------- |
| `--duration-fast`   | 140ms | Hover, cambios de color               |
| `--duration-base`   | 240ms | Transformaciones pequeñas             |
| `--duration-slow`   | 420ms | Entradas al hacer scroll              |
| `--duration-scene`  | 700ms | Reservado para cambios de estado grandes |
| `--ease-out-quart`  | —     | Curva por defecto para entradas       |

Reglas:

- Toda animación cumple una función: dirigir la atención, explicar, confirmar o
  conectar dos estados.
- Las entradas son 12 px de desplazamiento y opacidad. Nada más.
- Nada por encima del pliegue se anima al entrar: perjudica el LCP.
- `prefers-reduced-motion` está resuelto globalmente en `globals.css`.
- No hay librería de animación instalada, y no debería hacer falta: `Reveal`
  usa un `IntersectionObserver` y una transición CSS.

---

## 8. Puntos de ruptura

Nombrados por el dispositivo real al que sirven:

| Nombre | Ancho   | Contexto            |
| ------ | ------- | ------------------- |
| `xs`   | 430 px  | Móviles grandes     |
| `sm`   | 640 px  | —                   |
| `md`   | 768 px  | Tablet              |
| `lg`   | 1024 px | Tablet apaisada / portátil pequeño |
| `xl`   | 1366 px | Portátil de 16"     |
| `2xl`  | 1536 px | Portátil grande     |
| `3xl`  | 1920 px | Escritorio          |

`lg` es donde aparece la navegación de escritorio y desaparece el menú móvil.

---

## 9. Iconos

`lucide-react`, importados uno a uno. Tamaños: 16, 20, 24 px. Grosor de trazo
1.5 para iconografía decorativa y 1.75–2 dentro de botones.

Los iconos acompañan, nunca sustituyen a una etiqueta. Nada de emojis.

---

## 10. La firma visual

El diagrama antes/después es el elemento propio de esta marca. Dos
implementaciones, un mismo lenguaje:

- `ProcessRibbon` — versión comprimida y horizontal. Va en el hero.
- `ProcessFlow` / `BeforeAfter` — versión completa en dos columnas. Va en
  soluciones y casos.

Gramática de los marcadores:

| Marcador                     | Significa   |
| ---------------------------- | ----------- |
| Círculo hueco                | Entrada     |
| Cuadrado con borde           | Una persona |
| Cuadrado macizo en acento    | El sistema  |
| Rombo macizo en acento       | Resultado   |

El carril del proceso manual es **discontinuo** y sus etiquetas van atenuadas;
el automatizado es continuo y nítido. La diferencia se percibe antes de leer.
El significado también está en texto para lectores de pantalla: nunca depende
solo de la forma o del color.
