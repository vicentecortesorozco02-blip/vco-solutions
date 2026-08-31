# Guía de marca

Estado: **A — infraestructura preparada.** No hay nombre, logotipo ni color
definitivos. Este documento define qué es la marca y deja el sistema listo para
recibirlos.

---

## 1. Posicionamiento

### Qué somos

Una empresa de **ingeniería de procesos**. Entramos en una empresa, entendemos
cómo trabaja, medimos qué procesos consumen horas innecesarias y construimos
los sistemas que eliminan ese trabajo.

La tecnología —software a medida, integraciones, automatizaciones, IA— es el
medio. El producto es **tiempo, eficiencia y capacidad operativa**.

### Qué NO somos

Esta lista es operativa: si una decisión de diseño, copy o naming nos acerca a
alguna de estas categorías, está mal.

| No somos | Cómo se nota que lo estamos pareciendo |
| --- | --- |
| Agencia de IA | La IA aparece antes que el problema del cliente |
| SaaS genérico | Bento grids, degradados, "empieza gratis" |
| Consultora tradicional | Lenguaje de PowerPoint, "transformación", "roadmap estratégico" |
| Startup infantil | Ilustraciones, emojis, exclamaciones, tono de colega |
| Empresa de desarrollo web | Vendemos horas de programación en lugar de resultados |
| Agencia de marketing | Promesas sin método y cifras sin origen |

### La frase que resume la diferencia

> No vendemos tecnología. Vendemos el trabajo manual que desaparece.

---

## 2. Propuesta

**El problema.** En casi todas las empresas hay una parte del trabajo que no
produce nada y que nadie ha decidido conscientemente hacer: leer un correo para
reenviarlo, copiar un dato de un PDF a un programa, montar un documento
partiendo del último parecido. Cada tarea dura pocos minutos, y por eso nadie
la cuenta. Sumadas, son personas a jornada completa.

**Qué hacemos.** Mapeamos ese trabajo, le ponemos números y construimos el
sistema que lo reduce o lo elimina.

**Qué gana el cliente.** La cadena que ordena todos los textos del sitio:

> menos trabajo manual → menos errores → más capacidad → mejor rendimiento

---

## 3. Filosofía

Lo que la marca debe transmitir, y cómo se traduce en decisiones concretas:

| Valor | Cómo se hace visible |
| --- | --- |
| Precisión | Cifras con su origen; nunca un porcentaje redondo sin cálculo |
| Inteligencia | Explicar lo complejo en lenguaje llano, no al revés |
| Orden | Numeración de secciones, retícula, jerarquía inequívoca |
| Movimiento | Los diagramas de proceso: algo entra, algo sale |
| Eficiencia | Menos elementos, no más. Una idea por sección |
| Fiabilidad | Decir lo que no sabemos y lo que todavía no tenemos |
| Claridad | Un CTA dominante; cero jerga |
| Ingeniería | Filetes, medidas, marcadores. Estética de documento técnico |
| Mejora continua | La quinta fase del método existe para volver a medir |

**Prohibido en la identidad visual:** robots, cerebros, circuitos, nodos
neuronales, partículas, hologramas, degradados violeta o azul, estética
cyberpunk, efectos futuristas sin función.

---

## 4. Voz

Sencilla, directa, segura, humana, profesional. Sin humo.

La prueba: **una persona que no sabe qué es una API tiene que entenderlo todo.**

> Escribimos «Quitamos trabajo manual».
> No escribimos «Implementamos arquitecturas agentic multimodales».

### Reglas

1. Una idea por sección. Si no cabe en una pregunta de cinco palabras, sobra.
2. La frase corta gana.
3. Sustantivos concretos: factura, correo, presupuesto, Excel. Nunca «flujos de
   trabajo optimizados».
4. Verbos en primera persona del plural: mapeamos, medimos, construimos.
5. Nada de negrita para enfatizar dentro de un párrafo. Si algo importa, va en
   su propia línea.
