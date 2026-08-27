# Contenido y tono

## 1. Qué vendemos

Tiempo. No IA, no automatizaciones, no horas de desarrollo.

La frase que resume el negocio y que debería poder deducirse de cualquier
página:

> Entramos en una empresa, entendemos cómo trabaja, identificamos procesos que
> consumen tiempo innecesariamente y construimos sistemas que reducen o
> eliminan ese trabajo manual.

Cadena de valor que ordena todos los textos:

**menos trabajo manual → menos errores → más capacidad → mejor rendimiento**

---

## 2. A quién le hablamos

A la persona que decide: gerente, dueño, director de operaciones, responsable
de administración. Puede no tener ningún conocimiento técnico y aun así tiene
que entenderlo todo a la primera.

Esa persona no busca tecnología. Busca que se le quite un problema de encima.

---

## 3. Tono

**Somos:** claros, concretos, tranquilos, honestos hasta cuando no conviene.
Hablamos de tareas reales con las palabras que usa quien las hace.

**No somos:** entusiastas, visionarios, disruptivos, ni "partners estratégicos".

### Reglas de escritura

1. Una idea por sección. Si no cabe en una pregunta de cinco palabras, sobra.
2. La frase corta gana. El párrafo de tres líneas gana al de seis.
3. Sustantivos concretos: "factura", "correo", "presupuesto", "Excel". Nunca
   "flujos de trabajo optimizados".
4. Verbos en primera persona del plural: mapeamos, medimos, construimos.
5. Nada de negrita para dar énfasis dentro de un párrafo. Si algo es
   importante, va en su propia línea o en un titular.
6. Cero signos de exclamación.
7. Ninguna palabra que no sobreviva a la pregunta "¿esto qué significa
   exactamente?".

### Lista de prohibidas

potenciar · revolucionar · transformación digital · soluciones 360 · sinergia ·
disruptivo · líderes del sector · innovación de vanguardia · impulsar tu
negocio · desbloquear el potencial · IA de última generación

---

## 4. La regla de las cifras

**No inventamos nada.** Ni clientes, ni logos, ni testimonios, ni porcentajes,
ni horas ahorradas, ni proyectos entregados.

Mientras no haya resultados reales:

- Los casos son `demonstration` y llevan su distintivo visible.
- Toda cifra ilustrativa muestra su aritmética en el campo `workings`.
- La sección de métricas de la home no presume: hace una cuenta con los números
  que introduce el propio visitante. Es más persuasivo que un porcentaje
  inventado, y no puede ser falso.

Cuando haya proyectos reales:

- `kind: "project"`, con consentimiento explícito del cliente.
- Cada métrica pasa a `provenance: "measured"` y **exige** `source`: cómo se
  midió y contra qué línea de partida. Hay un test que lo comprueba.

Credibilidad por encima de rellenar huecos. Antes que una cifra falsa, un hueco
o un diseño distinto.

---

## 5. Narrativa de la home

Ocho secciones, cada una responde a una pregunta y solo a una:

| Nº | Sección   | Pregunta que responde                       |
| -- | --------- | ------------------------------------------- |
| —  | Hero      | ¿Qué me estáis diciendo?                     |
| 01 | Problema  | ¿Esto me pasa a mí?                          |
| 02 | La cuenta | ¿Cuánto me está costando?                    |
| 03 | Soluciones| ¿Qué me podéis quitar de encima?             |
| 04 | Método    | ¿Cómo trabajáis?                             |
| 05 | Caso      | ¿Cómo es esto de verdad?                     |
| 06 | Principios| ¿Por qué vosotros?                           |
| 07 | FAQ       | ¿Qué me impide dar el paso?                  |
| 08 | CTA       | ¿Qué hago ahora?                             |

El orden va de reconocimiento a coste, de coste a solución, de solución a
confianza y de confianza a acción. Cambiar el orden sin cambiar la copia rompe
el hilo.

---

## 6. Modelo de contenido

Todo en `src/content/`, tipado en `types.ts`.

| Archivo            | Contiene                                          |
| ------------------ | ------------------------------------------------- |
| `solutions.ts`     | Catálogo de soluciones, con su detalle completo    |
| `cases.ts`         | Casos y demostraciones                             |
| `method.ts`        | Las cinco fases y los cuatro compromisos           |
| `manual-tasks.ts`  | La lista de reconocimiento del problema            |
| `faq.ts`           | Preguntas generales                                |
| `company.ts`       | Página de empresa                                  |

### Añadir una solución

1. Añade un objeto a `solutions` en `src/content/solutions.ts`.
2. Rellena todos los campos obligatorios; TypeScript te dirá cuáles.
3. `published: true`.
4. Añádela a `footerNav` en `src/config/site.ts` si debe salir en el pie.
5. `npm test` comprueba que los enlaces relacionados existen.

No hace falta tocar ningún componente. La página de detalle, el índice, el
sitemap y los datos estructurados se generan solos.

### Añadir un caso

Igual, en `cases.ts`. Mientras sea `kind: "demonstration"`, `workings` es
obligatorio (hay un test).

---

## 7. Los CTA

La acción principal de todo el sitio es una sola, y vive en `brand.ts`:

> **Cuéntanos qué quieres automatizar**

Versión corta para la cabecera: *Cuéntanos tu proceso*.
Secundaria: *Ver cómo trabajamos*.

Prohibido como CTA principal: "Contactar", "Más información", "Enviar",
"Solicitar demo". Un CTA tiene que expresar intención, no mecánica.

En el formulario, el botón de envío dice *Enviar y que lo miremos*: describe lo
que va a pasar, no la acción del navegador.

---

## 8. El método

Cinco fases, todas verbos en primera persona del plural:

**01 Mapeamos · 02 Cuantificamos · 03 Rediseñamos · 04 Construimos ·
05 Comprobamos**

Cada fase declara un entregable concreto, porque un método sin entregables es
una presentación.

El entregable de la fase 01 se llama **Mapa de tiempo** y es el activo comercial
de la marca: un documento con el proceso del cliente dibujado paso a paso, con
tiempos reales. Es suyo tanto si sigue trabajando con nosotros como si no. Con
el tiempo puede convertirse en un primer encargo de pago por sí solo.

---

## 9. Precios

No se publican. No hay un producto cerrado y una tarifa inventada haría más
daño que bien.

Lo que sí se explica, en `/empresa`, es cómo se estructura un proyecto:
análisis, implementación, mantenimiento y evolución, y en qué momento se decide
cada cosa. Eso es lo que necesita saber alguien que está evaluando el riesgo.
