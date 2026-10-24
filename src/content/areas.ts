import type { Area, Signal } from "./types";

/**
 * Las tres áreas de trabajo y las señales que las delatan.
 *
 * Las áreas son la respuesta a «¿en qué me puedes ayudar?» sin hablar de
 * tecnología: vender más, tratar mejor al cliente y trabajar con menos
 * fricción. La tecnología aparece dentro, como una palanca más.
 */

export const areas: Area[] = [
  {
    slug: "crecimiento-comercial",
    number: "01",
    title: "Crecimiento comercial",
    shortTitle: "Crecimiento comercial",
    promise: "Aprovechar mejor las oportunidades que ya te llegan antes de pagar por más.",
    intro:
      "Casi ninguna empresa tiene un problema de visitas: tiene un problema de qué pasa después. Las preguntas que se quedan sin respuesta, los presupuestos que nadie recupera y los clientes antiguos a los que no se vuelve a llamar son ventas que ya estaban pagadas y se van sin hacer ruido.",
    problems: [
      {
        title: "Entran preguntas y no se contestan a tiempo",
        body: "El formulario, el WhatsApp y el teléfono llegan a sitios distintos y cada uno lo atiende quien puede. Quien pregunta un viernes por la tarde a veces no recibe respuesta hasta el lunes, y para entonces ya ha preguntado en otro sitio.",
      },
      {
        title: "Se envían presupuestos y ahí se acaba",
        body: "Se manda el PDF y se espera. Nadie sabe cuántos hay abiertos, cuáles llevan dos semanas sin respuesta ni cuántos se han perdido por silencio en vez de por precio.",
      },
      {
        title: "El cliente que ya compró no vuelve a saber de ti",
        body: "Lo más barato de vender es lo que ya está vendido una vez. Si no hay un momento acordado para volver a llamar, la segunda compra depende de que el cliente se acuerde.",
      },
      {
        title: "La web recibe visitas y convierte poco",
        body: "Páginas que explican la empresa en vez de resolver la duda del visitante, formularios largos, teléfonos escondidos y ninguna señal de qué pasa después de escribir.",
      },
    ],
    levers: [
      {
        title: "Un único sitio donde cae todo lo que entra",
        body: "Formulario, correo, teléfono y mensajería en una sola lista con dueño y plazo. Antes de automatizar nada, dejar de perder lo que llega.",
      },
      {
        title: "Seguimiento acordado, no improvisado",
        body: "Cuándo se llama, cuántas veces y qué se dice. Escrito, de modo que no dependa de la memoria de cada uno.",
      },
      {
        title: "Presupuestos que se puedan contestar",
        body: "Más cortos, con el precio claro, con una sola decisión que tomar y con una forma de decir que sí en un clic.",
      },
      {
        title: "Recuperación de oportunidades paradas",
        body: "Revisar lo que ya existe —presupuestos abiertos, clientes inactivos, preguntas antiguas— y darle una salida antes de gastar en captar más.",
      },
      {
        title: "Páginas pensadas para la duda que trae el visitante",
        body: "Lo que necesita saber, en el orden en que lo necesita, con la acción a mano. Medir qué pasa después, no solo cuánta gente entra.",
      },
    ],
    signals: [
      "Cuántas oportunidades entran y cuántas se contestan el mismo día",
      "Qué porcentaje de presupuestos enviados acaba en respuesta, sea sí o no",
      "Cuántos clientes vuelven a comprar y cada cuánto",
      "Cuántas visitas de la web acaban en una conversación",
    ],
    faq: [
      {
        id: "crecimiento-sin-mas-gasto",
        question: "¿Se puede vender más sin aumentar el gasto en publicidad?",
        answer:
          "En la mayoría de empresas que miramos, sí: hay oportunidades que ya se han pagado y se están perdiendo por falta de respuesta o de seguimiento. Primero se tapan esas fugas y después, si hace falta, se habla de captar más.",
      },
      {
        id: "crecimiento-crm",
        question: "¿Hace falta un CRM?",
        answer:
          "A veces basta con una lista compartida y un acuerdo de quién llama y cuándo. Un CRM ayuda cuando el volumen lo justifica; comprarlo antes de tener un proceso claro suele acabar en una base de datos vacía.",
      },
      {
        id: "crecimiento-plazo",
        question: "¿Cuándo se nota?",
        answer:
          "Los cambios de respuesta y seguimiento se notan en semanas porque actúan sobre oportunidades que ya existen. Lo que depende de captar clientes nuevos tarda más y se mide aparte.",
      },
    ],
    seo: {
      title: "Crecimiento comercial: convertir mejor lo que ya te llega",
      description:
        "Preguntas sin contestar, presupuestos sin seguimiento y clientes que no vuelven. Analizamos tu proceso comercial y aplicamos mejoras para convertir más con lo que ya te llega.",
    },
  },
  {
    slug: "experiencia-cliente",
    number: "02",
    title: "Experiencia del cliente",
    shortTitle: "Experiencia del cliente",
    promise: "Que cada contacto con tu empresa dé motivos para volver y para recomendarte.",
    intro:
      "La experiencia no es la sonrisa final: es el tiempo que tarda alguien en recibir respuesta, lo claro que está lo que va a pasar y lo poco que tiene que repetir su historia. Casi todo lo que molesta a un cliente es barato de arreglar cuando se ve escrito.",
    problems: [
      {
        title: "Nadie sabe en qué va lo suyo",
        body: "El cliente llama para preguntar por algo que ya había preguntado. Cada consulta de estado es trabajo que se podría haber evitado contándolo antes.",
      },
      {
        title: "La respuesta depende de quién atienda",
        body: "Dos personas del mismo equipo contestan cosas distintas a la misma pregunta. No es culpa suya: no hay acuerdo escrito de qué se responde.",
      },
      {
        title: "Las quejas se resuelven y no se aprenden",
        body: "Se apaga el fuego y se sigue. Sin un registro de qué falló y cuántas veces, el mismo problema vuelve cada mes con otro nombre.",
      },
      {
        title: "Los clientes contentos no dejan rastro",
        body: "Nadie les pide una reseña ni les pregunta qué tal, y la reputación pública acaba escrita solo por los que se enfadaron.",
      },
    ],
    levers: [
      {
        title: "Decir qué pasa después, siempre",
        body: "Un mensaje con el siguiente paso y el plazo quita la mitad de las llamadas de seguimiento y casi toda la ansiedad del cliente.",
      },
      {
        title: "Respuestas acordadas para lo que más se pregunta",
        body: "Las diez preguntas de siempre, contestadas una vez bien y disponibles para todo el equipo. Atender más rápido sin sonar a robot.",
      },
      {
        title: "Un registro de lo que falla",
        body: "Anotar la incidencia, su causa y cuántas veces pasa. Dos semanas de registro suelen señalar el problema que conviene arreglar.",
      },
      {
        title: "Pedir opinión en el momento adecuado",
        body: "Preguntar justo después de la buena experiencia, no tres semanas más tarde, y convertir eso en reseñas y en mejoras concretas.",
      },
      {
        title: "Menos pasos para el cliente",
        body: "Quitar datos que ya tienes, formularios que repiten, confirmaciones que no confirman nada. Cada paso que quitas es una queja menos.",
      },
    ],
    signals: [
      "Cuánto se tarda en dar la primera respuesta",
      "Cuántas consultas son solo para preguntar en qué va algo",
      "Cuántas incidencias se repiten por la misma causa",
      "Cuántas reseñas nuevas y con qué nota",
    ],
    faq: [
      {
        id: "experiencia-medir",
        question: "¿Cómo se mide la experiencia sin montar encuestas enormes?",
        answer:
          "Con cosas que ya existen: tiempo hasta la primera respuesta, número de consultas de estado, incidencias repetidas y reseñas. Si hace falta preguntar, una sola pregunta en el momento justo rinde más que un cuestionario.",
      },
      {
        id: "experiencia-bots",
        question: "¿Vais a poner un bot a contestar a mis clientes?",
        answer:
          "Solo si mejora la atención y queda claro que es automático. Lo habitual es al revés: automatizar los avisos de estado para que tu equipo tenga tiempo de atender de verdad lo que necesita a una persona.",
      },
    ],
    seo: {
      title: "Experiencia del cliente: mejorar cada contacto con tu empresa",
      description:
        "Respuestas lentas, clientes que preguntan dos veces y quejas que se repiten. Revisamos cada punto de contacto y aplicamos mejoras concretas para que tus clientes quieran volver.",
    },
  },
  {
    slug: "eficiencia-rentabilidad",
    number: "03",
    title: "Eficiencia y rentabilidad",
    shortTitle: "Eficiencia y rentabilidad",
    promise: "Menos trabajo repetido, menos costes innecesarios y más claridad sobre dónde ganas dinero.",
    intro:
      "El trabajo manual rara vez aparece en una cuenta de resultados, pero se paga igual: en horas, en errores y en servicios que se venden por debajo de lo que cuestan. Lo primero es verlo con números; lo segundo, quitarlo.",
    problems: [
      {
        title: "Horas en copiar, pegar y comprobar",
        body: "Datos que se pasan a mano de un sitio a otro, informes que se montan cada lunes, hojas de cálculo que solo entiende una persona.",
      },
      {
        title: "No se sabe qué servicio deja dinero",
        body: "Se factura mucho de algo que cuesta más horas de las que parece, y poco de lo que de verdad tiene margen. Sin ese dato, el esfuerzo comercial va al sitio equivocado.",
      },
      {
        title: "Gastos que nadie revisa",
        body: "Suscripciones duplicadas, servicios que ya no se usan, tarifas antiguas, permanencias olvidadas. Pequeños y constantes.",
      },
      {
        title: "El proceso vive en la cabeza de alguien",
        body: "Cuando esa persona falta, el trabajo se para o se hace peor. No es falta de talento, es falta de procedimiento escrito.",
      },
    ],
    levers: [
      {
        title: "Mapa del proceso con minutos reales",
        body: "Cuántas veces pasa, cuánto tarda y quién lo hace. Casi siempre aparece un paso que vale la mitad del total.",
      },
      {
        title: "Automatizar lo repetitivo, dejar el criterio a las personas",
        body: "Lo que es copiar, calcular y avisar lo hace un sistema. Lo que exige decidir sigue pasando por una persona, con mejor información.",
      },
      {
        title: "Cuentas por servicio",
        body: "Qué ingresa y qué cuesta cada tipo de trabajo, incluidas las horas. Después se decide qué se potencia, qué se sube de precio y qué se deja de hacer.",
      },
      {
        title: "Revisión de gastos fijos",
        body: "Inventario de lo que se paga cada mes, con fechas y condiciones, y una decisión por cada línea.",
      },
      {
        title: "Procedimientos escritos y formación",
        body: "Lo justo para que el trabajo no dependa de una sola cabeza: cómo se hace, qué se mira y qué se hace cuando algo falla.",
      },
    ],
    signals: [
      "Horas al mes dedicadas a tareas repetitivas",
      "Margen por tipo de servicio o cliente",
      "Coste fijo mensual y cuánto de eso se usa de verdad",
      "Errores y reprocesos por cada cien operaciones",
    ],
    faq: [
      {
        id: "eficiencia-despidos",
        question: "¿Esto va de reducir plantilla?",
        answer:
          "No. Va de que el equipo que tienes deje de gastar horas en lo que puede hacer un sistema y las use en vender, atender y mejorar. Si el objetivo fuese recortar personal, lo diríamos desde el principio.",
      },
      {
        id: "eficiencia-herramientas",
        question: "¿Tengo que cambiar de programas?",
        answer:
          "Casi nunca. Trabajamos sobre el ERP, el correo y las herramientas que ya usáis. Cambiar de herramienta es una decisión de negocio, no un atajo nuestro.",
      },
      {
        id: "eficiencia-primer-paso",
        question: "¿Por dónde se empieza?",
        answer:
          "Por medir un proceso concreto durante un par de semanas. Con ese dato se decide si merece la pena tocarlo y cuánto se puede esperar de hacerlo.",
      },
    ],
    seo: {
      title: "Eficiencia y rentabilidad: menos trabajo repetido, más margen",
      description:
        "Horas en tareas manuales, gastos que nadie revisa y servicios que no se sabe si son rentables. Medimos el coste real de tus procesos y aplicamos mejoras con los números delante.",
    },
  },
];

