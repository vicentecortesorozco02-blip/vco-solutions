/**
 * Company page content.
 *
 * Written for a company that has just started. It does not invent a team, a
 * history or a client list. What it can offer instead is a clear position and
 * a transparent commercial structure, which is what a cautious buyer is
 * actually looking for on this page.
 */

export const companyStory = {
  eyebrow: "Empresa",
  title: "Una empresa de ingeniería de procesos, no una agencia de IA",
  lead: "Hay mucha tecnología disponible y muy poca gente dedicada a mirar de cerca cómo trabaja una empresa antes de aplicarla. Ese hueco es el motivo de que exista este proyecto.",
  paragraphs: [
    "En casi todas las empresas hay una parte del trabajo que no produce nada y que nadie ha decidido conscientemente hacer: leer un correo para reenviarlo, copiar un dato de un PDF a un programa, montar un documento partiendo del último parecido. Nadie lo cuenta porque cada tarea dura pocos minutos. Sumadas, son personas a jornada completa.",
    "Nuestro trabajo consiste en mirar esos procesos con la persona que los ejecuta, medir lo que cuestan y construir el sistema que los reduce o los elimina. La tecnología concreta que usemos es una consecuencia del problema, no el punto de partida.",
    "Somos una empresa nueva, y lo decimos abiertamente. Todavía no hay una lista de clientes que enseñar y no vamos a inventarla. Lo que sí hay es un método claro, criterio técnico y una forma de trabajar en la que los números están siempre encima de la mesa.",
  ],
};

export const engagementStages = [
  {
    number: "01",
    title: "Análisis",
    body: "Mapear y cuantificar el proceso. Termina con un documento que es tuyo tanto si seguimos adelante como si no.",
    note: "Días, no semanas.",
  },
  {
    number: "02",
    title: "Implementación",
    body: "Diseño y construcción del sistema, integrado con las herramientas que ya tenéis, y formación al equipo que lo va a usar.",
    note: "Alcance cerrado por escrito antes de empezar.",
  },
  {
    number: "03",
    title: "Mantenimiento",
    body: "Que lo construido siga funcionando cuando cambia una tarifa, un formato o un proveedor. Opcional y por escrito.",
    note: "Nunca es condición para que el sistema siga siendo tuyo.",
  },
  {
    number: "04",
    title: "Evolución",
    body: "El siguiente proceso, priorizado con los datos del anterior en lugar de con una hoja de ruta escrita hace un año.",
    note: "Se decide cuando toca, no al firmar.",
  },
];

export const fitCriteria = {
  good: {
    title: "Encajamos bien si",
    items: [
      "Hay al menos una tarea repetitiva que consume varias horas a la semana.",
      "Alguien de dentro puede dedicarnos un par de sesiones para enseñarnos cómo trabajáis.",
      "Os interesa entender el porqué de lo que se construye, no solo recibirlo.",
      "Preferís empezar por un proceso concreto antes que por un plan de transformación.",
    ],
  },
  bad: {
    title: "Probablemente no somos lo que buscas si",
    items: [
      "Necesitas a alguien que ejecute una solución ya decidida sin discutirla.",
      "Buscas el precio más bajo por hora de desarrollo.",
      "El objetivo es poder decir que la empresa usa inteligencia artificial.",
      "Hace falta una respuesta cerrada esta semana sin haber mirado el proceso.",
    ],
  },
};
