import {
  FileSignature,
  Inbox,
  LayoutDashboard,
  Receipt,
  Route,
  Sparkles,
} from "lucide-react";

import type { Solution, SolutionSummary } from "./types";

/**
 * Solution catalogue.
 *
 * Add a solution by appending an object here. Index and detail pages, the
 * sitemap, the navigation menu and the home grid all read from this array.
 * No component needs editing.
 */
export const solutions: Solution[] = [
  {
    slug: "presupuestos-automaticos",
    order: 10,
    published: true,
    icon: FileSignature,
    title: "Presupuestos automáticos",
    heading: "Del correo del cliente al presupuesto enviado, sin intervención",
    excerpt:
      "La solicitud entra, el sistema la interpreta, aplica tus tarifas, genera el PDF y deja la respuesta lista.",
    chain: ["Solicitud", "Interpretación", "Cálculo", "PDF", "Respuesta"],
    problem: {
      title: "Presupuestar consume el tiempo de quien más sabe",
      body: "En la mayoría de empresas el presupuesto lo hace la persona con más criterio: el técnico, el jefe de obra, el responsable comercial. Cada solicitud le cuesta entre diez minutos y una hora, y llega en el peor momento. El resultado no es un problema de software, es un cuello de botella: los presupuestos salen tarde, y los que salen tarde se pierden.",
      symptoms: [
        "El cliente pregunta por el presupuesto antes de que se haya empezado.",
        "Las tarifas viven en un Excel que solo una persona sabe leer.",
        "Cada presupuesto se copia del anterior y se corrige a mano.",
        "Nadie sabe cuántas solicitudes se quedaron sin contestar.",
      ],
    },
    process: {
      before: {
        title: "Hoy",
        summary: "Entre 15 y 45 minutos de una persona cualificada por solicitud.",
        steps: [
          { id: "b1", label: "Llega la solicitud", actor: "trigger", note: "correo o formulario" },
          { id: "b2", label: "Alguien la lee e interpreta", actor: "person" },
          { id: "b3", label: "Busca las tarifas en el Excel", actor: "person" },
          { id: "b4", label: "Calcula precios y márgenes", actor: "person" },
          { id: "b5", label: "Monta el documento", actor: "person" },
          { id: "b6", label: "Redacta y envía el correo", actor: "person" },
        ],
      },
      after: {
        title: "Con el sistema",
        summary: "Minutos. Una persona revisa y aprueba, no calcula.",
        steps: [
          { id: "a1", label: "Llega la solicitud", actor: "trigger", note: "mismo buzón de siempre" },
          { id: "a2", label: "El sistema la interpreta y calcula", actor: "system" },
          { id: "a3", label: "Una persona revisa y aprueba", actor: "person", note: "opcional" },
          { id: "a4", label: "Presupuesto enviado y registrado", actor: "outcome" },
        ],
      },
    },
    buildingBlocks: [
      "Lectura e interpretación de la solicitud, venga como venga: correo, formulario, PDF adjunto o foto.",
      "Motor de tarifas conectado a tu lista de precios real, con reglas por cliente, volumen y excepciones.",
      "Generación del documento con tu formato, tu numeración y tus condiciones.",
      "Registro de cada solicitud, con estado y seguimiento, para que ninguna quede sin respuesta.",
    ],
    integrations: [
      "Correo corporativo",
      "Hojas de cálculo y listas de precios",
      "ERP o programa de gestión",
      "CRM",
      "Almacenamiento de documentos",
      "Firma electrónica",
    ],
    benefits: [
      {
        title: "Respondes el mismo día",
        body: "La velocidad de respuesta es una de las pocas variables comerciales que puedes controlar por completo.",
      },
      {
        title: "Los precios dejan de depender de quién lo haga",
        body: "Las reglas están en el sistema, no en la cabeza de una persona. El criterio se mantiene aunque esa persona esté de vacaciones.",
      },
      {
        title: "Sabes qué entra y qué se cierra",
        body: "Cada solicitud queda registrada. Por primera vez hay un número real de cuántas llegan y cuántas acaban en pedido.",
      },
    ],
    faq: [
      {
        id: "revision",
        question: "¿El presupuesto sale sin que lo vea nadie?",
        answer:
          "Solo si tú quieres. Lo habitual es empezar con revisión humana obligatoria: el sistema prepara el presupuesto completo y una persona lo aprueba con un clic. Cuando los números cuadran durante unas semanas, se decide qué casos pueden salir directos y cuáles siguen pasando por revisión.",
      },
      {
        id: "casos-raros",
        question: "Nuestros presupuestos son complicados, no siempre son iguales.",
        answer:
          "Casi siempre lo son. Por eso la primera fase es mapear el proceso: normalmente entre el 60% y el 80% de las solicitudes siguen un patrón claro y el resto son excepciones. Automatizamos el patrón y dejamos que las excepciones lleguen a una persona con el trabajo previo ya hecho.",
      },
      {
        id: "tarifas",
        question: "Nuestras tarifas cambian a menudo.",
        answer:
          "El sistema lee tu lista de precios donde ya vive, normalmente una hoja de cálculo o el ERP. Cambias el precio donde lo cambias siempre y el siguiente presupuesto ya sale con el nuevo.",
      },
    ],
    related: ["email-y-comunicacion", "procesos-comerciales"],
    seo: {
      title: "Presupuestos automáticos",
      description:
        "Sistemas que interpretan la solicitud, aplican tus tarifas, generan el PDF y dejan la respuesta lista. Presupuestos el mismo día, sin ocupar a tu mejor técnico.",
    },
  },

  {
    slug: "automatizacion-administrativa",
    order: 20,
    published: true,
    icon: Receipt,
    title: "Automatización administrativa",
    heading: "El papeleo que hoy hace una persona, hecho por un sistema",
    excerpt:
      "Facturas, albaranes, documentos y datos que hoy se leen, se copian y se comprueban a mano.",
    chain: ["Documento", "Lectura", "Comprobación", "Registro"],
    problem: {
      title: "Administración es, en gran parte, mover información de un sitio a otro",
      body: "Alguien abre un PDF, mira tres campos, los escribe en otro programa y archiva el documento. Repetido cien veces al mes, es una persona a media jornada. Y es exactamente el tipo de trabajo en el que un humano se equivoca y un sistema no.",
      symptoms: [
        "Facturas que se introducen a mano en el programa de gestión.",
        "Documentos que se renombran y se guardan siguiendo una convención mental.",
        "Comprobaciones que consisten en mirar dos pantallas a la vez.",
        "Cierres de mes que dependen de que alguien no se olvide de algo.",
      ],
    },
    process: {
      before: {
        title: "Hoy",
        summary: "Tres o cuatro minutos por documento, multiplicado por todo el mes.",
        steps: [
          { id: "b1", label: "Llega el documento", actor: "trigger", note: "correo, escáner, portal" },
          { id: "b2", label: "Alguien lo abre y lo lee", actor: "person" },
          { id: "b3", label: "Copia los datos al programa", actor: "person" },
          { id: "b4", label: "Comprueba contra el pedido", actor: "person" },
          { id: "b5", label: "Renombra y archiva", actor: "person" },
        ],
      },
      after: {
        title: "Con el sistema",
        summary: "Solo llegan a una persona los documentos que no cuadran.",
        steps: [
          { id: "a1", label: "Llega el documento", actor: "trigger" },
          { id: "a2", label: "El sistema extrae y comprueba", actor: "system" },
          { id: "a3", label: "Se registra y se archiva", actor: "system" },
          { id: "a4", label: "Excepciones a revisión", actor: "person", note: "solo lo dudoso" },
        ],
      },
    },
    buildingBlocks: [
      "Lectura de documentos (OCR e interpretación) de facturas, albaranes, contratos y formularios, incluidos escaneos y fotos.",
      "Reglas de validación propias: contra pedido, contra tarifa, contra histórico, contra lo que tenga sentido en tu negocio.",
      "Registro automático en el programa de gestión que ya usáis.",
      "Bandeja de excepciones: una pantalla con lo que no cuadra y el motivo, no una carpeta de correos.",
    ],
    integrations: [
      "ERP y programas de gestión",
      "Contabilidad",
      "Correo y carpetas compartidas",
      "Escáneres y portales de proveedores",
      "Bases de datos internas",
    ],
    benefits: [
      {
        title: "Los errores dejan de ser aleatorios",
        body: "Un sistema falla siempre igual, y eso se corrige. Una persona cansada falla de forma impredecible, y eso se descubre tarde.",
      },
      {
        title: "El cierre de mes deja de ser una carrera",
        body: "Si el registro va al día porque se hace solo, el cierre es una comprobación, no una acumulación.",
      },
      {
        title: "La capacidad crece sin contratar",
        body: "El doble de facturas no significa el doble de personas administrativas.",
      },
    ],
    faq: [
      {
        id: "erp",
        question: "Tenemos un programa de gestión antiguo y sin API.",
        answer:
          "Es el caso más frecuente. Hay más de una manera de entrar: importaciones en el formato que acepte, acceso a su base de datos, o automatización de la propia interfaz. En la fase de diagnóstico comprobamos cuál es viable antes de prometer nada.",
      },
      {
        id: "precision",
        question: "¿Qué pasa si el sistema lee mal un dato?",
        answer:
          "Todo documento pasa por reglas de validación. Lo que no supera una comprobación no se registra: se manda a una bandeja de revisión con el motivo señalado. El objetivo no es que el sistema no se equivoque nunca, es que nunca se equivoque en silencio.",
      },
    ],
    related: ["email-y-comunicacion", "herramientas-internas"],
    seo: {
      title: "Automatización administrativa",
      description:
        "Facturas, albaranes y documentos leídos, comprobados y registrados automáticamente en el programa que ya usas. Menos introducción manual, menos errores.",
    },
  },

  {
    slug: "email-y-comunicacion",
    order: 30,
    published: true,
    icon: Inbox,
    title: "Correo y comunicación",
    heading: "El buzón deja de ser una lista de tareas pendientes",
    excerpt:
      "Clasificar, extraer lo importante, responder lo repetitivo y arrancar el proceso que toque.",
    chain: ["Entrada", "Clasificación", "Extracción", "Acción"],
    problem: {
      title: "El correo es donde entra el trabajo y donde se pierde",
      body: "Pedidos, incidencias, solicitudes y preguntas llegan mezclados al mismo buzón. Alguien tiene que leerlo todo para decidir qué es cada cosa, a quién le toca y qué hay que hacer. Ese triaje es invisible en el organigrama y consume horas todos los días.",
      symptoms: [
        "Correos importantes que se contestan dos días tarde.",
        "La misma pregunta respondida veinte veces al mes.",
        "Información que hay que sacar del correo y meter en otro sitio.",
        "Buzones compartidos donde nadie sabe quién ha contestado qué.",
      ],
    },
    process: {
      before: {
        title: "Hoy",
        summary: "Una persona hace de router entre el buzón y el resto de la empresa.",
        steps: [
          { id: "b1", label: "Entra el correo", actor: "trigger" },
          { id: "b2", label: "Alguien lo lee y clasifica", actor: "person" },
          { id: "b3", label: "Reenvía a quien corresponda", actor: "person" },
          { id: "b4", label: "Copia los datos a otro sistema", actor: "person" },
          { id: "b5", label: "Responde o hace seguimiento", actor: "person" },
        ],
      },
      after: {
        title: "Con el sistema",
        summary: "Cada correo llega clasificado, con los datos extraídos y el proceso ya iniciado.",
        steps: [
          { id: "a1", label: "Entra el correo", actor: "trigger" },
          { id: "a2", label: "Se clasifica y se extraen los datos", actor: "system" },
          { id: "a3", label: "Arranca el proceso correspondiente", actor: "system" },
          { id: "a4", label: "Respuesta lista o enviada", actor: "outcome" },
        ],
      },
    },
    buildingBlocks: [
      "Clasificación por tipo de mensaje según tus propias categorías, no una taxonomía genérica.",
      "Extracción de datos estructurados del cuerpo del correo y de los adjuntos.",
      "Respuestas preparadas para lo repetitivo, con revisión previa mientras haga falta.",
      "Disparo del proceso que corresponda: crear el pedido, abrir la incidencia, preparar el presupuesto.",
    ],
    integrations: [
      "Correo corporativo",
      "Buzones compartidos",
      "Sistemas de tickets",
      "CRM y ERP",
      "Mensajería interna",
    ],
    benefits: [
      {
        title: "El tiempo de respuesta baja de días a minutos",
        body: "Sin contratar a nadie y sin pedirle a nadie que vaya más rápido.",
      },
      {
        title: "Nada se queda sin contestar",
        body: "Todo lo que entra queda registrado con estado. Los buzones compartidos dejan de ser tierra de nadie.",
      },
      {
        title: "Tu equipo lee lo que merece la pena leer",
        body: "El triaje deja de ser un trabajo humano y pasa a ser el punto de partida.",
      },
    ],
    faq: [
      {
        id: "tono",
        question: "No quiero que un sistema conteste a mis clientes en mi nombre.",
        answer:
          "Es una decisión tuya y se configura caso por caso. Se puede empezar con el sistema preparando el borrador y una persona enviándolo. Muchas empresas se quedan ahí, y ya han eliminado la mayor parte del trabajo.",
      },
      {
        id: "privacidad",
        question: "¿Quién ve el contenido de nuestros correos?",
        answer:
          "El sistema se despliega sobre tu infraestructura o sobre servicios que tú contratas, con la política de retención que decidas. Se documenta qué se procesa, dónde se guarda y durante cuánto tiempo, antes de conectar nada.",
      },
    ],
    related: ["presupuestos-automaticos", "automatizacion-administrativa"],
    seo: {
      title: "Automatización de correo y comunicación",
      description:
        "Clasificación, extracción de datos y respuesta automática del correo de empresa. El buzón deja de ser un cuello de botella.",
    },
  },

  {
    slug: "procesos-comerciales",
    order: 40,
    published: true,
    icon: Route,
    title: "Procesos comerciales",
    heading: "Que ningún cliente potencial se enfríe esperando",
    excerpt:
      "Leads, seguimiento, CRM y todo lo que hoy depende de que alguien se acuerde.",
    chain: ["Lead", "Cualificación", "Seguimiento", "Cierre"],
    problem: {
      title: "El seguimiento comercial depende de la memoria de una persona",
      body: "El lead entra, alguien lo apunta, y a partir de ahí el proceso vive en una cabeza, un cuaderno o un CRM que se actualiza a ratos. Lo que se pierde no se ve: nadie echa de menos al cliente al que no se volvió a llamar.",
      symptoms: [
        "El CRM está desactualizado porque actualizarlo es trabajo extra.",
        "Los leads de la web acaban en un correo que alguien reenvía.",
        "El seguimiento se hace cuando hay tiempo, no cuando toca.",
        "Nadie sabe qué canal trae los clientes que de verdad compran.",
      ],
    },
    process: {
      before: {
        title: "Hoy",
        summary: "El proceso funciona mientras la persona se acuerde.",
        steps: [
          { id: "b1", label: "Entra un contacto", actor: "trigger" },
          { id: "b2", label: "Alguien lo apunta", actor: "person" },
          { id: "b3", label: "Lo cualifica por teléfono", actor: "person" },
          { id: "b4", label: "Anota el seguimiento", actor: "person" },
          { id: "b5", label: "Recuerda volver a llamar", actor: "person", note: "o no" },
        ],
      },
      after: {
        title: "Con el sistema",
        summary: "El proceso avanza solo; la persona hace las conversaciones.",
        steps: [
          { id: "a1", label: "Entra un contacto", actor: "trigger" },
          { id: "a2", label: "Se registra y se cualifica", actor: "system" },
          { id: "a3", label: "Conversación comercial", actor: "person" },
          { id: "a4", label: "Seguimiento automático hasta el cierre", actor: "outcome" },
        ],
      },
    },
    buildingBlocks: [
      "Captura unificada de leads desde web, correo, teléfono y cualquier otro canal que uséis.",
      "Cualificación con vuestros criterios reales, no con una puntuación genérica.",
      "Secuencias de seguimiento que se disparan por tiempo y por comportamiento.",
      "CRM que se actualiza a partir de lo que pasa, en lugar de esperar a que alguien lo rellene.",
    ],
    integrations: [
      "CRM",
      "Formularios web",
      "Correo y calendario",
      "Telefonía",
      "Herramientas de propuestas y firma",
    ],
    benefits: [
      {
        title: "Los leads dejan de enfriarse",
        body: "El primer contacto ocurre en minutos, no cuando alguien encuentra un hueco.",
      },
      {
        title: "El comercial vende, no administra",
        body: "El tiempo dedicado a rellenar campos vuelve a la conversación con el cliente.",
      },
      {
        title: "Por fin hay datos",
        body: "Con el proceso registrado se puede saber qué funciona. Sin registro no hay decisión posible.",
      },
    ],
    faq: [
      {
        id: "crm",
        question: "¿Hay que cambiar de CRM?",
        answer:
          "No por defecto. Empezamos por hacer que el que tienes se mantenga solo. Solo proponemos cambiarlo si mantenerlo cuesta más que sustituirlo, y en ese caso te enseñamos el cálculo.",
      },
      {
        id: "equipo",
        question: "Mi equipo comercial se resiste a las herramientas.",
        answer:
          "Casi siempre porque las herramientas les piden trabajo en lugar de quitárselo. El criterio de diseño aquí es simple: si una pantalla añade pasos al comercial, está mal diseñada.",
      },
    ],
    related: ["presupuestos-automaticos", "herramientas-internas"],
    seo: {
      title: "Automatización de procesos comerciales",
      description:
        "Captura de leads, cualificación, seguimiento automático y un CRM que se mantiene solo. Que ningún cliente potencial se enfríe esperando.",
    },
  },

  {
    slug: "herramientas-internas",
    order: 50,
    published: true,
    icon: LayoutDashboard,
    title: "Herramientas internas",
    heading: "Software hecho para cómo trabaja tu empresa, no al revés",
    excerpt:
      "Sustituye el Excel compartido, el grupo de WhatsApp y los cuatro programas que no se hablan entre sí.",
    chain: ["Excel y correo", "Herramienta propia", "Un solo sitio"],
    problem: {
      title: "Cuando el proceso no cabe en ningún programa, acaba en un Excel",
      body: "Toda empresa tiene un proceso propio que ningún software del mercado cubre. Se resuelve con una hoja de cálculo compartida, un grupo de mensajería y mucha coordinación humana. Funciona hasta que crece: entonces cada consulta es una pregunta a otra persona.",
      symptoms: [
        "Un Excel del que depende media empresa y que solo una persona entiende.",
        "Datos que existen en tres sitios con tres valores distintos.",
        "Decisiones que requieren preguntar a alguien porque no están en ningún sistema.",
        "Procesos que se explican de palabra a cada persona nueva.",
      ],
    },
    process: {
      before: {
        title: "Hoy",
        summary: "El proceso vive repartido entre herramientas que no se hablan.",
        steps: [
          { id: "b1", label: "Excel compartido", actor: "person" },
          { id: "b2", label: "Correos de coordinación", actor: "person" },
          { id: "b3", label: "Mensajes para avisar", actor: "person" },
          { id: "b4", label: "Alguien consolida al final", actor: "person" },
        ],
      },
      after: {
        title: "Con el sistema",
        summary: "Un sitio, con permisos, histórico y avisos automáticos.",
        steps: [
          { id: "a1", label: "Herramienta propia", actor: "system" },
          { id: "a2", label: "Cada uno ve lo suyo", actor: "person" },
          { id: "a3", label: "Avisos automáticos", actor: "system" },
          { id: "a4", label: "Datos siempre al día", actor: "outcome" },
        ],
      },
    },
    buildingBlocks: [
      "Aplicaciones internas a medida del proceso concreto, sin funcionalidad que nadie ha pedido.",
      "Permisos por rol, para que cada persona vea exactamente lo que necesita.",
      "Histórico y trazabilidad: quién hizo qué y cuándo.",
      "Conexión con los sistemas que ya existen, para no crear otra isla de datos.",
    ],
    integrations: [
      "Bases de datos existentes",
      "ERP y contabilidad",
      "Almacenamiento de archivos",
      "Identidad corporativa y accesos",
      "Notificaciones por correo y móvil",
    ],
    benefits: [
      {
        title: "El conocimiento sale de las cabezas",
        body: "Cuando el proceso está en una herramienta, incorporar a alguien deja de depender de que otra persona tenga tiempo de explicarlo.",
      },
      {
        title: "Una sola versión de la verdad",
        body: "Se acaban las reuniones para decidir cuál de los tres Excel tiene el dato bueno.",
      },
      {
        title: "Se puede mejorar lo que se puede medir",
        body: "Un proceso registrado se puede analizar. Un proceso en hojas sueltas, no.",
      },
    ],
    faq: [
      {
        id: "medida",
        question: "¿No sale más caro hacer software a medida?",
        answer:
          "Depende del proceso. Si existe una herramienta de mercado que encaja, te lo diremos y ahí acaba la conversación. Hacer a medida tiene sentido cuando el proceso es específico de tu negocio, o cuando adaptarse a una herramienta genérica cuesta más que construir la propia.",
      },
      {
        id: "mantenimiento",
        question: "¿Qué pasa con el mantenimiento a largo plazo?",
        answer:
          "Se acuerda desde el principio: qué se mantiene, con qué tiempos de respuesta y a qué coste. El código y los datos son tuyos, documentados, sin dependencia obligatoria de nosotros.",
      },
    ],
    related: ["automatizacion-administrativa", "ia-aplicada"],
    seo: {
      title: "Herramientas internas a medida",
      description:
        "Aplicaciones internas que sustituyen el Excel compartido y el correo de coordinación. Software diseñado para tu proceso concreto.",
    },
  },

  {
    slug: "ia-aplicada",
    order: 60,
    published: true,
    icon: Sparkles,
    title: "IA aplicada al negocio",
    heading: "Inteligencia artificial conectada a tus datos y a tus procesos",
    excerpt:
      "Útil cuando hay que leer, entender o decidir sobre texto. Innecesaria para el resto.",
    chain: ["Pregunta", "Conocimiento propio", "Respuesta útil"],
    problem: {
      title: "La IA genérica no conoce tu empresa",
      body: "Un asistente de propósito general no sabe vuestras tarifas, ni vuestro histórico, ni cómo se llama internamente cada cosa. Por eso las pruebas suelen quedarse en curiosidad. Lo que cambia el resultado no es el modelo: es conectarlo a la información y a las herramientas de la empresa, con límites claros.",
      symptoms: [
        "Se probó una herramienta de IA y nadie la usa tres meses después.",
        "Las respuestas suenan bien pero no sirven para trabajar.",
        "La información útil está repartida en documentos que nadie encuentra.",
        "Preguntas internas que siempre acaban en la misma persona.",
      ],
    },
    process: {
      before: {
        title: "Hoy",
        summary: "El conocimiento está, pero solo lo encuentra quien ya sabe dónde mirar.",
        steps: [
          { id: "b1", label: "Surge una duda", actor: "trigger" },
          { id: "b2", label: "Se busca en carpetas y correos", actor: "person" },
          { id: "b3", label: "Se pregunta a un compañero", actor: "person" },
          { id: "b4", label: "Se interrumpe a quien sabe", actor: "person" },
        ],
      },
      after: {
        title: "Con el sistema",
        summary: "Respuestas con la información de la empresa y la fuente citada.",
        steps: [
          { id: "a1", label: "Surge una duda", actor: "trigger" },
          { id: "a2", label: "Consulta al asistente interno", actor: "person" },
          { id: "a3", label: "Busca en la documentación real", actor: "system" },
          { id: "a4", label: "Respuesta con su fuente", actor: "outcome" },
        ],
      },
    },
    buildingBlocks: [
      "Asistentes conectados a la documentación real de la empresa, con la fuente siempre citada.",
      "Lectura y clasificación de documentos y texto libre a escala.",
      "Agentes que ejecutan tareas acotadas con permisos explícitos y registro de lo que hacen.",
      "Evaluación previa honesta: dónde aporta la IA y dónde una regla de toda la vida funciona mejor y cuesta menos.",
    ],
    integrations: [
      "Documentación interna y carpetas compartidas",
      "Bases de datos y ERP",
      "Correo y mensajería",
      "Herramientas internas propias",
    ],
    benefits: [
      {
        title: "Aplicada donde de verdad aporta",
        body: "Texto, documentos y clasificación. Para lo demás hay soluciones más baratas y más fiables, y las proponemos.",
      },
      {
        title: "Con límites y con registro",
        body: "Qué puede consultar, qué puede hacer y qué queda documentado se define antes de conectar nada.",
      },
      {
        title: "Medida como cualquier otra inversión",
        body: "Si un asistente no ahorra tiempo comprobable, es un juguete caro. Se mide igual que el resto.",
      },
    ],
    faq: [
      {
        id: "datos",
        question: "¿Nuestros datos acaban entrenando un modelo público?",
        answer:
          "No. Se trabaja con acuerdos y configuraciones que excluyen el uso de vuestros datos para entrenamiento, y cuando el caso lo exige, con modelos desplegados en vuestra propia infraestructura. Esto se decide y se documenta antes de empezar.",
      },
      {
        id: "necesaria",
        question: "¿Necesitamos IA?",
        answer:
          "Probablemente en menos sitios de los que parece. Buena parte de lo que se vende como IA se resuelve mejor con una integración y unas reglas. Cuando en el diagnóstico la respuesta sea esa, será la que te demos.",
      },
    ],
    related: ["email-y-comunicacion", "herramientas-internas"],
    seo: {
      title: "IA aplicada al negocio",
      description:
        "Asistentes y sistemas de IA conectados al conocimiento y a las herramientas de tu empresa. Aplicada donde aporta, no donde queda bien.",
    },
  },
];

/** Published solutions, ordered. Everything in the UI reads from this. */
export const publishedSolutions: Solution[] = solutions
  .filter((solution) => solution.published)
  .sort((a, b) => a.order - b.order);

export const solutionSummaries: SolutionSummary[] = publishedSolutions.map(
  ({ slug, title, excerpt, chain, icon, order, published }) => ({
    slug,
    title,
    excerpt,
    chain,
    icon,
    order,
    published,
  }),
);

export function getSolution(slug: string): Solution | undefined {
  return publishedSolutions.find((solution) => solution.slug === slug);
}

export function getRelatedSolutions(slug: string): Solution[] {
  const solution = getSolution(slug);
  if (!solution) return [];
  return solution.related
    .map((relatedSlug) => getSolution(relatedSlug))
    .filter((value): value is Solution => Boolean(value));
}
