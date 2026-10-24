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

---

## D-018 · El sistema visual de YourHotelWeb

**Contexto.** YourHotelWeb es un producto propio del fundador (webs para
hoteles, con su CRM y sus cobros). Su web pública tiene un sistema visual y una
estructura que el fundador quiere también para VCO Solutions: «estilo y
estructura», con el mismo verde pino.

**Decisión.** VCO adopta el sistema de YourHotelWeb:

- Archivo en dos anchos: ancha, en mayúsculas y con la segunda línea del
  titular en gris (`type-display`, `TitleLines`); normal para leer.
- Geist Mono para las etiquetas pequeñas (`type-label`).
- Papel blanco, gris claro para alternar secciones, verde pino profundo para
  los bloques oscuros y el pie. Acento: pino `#0e3b31`.
- Botones en forma de píldora; trabajo real enseñado en portátiles y móviles
  dibujados en CSS (`ui/Devices`).
- La home sigue la estructura de YourHotelWeb contada para procesos: hero con
  el sistema en pantalla, lista grande de frentes, problema numerado, «De esto.
  A esto.» en oscuro, trabajo real, la cuenta, integraciones en oscuro, método,
  preguntas y cierre con pasos.

**Revierte.** D-004 (Instrument Serif + Sans, sin monoespaciada), D-005 (cobre)
y, en parte, D-006: siguen sin usarse sombras en paneles, pero ahora hay
superficies redondeadas y los marcos de dispositivo proyectan sombra.

**Lo que no se copia.** La regla de las cifras. YourHotelWeb y VCO se escriben
igual de honestos: YourHotelWeb aparece como `kind: "product"` (producto
propio, no cliente), con capturas del sistema real, datos de ejemplo
señalados como tales y ninguna hora ahorrada que no se haya medido.

**Coste.** Visualmente, VCO y YourHotelWeb pasan a parecer la misma casa. Es
intencionado: son del mismo fundador. Si algún día deben separarse, el color
son dos números en `brand.css` y la tipografía un archivo.

---

## D-019 · Tres tipos de trabajo: demostración, producto propio, proyecto

**Contexto.** Hasta ahora `CaseKind` era `demonstration | project`. Publicar
YourHotelWeb como `project` habría dicho que es un trabajo para un cliente, y
habría hecho desaparecer el aviso «todavía no hay proyectos de clientes», que
sigue siendo cierto.

**Decisión.** Nuevo tipo `product`: software construido y desplegado para un
negocio propio. Se etiqueta como «Producto propio» allí donde aparece
(`KindBadge`). Sus cifras son hechos comprobables sobre el sistema, nunca
ahorros sin medir. El aviso de `/casos` depende ahora de que no exista ningún
`project` (`noClientProjects`).

---

## D-020 · Un panel privado (Life CRM) dentro de la misma app, sobre Supabase

**Contexto.** El fundador quiere un centro de control personal (agenda, tareas,
dinero, suscripciones, universidad, proyectos, dominios, contactos, documentos)
con persistencia real, accesible desde esta misma web. El proyecto no tenía
base de datos ni autenticación, y la regla era no meterlas sin pedirlo: aquí se
pidieron explícitamente.

**Decisión.**

- Vive en `/panel`, en un grupo de rutas propio. La web pública pasa a
  `app/(site)/` con su cabecera y su pie; las URL no cambian.
- Datos en un proyecto de Supabase dedicado (`life-crm`), separado de los de
  otros negocios. Migraciones versionadas en `supabase/migrations/`.
- Dos dependencias nuevas: `@supabase/supabase-js` (cliente) y `@supabase/ssr`
  (sesión en cookies con Server Components y el proxy). No hay alternativa más
  pequeña que no sea reescribir el cliente de auth.
- Acceso por correo y contraseña de Supabase Auth, limitado a
  `PANEL_ALLOWED_EMAILS`. Privacidad con RLS en todas las tablas.
- Todo se calcula en el servidor (agenda, recordatorios, totales). El cliente
  solo lleva los diálogos, la búsqueda, el «+» y las casillas.

**Motivo.** Reutilizar el stack, los tokens y los componentes existentes. Un
segundo proyecto con su propio despliegue habría duplicado el sistema de
diseño y la configuración.

**Coste de revertir.** Medio: el panel no toca nada de la web pública salvo el
grupo de rutas y `robots.ts`. Borrar `app/panel`, `components/panel`,
`lib/life`, `lib/supabase` y `proxy.ts` lo elimina.

Detalle en `docs/LIFE_CRM.md`.

---

## D-021 · El panel tiene modo oscuro y un color de aviso

**Contexto.** La paleta es papel, tinta y un acento, sin modo oscuro. El panel
se usa a diario, también de noche, y necesita distinguir «vence pronto» de
«ya ha vencido».

