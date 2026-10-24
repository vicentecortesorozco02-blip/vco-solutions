/**
 * La aritmética de «una pequeña mejora puede cambiar mucho».
 *
 * Vive aparte de la interfaz porque es lo único de esta web que podría estar
 * mal sin que se note: un número bonito y falso hace más daño que no poner
 * ninguno. Está cubierta por pruebas y no inventa nada — el visitante pone
 * sus datos y aquí solo se multiplica.
 *
 * Cuatro magnitudes que no se mezclan nunca:
 *
 *   facturación  lo que entra de más. No es dinero ganado.
 *   ahorro       coste que deja de pagarse.
 *   beneficio    lo que queda después del margen o del coste.
 *   retorno      cuánto tarda en pagarse una inversión y qué deja al año.
 */

/** Semanas trabajadas al año: 52 menos vacaciones y festivos. */
export const WORKING_WEEKS = 46;

export type ScenarioKey = "conversion" | "recovery" | "hours" | "repeat" | "costs" | "roi";

/** Qué clase de dinero es cada cifra. La interfaz lo escribe al lado. */
export type AmountKind = "revenue" | "saving" | "profit" | "time" | "ratio";

export interface ScenarioInput {
  key: string;
  label: string;
  /** Unidad escrita a la derecha del campo: «€», «%», «min»… */
  unit?: string;
  min: number;
  max: number;
  step: number;
  initial: number;
  /** Nota corta bajo el campo. Solo cuando aclara algo de verdad. */
  hint?: string;
}

export interface ResultLine {
  label: string;
  value: number;
  kind: AmountKind;
  /** Lo que significa la cifra, en una frase. */
  note?: string;
}

/** Las dos barras de la figura: cómo está hoy y cómo quedaría. */
export interface Comparison {
  caption: string;
  unit: AmountKind;
  now: { label: string; value: number };
  better: { label: string; value: number };
}

export interface ScenarioResult {
  /** La cifra grande. */
  headline: ResultLine;
  lines: ResultLine[];
  /** La cuenta, escrita: se enseña siempre bajo el resultado. */
  workings: string;
  /** Lo mismo en dos barras, cuando hay un antes y un después que comparar. */
  compare?: Comparison;
  /** Null cuando los datos no permiten calcular (p. ej. objetivo por debajo). */
  warning: string | null;
}

export interface Scenario {
  key: ScenarioKey;
  /** Nombre corto para la pestaña. */
  tab: string;
  title: string;
  /** La pregunta que responde, en voz del visitante. */
  question: string;
  inputs: ScenarioInput[];
  compute: (values: Record<string, number>) => ScenarioResult;
}

const round = (value: number) => Math.round(value * 100) / 100;

const eur = (value: number) =>
  new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
    // En español 1500 no se agrupa por defecto; en un importe sí se quiere.
    useGrouping: "always",
  }).format(
    Math.round(value),
  );

const num = (value: number, decimals = 0) =>
  new Intl.NumberFormat("es-ES", { maximumFractionDigits: decimals, useGrouping: "always" }).format(
    value,
  );

