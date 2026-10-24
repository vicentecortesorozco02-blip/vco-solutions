# Sistema de diseño

Fuente de verdad: `src/app/globals.css` para la estructura y
`src/config/brand.css` para las decisiones de marca. Este documento explica el
porqué; los archivos mandan sobre los valores.

Separación deliberada: un rebranding toca `brand.css` y no debería necesitar
abrir `globals.css`. Ver [`BRAND.md`](BRAND.md).

Regla única: **si un componente contiene un color, un tamaño, un radio o una
duración escritos a mano, está mal.**

---

## 1. Intención visual

El mismo sistema que YourHotelWeb (ver `DECISIONS.md`, D-018): titulares
anchos en mayúsculas, mucho aire, papel blanco, gris claro y bloques de verde
pino profundo. La prueba no se describe: se enseña, con capturas reales dentro
de portátiles y móviles.

Queremos que la sensación sea "esta gente construye sistemas que funcionan",
no "esta gente hace cosas con IA". Por eso:

- Los titulares van en dos tonos: la primera línea afirma, la segunda, en gris,
  remata. Cortos: cuatro líneas como mucho a 1366 px.
- Las secciones alternan blanco y gris claro; como mucho dos bloques oscuros
  en la home, nunca seguidos.
- Las tablas de datos siguen siendo filetes de 1 px. Lo redondeado es para
  paneles, capturas y botones.
- Ninguna forma es gratuita: los diagramas explican, no adornan.

---

## 2. Color

### Marca

Toda la familia de acento deriva de dos números en `src/config/brand.css`:

```css
--brand-h: 175;     /* ángulo de tono OKLCH */
--brand-c: 0.0515;  /* croma del acento */
```

Con ellos, `brand-500` es el pino de YourHotelWeb (`#0e3b31`) y `brand-700` su
versión profunda (`#071c17`), que es el fondo de los bloques oscuros y del pie.

### Neutros

Rampa `ink-*` de grises fríos con una gota del tono de marca. El fondo del
sitio es blanco; `bg-subtle` (`#f2f5f3`) alterna secciones.

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
| `fg-quiet`        | Segunda línea de los titulares (solo display ≥ 32 px) |
| `fg-inverse-quiet`| Lo mismo sobre el bloque oscuro                  |
| `line`            | Filete estándar (decorativo)                     |
| `line-soft`       | Retícula de fondo                                |
| `line-strong`     | Filete de énfasis                                |
| `line-field`      | Borde de controles interactivos                  |
| `glint`           | Brillo interior de las superficies de acento     |
| `accent`          | Acción principal y marcadores de "sistema"       |
| `accent-text`     | Acento sobre papel para texto (más oscuro)       |
| `critical`        | Errores de formulario                            |
| `positive`        | Reservado, aún sin uso                           |

### Contraste medido

Medido en el navegador sobre el sitio construido, no estimado:

| Par                          | Ratio    | Requisito |
| ---------------------------- | -------- | --------- |
| `fg` sobre `bg`              | 18,8:1   | 4,5:1     |
| `fg-muted` sobre `bg` / `bg-subtle` | 5,7:1 / 5,2:1 | 4,5:1 |
| `fg-subtle` sobre `bg` / `bg-subtle` | 5,5:1 / 5,0:1 | 4,5:1 |
| `fg-quiet` sobre `bg` / `bg-subtle` | 3,5:1 / 3,2:1 | 3:1 (texto grande) |
| `accent` sobre `bg`          | 12,4:1   | 4,5:1     |
| `accent-fg` sobre `accent`   | 12,4:1   | 4,5:1     |
| `critical` sobre `bg`        | 6,4:1    | 4,5:1     |
| `fg-inverse-muted` sobre `inverse` | 8,9:1 | 4,5:1   |
| `fg-inverse-quiet` sobre `inverse` | 4,5:1 | 4,5:1   |
| `line-field` sobre `surface` | 3,6:1    | 3:1 (1.4.11) |

YourHotelWeb usa un gris del 35 % para la segunda línea de los titulares y un
gris "faint" (`#8b9692`, 3,05:1) para etiquetas. Aquí no: `fg-quiet` se
oscureció hasta pasar 3:1 también sobre gris claro, y las etiquetas usan
`fg-subtle`, que pasa 4,5:1. `line` no llega a 3:1 y por eso **no puede usarse
como borde de un control**: para eso está `line-field`.

Si añades un token de texto o de borde interactivo, mídelo antes de usarlo.

---

### Panel privado

El panel (`/panel`) usa los mismos tokens más estos, solo suyos (D-021):

| Token | Uso |
| ----- | --- |
| `canvas` | Fondo agrupado, gris muy claro (oscuro: casi negro) |
| `surface-raised` | Tarjeta al pasar el ratón, menús |
| `fill`, `fill-strong` | Fondo de controles y barras, translúcido |
| `caution`, `caution-quiet` | «Vence pronto». `critical` es «ya» |
| `scrim` | Detrás de los diálogos |

Modo oscuro: los tokens semánticos se redefinen bajo `[data-theme="dark"]`.
Contraste medido en ambos temas (2026-10-10): todo el texto ≥ 4,5:1
(`fg-subtle` 4,96 sobre lienzo claro; `caution` 4,78 sobre su fondo), bordes de
campo ≥ 3:1 (3,62 claro, 3,27 oscuro). `fg-quiet` (3,47) solo para
placeholders y días fuera del mes.