export const areaBySlug = (slug: string): Area | undefined =>
  areas.find((area) => area.slug === slug);

/**
 * «Lo que no ves también te cuesta».
 *
 * Ocho situaciones reconocibles. Ninguna lleva una cifra: lo que se afirma es
 * el mecanismo, no un porcentaje que nadie ha medido.
 */
export const signals: Signal[] = [
  {
    id: "sin-seguimiento",
    situation: "Alguien pregunta por un servicio, se le contesta y nunca se vuelve a llamar.",
    cost: "Esa oportunidad ya estaba pagada: llegó sola o la trajo la publicidad. Si no hay segunda llamada, el que compite contigo solo tiene que acordarse.",
    opportunity: "Un seguimiento acordado sobre las oportunidades que ya entran.",
    fix: "Una lista única de lo que entra, con dueño y plazo, y dos contactos de seguimiento escritos. A veces sin tocar ningún programa.",
    area: "crecimiento-comercial",
  },
  {
    id: "presupuestos-olvidados",
    situation: "Se envían presupuestos y nadie sabe cuántos siguen abiertos.",
    cost: "Se pierden por silencio más que por precio, y sin la cuenta de cuántos se envían y cuántos responden no se puede mejorar ni el precio ni el texto.",
    opportunity: "Saber qué porcentaje acaba en respuesta y recuperar los parados.",
    fix: "Presupuesto más corto y claro, un recordatorio a los pocos días y un registro de abiertos, ganados y perdidos con el motivo.",
    area: "crecimiento-comercial",
  },
  {
    id: "llamadas-perdidas",
    situation: "Entran llamadas que nadie coge y nadie devuelve.",
    cost: "Una llamada perdida en una empresa de servicios suele ser un cliente que ya ha llamado al siguiente de la lista.",
    opportunity: "Que ninguna llamada se quede sin devolver el mismo día.",
    fix: "Registro de llamadas no atendidas, un responsable de devolverlas y un mensaje automático diciendo cuándo se devuelve.",
    area: "experiencia-cliente",
  },
  {
    id: "clientes-que-no-vuelven",
    situation: "Clientes satisfechos que compraron una vez y no han vuelto.",
    cost: "Vender a quien ya te conoce cuesta mucho menos que encontrar a alguien nuevo. Si no hay un momento acordado para volver, no se vuelve.",
    opportunity: "Una razón y una fecha para volver a hablar con cada cliente.",
    fix: "Segmentar a los inactivos, decidir qué se les ofrece y cuándo, y medir cuántos vuelven.",
    area: "crecimiento-comercial",
  },
  {
    id: "horas-en-tareas",
    situation: "Procesos internos que consumen horas todas las semanas.",
    cost: "Copiar datos, montar informes y comprobar a mano no aparece en ninguna factura, pero se paga en nóminas y en errores.",
    opportunity: "Devolver esas horas al trabajo que sí requiere una persona.",
    fix: "Medir el proceso, automatizar lo repetitivo y dejar el criterio donde debe estar.",
    area: "eficiencia-rentabilidad",
  },
  {
    id: "web-que-no-convierte",
    situation: "La web recibe visitas y casi nadie escribe.",
    cost: "Pagas por traer gente a una página que no contesta su duda ni le dice qué pasa si escribe.",
    opportunity: "Convertir mejor las visitas que ya tienes antes de comprar más.",
    fix: "Reordenar la página alrededor de la duda del visitante, acortar el formulario y medir qué ocurre después de enviarlo.",
    area: "crecimiento-comercial",
  },
  {
    id: "servicios-sin-promocionar",
    situation: "El servicio con mejor margen es el que menos se ofrece.",
    cost: "El esfuerzo comercial va al trabajo más visible, no al más rentable, y el margen medio baja sin que nadie sepa por qué.",
    opportunity: "Poner el foco comercial donde está el margen.",
    fix: "Cuentas por servicio, y después cambiar qué se ofrece primero, cómo se presenta y a qué precio.",
    area: "eficiencia-rentabilidad",
  },
  {
    id: "sin-saber-donde-se-pierde",
    situation: "Se trabaja mucho y no se sabe dónde se va el dinero.",
    cost: "Sin el coste real por servicio y sin los gastos fijos revisados, cada decisión de precio es una apuesta.",
    opportunity: "Decidir con números en vez de con sensaciones.",
    fix: "Inventario de ingresos, costes y gastos fijos, y una decisión escrita por cada línea que no se justifique.",
    area: "eficiencia-rentabilidad",
  },
];
