# Roadmap

> El estado descrito en "V1 — hecho" está congelado en la etiqueta
> `baseline-v1`. Ver [`BASELINE.md`](BASELINE.md) para volver a ese punto.

## V1 — hecho

Base completa y desplegable.

- Sistema de diseño con tokens y punto único de cambio de marca
- Home con narrativa de ocho secciones numeradas
- Soluciones: índice y seis páginas de detalle, generadas desde contenido
- Casos: índice y tres demostraciones con la aritmética a la vista
- Método (cinco fases), Empresa, Diagnóstico, Contacto
- Páginas legales estructuradas, pendientes de revisión jurídica
- Formulario con validación doble, rate limit y honeypot
- SEO: metadatos, canónicas, sitemap, robots, OpenGraph, datos estructurados
- Accesibilidad AA, `prefers-reduced-motion`, navegación por teclado
- 42 tests unitarios y 71 pruebas e2e en tres perfiles de dispositivo
- Documentación: sistema de diseño, arquitectura, contenido, decisiones

---

## Antes de publicar en el dominio real

Bloqueantes. Ninguno es de código.

1. **Naming y marca.** Decidir el nombre y aplicarlo. La infraestructura ya
   está preparada: la lista exacta de pasos está en
   [`BRAND.md`](BRAND.md), sección 15.
2. **Transporte del formulario.** Configurar `CONTACT_WEBHOOK_URL`. Sin esto el
   formulario devuelve 503 a propósito.
3. **Revisión legal.** Aviso legal, privacidad y cookies están estructurados
   pero llevan marcadores `[PENDIENTE]` y no los ha revisado un abogado.
4. **Logo.** Hoy es un marcador tipográfico en `components/brand/Logo.tsx`, con
   variantes ya previstas (lockup, wordmark, símbolo, compacta; tono claro y
   oscuro). Cuando exista el asset real, se activa desde `brand.ts`.
5. **Favicon.** No hay ninguno. Se eliminó el que trae el andamiaje de Next
   porque es el logotipo de Next.js y no podemos publicarlo como identidad
   propia. Se añadirá con el branding, como `src/app/icon.svg`.
6. **Imagen social.** Se genera desde `brand.ts`; conviene revisarla una vez
   haya nombre.
7. **Sustituir todos los `[PENDIENTE]`.** Están en `brand.ts` (NIF) y en las
   páginas legales. Son visibles a propósito: no los borres sin el dato real.

---

## Siguiente ola

Por orden de retorno esperado.

### Casos reales

Lo que más va a mover la aguja. En cuanto haya un proyecto entregado con
permiso del cliente:

- `kind: "project"`, sector concreto, cifras `measured` con su `source`.
- El aviso de "todavía no hay proyectos publicados" de `/casos` desaparece solo:
  está condicionado a `allCasesAreDemonstrations`.

### Diagnóstico completo

La calculadora actual es la semilla. Lo que falta:

- Sector, tipo de proceso, herramientas en uso, personas implicadas
- Rango estimado de qué parte es automatizable, por tipo de proceso
- Informe descargable con el cálculo y las hipótesis
- Captura de correo al final del flujo, opcional y sin bloquear el resultado

Es la pieza con más potencial de conversión del sitio y merece su propio
diseño, no un formulario largo.

### Analítica

El contrato ya existe (`lib/analytics.ts`). Falta elegir proveedor. Criterios:
sin cookies si es posible, para no tener que añadir banner. Si acaba llevando
cookies, hay que actualizar la política y el aviso en el mismo cambio.

### Contenido editorial

Artículos sobre procesos concretos: cómo se automatiza un presupuesto, qué
hacer con un ERP sin API, cuándo la IA no es la respuesta. Es la vía de SEO
orgánico más coherente con el posicionamiento. Requiere decidir CMS o MDX.

---

## Más adelante

- **Internacionalización.** Segmento `[locale]` y segundo juego de contenido.
  La estructura ya lo permite.
- **CMS.** Cuando escribir contenido deje de ser cosa de quien toca el código.
  Las interfaces de `content/types.ts` son el contrato a respetar.
- **Área de cliente.** Estado de los procesos automatizados, horas acumuladas
  ahorradas. Sería el producto, no la web.

---

## Fuera de alcance, a propósito

- Precios públicos, mientras no exista un encargo empaquetado (ver D-012)
- Blog por tener blog
- Chat en vivo
- Vídeo de fondo en el hero
- Modo oscuro. El sitio es papel. Un modo oscuro sería otro diseño, no una
  variante, y hoy no hay demanda que lo justifique.
