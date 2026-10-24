import { z } from "zod";

import {
  ACCOUNT_CHANGES,
  ACCOUNT_KINDS,
  TAG_COLORS,
  CHARGE_KINDS,
  CHARGE_STATUSES,
  CONFIDENCES,
  COURSE_ITEM_KINDS,
  EVENT_CATEGORIES,
  FREQUENCIES,
  MONEY_CATEGORIES,
  PRIORITIES,
  PROJECT_STATUSES,
  RECURRENCES,
  SCOPES,
  SUBSCRIPTION_CATEGORIES,
  SUBSCRIPTION_STATUSES,
  TASK_STATUSES,
  TAX_MODES,
  TRANSACTION_KINDS,
  VAULT_CATEGORIES,
  accountChangeLabel,
  accountKindLabel,
  chargeKindLabel,
  chargeStatusLabel,
  confidenceLabel,
  courseItemKindLabel,
  eventCategoryLabel,
  frequencyLabel,
  moneyCategoryLabel,
  priorityLabel,
  projectStatusLabel,
  recurrenceLabel,
  scopeLabel,
  subscriptionCategoryLabel,
  subscriptionStatusLabel,
  tagColorLabel,
  taskStatusLabel,
  taxLabel,
  transactionKindLabel,
  vaultCategoryLabel,
} from "./model";

/**
 * Every record type the panel can create or edit, described once.
 *
 * The form, the validation and the server action all read these
 * definitions. Adding a field is one line here plus the column in a
 * migration; there is no per-entity form component to keep in sync.
 */

export type FieldType =
  | "text"
  | "textarea"
  | "date"
  | "time"
  | "number"
  | "money"
  | "range"
  | "select"
  | "checkbox"
  | "url"
  | "email"
  | "tel"
  | "project"
  | "course"
  | "account"
  | "subscription"
  | "partner"
  | "domainRef";

export interface FieldOption {
  value: string;
  label: string;
}

export interface FieldDef {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  placeholder?: string;
  hint?: string;
  options?: readonly FieldOption[];
  /** Initial value for new records. "today" resolves to the user's date. */
  defaultValue?: string | number | boolean;
  /** Pairs with the next half field on one row from 430 px up. */
  half?: boolean;
  min?: number;
  max?: number;
  /** Hidden behind "Más detalles" so the quick form stays short. */
  advanced?: boolean;
  /** Only shown while another field holds one of these values. */
  showIf?: { field: string; is: readonly string[] };
}

export interface EntityDef {
  table: string;
  /** "Tarea", used in "Nueva tarea", "Guardar tarea". */
  singular: string;
  /** Feminine nouns take "Nueva"; masculine ones "Nuevo". */
  feminine: boolean;
  /** Column shown as the record's name in search and lists. */
  titleField: string;
  /** Columns the global search looks into. */
  searchFields: readonly string[];
  fields: readonly FieldDef[];
}

const opts = <T extends string>(values: readonly T[], labels: Record<T, string>): FieldOption[] =>
  values.map((value) => ({ value, label: labels[value] }));

const reminderOptions: FieldOption[] = [
  { value: "", label: "Sin aviso" },
  { value: "0", label: "A la hora" },
  { value: "10", label: "10 minutos antes" },
  { value: "30", label: "30 minutos antes" },
  { value: "60", label: "1 hora antes" },
  { value: "1440", label: "1 día antes" },
  { value: "10080", label: "1 semana antes" },
];

