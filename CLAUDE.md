# Instrucciones para agentes

Este archivo es obligatorio. Léelo entero antes de tocar nada.

Si al terminar una tarea has infringido cualquier regla de aquí, la tarea no
está terminada.

---

## 1. Antes de modificar

1. Lee este archivo.
2. Lee `docs/DESIGN_SYSTEM.md` si vas a tocar cualquier cosa visual.
3. Lee `docs/ARCHITECTURE.md` si vas a añadir rutas, dependencias o capas.
4. Lee `docs/CONTENT.md` si vas a escribir o cambiar textos.
5. Busca si el patrón que necesitas ya existe. Casi siempre existe.

No empieces a escribir componentes sin haber mirado los que hay.

---

## 2. Qué es este proyecto

Web corporativa de una empresa que **vende tiempo**, no tecnología.

La propuesta es: entramos en una empresa, entendemos cómo trabaja, medimos qué
procesos consumen horas innecesarias y construimos sistemas que eliminan ese
trabajo. Software a medida, integraciones, automatizaciones e IA son medios.

Consecuencias que afectan a cada línea de código y de copy:

- El beneficio va primero, la tecnología después, y solo si aporta.
- Nada de jerga vacía: "potenciamos", "revolucionamos", "soluciones 360".
- Nada de estética de IA: robots, cerebros, circuitos, partículas, degradados
  morados, glassmorphism.
- Un empresario sin conocimientos técnicos tiene que entenderlo todo.

---

## 3. Reglas que no se negocian

### 3.1 Marca

- **Nunca** escribas el nombre de la empresa en un componente, un texto, un
  metadato o un documento. Importa desde `src/config/brand.ts`.
- El nombre actual es el marcador `[BRAND]` y es intencionado.
- Las rutas se declaran en `src/config/site.ts`. No escribas rutas a mano.

### 3.2 Design tokens

- **Ningún color, tamaño, radio, sombra o duración hardcodeado en componentes.**
  Todo sale de `src/app/globals.css`.
- Si necesitas un valor nuevo, añádelo como token con un nombre semántico y
  documéntalo en `docs/DESIGN_SYSTEM.md`. No lo metas suelto en una clase.
- Si añades una clave al espacio `--text-*`, añádela también a la lista de
  `font-size` en `src/lib/cn.ts`. Si no, `tailwind-merge` la confundirá con un
  color y la borrará en silencio. Ya pasó una vez: todos los `h2` del sitio se
  renderizaban a 16 px. Hay un test que lo protege.

### 3.3 No inventes patrones

Antes de crear un componente nuevo, comprueba que no exista:

| Necesitas                | Usa                                              |
| ------------------------ | ------------------------------------------------ |
| Un ancho de página       | `components/ui/Container`                        |
| Una sección con ritmo    | `components/ui/Section`                          |
| Un encabezado de sección | `components/ui/SectionHeader`                    |
| Un botón o CTA           | `components/ui/Button`                           |
| Una animación de entrada | `components/ui/Reveal`                           |
| Preguntas frecuentes     | `components/ui/Faq`                              |
| Una cifra                | `components/ui/Metric`                           |
| Un antes/después         | `components/diagrams/ProcessFlow`                |
| La cadena comprimida     | `components/diagrams/ProcessRibbon`              |
| La cabecera de una página interna | `components/layout/PageHero`            |

### 3.4 Cifras y credibilidad

Esta es la regla más importante del proyecto.

- **Prohibido inventar** clientes, logos, testimonios, horas ahorradas,
  porcentajes, facturación o número de proyectos.
- Toda métrica declara su procedencia en el tipo `Metric`:
  - `measured` exige `source` (cómo se midió). Hay un test que lo comprueba.
  - `illustrative` es aritmética o un ejemplo, y la interfaz lo etiqueta.
- Los casos son `demonstration` mientras no haya proyectos entregados con
  permiso del cliente. Se muestran con el distintivo correspondiente y con el
  cálculo a la vista (`workings`).
- Antes que rellenar un hueco con una cifra falsa, deja el hueco o cambia el
  diseño.