## 3. Tipografía

Una familia en dos anchos y una monoespaciada, servidas desde el propio
dominio por `next/font`. Se cargan en `src/config/fonts.ts` y se declaran como
pilas en `src/config/brand.css`.

- **Archivo ancha** — la utilidad `type-display`: anchura 122 %, peso 600,
  mayúsculas, interletraje −0,035 em. Solo titulares, listas grandes y cifras.
  Siempre con un token de tamaño (`text-h1`, `text-h2`, `text-h2-side`,
  `text-h3`, `text-list`, `text-metric`).
- **Archivo normal** — todo lo que hay que leer de verdad.
- **Geist Mono** — la utilidad `type-label`: etiquetas de 11 px en mayúsculas
  espaciadas. Nunca párrafos.

Las mayúsculas anchas se quedan sin sitio enseguida: `type-display` deja
partir una palabra que no cabe en su línea antes que empujar la página hacia
un lado. Si eso ocurre en un titular, el titular es demasiado largo.

### Escala

Toda la escala usa `clamp()` y **alcanza su techo alrededor de 1536 px**. Es la
decisión que hace que un portátil de 16" se sienta diseñado y no reducido:

| Token         | Móvil (360) | 16" (1366) | Techo  |
| ------------- | ----------- | ---------- | ------ |
| `text-h1`     | 38 px       | 77 px      | 84 px  |
| `text-h2`     | 32 px       | 59 px      | 64 px  |
| `text-h2-side`| 28 px       | 38 px      | 42 px  |
| `text-list`   | 30 px       | 52 px      | 56 px  |
| `text-h3`     | 22 px       | 29 px      | 30 px  |
| `text-metric` | 36 px       | 56 px      | 60 px  |
| `text-lead`   | 17 px       | 20 px      | 20 px  |

`text-h2-side` existe para los titulares que van en una columna lateral junto a
texto (`SectionHeader size="side"`): a tamaño `h2` una palabra de más de diez
letras no cabe en el 40 % de la fila.

Cuerpo fijo en 16 px con interlineado 1.65. No se reduce en móvil.

Panel: `text-title` para el título de cada pantalla y `text-stat` para las
cifras grandes de las tarjetas. Ancho normal, peso 600, sin mayúsculas.

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
--section-y: clamp(6rem, 4.3rem + 4.4vw, 10rem);  /* aire vertical entre secciones */
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

- Botones y distintivos: píldora (`rounded-full`). Paneles y capturas:
  `rounded-xl` / `rounded-2xl`. Tablas de datos: esquinas rectas.
- **La elevación se expresa con filetes, no con sombras.** La única sombra en
  uso es `--shadow-device`, en los marcos de portátil y móvil: son objetos, no
  paneles.
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

Dos elementos propios:

- **El trabajo en pantalla.** `ui/Devices` (`Laptop`, `Phone`, `Browser`)
  enseña capturas reales de `public/trabajos/`. Nunca una maqueta de algo que no
  existe; el pie de cada captura dice si los datos en pantalla son de ejemplo.
- **El diagrama antes/después**, `ProcessFlow` / `BeforeAfter`. Va en la
  sección oscura «De esto. A esto.» de la home, en soluciones y en casos,
  siempre sobre un panel blanco.

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

---

## 11. Controles de formulario del panel

El panel no usa `<select>`: un control del sistema operativo se ve distinto en
cada máquina y rompe la ilusión de aplicación propia. Se usa
`components/panel/Select`, un botón con una lista (`role="listbox"`) pintada
con los tokens de siempre:

- `bg-surface` y `ring-line-field` en reposo, `ring-accent` abierto.
- La lista es `bg-surface-raised` con `--shadow-pop`, y la opción activa
  `bg-accent-quiet` con su texto en `accent-text`, más una marca de
  verificación: el color nunca va solo.
- Alturas: 44 px (`min-h-11`) como control de formulario, 32 px (`min-h-8`) en
  el tamaño `sm` de las tarjetas del tablero.
- Teclado: flechas, inicio y fin, letras para buscar, Enter elige, Escape
  cierra y devuelve el foco al botón.

---

## 12. Figuras de datos

La web enseña cifras, no capturas decorativas. Las piezas están en
`components/ui/Figure.tsx` y se rigen por cuatro reglas:

- **Dos series como mucho.** Hoy en `line-strong` y el escenario de mejora en
  `accent`. No hay paleta de series porque no hace falta: papel, tinta y un
  acento siguen bastando.
- **El color nunca va solo.** Cada barra lleva su etiqueta y su número al lado,
  y por debajo es una `<table>` de verdad, legible con lector de pantalla y sin
  estilos.
- **La escala empieza en cero** y las barras llevan el extremo redondeado a
  4 px. Nunca un eje doble ni dos escalas en la misma figura.
- **Debajo de cada figura va la cuenta** y, cuando es un ejemplo, la palabra
  «simulación» o «ilustrativo». Una cifra sin su cálculo es una promesa.

Las capturas de trabajo real van en `Screenshot`: recuadro con la misma línea
que el resto de la página y un pie que dice qué se está mirando. Se han
retirado los marcos de portátil y de móvil; eran dibujo, no información.