**Decisión.**

- Modo oscuro solo en el panel: los tokens semánticos se redefinen bajo
  `[data-theme="dark"]` y, con `data-theme="system"`, bajo
  `prefers-color-scheme: dark`. El tema se guarda en el perfil y se aplica en el
  servidor, sin parpadeo. En oscuro el acento pasa al verde menta claro: el pino
  no se lee sobre fondo oscuro.
- Un color nuevo, `caution` (ámbar apagado), solo para «pronto». `critical`
  sigue siendo «ya». Nunca solo color: siempre va con texto o icono.
- Lienzo agrupado al estilo Apple: `canvas` de fondo, tarjetas `surface` sin
  bordes, `fill` para controles. Dos tamaños de texto propios, `title` y
  `stat`, en ancho normal: el panel se lee, no se presenta.

**La web pública no cambia.** Sigue sin modo oscuro y sin `caution`.

---

## D-022 · Las finanzas distinguen lo que pasó de lo que se prevé, y lo que no se sabe

**Contexto.** El panel guardaba suscripciones con un importe y una fecha
obligatorios. Los datos reales no son así: hay importes aproximados, fechas
solo comunicadas, cobros por consumo sin periodicidad, cargos sin identificar,
cuotas pagadas con retraso, el mismo pago visto en PayPal y en el banco, y
facturas comunicadas que no se sabe si se pagaron.

**Decisión.**

- Cuatro conceptos nuevos: `accounts` (dónde se cobra), `charges` (lo que pasó
  de verdad, con su estado), `subscription_prices` (el histórico de precios) y
  campos de confianza en cada importe y cada fecha.
- Un importe o una fecha que no se saben son `null`, y la base de datos obliga
  a que su confianza sea `unknown`. **Nunca 0 €.** Los totales suman lo que
  pueden y declaran cuántos datos han dejado fuera.
- Las previsiones se calculan, no se guardan. Una previsión pasada sin cargo
  que la respalde es «pendiente de comprobar», no un impago.
- Solo un cargo `paid` es dinero gastado. Autorizaciones, intentos rechazados y
  pagos espejo se guardan y no suman.
- `import_life_data()` importa lotes de forma idempotente: rellena huecos,
  nunca sobrescribe y convierte cada contradicción en una tarea de revisión.

**Motivo.** La regla 3.4 del proyecto («prohibido inventar cifras») aplicada a
los datos propios: una estimación presentada como un dato cierto es el mismo
error que una métrica inventada en la web.

**Coste de revertir.** Alto en datos, bajo en código: las tablas nuevas no
tocan la web pública.

---

## D-023 · Socios, colores, tablero y un asistente dentro del panel

**Contexto.** El panel ya contaba bien el dinero, pero faltaban cuatro cosas
que el día a día pedía: proyectos con socios y gastos a medias, una pantalla de
inicio que se lea de un vistazo, un sitio donde arrastrar tareas y una forma de
apuntar cosas hablando.

**Decisión.**

- **Socios**: `partners`, `project_partners` y `charge_shares`. Quién pagó y a
  quién le toca son dos datos distintos; el saldo sale de restarlos. Sin
  porcentaje acordado no se reparte: se avisa.
- **Colores**: ocho tokens `--color-tag-*`, un color por proyecto y un color por
  tipo de cosa en el calendario. Nunca solos: el nombre va siempre al lado.
- **Inicio**: seis cifras pequeñas en una línea y, debajo, una barra fina por
  día con la semana entera. Ocupa la mitad y cuenta el doble.
- **Tablero**: cuatro columnas por estado, se arrastra con el ratón y se mueve
  con un desplegable en el móvil o con el teclado. El orden es un número
  (`tasks.position`): mover una tarjeta escribe una fila.
- **IA**: un chat que recibe un resumen escrito del panel y puede crear tarea,
  evento o nota. Sin clave de API lo dice y no finge. Nada se guarda de la
  conversación.
- **Vault pasa a llamarse Documentos**, que es lo que es.

**Motivo.** Todo esto lo pidió el dueño del panel después de usarlo unos días.

**Coste de revertir.** Bajo salvo en socios, que añade datos.

---

## D-024 · Desplegables propios y diálogos que no recargan la pantalla

**Contexto.** El panel usaba `<select>` nativos, que en macOS los pinta el
sistema y no se parecen en nada al resto de la aplicación. Y abrir un editor
era un cambio de URL que pasaba por el router: Next volvía a pedir la pantalla
entera al servidor antes de que apareciera nada, así que un toque tardaba casi
un segundo en contestar.

**Decisión.**

- **`components/panel/Select`**: un botón más una lista (`role="listbox"`) con
  teclado completo, búsqueda por letras y un `input` oculto que lleva el valor
  en el formulario. Se pinta con los tokens, así que es igual en toda máquina.
  La lista se monta dentro del `<dialog>` cuando está en uno, porque la capa
  superior tapa cualquier cosa puesta en el `body`.
