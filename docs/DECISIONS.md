# Decisiones

Registro de las decisiones que cuesta caro revertir, y del motivo por el que se
tomaron. Si cambias una, añade una entrada nueva en lugar de reescribir la
vieja.

---

## D-001 · La marca es un marcador, no un nombre

**Contexto.** No hay naming decidido y la fase de branding es posterior.

**Decisión.** Toda identidad vive en `src/config/brand.ts`. El sitio muestra
`[BRAND]`, deliberadamente visible.

**Motivo.** Un nombre provisional escrito en cuarenta archivos se convierte en
deuda el día que se decide el definitivo. Un marcador feo es imposible de
olvidar.

**Coste de revertir.** Nulo: es editar un objeto.

---

## D-002 · Sin librería de animación

**Decisión.** No se instala Motion / Framer Motion. `Reveal` usa un
`IntersectionObserver` y una transición CSS.

**Motivo.** El presupuesto de movimiento del sitio es "12 px y opacidad".
Instalar decenas de kilobytes de runtime para eso empeora el LCP a cambio de
nada. Y una librería instalada se acaba usando: la restricción es parte del
diseño.

**Cuándo reconsiderar.** Si aparece un diagrama que necesite orquestación real
de estados o transiciones de layout, con medición de su coste antes.

---

## D-003 · Métricas honestas en lugar de métricas falsas

**Contexto.** El patrón habitual del sector es una banda de cifras: "+120
clientes", "40 % de ahorro". No tenemos ninguna.

**Decisión.** Nada de cifras inventadas. La sección de métricas es una
calculadora donde el visitante mete sus propios números. Los casos son
demostraciones etiquetadas, con la aritmética a la vista. El tipo `Metric`
obliga a declarar la procedencia y un test exige `source` para toda cifra
`measured`.

**Motivo.** El comprador de este servicio es exactamente el tipo de persona que
detecta una cifra inventada, y una vez detectada se pierde todo lo demás. La
aritmética sobre sus propios datos convierte mejor y no puede ser falsa.

---

## D-004 · Instrument Serif + Instrument Sans

**Decisión.** Un display serif editorial y una grotesca neutra. Sin
monoespaciada.

**Motivo.** Descartamos la grotesca geométrica omnipresente (Inter, Geist): es
el uniforme del SaaS y se reconoce al instante. El serif da autoridad de
documento sin caer en "bufete de abogados" porque se limita a titulares y
cifras. La ausencia de monoespaciada evita la estética de terminal, que nos
acercaría a "agencia de IA".

**Coste de revertir.** Bajo: dos importaciones en `layout.tsx` y dos tokens.

---

## D-005 · El acento es cobre, no azul

**Decisión.** Tono OKLCH 42, un cobre cálido, sobre papel cálido.

**Motivo.** Las dos referencias estudiadas usan lavanda y azul-verde, igual que
casi todo el sector. El calor terroso comunica oficio e ingeniería, no
laboratorio. Y sobrevive a la fase de branding: si el color definitivo cambia,
son dos números.

---

## D-006 · Bordes en vez de sombras

**Decisión.** La jerarquía se construye con filetes de 1 px y cambios de tono.
Las rejillas usan `gap-px` sobre fondo de línea.

**Motivo.** Las sombras difusas son la firma visual del template de SaaS. Las
retículas nítidas son la de un documento técnico, que es lo que queremos
parecer. Además rinden mejor y no crean capas de compositing.

---

## D-007 · El endpoint de contacto falla en voz alta

**Decisión.** Sin transporte configurado en producción, `/api/contacto`
devuelve 503 y la interfaz ofrece el correo directo.

**Motivo.** La alternativa habitual —registrar el envío y responder 200— hace
que se pierdan leads durante semanas sin que nadie se entere. Un fallo visible
se arregla el mismo día.

---

## D-008 · Analítica planteada, no instalada

**Decisión.** Existe el vocabulario de eventos y el punto de registro
(`lib/analytics.ts`), pero ningún proveedor.

**Motivo.** Sin tráfico no hay nada que medir, y cada script de terceros cuesta
rendimiento, un banner de cookies y una revisión de privacidad. Dejando el
contrato hecho, añadirlo después es un archivo.