### 3.5 Un CTA dominante

- La acción principal de todo el sitio es `primaryCta` en `brand.ts`.
- Una sección tiene como mucho una acción. Nunca dos botones primarios juntos.
- Prohibido "Contactar", "Más información", "Enviar" como CTA principal: el
  texto tiene que expresar intención.

### 3.6 Accesibilidad

- WCAG 2.2 AA como mínimo.
- Cada página tiene exactamente un `h1`. Hay un test e2e que lo verifica.
- Nunca elimines el `:focus-visible` sin poner algo mejor en su lugar.
- Objetivos táctiles: 44 px para acciones principales, 32 px para controles
  sueltos. Los enlaces dentro de un párrafo están exentos.
- El color nunca es el único portador de significado.
- Respeta `prefers-reduced-motion`. Ya está resuelto globalmente: no lo rompas
  con animaciones en JS que ignoren la preferencia.

### 3.7 Rendimiento

- Server Components por defecto. `"use client"` solo cuando haga falta estado,
  efectos o eventos, y en el componente más pequeño posible.
- Nada por encima del pliegue puede depender de JavaScript para aparecer. El
  hero no lleva animación de entrada por este motivo.
- No añadas una librería de animación para un `translateY` de 12 px.

---

## 4. Responsive

No diseñamos "escritorio encogido". Los anchos que importan:

| Contexto     | Anchos                          | Qué comprobar                                  |
| ------------ | ------------------------------- | ---------------------------------------------- |
| Móvil        | 360, 390, 430                   | Nada se desborda, CTA alcanzable con el pulgar  |
| Tablet       | 768, 1024                       | Las rejillas de 3 pasan a 2, no a 1             |
| Portátil 16" | 1366, 1440, 1536                | **El caso crítico.** No puede parecer una 27" mal escalada |
| Escritorio   | 1728, 1920, 2560                | El contenido no se estira: se centra a 1240 px  |

La escala tipográfica alcanza su techo alrededor de 1536 px. Por encima crece
el aire, no la letra.

Comprobación obligatoria en cualquier cambio visual: 390, 768, 1366 y 1920.

---

## 5. Comprobaciones obligatorias

Antes de dar por terminado cualquier cambio:

```bash
npm run lint
npm run typecheck
npm test
npm run build
npm run test:e2e     # requiere un build reciente
```

O en una sola orden: `npm run verify && npm run test:e2e`.

Además, para cambios visuales:

6. Abre la página de verdad en el navegador. Que compile no significa que esté
   bien.
7. Haz scroll entero buscando: saltos, huecos absurdos, textos que se salen,
   componentes aplastados, CTA poco visible, desbordes horizontales.
8. Repite a 390 px y a 1366 px.

---

## 6. Qué NO hacer

- No instales dependencias por comodidad. Cada una se justifica en
  `docs/DECISIONS.md`. Hoy son cinco en producción y hay un motivo escrito para
  cada una.
- No metas un CMS, una base de datos ni un sistema de tracking sin que se haya
  pedido explícitamente.
- No conviertas una sección en componente cliente para medir un clic: usa los
  atributos `data-analytics-*` y el listener delegado que ya existe.
- No añadas colores nuevos. La paleta es papel, tinta y un acento.
- No uses emojis como iconografía.
- No pongas tarjetas dentro de tarjetas.
- No añadas una sección que no responda a una pregunta concreta.
- No dejes texto en gris claro diminuto por estética.
- No dupliques bloques de contenido entre páginas: extrae y reutiliza.
- No escribas números en la web que no puedas defender delante de un cliente.

---

## 7. Al cambiar la arquitectura

Si añades una ruta, una capa, una dependencia o cambias un patrón:

1. Actualiza `docs/ARCHITECTURE.md`.
2. Anota la decisión y el motivo en `docs/DECISIONS.md`.
3. Si afecta a lo visual, actualiza `docs/DESIGN_SYSTEM.md`.
4. Si afecta a la navegación, actualiza `src/config/site.ts`, no los
   componentes.

Documentación desactualizada es peor que no tener documentación.
