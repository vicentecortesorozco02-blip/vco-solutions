import type { MethodPhase } from "./types";

/**
 * The method.
 *
 * This is commercial identity, not decoration. Five phases, each named with a
 * first-person verb, each with a deliverable the client can point at. Phase 01
 * produces the Mapa de tiempo, the artefact this company is known for.
 */

export const methodName = "Mapa de tiempo";

export const methodPromise =
  "Empezamos por entender cómo trabajáis. Un proceso cada vez, con números delante.";

export const methodPhases: MethodPhase[] = [
  {
    number: "01",
    title: "Mapeamos",
    summary:
      "Nos enseñas cómo trabajáis hoy. Sin preparar nada, sin maquillar el proceso.",
    deliverable: "Un mapa de tu proceso, paso a paso, con quién hace qué.",
    detail: [
      "Sesiones cortas con las personas que hacen el trabajo, no solo con quien lo dirige.",
      "Seguimos el recorrido real de la información: de dónde sale, por cuántas manos pasa y dónde se para.",
      "Anotamos las excepciones, que casi siempre son la mitad del problema.",
    ],
  },
  {
    number: "02",
    title: "Cuantificamos",
    summary:
      "Ponemos números encima de la mesa: cuántas veces, cuántos minutos, cuántos errores.",
    deliverable:
      "El coste real del proceso en horas y en euros, y qué parte es automatizable.",
    detail: [
      "Medimos la frecuencia y la duración real de cada paso, no la estimada.",
      "Separamos lo que un sistema puede hacer de lo que exige criterio humano.",
      "Priorizamos por retorno: qué proceso conviene atacar primero y cuál puede esperar.",
    ],
  },
  {
    number: "03",
    title: "Rediseñamos",
    summary:
      "Diseñamos el proceso nuevo antes de escribir una línea de código.",
    deliverable: "El proceso objetivo, con los puntos de control acordados.",
    detail: [
      "Definimos qué desaparece, qué se automatiza y qué sigue pasando por una persona.",
      "Acordamos qué ocurre cuando algo falla, porque algo siempre falla.",
      "Si la mejor solución es cambiar cómo trabajáis y no construir software, lo decimos aquí.",
    ],
  },
  {
    number: "04",
    title: "Construimos",
    summary:
      "Lo montamos e integramos con las herramientas que ya usáis. En semanas, no en trimestres.",
    deliverable: "El sistema funcionando en producción, con tu equipo formado.",
    detail: [
      "Entregas parciales desde el principio: se ve funcionando antes de estar terminado.",
      "Nos conectamos a lo que ya existe. Cambiar de herramientas es una decisión tuya, no un requisito nuestro.",
      "Formación al equipo con su proceso real, no con una demo.",
    ],
  },
  {
    number: "05",
    title: "Comprobamos",
    summary:
      "Comparamos con el punto de partida. Si los números no mejoran, no está terminado.",
    deliverable: "La medición del antes y el después, y el siguiente proceso priorizado.",
    detail: [
      "Medimos lo mismo que medimos en la fase 02, para que la comparación signifique algo.",
      "Ajustamos con el uso real, que siempre descubre casos que nadie contó.",
      "Decidimos juntos cuál es el siguiente proceso que merece la pena.",
    ],
  },
];

/** The four commitments that differentiate us. Used on the home and /empresa. */
export const principles = [
  {
    title: "Vendemos tiempo, no tecnología",
    body: "El software, las integraciones y la IA son el medio. Lo que se compra es trabajo manual que desaparece. Si un proceso se arregla sin construir nada, esa es la propuesta.",
  },
  {
    title: "Empezamos por un proceso, no por un proyecto",
    body: "Nada de transformaciones de doce meses. Un proceso concreto, medido y funcionando. Después se decide el siguiente con datos, no con una presentación.",
  },
  {
    title: "Nos adaptamos a tus herramientas",
    body: "Trabajamos sobre el ERP, el correo y los programas que ya tenéis. Cambiar de herramienta es una decisión de negocio, no un atajo para el proveedor.",
  },
  {
    title: "Enseñamos los números",
    body: "El coste del proceso antes, el coste después y cómo se ha calculado. Sin porcentajes redondos ni promesas que no se pueden comprobar.",
  },
];