6. Cero signos de exclamación.
7. Ninguna palabra que no sobreviva a «¿esto qué significa exactamente?».
8. Decir lo que no hacemos es parte del tono, no una debilidad.

---

## 5. Lenguaje prohibido

No por feo, sino porque **no aporta información**. Si una frase sigue siendo
verdad al sustituir nuestra empresa por cualquier otra, no dice nada.

potenciar · revolucionar · transformación digital · soluciones innovadoras ·
soluciones 360 · sinergia · disruptivo · líderes del sector · innovación de
vanguardia · impulsar tu negocio · desbloquear el potencial · llevar tu empresa
al siguiente nivel · IA de última generación · revolucionamos tu negocio con IA

### Prueba rápida

Tapa el nombre de la empresa en la frase. Si podría firmarla un competidor
cualquiera, reescríbela con un sustantivo concreto y un número.

---

## 6. Jerarquía de mensajes

Cinco niveles. El orden importa: es el recorrido mental del visitante.

### 1 — Mensaje principal

> Tu empresa tiene tareas que nadie debería seguir haciendo a mano.

Nombra el problema del lector, no nuestra capacidad. Es una **hipótesis de
comunicación**, no un lema cerrado: se validará con tráfico real.

### 2 — Explicación

> Analizamos cómo trabaja tu empresa y construimos los sistemas que eliminan
> ese trabajo repetitivo. Menos errores, más capacidad y horas que vuelven a tu
> equipo.

### 3 — Propuesta

> Menos trabajo manual → menos errores → más capacidad → mejor rendimiento.

### 4 — Metodología

> Cinco fases. Un proceso cada vez, con números delante.
> 01 Mapeamos · 02 Cuantificamos · 03 Rediseñamos · 04 Construimos · 05 Comprobamos

### 5 — CTA

> Cuéntanos qué quieres automatizar.

Un único CTA dominante en todo el sitio. Prohibidos como acción principal:
«Contactar», «Más información», «Enviar», «Solicitar demo». Un CTA expresa
intención, no mecánica.

Los cinco niveles viven en `src/config/brand.ts` y `src/content/`. Cambiarlos es
editar datos, no componentes.

---

## 7. Firma visual

El diagrama antes/después no es un componente de la home: es **lenguaje de
marca**. Puede vivir en una propuesta, una factura, una presentación o un
informe, y seguir siendo reconocible.

Dos implementaciones del mismo idioma:

- `ProcessRibbon` — forma comprimida y horizontal. Hero e imagen social.
- `BeforeAfter` / `ProcessFlow` — forma completa en dos columnas. Soluciones y
  casos.

### Gramática

| Elemento | Significa |
| --- | --- |
| Carril **discontinuo** | Proceso manual: se sostiene por personas y se rompe |
| Carril **continuo** | Proceso automatizado: se sostiene solo |
| Círculo hueco | Entrada al proceso |
| Cuadrado con borde | Lo hace una persona |
| Cuadrado macizo en acento | Lo hace el sistema |
| Rombo macizo en acento | Resultado |

Reglas de uso:

1. El lado automatizado **siempre tiene menos pasos** que el manual. Si no los
   tiene, el diagrama está mintiendo y hay una prueba que lo comprueba.
2. Las etiquetas del lado manual van atenuadas; las del automatizado, nítidas.
3. El significado nunca depende solo del color o de la forma: va también en
   texto para lectores de pantalla.
4. El rombo del resultado es el mismo signo que el isotipo. No es casualidad:
   la marca es el resultado del proceso.

---

## 8. Metodología y Mapa de tiempo

### Las cinco fases

| Nº | Fase | Qué recibe el cliente |
| --- | --- | --- |
| 01 | Mapeamos | El mapa de su proceso, paso a paso, con quién hace qué |
| 02 | Cuantificamos | El coste real en horas y en euros, y qué parte es automatizable |
| 03 | Rediseñamos | El proceso objetivo, con los puntos de control acordados |
| 04 | Construimos | El sistema funcionando, con el equipo formado |
| 05 | Comprobamos | La medición del antes y el después, y el siguiente proceso priorizado |

