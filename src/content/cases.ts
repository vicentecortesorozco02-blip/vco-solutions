import type { CaseStudy, CaseSummary } from "./types";

/**
 * Cases.
 *
 * IMPORTANT — credibility rule.
 * Three kinds, and the UI says which one every entry is:
 *
 *  - `product`: software we built and run for our own business. Real and
 *    deployed, but not a client engagement. Its figures are facts about the
 *    system (what it does, what it counts), never savings we have not measured.
 *  - `demonstration`: a worked example. Figures are arithmetic from stated
 *    assumptions, shown in `workings` so the reader can check them.
 *  - `project`: a delivered client engagement, with consent. There are none
 *    yet. When there are, fill `results[].source` with how each figure was
 *    measured.
 */
export const cases: CaseStudy[] = [
  {
    slug: "yourhotelweb",
    order: 5,
    published: true,
    kind: "product",
    name: "YourHotelWeb",
    sector: "Producto propio · Webs para hoteles",
    title: "La web, el CRM y los cobros en un solo sistema",
    excerpt:
      "Nuestro propio negocio de webs para hoteles. Lo construimos entero: la web que capta, el CRM que vende y la propuesta que el hotel acepta y paga.",
    url: "https://yourhotelweb.vercel.app",
    headline: {
      label: "Web pública, CRM, propuestas, cobros y facturas",
      value: "1 sistema",
      provenance: "measured",
      source: "Una sola aplicación desplegada en Vercel, con los datos en Supabase.",
    },
    cover: {
      src: "/trabajos/yourhotelweb/crm-hoy.jpg",
      alt: "CRM de YourHotelWeb, pantalla Hoy: contadores de prospectos, leads y respuestas, próximas acciones y últimos leads.",
      caption: "CRM, pantalla «Hoy». Datos de ejemplo.",
      device: "laptop",
    },
    situation:
      "YourHotelWeb es un negocio nuestro: diseñamos webs para hoteles independientes. Vender una web a un hotel tiene muchos pasos: encontrarlo, entender qué falla en su web actual, contactar, enseñarle algo, enviar una propuesta, cobrar en dos plazos y facturar. Hecho a mano, cada paso vive en un programa distinto y el seguimiento depende de que alguien se acuerde. Antes de ofrecer a nadie un sistema así, lo construimos para nosotros.",
    process: {
      before: {
        title: "Sin sistema",
        summary: "Cada paso a mano, cada dato en un programa distinto.",
        steps: [
          { id: "b1", label: "Buscar hoteles uno a uno", actor: "person" },
          { id: "b2", label: "Copiar sus datos a una hoja", actor: "person" },
          { id: "b3", label: "Escribir cada correo desde cero", actor: "person" },
          { id: "b4", label: "Montar la propuesta en un documento", actor: "person" },
          { id: "b5", label: "Perseguir el pago", actor: "person" },
          { id: "b6", label: "Hacer la factura a mano", actor: "person" },
        ],
      },
      after: {
        title: "Con YourHotelWeb",
        summary: "Una persona decide. El sistema prepara, registra y factura.",
        steps: [
          { id: "a1", label: "Hotel añadido o importado", actor: "trigger" },
          { id: "a2", label: "Auditoría de su web y ficha", actor: "system" },
          { id: "a3", label: "Correo revisado y enviado", actor: "person", note: "nada sale sin revisar" },
          { id: "a4", label: "Propuesta online con seguimiento", actor: "system" },
          { id: "a5", label: "Cliente, proyecto y factura", actor: "outcome" },
        ],
      },
    },
    solution: {
      title: "Qué construimos",
      body: "Una sola aplicación con tres caras. La web pública capta hoteles con una auditoría gratuita de su web y cuatro webs de ejemplo navegables. El CRM lleva cada hotel desde que es un nombre en una lista hasta que es cliente, y dice cada mañana qué toca hacer. Y la propuesta es una página privada que el hotel abre, acepta y paga; el primer pago lo convierte en cliente con su proyecto y su factura.",
      components: [
        "Web pública en español e inglés",
        "Auditoría gratuita de la web del hotel",
        "Prospectos con importación sin duplicados",
        "Pipeline con próxima acción en cada hotel",
        "Correos con plantilla, siempre revisados antes de salir",
        "Propuesta online con visitas, aceptación y versiones",
        "Cobro en dos plazos con tarjeta o transferencia",
        "Facturas numeradas en PDF",
        "Finanzas: cobrado, pendiente e ingresos recurrentes",
        "Pantalla «Hoy» con lo que toca hacer",
      ],
    },
    results: [
      {
        label: "Correos que salen sin que una persona los revise",
        value: "0",
        provenance: "measured",
        source: "Regla del sistema: no se envía nada sin pulsar «enviar».",
      },
      {
        label: "Basta para que el sistema cree cliente, proyecto y factura de anticipo",
        value: "1",
        unit: "pago",
        provenance: "measured",
        source: "Así funciona el cobro en el CRM desplegado.",
      },
      {
        label: "Etapas del pipeline, de prospecto a ganado o perdido",
        value: "11",
        provenance: "measured",
        source: "Pipeline del CRM, tal como está desplegado.",
      },
      {
        label: "Webs de hotel de ejemplo, navegables",
        value: "4",
        provenance: "measured",
        source: "yourhotelweb.vercel.app, sección Trabajos.",
      },
    ],
    workings:
      "Aquí no hay horas ahorradas porque todavía no se han medido: el sistema está recién desplegado. Lo que sí se puede comprobar es lo que hace. La web pública está en producción, y las capturas del CRM y de la propuesta son del propio sistema, con datos de ejemplo.",
    gallery: [
      {
        src: "/trabajos/yourhotelweb/web-desktop.jpg",
        alt: "Página de inicio de YourHotelWeb: titular «Tu hotel merece una web mejor» y una web de hotel en un portátil.",
        caption: "La web pública, en producción.",
        device: "laptop",
      },
      {
        src: "/trabajos/yourhotelweb/web-mobile.jpg",
        alt: "Página de inicio de YourHotelWeb en un móvil.",
        caption: "La web pública en el móvil.",
        device: "phone",
      },
      {
        src: "/trabajos/yourhotelweb/demo-boutique.jpg",
        alt: "Web de ejemplo de un hotel boutique ficticio, Casa Marès: foto del puerto y el nombre del hotel en grande.",
        caption: "Una de las cuatro webs de hotel de ejemplo. Hotel ficticio.",
        device: "laptop",
      },
      {
        src: "/trabajos/yourhotelweb/crm-pipeline.jpg",
        alt: "Pipeline del CRM con columnas por etapa y tarjetas de hotel con su próxima acción.",
        caption: "Pipeline. Datos de ejemplo.",
        device: "laptop",
      },
      {
        src: "/trabajos/yourhotelweb/crm-finanzas.jpg",
        alt: "Pantalla de finanzas: ingresos del mes, ingresos recurrentes, valor medio por proyecto y pendiente de cobro.",
        caption: "Finanzas. Datos de ejemplo.",
        device: "laptop",
      },
    ],
    seo: {
      title: "YourHotelWeb: web, CRM y cobros en un solo sistema",
      description:
        "Nuestro propio producto: la web que capta hoteles, el CRM que los acompaña hasta cliente y la propuesta que aceptan y pagan online.",
    },
  },
  {
    slug: "presupuestos-por-correo",
    order: 10,
    published: true,
    kind: "demonstration",
    sector: "Distribución e instalación",
    title: "Presupuestos que se preparan solos",
    excerpt:
      "Una solicitud por correo se convierte en un presupuesto calculado, maquetado y listo para enviar.",
    headline: {
      label: "Tiempo de una persona por presupuesto",
      value: "25 min → 2 min",
      provenance: "illustrative",
    },
    situation:
      "El caso de partida es el más común que encontramos: las solicitudes llegan por correo, en texto libre, a veces con un PDF o una foto adjunta. El responsable técnico las interpreta, busca precios en una hoja de cálculo con varias pestañas, aplica descuentos por cliente, monta el documento en un procesador de texto y redacta la respuesta. Entre veinte y cuarenta minutos, y siempre a costa de interrumpir otra cosa.",
    process: {
      before: {
        title: "Hoy",
        summary: "25 minutos de la persona con más criterio, por cada solicitud.",
        steps: [
          { id: "b1", label: "Correo con la solicitud", actor: "trigger" },
          { id: "b2", label: "Lectura e interpretación", actor: "person", note: "5 min" },
          { id: "b3", label: "Búsqueda de tarifas", actor: "person", note: "6 min" },
          { id: "b4", label: "Cálculo y descuentos", actor: "person", note: "7 min" },
          { id: "b5", label: "Maquetación del PDF", actor: "person", note: "4 min" },
          { id: "b6", label: "Redacción y envío", actor: "person", note: "3 min" },
        ],
      },
      after: {
        title: "Con el sistema",
        summary: "2 minutos de revisión humana. El resto ocurre en segundos.",
        steps: [
          { id: "a1", label: "Correo con la solicitud", actor: "trigger" },
          { id: "a2", label: "Interpretación y cálculo", actor: "system", note: "segundos" },
          { id: "a3", label: "Revisión y aprobación", actor: "person", note: "2 min" },
          { id: "a4", label: "Presupuesto enviado y registrado", actor: "outcome" },
        ],
      },
    },
    solution: {
      title: "Qué se construye",
      body: "Un sistema que vigila el buzón de solicitudes, entiende qué se está pidiendo aunque venga redactado de cualquier manera, cruza las referencias con la lista de precios vigente, aplica las condiciones del cliente y genera el documento con el formato de la casa. La persona responsable recibe el presupuesto ya montado y decide: aprobar, corregir o descartar.",
      components: [
        "Conexión al buzón de solicitudes existente",
        "Interpretación de la solicitud, incluidos adjuntos y fotos",
        "Motor de tarifas conectado a la lista de precios real",
        "Reglas de descuento por cliente y por volumen",
        "Generación del PDF con la plantilla de la empresa",
        "Panel de revisión y aprobación",
        "Registro de solicitudes con estado y seguimiento",
      ],
    },
    results: [
      {
        label: "Tiempo por presupuesto",
        value: "25 → 2",
        unit: "min",
        provenance: "illustrative",
      },
      {
        label: "Con 30 solicitudes al mes",
        value: "11,5",
        unit: "h/mes",
        provenance: "illustrative",
      },
      {
        label: "Equivalente al año",
        value: "138",
        unit: "h/año",
        provenance: "illustrative",
      },
      {
        label: "Tiempo de respuesta al cliente",
        value: "Mismo día",
        provenance: "illustrative",
      },
    ],
    workings:
      "Cálculo: 30 solicitudes al mes × 23 minutos ahorrados = 690 minutos, es decir 11,5 horas al mes y 138 horas al año. Los minutos de partida son los de un proceso manual observado paso a paso; sustituye las cifras por las tuyas y el cálculo sigue siendo válido.",
    seo: {
      title: "Demostración: presupuestos automáticos por correo",
      description:
        "Cómo una solicitud por correo se convierte en un presupuesto calculado, maquetado y listo para enviar. Demostración con el cálculo a la vista.",
    },
  },

  {
    slug: "facturas-de-proveedor",
    order: 20,
    published: true,
    kind: "demonstration",
    sector: "Administración y compras",
    title: "Facturas de proveedor que se registran solas",
    excerpt:
      "Llegan por correo, se leen, se comprueban contra el pedido y se registran. A una persona solo le llega lo que no cuadra.",
    headline: {
      label: "Documentos que necesitan intervención humana",
      value: "100% → lo que falla",
      provenance: "illustrative",
    },
    situation:
      "Las facturas llegan por correo desde decenas de proveedores, cada una con su formato. Alguien las abre una por una, comprueba que el importe coincide con el pedido, introduce los datos en el programa de gestión, renombra el archivo y lo guarda en la carpeta del mes. Tres o cuatro minutos por factura que no producen nada: solo trasladan información de un sitio a otro.",
    process: {
      before: {
        title: "Hoy",
        summary: "Cada factura pasa por una persona, cuadre o no cuadre.",
        steps: [
          { id: "b1", label: "Factura por correo", actor: "trigger" },
          { id: "b2", label: "Apertura y lectura", actor: "person" },
          { id: "b3", label: "Comprobación contra pedido", actor: "person" },
          { id: "b4", label: "Introducción en el ERP", actor: "person" },
          { id: "b5", label: "Renombrado y archivo", actor: "person" },
        ],
      },
      after: {
        title: "Con el sistema",
        summary: "Solo se revisa lo que no supera las comprobaciones.",
        steps: [
          { id: "a1", label: "Factura por correo", actor: "trigger" },
          { id: "a2", label: "Extracción de datos", actor: "system" },
          { id: "a3", label: "Comprobación automática", actor: "system" },
          { id: "a4", label: "Registro y archivo", actor: "outcome" },
          { id: "a5", label: "Excepciones a revisión", actor: "person", note: "con el motivo" },
        ],
      },
    },
    solution: {
      title: "Qué se construye",
      body: "Un sistema que recoge las facturas del buzón, extrae proveedor, fecha, base, impuestos, total y número de documento, y las contrasta con el pedido correspondiente. Lo que cuadra se registra en el programa de gestión y se archiva con la convención de nombres de la casa. Lo que no cuadra aparece en una bandeja de revisión con el motivo señalado: importe distinto, proveedor desconocido, posible duplicado.",
      components: [
        "Recogida automática desde el buzón de facturas",
        "Lectura de documentos, incluidos escaneos y fotos",
        "Detección de duplicados",
        "Cotejo contra pedido y contra tarifa acordada",
        "Registro en el programa de gestión",
        "Archivo con nomenclatura consistente",
        "Bandeja de excepciones con el motivo del rechazo",
      ],
    },
    results: [
      {
        label: "Tiempo por factura",
        value: "3,5 → 0",
        unit: "min",
        provenance: "illustrative",
      },
      {
        label: "Con 400 facturas al mes",
        value: "23",
        unit: "h/mes",
        provenance: "illustrative",
      },
      {
        label: "Errores de transcripción",
        value: "Eliminados",
        provenance: "illustrative",
      },
      {
        label: "Duplicados",
        value: "Detectados antes de pagar",
        provenance: "illustrative",
      },
    ],
    workings:
      "Cálculo: 400 facturas al mes × 3,5 minutos = 1.400 minutos, unas 23 horas al mes. La revisión de excepciones consume una parte de ese tiempo; el ahorro real depende de qué porcentaje de facturas necesita intervención, que se mide en las primeras semanas.",
    seo: {
      title: "Demostración: registro automático de facturas de proveedor",
      description:
        "Facturas leídas, comprobadas contra el pedido y registradas automáticamente. Solo llega a una persona lo que no cuadra.",
    },
  },

  {
    slug: "informes-de-seguimiento",
    order: 30,
    published: true,
    kind: "demonstration",
    sector: "Dirección y operaciones",
    title: "El informe del lunes, hecho el domingo por la noche",
    excerpt:
      "Datos que hoy se recopilan a mano de cuatro sitios distintos, consolidados y enviados automáticamente.",
    headline: {
      label: "Preparación del informe semanal",
      value: "3 h → 0",
      provenance: "illustrative",
    },
    situation:
      "Cada lunes alguien dedica media mañana a lo mismo: exportar del ERP, abrir el CRM, copiar de una hoja de cálculo, cuadrar cifras que no coinciden, montar el resumen y enviarlo. Cuando llega a la reunión, los datos ya tienen unas horas. Y si esa persona está de baja, esa semana no hay informe.",
    process: {
      before: {
        title: "Hoy",
        summary: "Tres horas de trabajo manual antes de poder mirar un solo número.",
        steps: [
          { id: "b1", label: "Exportar del ERP", actor: "person" },
          { id: "b2", label: "Sacar datos del CRM", actor: "person" },
          { id: "b3", label: "Copiar de las hojas", actor: "person" },
          { id: "b4", label: "Cuadrar diferencias", actor: "person" },
          { id: "b5", label: "Montar y enviar", actor: "person" },
        ],
      },
      after: {
        title: "Con el sistema",
        summary: "El informe está listo antes de que nadie llegue a la oficina.",
        steps: [
          { id: "a1", label: "Se cumple la hora", actor: "trigger", note: "programado" },
          { id: "a2", label: "Recogida de todas las fuentes", actor: "system" },
          { id: "a3", label: "Consolidación y control de cuadre", actor: "system" },
          { id: "a4", label: "Informe enviado", actor: "outcome" },
        ],
      },
    },
    solution: {
      title: "Qué se construye",
      body: "Un proceso programado que se conecta a cada fuente, aplica las mismas reglas de consolidación que aplicaba la persona, comprueba que las cifras cuadran entre sí y distribuye el informe. Cuando algo no cuadra, no publica un número dudoso: avisa de qué fuente ha fallado y por qué.",
      components: [
        "Conexión a ERP, CRM y hojas de cálculo",
        "Reglas de consolidación documentadas",
        "Controles de cuadre entre fuentes",
        "Generación del informe en el formato de siempre",
        "Envío programado por correo",
        "Aviso cuando una fuente falla o no cuadra",
      ],
    },
    results: [
      {
        label: "Tiempo de preparación",
        value: "3 → 0",
        unit: "h/semana",
        provenance: "illustrative",
      },
      {
        label: "Equivalente al año",
        value: "138",
        unit: "h/año",
        provenance: "illustrative",
      },
      {
        label: "Antigüedad de los datos",
        value: "Horas → minutos",
        provenance: "illustrative",
      },
      {
        label: "Dependencia de una persona",
        value: "Eliminada",
        provenance: "illustrative",
      },
    ],
    workings:
      "Cálculo: 3 horas por semana × 46 semanas laborables = 138 horas al año. No incluye el tiempo de las reuniones que se retrasan esperando el informe.",
    seo: {
      title: "Demostración: informes de seguimiento automáticos",
      description:
        "Datos recopilados de varias fuentes, consolidados y enviados automáticamente. El informe deja de depender de que alguien tenga la mañana libre.",
    },
  },
];

export const publishedCases: CaseStudy[] = cases
  .filter((entry) => entry.published)
  .sort((a, b) => a.order - b.order);

export const caseSummaries: CaseSummary[] = publishedCases.map(
  ({ slug, title, sector, excerpt, kind, name, headline, cover, url, order, published }) => ({
    slug,
    name,
    title,
    sector,
    excerpt,
    kind,
    headline,
    cover,
    url,
    order,
    published,
  }),
);

export function getCase(slug: string): CaseStudy | undefined {
  return publishedCases.find((entry) => entry.slug === slug);
}

/**
 * The process shown end to end on the home page. Always a demonstration: it is
 * the one with the arithmetic printed underneath.
 */
export const featuredCase =
  publishedCases.find((entry) => entry.kind === "demonstration") ?? publishedCases[0];

/** Real software: our own products and, when there are any, client projects. */
export const realWork: CaseStudy[] = publishedCases.filter(
  (entry) => entry.kind !== "demonstration",
);

/** True while no client project has been published. Drives honest labelling. */
export const noClientProjects = !publishedCases.some((entry) => entry.kind === "project");