export const entities = {
  task: {
    table: "tasks",
    singular: "Tarea",
    feminine: true,
    titleField: "title",
    searchFields: ["title", "description", "category"],
    fields: [
      { name: "title", label: "Qué hay que hacer", type: "text", required: true, placeholder: "Llamar al gestor" },
      { name: "due_date", label: "Fecha", type: "date", half: true, defaultValue: "today" },
      { name: "due_time", label: "Hora", type: "time", half: true },
      { name: "priority", label: "Prioridad", type: "select", options: opts(PRIORITIES, priorityLabel), defaultValue: "normal", half: true },
      { name: "status", label: "Estado", type: "select", options: opts(TASK_STATUSES, taskStatusLabel), defaultValue: "pending", half: true },
      { name: "project_id", label: "Proyecto", type: "project", half: true, advanced: true },
      { name: "course_id", label: "Asignatura", type: "course", half: true, advanced: true },
      { name: "category", label: "Categoría", type: "text", placeholder: "Casa, papeles, salud…", advanced: true },
      { name: "description", label: "Notas", type: "textarea", advanced: true },
    ],
  },
  event: {
    table: "events",
    singular: "Evento",
    feminine: false,
    titleField: "title",
    searchFields: ["title", "location", "notes"],
    fields: [
      { name: "title", label: "Título", type: "text", required: true, placeholder: "Cena con Marta" },
      { name: "date", label: "Fecha", type: "date", required: true, half: true, defaultValue: "today" },
      { name: "category", label: "Tipo", type: "select", options: opts(EVENT_CATEGORIES, eventCategoryLabel), defaultValue: "personal", half: true },
      { name: "start_time", label: "Empieza", type: "time", half: true },
      { name: "end_time", label: "Termina", type: "time", half: true },
      { name: "location", label: "Lugar", type: "text" },
      { name: "recurrence", label: "Repetir", type: "select", options: opts(RECURRENCES, recurrenceLabel), defaultValue: "none", half: true, advanced: true },
      { name: "recurrence_interval", label: "Cada cuántos", type: "number", min: 1, max: 365, defaultValue: 1, half: true, advanced: true, hint: "1 = cada vez; 2 = una sí, una no", showIf: { field: "recurrence", is: ["daily", "weekly", "monthly", "yearly"] } },
      { name: "recurrence_until", label: "Repetir hasta", type: "date", half: true, advanced: true, showIf: { field: "recurrence", is: ["daily", "weekly", "monthly", "yearly"] } },
      { name: "end_date", label: "Último día", type: "date", half: true, advanced: true, hint: "Para viajes de varios días" },
      { name: "reminder_minutes", label: "Recordatorio", type: "select", options: reminderOptions, advanced: true },
      { name: "notes", label: "Notas", type: "textarea", advanced: true },
    ],
  },
  subscription: {
    table: "subscriptions",
    singular: "Suscripción",
    feminine: true,
    titleField: "name",
    searchFields: ["name", "company", "merchant", "notes", "payment_method"],
    fields: [
      { name: "name", label: "Nombre", type: "text", required: true, placeholder: "Vercel Pro" },
      { name: "amount", label: "Importe", type: "money", half: true, hint: "Déjalo vacío si aún no lo sabes" },
      { name: "amount_status", label: "El importe es", type: "select", options: opts(CONFIDENCES, confidenceLabel), defaultValue: "unknown", half: true },
      { name: "frequency", label: "Frecuencia", type: "select", options: opts(FREQUENCIES, frequencyLabel), defaultValue: "monthly", half: true },
      { name: "custom_days", label: "Cada cuántos días", type: "number", min: 1, max: 3650, half: true, showIf: { field: "frequency", is: ["custom"] }, hint: "28 = cada cuatro semanas" },
      { name: "next_charge_date", label: "Próximo cobro", type: "date", half: true, hint: "La siguiente vez que te lo cobran" },
      { name: "date_status", label: "La fecha es", type: "select", options: opts(CONFIDENCES, confidenceLabel), defaultValue: "unknown", half: true },
      { name: "status", label: "Estado", type: "select", options: opts(SUBSCRIPTION_STATUSES, subscriptionStatusLabel), defaultValue: "active", half: true },
      { name: "category", label: "Categoría", type: "select", options: opts(SUBSCRIPTION_CATEGORIES, subscriptionCategoryLabel), defaultValue: "software", half: true },
      { name: "scope", label: "Es un gasto", type: "select", options: opts(SCOPES, scopeLabel), defaultValue: "pending", half: true },
      { name: "project_id", label: "Proyecto", type: "project", half: true },
      { name: "observed_account_id", label: "Se cobra en", type: "account", half: true },
      { name: "target_account_id", label: "Debería cobrarse en", type: "account", half: true },
      { name: "account_change", label: "Cambio de cuenta", type: "select", options: opts(ACCOUNT_CHANGES, accountChangeLabel), defaultValue: "none", half: true },
      { name: "tax", label: "Impuestos", type: "select", options: opts(TAX_MODES, taxLabel), defaultValue: "unknown", half: true },
      { name: "amount_as_of", label: "Importe vigente desde", type: "date", half: true, advanced: true },
      { name: "company", label: "Empresa", type: "text", half: true, advanced: true },
      { name: "merchant", label: "Aparece en el banco como", type: "text", placeholder: "Apple Services", half: true, advanced: true },
      { name: "payment_method", label: "Método de pago", type: "text", placeholder: "Visa ···· 4242", half: true, advanced: true },
      { name: "commitment", label: "Permanencia", type: "text", placeholder: "Con permanencia hasta…", half: true, advanced: true },
      { name: "commitment_until", label: "La permanencia acaba", type: "date", half: true, advanced: true },
      { name: "url", label: "Enlace", type: "url", advanced: true },
      { name: "source", label: "De dónde sale el dato", type: "text", advanced: true },
      { name: "notes", label: "Notas", type: "textarea", advanced: true },
    ],
  },
  account: {
    table: "accounts",
    singular: "Cuenta",
    feminine: true,
    titleField: "name",
    searchFields: ["name", "institution", "notes"],
    fields: [
      { name: "name", label: "Nombre", type: "text", required: true, placeholder: "Caixa con tarjeta" },
      { name: "institution", label: "Banco o plataforma", type: "text", half: true },
      { name: "kind", label: "Tipo", type: "select", options: opts(ACCOUNT_KINDS, accountKindLabel), defaultValue: "bank", half: true },
      { name: "has_card", label: "Tiene tarjeta", type: "checkbox" },
      { name: "is_target", label: "Es la cuenta donde quiero centralizar los cobros", type: "checkbox" },
      { name: "source", label: "De dónde sale el dato", type: "text", advanced: true },
      { name: "notes", label: "Notas", type: "textarea", advanced: true },
    ],
  },
  charge: {
    table: "charges",
    singular: "Cargo",
    feminine: false,
    titleField: "description",
    searchFields: ["description", "merchant", "period_label", "notes"],
    fields: [
      { name: "description", label: "Concepto", type: "text", required: true, placeholder: "Tal como aparece en el extracto" },
      { name: "amount", label: "Importe", type: "money", required: true, half: true },
      { name: "status", label: "Qué pasó", type: "select", options: opts(CHARGE_STATUSES, chargeStatusLabel), defaultValue: "paid", half: true },
      { name: "kind", label: "Tipo", type: "select", options: opts(CHARGE_KINDS, chargeKindLabel), defaultValue: "payment", half: true },
      { name: "operation_date", label: "Fecha de operación", type: "date", half: true },
      { name: "subscription_id", label: "Suscripción", type: "subscription", half: true },
      { name: "account_id", label: "Cuenta", type: "account", half: true },
      { name: "identified", label: "Sé lo que es", type: "checkbox", defaultValue: true },
      { name: "project_id", label: "Proyecto", type: "project", half: true },
      { name: "paid_by_partner_id", label: "Lo pagó", type: "partner", half: true, hint: "Vacío: lo pagaste tú" },
      { name: "shared", label: "Se reparte entre los socios", type: "checkbox", hint: "Sin marcar, el gasto es entero de quien lo pagó" },
      { name: "domain_id", label: "Dominio", type: "domainRef", half: true, advanced: true },
      { name: "value_date", label: "Fecha valor", type: "date", half: true, advanced: true },
      { name: "booking_date", label: "Fecha de contabilización", type: "date", half: true, advanced: true },
      { name: "reported_on", label: "Comunicado el", type: "date", half: true, advanced: true },
      { name: "due_date", label: "Cuota con fecha", type: "date", half: true, advanced: true, hint: "Si paga una cuota anterior" },
      { name: "period_label", label: "Nombre de la cuota", type: "text", placeholder: "May 30", half: true, advanced: true },
      { name: "merchant", label: "Comercio", type: "text", half: true, advanced: true },
      { name: "channel", label: "Medio", type: "text", placeholder: "PayPal", half: true, advanced: true },
      { name: "candidate_subscription_id", label: "Podría ser", type: "subscription", half: true, advanced: true, hint: "Sin confirmar" },
      { name: "source", label: "De dónde sale el dato", type: "text", advanced: true },
      { name: "notes", label: "Notas", type: "textarea", advanced: true },
    ],
  },
  transaction: {
    table: "transactions",
    singular: "Movimiento",
    feminine: false,
    titleField: "description",
    searchFields: ["description"],
    fields: [
      { name: "kind", label: "Tipo", type: "select", options: opts(TRANSACTION_KINDS, transactionKindLabel), defaultValue: "expense", half: true },
      { name: "amount", label: "Importe", type: "money", required: true, half: true },
      { name: "description", label: "Concepto", type: "text", placeholder: "Compra semanal" },
      { name: "date", label: "Fecha", type: "date", required: true, half: true, defaultValue: "today" },
      { name: "category", label: "Categoría", type: "select", options: opts(MONEY_CATEGORIES, moneyCategoryLabel), defaultValue: "other", half: true },
      { name: "planned", label: "Pago previsto, aún sin pagar", type: "checkbox" },
      { name: "project_id", label: "Proyecto", type: "project", advanced: true },
    ],
  },
  project: {
    table: "projects",
    singular: "Proyecto",
    feminine: false,
    titleField: "name",
    searchFields: ["name", "description", "notes"],
    fields: [
      { name: "name", label: "Nombre", type: "text", required: true },
      { name: "description", label: "En una frase", type: "textarea" },
      { name: "status", label: "Estado", type: "select", options: opts(PROJECT_STATUSES, projectStatusLabel), defaultValue: "active", half: true },
      { name: "priority", label: "Prioridad", type: "select", options: opts(PRIORITIES, priorityLabel), defaultValue: "normal", half: true },
      { name: "color", label: "Color", type: "select", options: opts(TAG_COLORS, tagColorLabel), defaultValue: "slate", half: true },
      { name: "progress", label: "Progreso", type: "range", min: 0, max: 100, defaultValue: 0 },
      { name: "start_date", label: "Inicio", type: "date", half: true, advanced: true },
      { name: "target_date", label: "Fecha objetivo", type: "date", half: true, advanced: true },
      { name: "url", label: "Enlace", type: "url", advanced: true },
      { name: "notes", label: "Notas", type: "textarea", advanced: true },
    ],
  },
  course: {
    table: "courses",
    singular: "Asignatura",
    feminine: true,
    titleField: "name",
    searchFields: ["name", "teacher", "room", "notes"],
    fields: [
      { name: "name", label: "Nombre", type: "text", required: true },
      { name: "teacher", label: "Profesor", type: "text", half: true },
      { name: "room", label: "Aula", type: "text", half: true },
      { name: "schedule", label: "Horario", type: "text", placeholder: "Lun y mié · 10:00–12:00" },
      { name: "url", label: "Campus o carpeta", type: "url", advanced: true },
      { name: "active", label: "Este curso", type: "checkbox", defaultValue: true, advanced: true },
      { name: "notes", label: "Notas", type: "textarea", advanced: true },
    ],
  },
  courseItem: {
    table: "course_items",
    singular: "Entrega",
    feminine: true,
    titleField: "title",
    searchFields: ["title", "description"],
    fields: [
      { name: "title", label: "Título", type: "text", required: true, placeholder: "Práctica 2" },
      { name: "course_id", label: "Asignatura", type: "course", required: true, half: true },
      { name: "kind", label: "Tipo", type: "select", options: opts(COURSE_ITEM_KINDS, courseItemKindLabel), defaultValue: "assignment", half: true },
      { name: "due_date", label: "Fecha límite", type: "date", half: true },
      { name: "due_time", label: "Hora", type: "time", half: true },
      { name: "status", label: "Estado", type: "select", options: opts(TASK_STATUSES, taskStatusLabel), defaultValue: "pending", half: true, advanced: true },
      { name: "priority", label: "Prioridad", type: "select", options: opts(PRIORITIES, priorityLabel), defaultValue: "normal", half: true, advanced: true },
      { name: "grade", label: "Nota", type: "number", min: 0, max: 100, advanced: true },
      { name: "url", label: "Enunciado o entrega", type: "url", advanced: true },
      { name: "description", label: "Notas", type: "textarea", advanced: true },
    ],
  },
  domain: {
    table: "domains",
    singular: "Dominio",
    feminine: false,
    titleField: "domain",
    searchFields: ["domain", "provider", "email", "notes"],
    fields: [
      { name: "domain", label: "Dominio", type: "text", required: true, placeholder: "ejemplo.com" },
      { name: "renews_on", label: "Renueva el", type: "date", half: true, hint: "Vacío si no lo sabes" },
      { name: "renews_status", label: "La fecha es", type: "select", options: opts(CONFIDENCES, confidenceLabel), defaultValue: "unknown", half: true },
      { name: "cost", label: "Coste anual", type: "money", half: true },
      { name: "provider", label: "Proveedor", type: "text", half: true },
      { name: "project_id", label: "Proyecto", type: "project", half: true },
      { name: "account_id", label: "Se paga desde", type: "account", half: true },
      { name: "auto_renew", label: "Renovación automática", type: "checkbox" },
      { name: "purchased_on", label: "Comprado el", type: "date", half: true, advanced: true },
      { name: "email", label: "Correo asociado", type: "email", half: true, advanced: true },
      { name: "source", label: "De dónde sale el dato", type: "text", advanced: true },
      { name: "notes", label: "Notas", type: "textarea", advanced: true },
    ],
  },
  contact: {
    table: "contacts",
    singular: "Contacto",
    feminine: false,
    titleField: "name",
    searchFields: ["name", "company", "email", "phone", "relationship", "notes", "next_action"],
    fields: [
      { name: "name", label: "Nombre", type: "text", required: true },
      { name: "phone", label: "Teléfono", type: "tel", half: true },
      { name: "email", label: "Correo", type: "email", half: true },
      { name: "relationship", label: "Relación", type: "text", placeholder: "Familia, amigo, cliente…", half: true },
      { name: "birthday", label: "Cumpleaños", type: "date", half: true },
      { name: "next_action", label: "Próxima cosa pendiente", type: "text", placeholder: "Devolverle el libro" },
      { name: "next_action_date", label: "Para cuándo", type: "date", half: true },
      { name: "last_interaction", label: "Última vez que hablasteis", type: "date", half: true },
      { name: "company", label: "Empresa", type: "text", advanced: true },
      { name: "notes", label: "Notas", type: "textarea", advanced: true },
    ],
  },
  vault: {
    table: "vault_items",
    singular: "Documento",
    feminine: false,
    titleField: "title",
    searchFields: ["title", "notes", "url"],
    fields: [
      { name: "title", label: "Título", type: "text", required: true, placeholder: "Póliza del coche" },
      { name: "category", label: "Categoría", type: "select", options: opts(VAULT_CATEGORIES, vaultCategoryLabel), defaultValue: "other", half: true },
      { name: "expires_on", label: "Vence el", type: "date", half: true },
      { name: "url", label: "Enlace", type: "url" },
      { name: "date", label: "Fecha del documento", type: "date", advanced: true },
      { name: "notes", label: "Notas", type: "textarea" },
    ],
  },
  partner: {
    table: "partners",
    singular: "Socio",
    feminine: false,
    titleField: "name",
    searchFields: ["name", "company", "email", "phone", "notes"],
    fields: [
      { name: "name", label: "Nombre", type: "text", required: true },
      { name: "company", label: "Empresa", type: "text", half: true },
      { name: "email", label: "Correo", type: "email", half: true },
      { name: "phone", label: "Teléfono", type: "tel", half: true },
      { name: "source", label: "De dónde sale el dato", type: "text", advanced: true },
      { name: "notes", label: "Notas", type: "textarea", advanced: true },
    ],
  },
  projectPartner: {
    table: "project_partners",
    singular: "Socio del proyecto",
    feminine: false,
    titleField: "role",
    searchFields: ["role", "notes"],
    fields: [
      { name: "project_id", label: "Proyecto", type: "project", required: true, half: true },
      { name: "partner_id", label: "Socio", type: "partner", required: true, half: true },
      { name: "share", label: "Le toca (%)", type: "number", min: 0, max: 100, half: true, hint: "Vacío si aún no lo habéis acordado" },
      { name: "role", label: "Papel", type: "text", placeholder: "Socio, inversor…", half: true },
      { name: "notes", label: "Notas", type: "textarea", advanced: true },
    ],
  },
  inbox: {
    table: "inbox_items",
    singular: "Nota rápida",
    feminine: true,
    titleField: "text",
    searchFields: ["text", "category"],
    fields: [
      { name: "text", label: "Qué tienes en la cabeza", type: "text", required: true },
      { name: "category", label: "Categoría", type: "text", half: true },
      { name: "date", label: "Fecha", type: "date", half: true },
    ],
  },
} as const satisfies Record<string, EntityDef>;