export const scenarios: Scenario[] = [
  {
    key: "conversion",
    tab: "Conversión",
    title: "Convertir mejor lo que ya entra",
    question: "¿Qué pasa si cierro unas pocas oportunidades más de las que ya me llegan?",
    inputs: [
      { key: "leads", label: "Oportunidades al mes", min: 5, max: 1000, step: 5, initial: 100, hint: "Peticiones, llamadas o formularios que entran" },
      { key: "current", label: "Conversión actual", unit: "%", min: 1, max: 95, step: 1, initial: 20 },
      { key: "target", label: "Conversión objetivo", unit: "%", min: 1, max: 95, step: 1, initial: 25 },
      { key: "ticket", label: "Ticket medio", unit: "€", min: 10, max: 20000, step: 10, initial: 300 },
      { key: "margin", label: "Margen bruto", unit: "%", min: 1, max: 95, step: 1, initial: 40, hint: "Lo que queda de cada venta antes de gastos fijos" },
    ],
    compute: ({ leads, current, target, ticket, margin }) => {
      const extraSales = (leads * (target - current)) / 100;
      const revenue = extraSales * ticket;
      return {
        headline: { label: "Facturación adicional al mes", value: round(revenue), kind: "revenue" },
        compare: {
          caption: "Facturación al mes",
          unit: "revenue",
          now: { label: `Hoy, al ${num(current)} %`, value: round((leads * current * ticket) / 100) },
          better: { label: `Al ${num(target)} %`, value: round((leads * target * ticket) / 100) },
        },
        lines: [
          { label: "Ventas de más al mes", value: round(extraSales), kind: "ratio", note: "con las mismas oportunidades" },
          { label: "Facturación adicional al año", value: round(revenue * 12), kind: "revenue" },
          { label: "Beneficio bruto adicional al año", value: round((revenue * 12 * margin) / 100), kind: "profit", note: "aplicando tu margen" },
        ],
        workings: `${num(leads)} oportunidades × (${num(target)} % − ${num(current)} %) = ${num(extraSales, 1)} ventas más al mes. × ${eur(ticket)} de ticket medio = ${eur(revenue)} al mes, ${eur(revenue * 12)} al año. Con un margen del ${num(margin)} %, el beneficio bruto adicional es ${eur((revenue * 12 * margin) / 100)} al año.`,
        warning:
          target <= current
            ? "Pon un objetivo por encima de tu conversión actual para ver la diferencia."
            : null,
      };
    },
  },
  {
    key: "recovery",
    tab: "Recuperación",
    title: "Recuperar oportunidades paradas",
    question: "¿Cuánto hay en los presupuestos abiertos que nadie ha vuelto a tocar?",
    inputs: [
      { key: "open", label: "Presupuestos o peticiones sin respuesta", min: 1, max: 2000, step: 1, initial: 40 },
      { key: "rate", label: "Que se recuperan con seguimiento", unit: "%", min: 1, max: 60, step: 1, initial: 10, hint: "Hipótesis prudente: el resto ya estaba perdido" },
      { key: "ticket", label: "Importe medio", unit: "€", min: 10, max: 50000, step: 10, initial: 600 },
      { key: "margin", label: "Margen bruto", unit: "%", min: 1, max: 95, step: 1, initial: 40 },
    ],
    compute: ({ open, rate, ticket, margin }) => {
      const recovered = (open * rate) / 100;
      const revenue = recovered * ticket;
      return {
        headline: { label: "Facturación recuperable", value: round(revenue), kind: "revenue" },
        lines: [
          { label: "Operaciones recuperadas", value: round(recovered), kind: "ratio" },
          { label: "Beneficio bruto", value: round((revenue * margin) / 100), kind: "profit" },
        ],
        workings: `${num(open)} operaciones paradas × ${num(rate)} % recuperadas = ${num(recovered, 1)}. × ${eur(ticket)} de importe medio = ${eur(revenue)} de facturación. Con un margen del ${num(margin)} %, quedan ${eur((revenue * margin) / 100)} de beneficio bruto. Es un cálculo de una sola vez sobre lo que ya tienes, no un ingreso recurrente.`,
        warning: null,
      };
    },
  },
  {
    key: "hours",
    tab: "Horas",
    title: "Horas que vuelven al equipo",
    question: "¿Cuánto cuesta al año una tarea que hacemos a mano?",
    inputs: [
      { key: "minutes", label: "Minutos cada vez", unit: "min", min: 1, max: 240, step: 1, initial: 12 },
      { key: "times", label: "Veces por semana", min: 1, max: 300, step: 1, initial: 25 },
      { key: "people", label: "Personas que lo hacen", min: 1, max: 30, step: 1, initial: 1 },
      { key: "rate", label: "Coste por hora", unit: "€", min: 8, max: 150, step: 1, initial: 22, hint: "Coste interno con cargas, no la tarifa de venta" },
      { key: "share", label: "Parte que se puede automatizar", unit: "%", min: 10, max: 100, step: 5, initial: 70, hint: "Casi nunca es el 100 %: queda revisión" },
    ],
    compute: ({ minutes, times, people, rate, share }) => {
      const hoursWeek = (minutes * times * people) / 60;
      const hoursYear = hoursWeek * WORKING_WEEKS;
      const savedHours = (hoursYear * share) / 100;
      return {
        headline: { label: "Horas que se recuperan al año", value: round(savedHours), kind: "time" },
        compare: {
          caption: "Horas al año en esa tarea",
          unit: "time",
          now: { label: "Hoy", value: round(hoursYear) },
          better: { label: "Después de automatizar", value: round(hoursYear - savedHours) },
        },
        lines: [
          { label: "Horas al mes dedicadas hoy", value: round((hoursYear / 12)), kind: "time" },
          { label: "Ahorro de coste al año", value: round((savedHours * rate)), kind: "saving", note: "coste interno, no facturación" },
          { label: "Equivale a jornadas de 8 h", value: round(savedHours / 8), kind: "ratio" },
        ],
        workings: `${num(minutes)} min × ${num(times)} veces × ${num(people)} persona(s) ÷ 60 = ${num(hoursWeek, 1)} h a la semana. × ${WORKING_WEEKS} semanas trabajadas = ${num(hoursYear, 1)} h al año. Si se automatiza el ${num(share)} %, se recuperan ${num(savedHours, 1)} h, que a ${eur(rate)} por hora de coste interno son ${eur(savedHours * rate)} al año.`,
        warning: null,
      };
    },
  },
  {
    key: "repeat",
    tab: "Recurrencia",
    title: "Que el cliente vuelva una vez más",
    question: "¿Cuánto vale que cada cliente compre una vez más al año?",
    inputs: [
      { key: "customers", label: "Clientes activos", min: 5, max: 10000, step: 5, initial: 200 },
      { key: "current", label: "Compras al año ahora", min: 1, max: 52, step: 1, initial: 2 },
      { key: "target", label: "Compras al año objetivo", min: 1, max: 52, step: 1, initial: 3 },
      { key: "ticket", label: "Ticket medio", unit: "€", min: 10, max: 5000, step: 10, initial: 120 },
      { key: "margin", label: "Margen bruto", unit: "%", min: 1, max: 95, step: 1, initial: 40 },
    ],
    compute: ({ customers, current, target, ticket, margin }) => {
      const extraPurchases = customers * (target - current);
      const revenue = extraPurchases * ticket;
      return {
        headline: { label: "Facturación adicional al año", value: round(revenue), kind: "revenue" },
        compare: {
          caption: "Facturación al año de tus clientes actuales",
          unit: "revenue",
          now: { label: `${num(current)} compras al año`, value: round(customers * current * ticket) },
          better: { label: `${num(target)} compras al año`, value: round(customers * target * ticket) },
        },
        lines: [
          { label: "Compras de más al año", value: round(extraPurchases), kind: "ratio" },
          { label: "Beneficio bruto adicional", value: round((revenue * margin) / 100), kind: "profit" },
          { label: "Por cliente y año", value: round((target - current) * ticket), kind: "revenue" },
        ],
        workings: `${num(customers)} clientes × (${num(target)} − ${num(current)}) compras = ${num(extraPurchases)} compras más al año. × ${eur(ticket)} = ${eur(revenue)} de facturación, ${eur((revenue * margin) / 100)} de beneficio bruto con un margen del ${num(margin)} %. Vender a quien ya te compró no cuesta captación, pero sí esfuerzo: eso no está descontado aquí.`,
        warning:
          target <= current ? "Pon un objetivo por encima de las compras actuales." : null,
      };
    },
  },
  {
    key: "costs",
    tab: "Costes",
    title: "Gasto fijo que deja de pagarse",
    question: "¿Cuánto hay en gastos que nadie ha revisado este año?",
    inputs: [
      { key: "monthly", label: "Gasto fijo mensual revisado", unit: "€", min: 50, max: 50000, step: 50, initial: 1200, hint: "Suscripciones, servicios, tarifas, licencias" },
      { key: "share", label: "Parte que se puede eliminar o renegociar", unit: "%", min: 1, max: 60, step: 1, initial: 12 },
    ],
    compute: ({ monthly, share }) => {
      const monthlySaving = (monthly * share) / 100;
      return {
        headline: { label: "Ahorro al año", value: round(monthlySaving * 12), kind: "saving" },
        compare: {
          caption: "Gasto fijo al año",
          unit: "saving",
          now: { label: "Hoy", value: round(monthly * 12) },
          better: { label: "Después de revisarlo", value: round((monthly - monthlySaving) * 12) },
        },
        lines: [
          { label: "Ahorro al mes", value: round(monthlySaving), kind: "saving" },
          { label: "Gasto que seguiría pagándose", value: round((monthly - monthlySaving) * 12), kind: "saving", note: "al año" },
        ],
        workings: `${eur(monthly)} al mes × ${num(share)} % = ${eur(monthlySaving)} al mes, ${eur(monthlySaving * 12)} al año. Un ahorro va directo al resultado: no hay que descontarle margen, a diferencia de la facturación.`,
        warning: null,
      };
    },
  },
  {
    key: "roi",
    tab: "Retorno",
    title: "Cuándo se paga una mejora",
    question: "¿En cuánto tiempo recupero lo que invierta?",
    inputs: [
      { key: "invest", label: "Inversión inicial", unit: "€", min: 100, max: 100000, step: 100, initial: 3000 },
      { key: "recurring", label: "Coste recurrente al mes", unit: "€", min: 0, max: 5000, step: 10, initial: 60, hint: "Licencias, mantenimiento, servicios" },
      { key: "benefit", label: "Beneficio o ahorro mensual esperado", unit: "€", min: 0, max: 50000, step: 50, initial: 600 },
    ],
    compute: ({ invest, recurring, benefit }) => {
      const net = benefit - recurring;
      const payback = net > 0 ? invest / net : Infinity;
      const yearOne = net * 12 - invest;
      return {
        headline: {
          label: "Meses hasta recuperar la inversión",
          value: net > 0 ? round(payback) : 0,
          kind: "ratio",
        },
        lines: [
          { label: "Resultado neto al mes", value: round(net), kind: "profit", note: "beneficio menos coste recurrente" },
          { label: "Resultado del primer año", value: round(yearOne), kind: "profit", note: "ya descontada la inversión" },
          {
            label: "Retorno sobre la inversión a 12 meses",
            value: invest > 0 ? round((yearOne / invest) * 100) : 0,
            kind: "ratio",
            note: "en porcentaje",
          },
        ],
        workings:
          net > 0
            ? `${eur(benefit)} de beneficio mensual − ${eur(recurring)} de coste recurrente = ${eur(net)} netos al mes. ${eur(invest)} ÷ ${eur(net)} = ${num(payback, 1)} meses para recuperar la inversión. Al cabo de 12 meses: ${eur(net * 12)} − ${eur(invest)} = ${eur(yearOne)}.`
            : `Con ${eur(benefit)} de beneficio mensual y ${eur(recurring)} de coste recurrente no queda nada neto: así la inversión no se recupera. Es una respuesta tan válida como la otra, y conviene saberla antes de gastar.`,
        warning: net <= 0 ? "Con estos números la mejora no se paga sola." : null,
      };
    },
  },
];

export const scenarioByKey = (key: string): Scenario | undefined =>
  scenarios.find((scenario) => scenario.key === key);

/** Valores de partida de un escenario. */
export const initialValues = (scenario: Scenario): Record<string, number> =>
  Object.fromEntries(scenario.inputs.map((input) => [input.key, input.initial]));
