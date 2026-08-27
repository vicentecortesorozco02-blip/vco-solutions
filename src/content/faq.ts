import type { FaqItem } from "./types";

/**
 * Home / general FAQ.
 *
 * These are the objections that actually stop a decision: price, disruption,
 * size, dependence, and whether this is just AI hype. Answering them plainly
 * does more for conversion than another benefits grid.
 */
export const generalFaq: FaqItem[] = [
  {
    id: "empresa-pequena",
    question: "¿Esto es para empresas como la mía?",
    answer:
      "Si en tu empresa alguien dedica varias horas a la semana a tareas repetitivas, sí. El tamaño importa menos de lo que parece: el cálculo es el mismo para una empresa de seis personas que para una de doscientas, solo cambia el número de horas que hay en juego. En la primera conversación se ve enseguida si hay recorrido o no.",
  },
  {
    id: "precio",
    question: "¿Cuánto cuesta?",
    answer:
      "Depende del proceso, y no vamos a publicar una tarifa que después no se cumpla. Lo que sí hacemos es cuantificar antes de construir: cuántas horas consume hoy ese proceso y cuánto cuesta al año. Con ese número delante, decidir si la inversión tiene sentido es sencillo, y a veces la conclusión honesta es que todavía no.",
  },
  {
    id: "cambiar-herramientas",
    question: "¿Tenemos que cambiar de programas?",
    answer:
      "No. Trabajamos sobre las herramientas que ya usáis: vuestro ERP, vuestro correo, vuestras hojas de cálculo. Cambiar de herramienta es una decisión de negocio con su propio coste, y solo la proponemos cuando mantener la actual sale más caro que sustituirla. En ese caso, con los números al lado.",
  },
  {
    id: "tiempo",
    question: "¿Cuánto se tarda?",
    answer:
      "El mapa y la cuantificación de un proceso son cuestión de días. La construcción depende del alcance, pero el objetivo siempre es tener algo funcionando en semanas y no en trimestres. Preferimos entregar un proceso completo y medido antes que empezar cinco a la vez.",
  },
  {
    id: "despidos",
    question: "¿Esto significa prescindir de gente?",
    answer:
      "En la práctica, casi nunca. Lo que suele pasar es que el equipo deja de dedicar la mañana a tareas administrativas y la dedica a clientes, a calidad o a lo que estaba postergado. Es el mismo equipo con más capacidad. Si tu objetivo es otro, es una conversación legítima, pero no es lo que nosotros vendemos.",
  },
  {
    id: "ia",
    question: "¿Todo esto es inteligencia artificial?",
    answer:
      "Parte sí y parte no. La IA es muy útil cuando hay que leer, interpretar o clasificar texto y documentos. Para el resto, una integración bien hecha y unas reglas claras suelen ser más baratas, más rápidas y más fiables. Usamos lo que resuelve el problema, no lo que suena mejor.",
  },
  {
    id: "dependencia",
    question: "¿Nos quedamos atados a vosotros?",
    answer:
      "No. El código, los datos y la documentación son tuyos. Se entrega documentado y con formación al equipo. El mantenimiento se acuerda por escrito y es una opción, no una condición para que lo que hemos construido siga funcionando.",
  },
  {
    id: "primer-paso",
    question: "¿Cuál es el primer paso?",
    answer:
      "Contarnos qué proceso te está consumiendo tiempo. Con una descripción en dos líneas ya podemos decirte si es un caso claro, si conviene medirlo antes, o si sinceramente no merece la pena tocarlo.",
  },
];