export type EntityKind = keyof typeof entities;

export function isEntityKind(value: unknown): value is EntityKind {
  return typeof value === "string" && Object.hasOwn(entities, value);
}

export function newLabel(kind: EntityKind): string {
  const def: EntityDef = entities[kind];
  return `${def.feminine ? "Nueva" : "Nuevo"} ${def.singular.toLowerCase()}`;
}

// ---------------------------------------------------------------------------
// Validation, generated from the field definitions.
// ---------------------------------------------------------------------------

const isoDate = /^\d{4}-\d{2}-\d{2}$/;
const timeOfDay = /^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/;
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function blankToNull(value: FormDataEntryValue | null): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}

function fieldSchema(field: FieldDef): z.ZodType {
  const required = field.required ?? false;
  const optional = <T extends z.ZodType>(schema: T) => (required ? schema : schema.nullable());
  const message = `Revisa «${field.label}»`;

  switch (field.type) {
    case "checkbox":
      return z.boolean();
    case "number":
    case "range":
    case "money": {
      let n = z.number({ error: message });
      if (field.type === "money") n = n.min(0, message).max(1_000_000, message);
      if (field.min !== undefined) n = n.min(field.min, message);
      if (field.max !== undefined) n = n.max(field.max, message);
      if (field.type === "range") n = n.int(message);
      return optional(n);
    }
    case "date":
      return optional(z.string().regex(isoDate, message));
    case "time":
      return optional(z.string().regex(timeOfDay, message));
    case "select":
      return field.options?.some((o) => o.value === "")
        ? z.string().nullable()
        : optional(z.enum((field.options ?? []).map((o) => o.value) as [string, ...string[]], { error: message }));
    case "project":
    case "course":
    case "account":
    case "subscription":
    case "partner":
    case "domainRef":
      return optional(z.string().regex(uuid, message));
    case "url":
      return optional(z.url({ protocol: /^https?$/, error: "Pon un enlace que empiece por https://" }).max(2000));
    case "email":
      return optional(z.email({ error: "Ese correo no parece válido" }).max(320));
    case "textarea":
      return optional(z.string().max(5000, message));
    default:
      return optional(z.string().min(1, `Falta «${field.label}»`).max(field.name === "text" ? 500 : 200, message));
  }
}