Todas son verbos en primera persona del plural. Todas terminan en un
entregable: un método sin entregables es una presentación.

### El Mapa de tiempo

Es el entregable de la fase 01 y **el activo comercial de la marca**. Un
documento que el cliente se queda tanto si seguimos trabajando juntos como si
no.

Qué contiene:

1. **Fotografía del proceso actual.** Cómo se trabaja hoy de verdad, no cómo
   está escrito en un procedimiento.
2. **Pasos.** Cada uno con su entrada, su salida y su herramienta.
3. **Responsables.** Quién ejecuta cada paso y quién decide.
4. **Tiempos.** Duración real y frecuencia, medidas, no estimadas.
5. **Fricciones.** Dónde se para el trabajo, dónde se repite, dónde se pierde
   información, dónde aparecen los errores.
6. **Automatizaciones posibles.** Qué puede hacer un sistema, qué exige
   criterio humano y qué conviene dejar como está.
7. **Estimación de impacto.** Horas al año en juego y qué parte es realista
   recuperar, con las hipótesis a la vista.

Por qué importa a la marca: es la prueba de que empezamos por entender y no por
proponer. Es lo único que un competidor no puede copiar de la web.

**Sin precio todavía.** Es candidato natural a convertirse en un primer encargo
de pago, pero hasta que exista un alcance repetible no se publica ninguna
tarifa. Ver `DECISIONS.md`, D-012.

---

## 9. Territorio de naming

**El nombre no está decidido.** Aquí queda el criterio, no la respuesta.

### Campo semántico

Flujo · movimiento · proceso · continuidad · sistema · eficiencia · velocidad ·
conexión · cadencia · precisión.

No es obligatorio que contenga literalmente «flow».

### Criterios

| Criterio | Umbral |
| --- | --- |
| Longitud | 2–3 sílabas; idealmente 5–8 letras |
| Pronunciación en España | Unívoca a la primera, sin explicar cómo se escribe |
| Dictado por teléfono | Se escribe bien sin deletrear |
| Internacional | Legible fuera del español; sin eñes ni tildes |
| Registro | Funciona como `XXXXX, S.L.` en un documento serio |
| Tono | Profesional, ni infantil ni excesivamente técnico |
| Recorrido | Sirve igual a una empresa de 6 personas que a una de 200 |

### Descartar si

- Termina en `-ify`, `-ly`, `-AI`, `-Tech`, `-Soft` o `-Labs`.
- Necesita una explicación para entenderse.
- Es un juego de palabras que envejece.
- Se confunde al oído con una marca existente del sector.

### Comprobaciones antes de cerrar

1. Dominio `.es` y `.com` libres, o adquiribles.
2. Búsqueda en la OEPM y en EUIPO por clases 42 y 35.
3. Registro Mercantil Central: certificación negativa de denominación.
4. Búsqueda en Google: que no arrastre significados incómodos.
5. Prueba de teléfono: decirlo en voz alta y que la otra persona lo escriba
   bien a la primera.
6. Prueba de correo: `nombre@dominio` cabe en una firma sin resultar ridículo.

---

## 10. Dónde vive la marca

Toda la identidad está en **cuatro archivos**. No hay ningún quinto sitio.

| Archivo | Qué controla |
| --- | --- |
| `src/config/brand.ts` | Nombre, razón social, NIF, lema, descripción, dominio, correo, teléfono, ubicación, redes, idioma, metadatos, logotipo, favicon, tipografías y el espejo de la paleta |
| `src/config/brand.css` | Tono y croma del color de marca; pilas tipográficas |
| `src/config/fonts.ts` | Carga de las tipografías (`next/font`) |
| `src/components/brand/Logo.tsx` | Cómo se dibuja el logotipo |

Todo lo demás —espaciado, escala tipográfica, radios, movimiento,
componentes— es **estructura**, y un rebranding no debería tocarlo.

Hay pruebas que lo vigilan: `src/config/brand.test.ts` falla si alguien escribe
el nombre, el dominio, el correo o un color hexadecimal fuera de la
configuración.

