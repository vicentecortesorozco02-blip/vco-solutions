import type { Sector } from "./types";

/**
 * Sectores.
 *
 * Cada ficha está escrita con el vocabulario que usa ese sector —escandallo,
 * descuadre, liquidación, comisión de la OTA— porque es así como se describe
 * el problema cuando lo cuenta quien lo tiene.
 *
 * Los ejemplos numéricos son simulaciones con hipótesis a la vista. No hay
 * clientes, resultados ni colaboraciones inventadas en ningún sitio.
 */

export const sectors: Sector[] = [
  {
    slug: "hoteles-y-alojamientos",
    name: "Hoteles y alojamientos",
    shortName: "Hoteles",
    intro:
      "El alojamiento vende con margen ajeno: cada reserva que entra por un portal paga comisión, y cada petición directa que se queda sin contestar a tiempo acaba entrando por ese mismo portal. En medio hay trabajo manual —pasar reservas, cuadrar disponibilidad, contestar lo mismo veinte veces— que se come las horas de recepción.",
    problems: [
      "Peticiones directas por correo o formulario que se contestan tarde, cuando el huésped ya ha reservado en la OTA.",
      "Reservas que se pasan a mano de un canal al PMS, con el riesgo de sobreventa que eso trae.",
      "La misma pregunta —parking, hora de entrada, mascotas— contestada una y otra vez por recepción.",
      "Mensajes antes y después de la estancia que dependen de que alguien se acuerde.",
      "Reseñas que solo escriben los huéspedes que se fueron disgustados.",
    ],
    opportunities: [
      {
        title: "Contestar lo directo antes de que reserve por el portal",
        body: "Una respuesta rápida con precio y condiciones a la petición directa compite de tú a tú con la OTA, y esa reserva entra sin comisión.",
      },
      {
        title: "Quitar el paso a mano entre canal y PMS",
        body: "Menos minutos por reserva y, sobre todo, menos sobreventas que acaban en un huésped reubicado y una reseña mala.",
      },
      {
        title: "Mensajes de estancia que se envían solos",
        body: "Confirmación, instrucciones de llegada y petición de opinión en el momento adecuado, sin depender de la memoria del turno.",
      },
      {
        title: "Pedir la reseña a quien se va contento",
        body: "La reputación pública deja de estar escrita solo por los descontentos.",
      },
    ],
    example: {
      title: "Peticiones directas sin contestar",
      workings:
        "40 peticiones directas al mes · 25 % acaban en reserva = 10 reservas. Si contestar el mismo día sube la conversión al 35 %, son 14 reservas: 4 más. Con una estancia media de 180 € y una comisión de portal del 17 %, esas 4 reservas directas ahorran 122 € de comisión y aportan 720 € de facturación que antes podía irse al portal.",
      assumptions: [
        "La mejora de conversión es una hipótesis de trabajo, no una media del sector.",
        "La estancia media y la comisión son valores de ejemplo: con los tuyos el cálculo cambia.",
        "Supone que la demanda directa no baja al contestar antes, solo que se pierde menos.",
      ],
      compare: {
        unit: "count",
        label: "Reservas directas al mes",
        now: { label: "Con la conversión actual", value: 10 },
        better: { label: "Contestando el mismo día", value: 14 },
      },
      stats: [
        { label: "Peticiones directas al mes", value: 40, unit: "count" },
        { label: "Conversión actual", value: 25, unit: "percent" },
        {
          label: "Conversión al contestar el mismo día",
          value: 35,
          unit: "percent",
        },
      ],
    },
    faq: [
      {
        id: "hoteles-pms",
        question: "¿Tengo que cambiar de PMS o de motor de reservas?",
        answer:
          "No. Se trabaja sobre lo que ya tenéis y se mira qué permite conectar. Cambiar de PMS es un proyecto en sí mismo y casi nunca es el primer paso rentable.",
      },
      {
        id: "hoteles-ota",
        question: "¿Esto va de dejar las OTA?",
        answer:
          "No: las OTA traen demanda que de otra forma no llegaría. Va de que la petición que ya te llega directa no acabe convirtiéndose en una reserva con comisión por haberla contestado tarde.",
      },
    ],
    seo: {
      title: "Mejoras para hoteles y alojamientos: reservas directas y menos trabajo manual",
      description:
        "Peticiones directas sin contestar, reservas pasadas a mano al PMS y mensajes que dependen del turno. Detectamos las oportunidades de tu alojamiento y aplicamos mejoras.",
    },
  },
  {
    slug: "restaurantes",
    name: "Restaurantes",
    shortName: "Restaurantes",
    intro:
      "En un restaurante el margen se decide dos veces: en el escandallo y en la sala. Lo primero suele estar desactualizado y lo segundo se pierde cuando nadie puede coger el teléfono en pleno servicio.",
    problems: [
      "El escandallo se hizo una vez y los precios de proveedor han cambiado desde entonces.",
      "Reservas que se pierden porque en hora punta nadie atiende la llamada.",
      "Mesas que no aparecen y nadie confirma la víspera.",
      "Pedidos a proveedor por WhatsApp, sin registro de qué se pidió ni a qué precio.",
      "No se sabe qué platos dejan dinero y cuáles se venden mucho con margen pequeño.",
    ],
    opportunities: [
      {
        title: "Escandallo al día y carta ordenada por margen",
        body: "Saber qué plato deja dinero cambia la carta, las sugerencias del equipo y el precio. Es la mejora más barata que existe en hostelería.",
      },
      {
        title: "Que ninguna llamada de reserva se pierda",
        body: "Reserva por mensaje o formulario para las horas de servicio, y devolución de llamadas perdidas como norma escrita.",
      },
      {
        title: "Confirmar la víspera",
        body: "Un recordatorio el día antes reduce las mesas que no se presentan y permite recolocar a tiempo.",
      },
      {
        title: "Pedidos y precios con registro",
        body: "Qué se pide, a quién y a qué precio. Sin ese histórico no se negocia con proveedores, se acepta lo que llega.",
      },
    ],
    example: {
      title: "Reservas perdidas al teléfono",
      workings:
        "Si se pierden 15 llamadas de reserva a la semana y la mitad eran reserva real, son 30 reservas al mes sin atender. A 2,2 comensales y 24 € de ticket medio, eso equivale a 1.584 € de facturación mensual. Recuperar solo un tercio ya son 528 € al mes con los mismos cocineros y la misma sala: la pérdida baja de 1.584 € a 1.056 €.",
      assumptions: [
        "Las llamadas perdidas hay que contarlas de verdad: la centralita o el móvil lo dicen.",
        "Comensales por reserva y ticket medio son de ejemplo.",
        "Facturación no es beneficio: hay que descontar el coste de la materia prima.",
      ],
      compare: {
        unit: "eur",
        label: "Facturación mensual perdida por reservas sin atender",
        now: { label: "Hoy", value: 1584 },
        better: { label: "Recuperando un tercio", value: 1056 },
      },
      stats: [
        { label: "Reservas sin atender al mes", value: 30, unit: "count" },
        { label: "Comensales por reserva", value: 2.2, unit: "count" },
        { label: "Ticket medio", value: 24, unit: "eur" },
      ],
    },
    faq: [
      {
        id: "restaurantes-tpv",
        question: "¿Hace falta cambiar el TPV?",
        answer:
          "No. El escandallo y el control de margen se pueden montar con lo que ya factura el TPV; cambiarlo solo se plantea si impide ver los datos, y eso se comprueba antes.",
      },
      {
        id: "restaurantes-tamano",
        question: "¿Esto sirve para un restaurante pequeño?",
        answer:
          "Sobre todo para uno pequeño: con menos volumen, cada mesa perdida y cada plato mal escandallado pesan más en el resultado del mes.",
      },
    ],
    seo: {
      title: "Mejoras para restaurantes: margen por plato y reservas que no se pierden",
      description:
        "Escandallos desfasados, llamadas de reserva sin atender y mesas que no aparecen. Analizamos dónde se va el margen de tu restaurante y aplicamos mejoras concretas.",
    },
  },
  {
    slug: "clinicas-y-centros-de-servicios",
    name: "Clínicas y centros de servicios",
    shortName: "Clínicas",
    intro:
      "Una clínica vende tiempo de agenda: el hueco que se queda vacío no se recupera. La recepción, mientras tanto, atiende teléfono, mensajería y mostrador a la vez, y lo que no da tiempo a hacer es lo que más vale: llamar a quien dejó un tratamiento a medias.",
    problems: [
      "Pacientes que no acuden y huecos que se quedan sin cubrir.",
      "Recepción atendiendo llamadas, WhatsApp y mostrador al mismo tiempo.",
      "Primeras visitas que preguntan precio, se les contesta y no se vuelve a llamar.",
      "Tratamientos empezados y no terminados que nadie recupera.",
      "Documentación y consentimientos que se rellenan a mano el día de la cita.",
    ],
    opportunities: [
      {
        title: "Recordatorio de cita con confirmación",
        body: "Avisar con antelación y poder confirmar en un clic reduce las ausencias y deja margen para recolocar el hueco.",
      },
      {
        title: "Lista de espera para huecos libres",
        body: "Cuando alguien cancela, el hueco se ofrece automáticamente a quien esperaba fecha.",
      },
      {
        title: "Seguimiento de tratamientos sin terminar",
        body: "Un listado de quién se quedó a medias y una llamada con motivo. Es la venta más rentable de una clínica.",
      },
      {
        title: "Papeleo antes de la cita",
        body: "Formularios y consentimientos firmados desde casa: menos cola en mostrador y menos datos que teclear después.",
      },
    ],
    example: {
      title: "Reducir las ausencias de agenda",
      workings:
        "Una agenda de 160 citas al mes con un 12 % de ausencias deja 19 huecos vacíos. Si el recordatorio con confirmación baja las ausencias al 8 %, quedan 13 huecos: se recuperan 6 citas, y a 55 € por cita son 330 € al mes de ingresos que ya estaban agendados y se perdían.",
      assumptions: [
        "El porcentaje actual de ausencias se mide con la agenda real antes de tocar nada.",
        "La bajada al 8 % es una hipótesis: depende del canal y de la antelación del aviso.",
        "El precio por cita es de ejemplo y no descuenta el coste del profesional.",
      ],
      compare: {
        unit: "count",
        label: "Huecos de agenda vacíos al mes",
        now: { label: "Con el 12 % de ausencias", value: 19 },
        better: { label: "Con recordatorio y confirmación", value: 13 },
      },
      stats: [
        { label: "Citas al mes", value: 160, unit: "count" },
        { label: "Ausencias actuales", value: 12, unit: "percent" },
        { label: "Ausencias con confirmación", value: 8, unit: "percent" },
      ],
    },
    faq: [
      {
        id: "clinicas-datos",
        question: "¿Qué pasa con los datos de los pacientes?",
        answer:
          "Son datos de salud: categoría especial. Se trabaja con el mínimo dato necesario, sobre vuestros sistemas y con encargado de tratamiento firmado. Si una mejora exige mover datos sensibles sin base legal clara, no se hace.",
      },
      {
        id: "clinicas-software",
        question: "¿Funciona con el software de gestión que ya usamos?",
        answer:
          "Se comprueba antes de prometer nada: muchos programas de clínica permiten exportar agenda o conectar avisos, y cuando no, se busca la vía más simple sin cambiar el programa.",
      },
    ],
    seo: {
      title: "Mejoras para clínicas y centros: menos ausencias y recepción más libre",
      description:
        "Pacientes que no acuden, recepción desbordada y tratamientos sin terminar. Detectamos las oportunidades de tu clínica y aplicamos mejoras sobre los sistemas que ya usas.",
    },
  },
  {
    slug: "transporte",
    name: "Empresas de transporte",
    shortName: "Transporte",
    intro:
      "En transporte el presupuesto es la venta: quien contesta antes y con un precio defendible se lleva el servicio. Detrás, las liquidaciones a conductores y colaboradores consumen días de administración y son la fuente número uno de descuadres.",
    problems: [
      "Presupuestos que tardan porque hay que mirar tarifas, kilómetros y disponibilidad a mano.",
      "Precios que varían según quién los calcule.",
      "Liquidaciones a conductores autónomos cuadradas en hojas de cálculo.",
      "Servicios confirmados por correo o mensajería, sin un sitio único donde mirar.",
      "No se sabe qué ruta o qué cliente deja margen y cuál se trabaja casi a coste.",
    ],
    opportunities: [
      {
        title: "Presupuesto en minutos, con la tarifa aplicada sola",
        body: "El tiempo de respuesta es una ventaja comercial medible, y el precio deja de depender de quién esté de guardia.",
      },
      {
        title: "Liquidaciones automáticas a partir de los servicios",
        body: "Lo que se liquida sale de lo que se ha hecho, no de volver a teclearlo. Menos días de cierre y menos discusiones.",
      },
      {
        title: "Un panel con los servicios del día",
        body: "Qué hay confirmado, con quién y a qué precio, sin reconstruirlo del correo cada mañana.",
      },
      {
        title: "Margen por cliente y por ruta",
        body: "Con el coste real delante se renegocia, se sube precio o se deja de hacer el trabajo que no sale.",
      },
    ],
    example: {
      title: "Presupuestos contestados antes",
      workings:
        "120 peticiones al mes con un 30 % de cierre son 36 servicios. Si responder en minutos en vez de en horas sube el cierre al 36 %, son 43 servicios: 7 más. A 140 € de media, 980 € más de facturación al mes sin una sola petición nueva.",
      assumptions: [
        "La subida de cierre es una hipótesis que hay que comprobar midiendo antes y después.",
        "El precio medio por servicio es de ejemplo.",
        "Requiere capacidad para atender esos servicios extra; si no la hay, el cálculo no aplica.",
      ],
      compare: {
        unit: "count",
        label: "Servicios cerrados al mes",
        now: { label: "Con el cierre actual", value: 36 },
        better: { label: "Respondiendo en minutos", value: 43 },
      },
      stats: [
        { label: "Peticiones al mes", value: 120, unit: "count" },
        { label: "Cierre actual", value: 30, unit: "percent" },
        { label: "Cierre al responder antes", value: 36, unit: "percent" },
      ],
    },
    faq: [
      {
        id: "transporte-tarifas",
        question: "¿Y si mis tarifas son complicadas?",
        answer:
          "Suelen serlo: zonas, suplementos, esperas, temporada. Precisamente por eso conviene escribirlas una vez bien; lo que hoy está en la cabeza de dos personas es lo que hace que dos presupuestos del mismo servicio no coincidan.",
      },
      {
        id: "transporte-colaboradores",
        question: "¿Sirve si trabajo con colaboradores externos?",
        answer:
          "Sí, y ahí suele estar la mejora más grande: confirmar servicios y liquidar a colaboradores es donde se van las horas de administración y donde aparecen los descuadres.",
      },
    ],
    seo: {
      title: "Transporte: presupuestos rápidos y liquidaciones sin descuadres",
      description:
        "Presupuestos lentos, precios que varían y liquidaciones a mano. Analizamos tu operativa de transporte y aplicamos mejoras para cerrar más servicios con menos administración.",
    },
  },
  {
    slug: "comercios",
    name: "Comercios",
    shortName: "Comercios",
    intro:
      "El comercio con tienda y venta online vive con dos verdades sobre el mismo stock. Mientras no cuadren, se vende lo que no hay y se guarda lo que no se vende.",
    problems: [
      "El stock de la tienda no coincide con el de la web.",
      "Fichas de producto que se escriben dos veces, una por canal.",
      "Pedidos online gestionados a mano, con el consiguiente retraso en avisar al cliente.",
      "Devoluciones sin proceso claro: cada una se resuelve distinto.",
      "Clientes que compraron una vez y de los que no queda ni el correo.",
    ],
    opportunities: [
      {
        title: "Un único inventario",
        body: "Vender sin stock cuesta una cancelación y una reseña; guardar stock que no rota cuesta dinero parado. Las dos cosas se arreglan con un solo recuento.",
      },
      {
        title: "Fichas escritas una vez",
        body: "Alta de producto en un sitio y publicación en los canales, con las mismas fotos y el mismo texto.",
      },
      {
        title: "Avisos automáticos de pedido",
        body: "Confirmación, preparación y envío. La mayoría de los «¿dónde está mi pedido?» desaparecen solos.",
      },
      {
        title: "Base de clientes propia",
        body: "Con permiso y una razón para volver: recomendaciones, recambios, temporada. Vender a quien ya te compró es lo más barato que hay.",
      },
    ],
    example: {
      title: "Dejar de vender lo que no hay",
      workings:
        "Con 300 pedidos al mes y un 4 % cancelados por descuadre de stock son 12 cancelaciones. A 45 € de ticket medio, 540 € de facturación perdida al mes, más el tiempo de gestionar cada cancelación y el efecto en la reputación, que no se calcula aquí. Con un único inventario, dejar esas cancelaciones en 3 al mes es una hipótesis prudente.",
      assumptions: [
        "El porcentaje de cancelaciones por stock se saca del histórico real de pedidos.",
        "Bajar de 12 a 3 cancelaciones es una hipótesis de trabajo, no una media del sector.",
        "El ticket medio es de ejemplo.",
        "No se cuentan los clientes que no vuelven tras una cancelación: eso se mide aparte.",
      ],
      compare: {
        unit: "count",
        label: "Pedidos cancelados por descuadre de stock, al mes",
        now: { label: "Hoy", value: 12 },
        better: { label: "Con un único inventario", value: 3 },
      },
      stats: [
        { label: "Cancelaciones por stock", value: 4, unit: "percent" },
        { label: "Ticket medio", value: 45, unit: "eur" },
        { label: "Facturación perdida al mes", value: 540, unit: "eur" },
      ],
    },
    faq: [
      {
        id: "comercios-plataforma",
        question: "¿Tengo que rehacer la tienda online?",
        answer:
          "Normalmente no. Primero se comprueba si la plataforma actual permite sincronizar stock y pedidos; rehacerla es la última opción, no la primera.",
      },
    ],
    seo: {
      title: "Mejoras para comercios: stock que cuadra entre tienda y web",
      description:
        "Inventario descuadrado, fichas duplicadas y pedidos gestionados a mano. Revisamos tu operativa de comercio y aplicamos mejoras para vender sin cancelaciones.",
    },
  },
  {
    slug: "servicios-profesionales",
    name: "Servicios profesionales",
    shortName: "Servicios profesionales",
    intro:
      "Asesorías, despachos y consultoras venden horas de gente cualificada y las gastan persiguiendo documentación y tecleando facturas. Cada hora que se va en eso es una hora que no se factura ni se dedica a asesorar.",
    problems: [
      "Perseguir documentación de clientes por correo y WhatsApp todos los meses.",
      "Entrada manual de facturas en el programa de contabilidad.",
      "Horas que se apuntan tarde y mal, o que directamente no se apuntan.",
      "Presupuestos y propuestas que se escriben desde cero cada vez.",
      "No se sabe qué cliente deja margen y cuál consume el doble de horas de las presupuestadas.",
    ],
    opportunities: [
      {
        title: "Recogida de documentación con recordatorio",
        body: "Un sitio donde el cliente sube lo suyo y un aviso automático cuando falta. Se acaba la persecución mensual.",
      },
      {
        title: "Menos tecleo en la entrada de facturas",
        body: "Lectura automática y revisión humana solo de lo dudoso. El criterio sigue siendo vuestro; el tecleo, no.",
      },
      {
        title: "Horas y rentabilidad por cliente",
        body: "Con las horas reales delante se renegocia la cuota o se ajusta el alcance, en vez de asumir la diferencia.",
      },
      {
        title: "Propuestas con plantilla propia",
        body: "Mismo formato, mismos textos y mismos precios. Se escriben en minutos y se dejan de enviar descuadradas.",
      },
    ],
    example: {
      title: "Quitar tecleo de la entrada de facturas",
      workings:
        "500 facturas al mes a 2 minutos de tecleo son 16,7 horas. Si se automatiza el 70 % y el resto sigue revisándose a mano, quedan 5 horas: casi 12 horas al mes. A un coste interno de 22 €/hora, 257 € al mes, y sobre todo 12 horas que vuelven al trabajo que sí se factura.",
      assumptions: [
        "El tiempo por factura y el volumen se miden antes, durante una o dos semanas.",
        "El 70 % automatizable depende de la calidad de los documentos que mandan los clientes.",
        "El coste por hora es un coste interno de ejemplo, no una tarifa de venta.",
      ],
      compare: {
        unit: "hours",
        label: "Horas mensuales de entrada de facturas",
        now: { label: "Con tecleo manual", value: 16.7 },
        better: { label: "Con el 70 % automatizado", value: 5 },
      },
      stats: [
        { label: "Facturas al mes", value: 500, unit: "count" },
        { label: "Parte automatizable", value: 70, unit: "percent" },
        { label: "Coste interno por hora", value: 22, unit: "eur" },
      ],
    },
    faq: [
      {
        id: "profesionales-programa",
        question: "¿Funciona con el programa de contabilidad que usamos?",
        answer:
          "Se comprueba antes: la mayoría permite importar asientos o facturas en algún formato. Si el vuestro no lo permite, se dice y se busca otra mejora con mejor relación impacto-esfuerzo.",
      },
      {
        id: "profesionales-secreto",
        question: "¿Y la confidencialidad de los expedientes?",
        answer:
          "Se trabaja con el mínimo acceso necesario, con acuerdo de confidencialidad y, cuando toca, con encargado de tratamiento. No sacamos documentación del cliente para probar nada.",
      },
    ],
    seo: {
      title: "Mejoras para asesorías y despachos: menos tecleo, más horas facturables",
      description:
        "Documentación que hay que perseguir, facturas que se teclean una a una y clientes que consumen más horas de las presupuestadas. Analizamos tu despacho y aplicamos mejoras medibles.",
    },
  },
  {
    slug: "pymes-con-equipo-administrativo",
    name: "Pymes con equipo administrativo",
    shortName: "Pymes con administración",
    intro:
      "Hay una persona —o dos— que sostienen la empresa por dentro: facturas, albaranes, correos, informes, cuadres. Funciona hasta que esa persona se va de vacaciones. Lo que hay debajo no es desorganización, es un proceso que nunca se escribió.",
    problems: [
      "Datos que se copian de un sistema a otro varias veces al día.",
      "Informes que se montan a mano cada semana para mirarlos cinco minutos.",
      "Procesos que solo conoce una persona.",
      "Correos importantes que se pierden entre los que no lo son.",
      "Cuadres y comprobaciones manuales al cierre de cada mes.",
    ],
    opportunities: [
      {
        title: "Medir antes de tocar",
        body: "Dos semanas de registro bastan para saber qué tarea se lleva las horas. Casi nunca es la que todo el mundo creía.",
      },
      {
        title: "Quitar la copia entre sistemas",
        body: "Lo que es copiar y comprobar lo hace un sistema; lo que exige criterio sigue en manos de la persona, con mejor información y menos ruido.",
      },
      {
        title: "Informes que se generan solos",
        body: "Los mismos números, a la misma hora, sin montarlos. Y si nadie los mira, dejar de hacerlos también es una mejora.",
      },
      {
        title: "Procedimientos escritos",
        body: "Lo justo para que el trabajo no se pare cuando falta quien lo hace siempre.",
      },
    ],
    example: {
      title: "Una tarea diaria que nadie había contado",
      workings:
        "20 minutos al día, 5 días a la semana, 46 semanas al año son 76,7 horas: casi dos semanas de trabajo de una persona. A 22 €/hora de coste interno, 1.687 € al año en una sola tarea de las que nadie menciona en una reunión. Automatizar el 70 % la deja en 23 horas.",
      assumptions: [
        "46 semanas descuenta vacaciones y festivos.",
        "El coste por hora es interno y de ejemplo; con el tuyo cambia el resultado.",
        "Automatizar rara vez quita el 100 %: queda una parte de revisión.",
      ],
      compare: {
        unit: "hours",
        label: "Horas al año en esa sola tarea",
        now: { label: "Hoy", value: 76.7 },
        better: { label: "Automatizando el 70 %", value: 23 },
      },
      stats: [
        { label: "Minutos al día", value: 20, unit: "count" },
        { label: "Coste interno por hora", value: 22, unit: "eur" },
        { label: "Coste al año", value: 1687, unit: "eur" },
      ],
    },
    faq: [
      {
        id: "pymes-equipo",
        question: "¿Mi equipo se va a sentir vigilado?",
        answer:
          "Se mide el proceso, no a las personas, y se mide con ellas: son quienes saben dónde está el atasco. Cuando el resultado es que dejan de hacer la parte más tediosa, suelen ser los primeros aliados.",
      },
      {
        id: "pymes-inversion",
        question: "¿Cuánto hay que invertir para empezar?",
        answer:
          "El primer paso es una conversación de veinte minutos y, si tiene sentido, un diagnóstico acotado. Lo que cuesta cada mejora se presenta con su impacto estimado al lado, para que la decisión sea tuya y con números.",
      },
    ],
    seo: {
      title: "Mejoras para pymes con equipo administrativo: menos trabajo repetido",
      description:
        "Datos que se copian a mano, informes que nadie lee y procesos que solo conoce una persona. Medimos dónde se van las horas de tu administración y aplicamos mejoras concretas.",
    },
  },
];

export const sectorBySlug = (slug: string): Sector | undefined =>
  sectors.find((sector) => sector.slug === slug);