- **Campos que dependen de otro**: `FieldDef.showIf`. La frecuencia
  personalizada pide los días ahí mismo y solo ella; repetir un evento solo
  pregunta cada cuánto cuando repite.
- **Abrir un editor no es cambiar de página**: los enlaces que solo añaden
  `?nuevo=` o `?editar=` se interceptan y se empujan con `history.pushState`.
  El diálogo aparece en unos 80 ms y la flecha de atrás lo sigue cerrando.
- **Navegar**: `staleTimes` en la configuración (30 s), el menú precarga cada
  pantalla y un `loading.tsx` enseña la forma de lo que viene.
- **Las funciones se despliegan en París** (`cdg1`), donde está la base: antes
  cada consulta cruzaba el Atlántico.

**Motivo.** El panel se usa a diario. Lo que se abre decenas de veces al día
tiene que contestar al instante, y un control del sistema operativo rompe la
ilusión de aplicación propia.

**Coste de revertir.** Bajo: el `Select` es un componente y la interceptación
de clics, un efecto en `PanelDialogs`.

---

## D-025 · De «automatizamos procesos» a «descubrimos potencial»

**Contexto.** La web vendía bien una cosa concreta —quitar trabajo manual—
pero dejaba fuera la mitad de lo que esta empresa puede hacer por un cliente:
contestar antes una petición, recuperar presupuestos parados, saber qué
servicio deja margen, pedir reseñas a quien se va contento. Un empresario que
no se identifica con «tengo tareas repetitivas» se iba sin ver nada para él.

**Decisión.** El posicionamiento pasa a ser detectar el potencial de un
negocio y convertirlo en crecimiento, rentabilidad y mejor servicio. La
tecnología queda donde corresponde: dentro, como una palanca más.

- **Tres áreas** (`content/areas.ts`): crecimiento comercial, experiencia del
  cliente, eficiencia y rentabilidad. Cada una con su página.
- **Siete sectores** (`content/sectors.ts`), escritos con el vocabulario de
  cada oficio —escandallo, descuadre, liquidación, comisión de la OTA— porque
  así se describe el problema cuando lo cuenta quien lo tiene.
- **Ocho señales** en la home: situación, qué cuesta, qué oportunidad hay y
  qué se hace. Ninguna lleva un porcentaje: lo que se afirma es el mecanismo.
- **Método VCO** (`/metodo-vco`, antes `/metodo`): descubrir, detectar,
  priorizar, transformar, medir. Sin el símbolo ®, que exige un registro que
  no existe. La ruta antigua redirige con 308.
- **Calculadora de escenarios** (`lib/impact.ts` + `ImpactCalculator`): seis
  cuentas sobre los números del visitante, con la aritmética a la vista y
  separando siempre facturación, ahorro, beneficio y retorno. La lógica vive
  aparte de la interfaz y está cubierta por pruebas porque es lo único de la
  web que podría estar mal sin que se note.
- El CTA dominante pasa a ser `/diagnostico`.

**Motivo.** Lo pidió el dueño, y coincide con lo que dice el mercado: nadie
busca «transformación digital», pero sí «no doy abasto con las llamadas» o
«cuánto me cuesta una tarea manual al año».

**Coste de revertir.** Bajo en código, alto en SEO: las rutas nuevas ya están
en el sitemap.

---

## D-026 · Las solicitudes de diagnóstico se guardan en la base

**Contexto.** El formulario de contacto dependía de un webhook que nunca se
configuró, así que en producción devolvía 503 honesto pero inútil. Y la web
pública no tocaba la base de datos a propósito (ver D-020).

**Decisión.** Hay una excepción, y es de escritura: la tabla `leads`.

- `POST /api/diagnostico` valida con el mismo esquema que el navegador,
  descarta por tamaño, por señuelo y por límite de IP, y escribe la solicitud.
- RLS: insertar puede cualquiera, leer y modificar solo quien esté en
  `panel_owners`. Comprobado con la clave publicable: `select` devuelve cero
  filas y un `update` anónimo no toca nada.
- La web pública sigue sin **leer** nada de la base.
- Si además hay `CONTACT_WEBHOOK_URL`, se avisa por ahí; que el aviso falle no
  pierde la solicitud. Si no hay dónde guardarla, 503 y el correo a la vista:
  nunca un «enviado» falso.
- Las solicitudes se ven y se marcan como atendidas en `/panel/inbox`.

**Motivo.** Un formulario que no entrega el contacto es peor que no tener
formulario, y la infraestructura para guardarlo ya estaba pagada.

**Coste de revertir.** Medio: habría que llevarse los contactos antes de
quitar la tabla.