export interface ParseResult {
  ok: boolean;
  values: Record<string, unknown>;
  fieldErrors: Record<string, string>;
}

/** Turns a submitted form into a row, or explains what is wrong. */
export function parseEntityForm(kind: EntityKind, form: FormData): ParseResult {
  const def: EntityDef = entities[kind];
  const raw: Record<string, unknown> = {};

  for (const field of def.fields) {
    const value = form.get(field.name);
    if (field.type === "checkbox") {
      raw[field.name] = value === "on" || value === "true";
    } else if (field.type === "number" || field.type === "range" || field.type === "money") {
      const text = blankToNull(value)?.replace(",", ".") ?? null;
      raw[field.name] = text === null ? null : Number(text);
    } else if (field.type === "url") {
      const text = blankToNull(value);
      // People paste "ejemplo.com": accept it as https.
      raw[field.name] = text && !/^[a-z]+:\/\//i.test(text) ? `https://${text}` : text;
    } else {
      const text = blankToNull(value);
      raw[field.name] =
        text === null && field.type === "select" && typeof field.defaultValue === "string"
          ? field.defaultValue
          : text;
    }
  }

  const shape = Object.fromEntries(def.fields.map((f) => [f.name, fieldSchema(f)]));
  const result = z.object(shape).safeParse(raw);

  if (!result.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of result.error.issues) {
      const name = String(issue.path[0]);
      if (!fieldErrors[name]) {
        const field = def.fields.find((f) => f.name === name);
        fieldErrors[name] =
          raw[name] === null && field?.required ? `Falta «${field.label}»` : issue.message;
      }
    }
    return { ok: false, values: raw, fieldErrors };
  }

  const values = result.data as Record<string, unknown>;

  // Cross-field rules the database also enforces, explained in Spanish.
  const crossErrors: Record<string, string> = {};
  if (kind === "subscription" && values.frequency === "custom" && !values.custom_days) {
    crossErrors.custom_days = "Indica cada cuántos días se cobra";
  }
  // An unknown figure is empty, and an empty figure is unknown: the database
  // enforces the same thing, so say it in Spanish before it gets there.
  if (kind === "subscription") {
    if (values.amount === null && values.amount_status !== "unknown") {
      crossErrors.amount_status = "Sin importe, esto tiene que ser «Pendiente de confirmar»";
    }
    if (values.amount !== null && values.amount_status === "unknown") {
      crossErrors.amount_status = "Si has puesto un importe, di de dónde sale";
    }
    if (values.next_charge_date === null && values.date_status !== "unknown") {
      crossErrors.date_status = "Sin fecha, esto tiene que ser «Pendiente de confirmar»";
    }
    if (values.next_charge_date !== null && values.date_status === "unknown") {
      crossErrors.date_status = "Si has puesto una fecha, di de dónde sale";
    }
  }
  if (kind === "domain") {
    if (values.renews_on === null && values.renews_status !== "unknown") {
      crossErrors.renews_status = "Sin fecha, esto tiene que ser «Pendiente de confirmar»";
    }
    if (values.renews_on !== null && values.renews_status === "unknown") {
      crossErrors.renews_status = "Si has puesto una fecha, di de dónde sale";
    }
  }
  if (kind === "event" && values.end_date && typeof values.date === "string" && String(values.end_date) < values.date) {
    crossErrors.end_date = "El último día no puede ser anterior al primero";
  }
  if (kind === "event" && values.reminder_minutes !== null && values.reminder_minutes !== undefined) {
    values.reminder_minutes = Number(values.reminder_minutes);
  }
  if (kind === "event" && values.recurrence_interval === null) values.recurrence_interval = 1;
  if (kind === "project" && values.progress === null) values.progress = 0;

  if (Object.keys(crossErrors).length) return { ok: false, values: raw, fieldErrors: crossErrors };
  return { ok: true, values, fieldErrors: {} };
}