**Consecuencia.** Hoy el sitio no instala ninguna cookie, y la política de
cookies lo dice literalmente. Si se añade medición hay que actualizar la
política, el banner y esta entrada en el mismo cambio.

---

## D-009 · `tailwind-merge` con configuración extendida

**Contexto.** Bug real encontrado en QA visual: todos los `h2` del sitio se
renderizaban a 16 px.

**Causa.** `tailwind-merge` clasifica cualquier `text-*` desconocido como color
de texto. `cn("text-h2", "text-fg")` eliminaba el tamaño.

**Decisión.** `extendTailwindMerge` declara nuestra escala tipográfica, y un
test de regresión lo protege.

**Consecuencia permanente.** Toda clave nueva en el espacio `--text-*` de
`globals.css` hay que registrarla también en `src/lib/cn.ts`. Está anotado en
`CLAUDE.md`.

---

## D-010 · El panel del menú móvil no cuelga de la cabecera

**Contexto.** Segundo bug encontrado en QA visual: el menú móvil se abría vacío.

**Causa.** La cabecera usa `backdrop-blur`, y un `backdrop-filter` establece un
bloque contenedor para los descendientes `fixed`. El panel se maquetaba dentro
de los 64 px de la cabecera y colapsaba.

**Decisión.** El panel es hermano de `<header>`, no hijo. Está comentado en el
código para que nadie lo "arregle" volviéndolo a anidar.

---

## D-011 · El contenido son datos, no JSX

**Decisión.** Soluciones, casos, método y FAQ viven en `src/content/` como
objetos tipados.

**Motivo.** Es lo que más va a cambiar y lo que antes o después irá a un CMS.
Manteniéndolo como datos, esa migración sustituye el origen del array sin tocar
un solo componente. Además permite tests de invariantes de contenido, que es
como se protege la regla de credibilidad.

---

## D-012 · Nada de precios

**Decisión.** No se publica ninguna tarifa. Sí se publica la estructura de un
proyecto: análisis, implementación, mantenimiento y evolución.

**Motivo.** No hay un producto cerrado. Una tarifa inventada se convierte en
una conversación incómoda en la primera reunión.

**Cuándo reconsiderar.** Cuando exista un primer encargo empaquetado y
repetible —el *Mapa de tiempo* es el candidato natural— con un precio que se
pueda sostener.

---

## D-013 · Escala tipográfica con techo en 1536 px

**Decisión.** Todos los `clamp()` alcanzan su máximo alrededor de 1536 px. Por
encima crece el aire, no la letra, y el contenido se queda en 1240 px.

**Motivo.** El requisito explícito era que un portátil de 16" no pareciese una
pantalla de 27" mal escalada. Escalando la tipografía con el viewport sin techo,
un 16" recibe una versión reducida del diseño de 27". Con techo, cada contexto
tiene una composición propia.

---

## D-014 · Baseline congelado antes de naming y branding

**Contexto.** La arquitectura, el sistema de diseño y la estructura de
contenidos están terminados y verificados. Las siguientes fases —naming,
identidad visual, color definitivo— son las que más riesgo tienen de empeorar
el resultado, porque son subjetivas y se iteran mucho.

**Decisión.** Congelar este estado en el commit
`feat: establish production-ready website foundation`, etiquetado `baseline-v1`,
y documentar en `docs/BASELINE.md` cómo volver a él.

**Motivo.** Una base verificada a la que se puede regresar convierte la fase de
branding en un experimento reversible en lugar de en una apuesta.

**Consecuencia.** El favicon del andamiaje de Next se eliminó en este commit: es
el logotipo de Next.js y publicarlo como identidad propia sería incorrecto.
Hasta que haya branding, el sitio no sirve favicon.

---

## D-015 · La marca se separa de la estructura

**Contexto.** Fase de branding. `--brand-h` y `--brand-c` vivían mezclados con
el resto de tokens en `globals.css`, las tipografías se cargaban en
`app/layout.tsx` y el logotipo era un componente de `layout/`. Aplicar una
identidad obligaba a abrir archivos que no tienen nada que ver con la marca.

**Decisión.** La identidad vive en cuatro archivos y solo cuatro:
`config/brand.ts`, `config/brand.css`, `config/fonts.ts` y
`components/brand/Logo.tsx`. `globals.css` queda como estructura pura:
espaciado, escala, radios, movimiento. Un rebranding no debería abrirlo.