### Nota sobre los nombres de campo

`brand.name` es el *companyName* y `brand.url` es el *website*. Se conservan
esos nombres porque ya están consumidos en todo el proyecto y renombrarlos solo
añadiría ruido.

---

## 11. Color

### Cómo cambiarlo

Dos números en `src/config/brand.css`:

```css
--brand-h: 42;     /* ángulo de tono OKLCH, 0-360 */
--brand-c: 0.115;  /* croma de referencia */
```

De ahí sale la rampa `brand-50` … `brand-900` y, con ella, el acento, el color
de los enlaces, los marcadores de los diagramas y los estados de foco.

El acento actual es un cobre cálido, elegido por descarte: el azul y el morado
son el uniforme de las consultoras de IA. Ver `DECISIONS.md`, D-005.

### Después de cambiarlo, obligatorio

**1. Comprobar contraste.** El sistema exige AA (4,5:1 en texto, 3:1 en bordes
de controles). Con el sitio servido:

```js
// Ejecutar en la consola del navegador sobre cualquier página del sitio.
const c = document.createElement("canvas"); c.width = c.height = 1;
const ctx = c.getContext("2d");
const rgb = (css) => { ctx.fillStyle = css; ctx.fillRect(0,0,1,1);
  const d = ctx.getImageData(0,0,1,1).data; return [d[0],d[1],d[2]]; };
const lin = (v) => (v/=255) <= 0.03928 ? v/12.92 : ((v+0.055)/1.055)**2.4;
const lum = ([r,g,b]) => 0.2126*lin(r) + 0.7152*lin(g) + 0.0722*lin(b);
const ratio = (a,b) => { const [x,y] = [lum(a),lum(b)].sort((p,q)=>q-p);
  return ((x+0.05)/(y+0.05)).toFixed(2); };
const v = (n) => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
for (const [fg, bg] of [["--color-accent","--color-bg"],
                        ["--color-accent-text","--color-bg"],
                        ["--color-accent-fg","--color-accent"]])
  console.log(fg, "/", bg, "=", ratio(rgb(v(fg)), rgb(v(bg))));
```

Si `--color-accent-fg` sobre `--color-accent` baja de 4,5:1, el texto de los
botones deja de ser accesible: ajusta la luminosidad de `brand-600`.

**2. Sincronizar la paleta.** `brand.colors` es un espejo hexadecimal para las
superficies que no leen CSS: la imagen social se genera en un worker y
`theme-color` es un metadato. Regenerarlo con el sitio servido:

```js
const c = document.createElement("canvas"); c.width = c.height = 1;
const ctx = c.getContext("2d", { willReadFrequently: true });
const hex = (css) => { ctx.clearRect(0,0,1,1); ctx.fillStyle = css; ctx.fillRect(0,0,1,1);
  const d = ctx.getImageData(0,0,1,1).data;
  return "#" + [d[0],d[1],d[2]].map(n => n.toString(16).padStart(2,"0")).join(""); };
const v = (n) => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
console.log(Object.fromEntries(Object.entries({
  bg:"--color-bg", surface:"--color-surface", inverse:"--color-inverse",
  fg:"--color-fg", fgMuted:"--color-fg-muted", fgSubtle:"--color-fg-subtle",
  line:"--color-line", accent:"--color-accent", accentFg:"--color-accent-fg",
}).map(([k,n]) => [k, hex(v(n))])));
```

Pega el resultado en `brand.colors`. La prueba `e2e/brand.spec.ts` falla si se
desvían, que es exactamente cómo se detectó que la imagen social llevaba toda
la fase 1 con un acento distinto al del sitio.

---

## 12. Tipografía

Dos familias, ambas variables y servidas desde el propio dominio.

| Papel | Familia actual | Uso |
| --- | --- | --- |
| Display | Instrument Serif | Titulares, títulos de sección, cifras grandes |
| Texto | Instrument Sans | Párrafos, interfaz, etiquetas, navegación |

