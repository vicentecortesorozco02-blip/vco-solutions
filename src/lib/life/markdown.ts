import { buildAgenda, type AgendaItem, type LifeData } from "./agenda";
import { addDays, formatLong, formatShort, formatWithYear, relativeDay, shortTime } from "./dates";
import {
  buildPaymentPlan,
  isSpend,
  nextChargeView,
  paymentStateLabel,
  upcoming,
} from "./finance";
import { formatMoney } from "./money";
import type { Account, ISODate, Project, Subscription } from "./model";
import {
  accountKindLabel,
  courseItemKindLabel,
  frequencyLabel,
  priorityLabel,
  projectStatusLabel,
  subscriptionCategoryLabel,
  subscriptionStatusLabel,
  taskStatusLabel,
} from "./model";
import { partnerBalances, partnersOf, projectCharges, projectPaidBy } from "./partners";
import { monthlyCost } from "./recurrence";

/**
 * El panel, escrito en Markdown para Obsidian.
 *
 * Son notas de lectura: la verdad vive en la base y aquí se vuelca entera
 * cada vez. Lo único que viaja en sentido contrario son las notas que dejes
 * en `Inbox/`, que entran en la bandeja del panel.
 *
 * Las mismas reglas que en pantalla: un importe que no se sabe se escribe
 * «pendiente de confirmar», nunca 0 €, y una fecha sin frecuencia no se
 * convierte en una serie inventada.
 */

export interface VaultFile {
  /** Ruta dentro de la carpeta del panel, con «/» siempre. */
  path: string;
  content: string;
}

/** La carpeta que el panel escribe dentro del vault. */
export const VAULT_FOLDER = "Life CRM";

const money = (amount: number | null | undefined) =>
  amount === null || amount === undefined ? "pendiente de confirmar" : formatMoney(Number(amount));

