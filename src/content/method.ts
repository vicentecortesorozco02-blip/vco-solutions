import type { MethodPhase } from "./types";

/**
 * El Método VCO.
 *
 * Cinco fases, cada una con un verbo y con algo que el cliente puede señalar
 * al final. No lleva ®: la marca no está registrada todavía, y poner el
 * símbolo sin el registro es exactamente el tipo de afirmación sin respaldo
 * que este sitio no hace.
 */

export const methodName = "Método VCO";

export const methodPromise =
  "Primero entendemos tu negocio. Después te enseñamos dónde hay oportunidades, por cuál conviene empezar y qué cambia cuando se aplica.";

/** Lo que el método no es. Se usa en la página del método. */
export const methodBoundaries = [
  "No empezamos proponiendo software. Empezamos preguntando cómo entra un cliente, qué pasa después y dónde se queda parado.",
  "No todas las mejoras son tecnológicas. Cambiar una frase del presupuesto, el orden de una llamada o quién responde primero puede rendir más que una aplicación.",
  "No vendemos transformaciones de doce meses. Una oportunidad concreta, aplicada y medida, y después se decide la siguiente.",
];

export const methodPhases: MethodPhase[] = [
  {
    number: "01",
    title: "Descubrir",
    summary:
      "Entendemos la empresa por dentro: cómo entran los clientes, cómo se vende, cómo se entrega y en qué se va el tiempo y el dinero.",
    deliverable: "Un retrato de cómo funciona hoy tu negocio, con sus números delante.",
    detail: [
      "Hablamos con quien hace el trabajo, no solo con quien lo dirige.",
      "Seguimos el recorrido real de un cliente, desde que pregunta hasta que paga y vuelve.",
      "Miramos ingresos, costes, volúmenes y plazos: lo que ya tienes, sin pedirte informes nuevos.",
    ],
  },
  {
    number: "02",
    title: "Detectar",
    summary:
      "Buscamos lo que se está escapando: oportunidades sin aprovechar, fricciones, trabajo repetido y dinero que se pierde por el camino.",
    deliverable: "La lista de oportunidades, cada una con dónde ocurre y qué está costando.",
    detail: [
      "Preguntas sin contestar, presupuestos sin seguimiento, clientes que no vuelven, servicios rentables que nadie promociona.",
      "Cada hallazgo se escribe con lo que se puede comprobar: cuántas veces pasa, cuánto tarda, cuánto vale.",
      "Lo que no se puede medir todavía se marca como hipótesis, no como hecho.",
    ],
  },
  {
    number: "03",
    title: "Priorizar",
    summary:
      "Ordenamos las mejoras por lo que pueden rendir, lo que cuesta aplicarlas y lo rápido que se notan.",
    deliverable: "Un orden de trabajo acordado: por dónde empezar y qué puede esperar.",
    detail: [
      "Cada oportunidad lleva impacto estimado, esfuerzo, inversión y plazo. Las cuatro cosas, no solo la primera.",
      "Las hipótesis de impacto se enseñan con el cálculo a la vista, para que puedas discutirlas.",
      "Arriba suele quedar lo pequeño y rápido, no lo espectacular.",
    ],
  },
  {
    number: "04",
    title: "Transformar",
    summary:
      "Aplicamos los cambios: comerciales, de atención, de proceso, de organización o de tecnología, según lo que haga falta.",
    deliverable: "La mejora funcionando, con tu equipo sabiendo usarla.",
    detail: [
      "Entregas parciales desde el principio: se ve funcionando antes de estar terminado.",
      "Nos conectamos a las herramientas que ya tienes. Cambiarlas es una decisión tuya, no un requisito nuestro.",
      "Si la mejor solución no necesita software, se aplica igual y se dice.",
    ],
  },
  {
    number: "05",
    title: "Medir",
    summary:
      "Comparamos con el punto de partida los mismos indicadores, y decidimos la siguiente mejora con lo aprendido.",
    deliverable: "El antes y el después, y la siguiente oportunidad priorizada.",
    detail: [
      "Medimos lo mismo que se midió en la fase 02, porque si cambia la vara la comparación no vale.",
      "Ajustamos con el uso real, que siempre descubre casos que nadie contó.",
      "Si un cambio no mejora los números, se dice y se corrige.",
    ],
  },
];

/** Los cuatro compromisos. Se usan en la home, en /metodo-vco y en /empresa. */
export const principles = [
  {
    title: "Primero el negocio, después la tecnología",
    body: "Lo que se compra es crecimiento, tiempo o margen. El software, las integraciones y la IA son medios, y solo entran cuando son el medio más barato de conseguirlo.",
  },
  {
    title: "Pequeños cambios, grandes resultados",
    body: "Una frase en un presupuesto, una llamada que antes no se hacía o un formulario más corto pueden mover más dinero que un desarrollo entero. Empezamos por ahí.",
  },
  {
    title: "Una oportunidad cada vez",
    body: "Nada de planes de doce meses. Se elige la mejora con mejor relación impacto-esfuerzo, se aplica, se mide y después se decide la siguiente con datos.",
  },
  {
    title: "Enseñamos los cálculos",
    body: "Cada estimación va con sus hipótesis a la vista y etiquetada como lo que es. Sin porcentajes redondos, sin resultados de clientes que no existen.",
  },
];