Sin monoespaciada: la sensación técnica la dan las mayúsculas espaciadas y las
cifras tabulares, no una fuente de terminal.

Para cambiarlas: `src/config/fonts.ts` (la carga) y `src/config/brand.css` (las
pilas de respaldo). Mantener los nombres de variable `--font-brand-sans` y
`--font-brand-display` y el resto del sistema no se entera.

Al elegir una tipografía nueva, comprobar: acentos y eñe completos, cifras
tabulares, y que el titular del hero siga cayendo en un número razonable de
líneas a 390 px y a 1366 px.

---

## 13. Logotipo

`src/components/brand/Logo.tsx` es el único sitio que dibuja la identidad.

### Variantes

| Variante | Contenido | Dónde |
| --- | --- | --- |
| `lockup` | Símbolo + denominación | Cabecera, pie. Por defecto |
| `wordmark` | Solo denominación | Cuando el símbolo ya está presente |
| `symbol` | Solo isotipo | Espacios estrechos, avatares, favicon |
| `compact` | Símbolo + nombre corto | Anchos reducidos |

Tonos: `default` sobre papel, `inverse` sobre el bloque oscuro.
Tamaños: `sm`, `md`, `lg`.

### Estado actual

No hay logotipo. Lo que se dibuja es un marcador honesto: un rombo geométrico
en color de acento y el nombre en tipografía de marca. El rombo es el mismo
signo que marca «resultado» en los diagramas de proceso.

### Cuando exista el logotipo real

1. Colocar los SVG en `public/marca/`.
2. En `brand.ts`: `logo.hasCustomAsset: true` y rellenar `symbolSrc` (y
   `lockupSrc` si el conjunto no se compone), más `aspectRatio` para reservar
   espacio y no provocar CLS.
3. `Logo.tsx` sirve el asset. Ningún otro archivo cambia.

Requisitos del asset: SVG optimizado, sin texto convertido a curvas si se puede
evitar, legible a 20 px de alto, y con una versión que funcione en monocromo
sobre el bloque oscuro.

---

## 14. Favicon

Hoy **no hay ninguno, y es deliberado**: el del andamiaje era el logotipo de
Next.js y no puede publicarse como identidad propia.

Cuando exista la marca, basta con crear los archivos. Next los detecta por
convención, no hay que registrar nada:

| Archivo | Para qué |
| --- | --- |
| `src/app/icon.svg` | Icono principal. Suficiente por sí solo |
| `src/app/apple-icon.png` | 180×180, pantalla de inicio en iOS |

El icono debe ser el isotipo, no el conjunto: a 16 px una palabra no se lee.
Comprobar que se distingue sobre pestañas claras y oscuras.

---

## 15. Checklist de aplicación de marca

Cuando lleguen nombre, dominio, color y logotipo:

- [ ] `brand.ts`: `name`, `shortName`, `legalName`, `taxId`
- [ ] `brand.ts`: `domain`, `url`, `email`, `phone`
- [ ] `brand.ts`: `location`, `social`
- [ ] `brand.ts`: `metadata.twitterHandle`, `metadata.ogImageAlt`
- [ ] `brand.css`: `--brand-h`, `--brand-c`
- [ ] Comprobar contraste (§11) y corregir si algún par baja del umbral
- [ ] Regenerar `brand.colors` (§11) y pasar `e2e/brand.spec.ts`
- [ ] `fonts.ts` si cambian las tipografías
- [ ] `public/marca/` + `logo.hasCustomAsset` si hay logotipo
- [ ] `src/app/icon.svg` y `favicon.present: true`
- [ ] `README.md`: el título de la primera línea lleva el marcador
- [ ] Sustituir los `[PENDIENTE]` de las páginas legales con datos reales
- [ ] Eliminar de `brand.test.ts` la prueba «sigue sin publicar un nombre
      inventado», que existe solo mientras dure el marcador
- [ ] `npm run verify && npm run test:e2e`
- [ ] Revisión visual a 390, 768, 1366 y 1920 px
- [ ] Actualizar `DECISIONS.md` con el porqué del nombre y del color elegidos