/** Un título de nota no puede llevar los caracteres que Windows prohíbe. */
export const safeName = (name: string) =>
  name
    .replace(/[\\/:*?"<>|#^[\]]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 80) || "Sin nombre";

const frontmatter = (title: string, generatedAt: string) =>
  ["---", `title: ${JSON.stringify(title)}`, "origen: Life CRM", `actualizado: ${generatedAt}`, "---", ""].join("\n");

const footer = [
  "",
  "---",
  "",
  "*Esta nota la escribe el panel cada vez que sincronizas: lo que edites aquí se pierde.*",
  "*Para que algo llegue al panel, deja una nota en `Inbox/`.*",
  "",
].join("\n");

const note = (title: string, generatedAt: string, body: string[]) =>
  `${frontmatter(title, generatedAt)}# ${title}\n\n${body.join("\n")}\n${footer}`;

/** Una tabla, o una línea diciendo que no hay nada. */
function table(headers: string[], rows: string[][], empty: string): string[] {
  if (!rows.length) return [empty, ""];
  return [
    `| ${headers.join(" | ")} |`,
    `| ${headers.map(() => "---").join(" | ")} |`,
    ...rows.map((row) => `| ${row.map((cell) => cell.replace(/\|/g, "\\|")).join(" | ")} |`),
    "",
  ];
}

const agendaLine = (item: AgendaItem) =>
  [
    "-",
    shortTime(item.time) ?? null,
    `**${item.title}**`,
    item.amount !== undefined ? `· ${formatMoney(item.amount)}` : null,
    item.detail ? `· ${item.detail}` : null,
  ]
    .filter(Boolean)
    .join(" ");

function todayNote(data: LifeData, today: ISODate, generatedAt: string): VaultFile {
  const week = buildAgenda(data, today, addDays(today, 6));
  const mine = week.filter((item) => item.date === today);
  const overdue = data.tasks.filter((t) => t.due_date && t.due_date < today && t.status !== "done");
  const payments = upcoming(data, today, 7);

  const body = [
    `*${formatLong(today)}*`,
    "",
    "## Hoy",
    "",
    ...(mine.length ? mine.map(agendaLine) : ["Nada en la agenda de hoy."]),
    "",
    "## Atrasado",
    "",
    ...(overdue.length
      ? overdue.map((task) => `- [ ] ${task.title} · vencía ${relativeDay(task.due_date!, today)}`)
      : ["Nada atrasado."]),
    "",
    "## Pagos de los próximos 7 días",
    "",
    ...table(
      ["Día", "Qué", "Importe", "Estado"],
      payments.map((payment) => [
        formatShort(payment.date),
        payment.name,
        money(payment.amount),
        paymentStateLabel[payment.state],
      ]),
      "Ningún pago previsto esta semana.",
    ),
    "## La semana",
    "",
    ...[0, 1, 2, 3, 4, 5, 6].flatMap((offset) => {
      const date = addDays(today, offset);
      const items = week.filter((item) => item.date === date);
      if (!items.length) return [];
      return [`### ${formatShort(date)} · ${relativeDay(date, today)}`, "", ...items.map(agendaLine), ""];
    }),
    "## Dónde está cada cosa",
    "",
    "- [[Tareas]]",
    "- [[Suscripciones]]",
    "- [[Dinero]]",
    "- [[Dominios]]",
    "- [[Universidad]]",
    "- [[Proyectos]]",
  ];

  return { path: "Hoy.md", content: note("Hoy", generatedAt, body) };
}

function tasksNote(data: LifeData, today: ISODate, generatedAt: string): VaultFile {
  const projectName = new Map(data.projects.map((p) => [p.id, p.name]));
  const line = (task: LifeData["tasks"][number]) =>
    [
      `- [${task.status === "done" ? "x" : " "}]`,
      task.title,
      task.due_date ? `· ${formatShort(task.due_date)}` : null,
      task.project_id ? `· [[${safeName(projectName.get(task.project_id) ?? "")}]]` : null,
      task.priority === "urgent" || task.priority === "high" ? `· ${priorityLabel[task.priority]}` : null,
    ]
      .filter(Boolean)
      .join(" ");

  const body = (["pending", "in_progress", "postponed", "done"] as const).flatMap((status) => {
    const list = data.tasks
      .filter((t) => t.status === status)
      .sort((a, b) => (a.due_date ?? "9999").localeCompare(b.due_date ?? "9999"));
    return [`## ${taskStatusLabel[status]} (${list.length})`, "", ...(list.length ? list.map(line) : ["Nada aquí."]), ""];
  });

  return {
    path: "Tareas.md",
    content: note("Tareas", generatedAt, [`*Al día de ${formatLong(today)}.*`, "", ...body]),
  };
}

function subscriptionsNote(data: LifeData, today: ISODate, generatedAt: string): VaultFile {
  const accountName = new Map(data.accounts.map((a) => [a.id, a.name]));
  const row = (sub: Subscription) => {
    const next = nextChargeView(sub, today);
    return [
      sub.name,
      money(sub.amount === null ? null : Number(sub.amount)),
      frequencyLabel[sub.frequency] + (sub.frequency === "custom" && sub.custom_days ? ` (${sub.custom_days} d)` : ""),
      next.date ? `${formatShort(next.date)} · ${relativeDay(next.date, today)}` : "pendiente de confirmar",
      sub.observed_account_id ? (accountName.get(sub.observed_account_id) ?? "—") : "—",
      subscriptionCategoryLabel[sub.category],
    ];
  };

  const body = (["active", "review", "cancel_pending", "cancelled"] as const).flatMap((status) => {
    const list = data.subscriptions
      .filter((s) => s.status === status)
      .sort((a, b) => (nextChargeView(a, today).date ?? "9999").localeCompare(nextChargeView(b, today).date ?? "9999"));
    return [
      `## ${subscriptionStatusLabel[status]} (${list.length})`,
      "",
      ...table(
        ["Servicio", "Importe", "Cada", "Próximo cobro", "Se cobra en", "Categoría"],
        list.map(row),
        "Ninguna.",
      ),
    ];
  });

  const monthly = data.subscriptions
    .filter((s) => s.status !== "cancelled")
    .reduce((sum, s) => sum + (monthlyCost(s) ?? 0), 0);
  const unknown = data.subscriptions.filter((s) => s.status !== "cancelled" && monthlyCost(s) === null).length;

  return {
    path: "Suscripciones.md",
    content: note("Suscripciones", generatedAt, [
      `**${monthly > 0 ? formatMoney(monthly) : "Pendiente de confirmar"} al mes**` +
        (unknown ? ` · ${unknown} sin coste comparable` : ""),
      "",
      ...body,
    ]),
  };
}

function moneyNote(data: LifeData, today: ISODate, generatedAt: string): VaultFile {
  const live = data.subscriptions.filter((s) => s.status !== "cancelled");
  const card = (account: Account | null) => {
    const subs = live.filter((s) => s.observed_account_id === (account?.id ?? null));
    const costs = subs.map(monthlyCost);
    const total = costs.reduce((sum: number, cost) => sum + (cost ?? 0), 0);
    const unknown = costs.filter((cost) => cost === null).length;
    return [
      `## ${account ? account.name : "Sin cuenta asignada"}`,
      "",
      account
        ? `*${[account.institution, accountKindLabel[account.kind], account.has_card ? "con tarjeta" : null]
            .filter(Boolean)
            .join(" · ")}*`
        : "*Suscripciones que todavía no sabes de dónde salen.*",
      "",
      `Al mes: **${total > 0 ? formatMoney(total) : "pendiente de confirmar"}**` +
        (unknown ? ` · ${unknown} sin importe` : ""),
      "",
      ...table(
        ["Suscripción", "Importe", "Cada"],
        subs.map((sub) => [
          sub.name,
          money(sub.amount === null ? null : Number(sub.amount)),
          frequencyLabel[sub.frequency],
        ]),
        "Ninguna suscripción apuntada a esta cuenta.",
      ),
    ];
  };

  const plan = buildPaymentPlan(data, today, addDays(today, 30), today);

  return {
    path: "Dinero.md",
    content: note("Dinero", generatedAt, [
      "## Próximos 30 días",
      "",
      ...table(
        ["Día", "Qué", "Importe", "Estado"],
        plan.map((payment) => [
          formatShort(payment.date),
          payment.name,
          money(payment.amount),
          paymentStateLabel[payment.state],
        ]),
        "Sin pagos previstos.",
      ),
      ...data.accounts.flatMap((account) => card(account)),
      ...(live.some((s) => s.observed_account_id === null) ? card(null) : []),
    ]),
  };
}

function domainsNote(data: LifeData, today: ISODate, generatedAt: string): VaultFile {
  const projectName = new Map(data.projects.map((p) => [p.id, p.name]));
  const rows = [...data.domains]
    .sort((a, b) => (a.renews_on ?? "9999").localeCompare(b.renews_on ?? "9999"))
    .map((domain) => {
      const payments = data.charges.filter((c) => c.domain_id === domain.id && isSpend(c));
      const paid = payments.reduce((sum, c) => sum + Number(c.amount), 0);
      return [
        domain.domain,
        domain.cost === null ? "pendiente de confirmar" : `${formatMoney(Number(domain.cost))}/año`,
        domain.renews_on ? `${formatWithYear(domain.renews_on)} · ${relativeDay(domain.renews_on, today)}` : "sin fecha",
        payments.length ? formatMoney(paid) : "sin pagos",
        domain.provider ?? "—",
        domain.project_id ? `[[${safeName(projectName.get(domain.project_id) ?? "")}]]` : "—",
      ];
    });

  return {
    path: "Dominios.md",
    content: note("Dominios", generatedAt, [
      ...table(["Dominio", "Precio", "Renueva", "Pagado", "Proveedor", "Proyecto"], rows, "Ningún dominio registrado."),
    ]),
  };
}

function universityNote(data: LifeData, today: ISODate, generatedAt: string): VaultFile {
  const body = data.courses.flatMap((course) => {
    const items = data.courseItems
      .filter((item) => item.course_id === course.id)
      .sort((a, b) => (a.due_date ?? "9999").localeCompare(b.due_date ?? "9999"));
    return [
      `## ${course.name}`,
      "",
      ...table(
        ["Qué", "Tipo", "Fecha", "Estado"],
        items.map((item) => [
          item.title,
          courseItemKindLabel[item.kind],
          item.due_date ? `${formatShort(item.due_date)} · ${relativeDay(item.due_date, today)}` : "sin fecha",
          taskStatusLabel[item.status],
        ]),
        "Nada apuntado en esta asignatura.",
      ),
    ];
  });

  return {
    path: "Universidad.md",
    content: note("Universidad", generatedAt, body.length ? body : ["Ninguna asignatura todavía."]),
  };
}

function projectsIndex(data: LifeData, generatedAt: string): VaultFile {
  const rows = data.projects.map((project) => {
    const open = data.tasks.filter((t) => t.project_id === project.id && t.status !== "done").length;
    const partners = data.projectPartners.filter((link) => link.project_id === project.id).length;
    return [
      `[[${safeName(project.name)}]]`,
      projectStatusLabel[project.status],
      `${project.progress} %`,
      String(open),
      partners ? String(partners) : "—",
    ];
  });

  return {
    path: "Proyectos.md",
    content: note("Proyectos", generatedAt, [
      ...table(["Proyecto", "Estado", "Progreso", "Tareas abiertas", "Socios"], rows, "Ningún proyecto todavía."),
    ]),
  };
}

function projectNote(data: LifeData, project: Project, today: ISODate, generatedAt: string): VaultFile {
  const partners = partnersOf(data, project.id);
  const balances = partnerBalances(data, project.id);
  const expenses = projectCharges(data, project.id);
  const putIn = projectPaidBy(expenses);
  const partnerName = new Map(data.partners.map((p) => [p.id, p.name]));
  const tasks = data.tasks.filter((t) => t.project_id === project.id);
  const subs = data.subscriptions.filter((s) => s.project_id === project.id);
  const domains = data.domains.filter((d) => d.project_id === project.id);
  const total = expenses.reduce((sum, e) => sum + Number(e.charge.amount), 0);

  const body = [
    `*${projectStatusLabel[project.status]} · ${project.progress} % · prioridad ${priorityLabel[project.priority].toLowerCase()}*`,
    "",
    ...(project.description ? [project.description, ""] : []),
    "## Socios",
    "",
    ...table(
      ["Socio", "Papel", "Le toca", "Saldo"],
      partners.map(({ link, partner }) => {
        const balance = balances.find((row) => row.partner.id === partner.id);
        const net = balance?.net ?? 0;
        return [
          partner.name,
          link.role ?? "—",
          link.share === null ? "sin acordar" : `${Number(link.share)} %`,
          Math.abs(net) < 0.005
            ? "en paz"
            : net > 0
              ? `le debes ${formatMoney(net)}`
              : `te debe ${formatMoney(-net)}`,
        ];
      }),
      "Nadie más en este proyecto.",
    ),
    "## Gastos",
    "",
    ...table(
      ["Fecha", "Concepto", "Importe", "Lo pagó", "Reparto"],
      expenses.map(({ charge, paidBy, split, shared, date }) => [
        date ? formatWithYear(date) : "sin fecha",
        charge.description || "Gasto",
        formatMoney(Number(charge.amount)),
        paidBy ? paidBy.name : "tú",
        shared
          ? split.undecided
            ? "sin acordar"
            : split.shares
                .map(
                  (share) =>
                    `${share.partnerId ? (partnerName.get(share.partnerId) ?? "socio") : "tú"} ${formatMoney(share.amount)}`,
                )
                .join(", ")
          : "de uno solo",
      ]),
      "Ningún gasto apuntado.",
    ),
    ...(expenses.length
      ? [
          `**${formatMoney(total)} en total** · ` +
            putIn
              .map(
                (row) =>
                  `${row.partnerId ? (partnerName.get(row.partnerId) ?? "socio") : "tú"} ${formatMoney(row.amount)}`,
              )
              .join(" · "),
          "",
        ]
      : []),
    "## Tareas",
    "",
    ...(tasks.length
      ? tasks.map(
          (task) =>
            `- [${task.status === "done" ? "x" : " "}] ${task.title}${task.due_date ? ` · ${formatShort(task.due_date)}` : ""}`,
        )
      : ["Sin tareas."]),
    "",
    "## Costes fijos",
    "",
    ...table(
      ["Qué", "Importe", "Cada", "Próximo"],
      [
        ...subs.map((sub) => {
          const next = nextChargeView(sub, today);
          return [
            sub.name,
            money(sub.amount === null ? null : Number(sub.amount)),
            frequencyLabel[sub.frequency],
            next.date ? formatShort(next.date) : "pendiente de confirmar",
          ];
        }),
        ...domains.map((domain) => [
          domain.domain,
          domain.cost === null ? "pendiente de confirmar" : formatMoney(Number(domain.cost)),
          "Anual",
          domain.renews_on ? formatWithYear(domain.renews_on) : "sin fecha",
        ]),
      ],
      "Ninguno.",
    ),
  ];

  return { path: `Proyectos/${safeName(project.name)}.md`, content: note(safeName(project.name), generatedAt, body) };
}

function readme(generatedAt: string): VaultFile {
  return {
    path: "Inbox/Léeme.md",
    content: note("Léeme", generatedAt, [
      "Deja aquí una nota suelta y en la siguiente sincronización entra en la bandeja del panel,",
      "donde la conviertes en tarea, evento o lo que sea.",
      "",
      "- Una nota por idea. El título de la nota es el texto que llega.",
      "- Lo ya enviado se mueve a `Inbox/enviado/` y no se vuelve a mandar.",
      "- El resto de notas de esta carpeta las escribe el panel y se sobrescriben: no las edites.",
    ]),
  };
}

/** Las notas del vault para estos datos. */
export function vaultFiles(data: LifeData, today: ISODate, generatedAt: string): VaultFile[] {
  return [
    todayNote(data, today, generatedAt),
    tasksNote(data, today, generatedAt),
    subscriptionsNote(data, today, generatedAt),
    moneyNote(data, today, generatedAt),
    domainsNote(data, today, generatedAt),
    universityNote(data, today, generatedAt),
    projectsIndex(data, generatedAt),
    ...data.projects.map((project) => projectNote(data, project, today, generatedAt)),
    readme(generatedAt),
  ];
}

/** Lo que el panel nota como pendiente de ver en el inbox del vault. */
export const inboxFolder = `${VAULT_FOLDER}/Inbox`;
