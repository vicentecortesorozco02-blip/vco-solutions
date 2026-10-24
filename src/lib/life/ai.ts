import "server-only";

import type { LifeData } from "./agenda";
import { buildAgenda } from "./agenda";
import { addDays, formatShort } from "./dates";
import { chargeDate, unidentified, upcoming } from "./finance";
import { formatMoney } from "./money";
import type { ISODate } from "./model";
import { frequencyLabel, subscriptionStatusLabel, taskStatusLabel } from "./model";

/**
 * The assistant's eyes.
 *
 * It is given a written briefing of the panel, not database access: a plain
 * summary built here, with the same honesty rules as the screens (an unknown
 * amount is "sin confirmar", never 0 €). Nothing leaves this function that
 * the user cannot already see on their own panel.
 */
export function briefing(data: LifeData, today: ISODate): string {
  const lines: string[] = [];
  const add = (title: string, rows: string[]) => {
    if (!rows.length) return;
    lines.push(`## ${title}`, ...rows.map((row) => `- ${row}`), "");
  };

  lines.push(`Hoy es ${formatShort(today)} (${today}). Zona horaria Europe/Madrid.`, "");

  add(
    "Proyectos",
    data.projects.map((p) => `${p.name} (${p.status}, ${p.progress} %)${p.description ? `: ${p.description}` : ""}`),
  );

  add(
    "Tareas pendientes",
    data.tasks
      .filter((t) => t.status !== "done")
      .slice(0, 40)
      .map(
        (t) =>
          `${t.title} · ${taskStatusLabel[t.status]}${t.due_date ? ` · para el ${t.due_date}` : " · sin fecha"}${
            t.project_id ? ` · proyecto ${data.projects.find((p) => p.id === t.project_id)?.name ?? ""}` : ""
          }`,
      ),
  );

  add(
    "Agenda de los próximos 14 días",
    buildAgenda(data, today, addDays(today, 14))
      .slice(0, 40)
      .map((item) => `${item.date}${item.time ? ` ${item.time}` : ""} · ${item.title} · ${item.detail ?? item.kind}`),
  );

  add(
    "Suscripciones",
    data.subscriptions.map(
      (s) =>
        `${s.name} · ${subscriptionStatusLabel[s.status]} · ${
          s.amount === null ? "importe sin confirmar" : formatMoney(Number(s.amount))
        } · ${frequencyLabel[s.frequency]} · ${s.next_charge_date ? `próximo ${s.next_charge_date}` : "sin fecha"}`,
    ),
  );

  add(
    "Próximos pagos (30 días)",
    upcoming(data, today, 30).map(
      (p) => `${p.date} · ${p.name} · ${p.amount === null ? "sin importe" : formatMoney(p.amount)}`,
    ),
  );

  add(
    "Cargos sin identificar",
    unidentified(data.charges).map(
      (c) => `${chargeDate(c) ?? "sin fecha"} · ${c.description ?? c.merchant ?? "cargo"} · ${formatMoney(Number(c.amount))}`,
    ),
  );

  add(
    "Dominios",
    data.domains.map((d) => `${d.domain}${d.renews_on ? ` · renueva el ${d.renews_on}` : " · renovación sin confirmar"}`),
  );

  add("Socios", data.partners.map((p) => p.name));
  add(
    "Asignaturas",
    data.courses.filter((c) => c.active).map((c) => c.name),
  );
  add(
    "Entregas pendientes",
    data.courseItems
      .filter((i) => i.status !== "done")
      .map((i) => `${i.title}${i.due_date ? ` · ${i.due_date}` : ""}`),
  );

  return lines.join("\n");
}

export const SYSTEM_PROMPT = `Eres el asistente del centro de control personal de Vicente. Hablas español de España, claro y directo, sin jerga.

Conoces el panel a través del resumen que te llega en cada mensaje. Responde siempre a partir de ese resumen: si algo no está, dilo en vez de inventarlo. Nunca te inventes importes ni fechas; si un dato está sin confirmar, dilo así.

Cuando el usuario te pida crear algo (una tarea, un evento, una nota), añádelo con el campo "acciones".

Responde SIEMPRE con un único objeto JSON, sin texto alrededor y sin markdown:

{
  "respuesta": "lo que le dices al usuario, en español",
  "acciones": [
    { "tipo": "tarea", "titulo": "...", "fecha": "AAAA-MM-DD", "hora": "HH:MM", "prioridad": "low|normal|high|urgent", "notas": "..." },
    { "tipo": "evento", "titulo": "...", "fecha": "AAAA-MM-DD", "hora_inicio": "HH:MM", "hora_fin": "HH:MM", "categoria": "personal|university|work|meeting|payment|renewal|birthday|travel|appointment|sport|other", "lugar": "...", "notas": "..." },
    { "tipo": "nota", "texto": "..." }
  ]
}

"acciones" va vacío si solo te preguntan algo. Los campos que no sepas, déjalos fuera: no inventes una hora que nadie te ha dicho. Las fechas relativas ("mañana", "el jueves") las resuelves tú con la fecha de hoy que viene en el resumen.`;