**Motivo.** El objetivo declarado de la fase es que aplicar el naming sea un
cambio pequeño y seguro. Eso exige que la superficie de cambio sea enumerable.

**Verificación.** `config/brand.test.ts` recorre el código y falla si aparece el
marcador, el dominio, el correo o un color hexadecimal fuera de la
configuración. La extracción se comprobó además píxel a píxel contra
`baseline-v1`: 28 capturas de página completa idénticas.

---

## D-016 · `brand.colors`, un espejo consciente

**Contexto.** Bug encontrado al centralizar el color: la imagen social llevaba
toda la fase 1 con literales escritos a mano que se habían desviado de los
tokens. El acento del sitio es `#ac522d`; el de la imagen social era `#b0631c`.
También `theme-color` estaba desviado.

**Causa.** La imagen social se genera en un worker que no puede leer CSS, y
`theme-color` es un metadato. Ninguno de los dos puede consumir un token.

**Decisión.** Un único espejo hexadecimal en `brand.colors`, marcado como copia,
con instrucciones de regeneración en `BRAND.md` §11 y una prueba e2e
(`e2e/brand.spec.ts`) que resuelve los tokens reales en un navegador y falla si
se desvían.

**Alternativa descartada.** Mover la paleta a TypeScript y generar el CSS desde
ahí: añadiría un paso de compilación y JavaScript para resolver algo que CSS ya
hace mejor. Una copia vigilada por una prueba es más simple que un generador.

---

## D-017 · El nombre es VCO Solutions

**Contexto.** D-001 dejó la marca como marcador a la espera del naming. Se
exploraron dos rondas de candidatos y se auditó VALDRA a fondo: sin marcas
idénticas en OEPM ni EUIPO, pero con una marca UE casi homófona registrada
hasta 2030 (VALTRA, AGCO, clase 9 con software descargable), con `.com` y `.ai`
en manos de una empresa homónima de software y con el `.com` fuera de alcance.
Resultado de la auditoría: ámbar, condicionado a dictamen jurídico.

**Decisión.** Se descarta VALDRA. El nombre es **VCO Solutions**, forma corta
**VCO**, razón social **VCO Solutions S.L.**, dominio **vcosolutions.es**.

**Motivo.** Es la decisión del fundador. Lo que la sostiene: `VCO` son sus
iniciales, la cadena completa no existe como marca registrada en OEPM ni EUIPO
en ninguna clase, todos los dominios relevantes están libres —incluido el
`.com`, que en el candidato anterior no lo estaba— y la marca comercial
coincide con la razón social, así que la factura, el contrato y la web dicen lo
mismo.

**Lo que cuesta, escrito para que nadie lo redescubra dentro de dos años.**

1. `Solutions` es el sufijo genérico que `BRAND.md` §5 desaconseja y que
   `CLAUDE.md` §2 cita como ejemplo de jerga vacía. La web está construida
   para no sonar a proveedor genérico y el nombre empuja en sentido contrario.
   Lo compensa el copy, no el nombre.
2. La marca es débil por construcción: `Solutions` es descriptivo y no da
   exclusividad a nadie. Lo único protegible es `VCO`, y existe una EUTM `VCO`
   registrada en clases 41 y 42 (Virtual Competition Organisation GmbH, 2020).
   Antes de solicitar marca hace falta un dictamen sobre esa anterioridad.
3. Existe ya un producto de software llamado literalmente «VCO Solutions»
   (Veridico, `vco.solutions`, apps publicadas en iOS y Android). No es una
   marca registrada, pero comparte SERP y nombre exacto en el mismo sector.
4. `V-C-O` hay que deletrearlo siempre por teléfono, y `vcosolutions.es` son
   quince caracteres sin separador. El dictado es peor que el de cualquier
   candidato de las dos rondas.

**Consecuencia.** La diferenciación de la marca recae por completo en el
mensaje: el lema, el hero y el pie. Al revisar copy, esa es la prioridad.

**Coste de revertir.** Bajo mientras no se registre la marca ni la sociedad, y
mientras el dominio no lleve tiempo indexado: es editar `brand.ts` y cuatro
documentos. Alto después.
