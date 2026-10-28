/**
 * Life CRM domain model.
 *
 * Mirrors supabase/migrations/*_life_crm.sql. Every enum below is a CHECK
 * constraint in the database: change both together.
 *
 * Dates are ISO strings ("2026-10-10") and times "HH:MM" or "HH:MM:SS", as
 * Postgres returns them. Nothing here touches the network or React.
 */

export type ISODate = string;

export const PRIORITIES = ["low", "normal", "high", "urgent"] as const;
export type Priority = (typeof PRIORITIES)[number];
export const priorityLabel: Record<Priority, string> = {
  low: "Baja",
  normal: "Normal",
  high: "Alta",
  urgent: "Urgente",
};
/** Higher sorts first. */
export const priorityWeight: Record<Priority, number> = { low: 0, normal: 1, high: 2, urgent: 3 };

export const TASK_STATUSES = ["pending", "in_progress", "done", "postponed"] as const;
export type TaskStatus = (typeof TASK_STATUSES)[number];
export const taskStatusLabel: Record<TaskStatus, string> = {
  pending: "Pendiente",
  in_progress: "En progreso",
  done: "Completada",
  postponed: "Pospuesta",
};

export const PROJECT_STATUSES = ["idea", "active", "paused", "done"] as const;
export type ProjectStatus = (typeof PROJECT_STATUSES)[number];
export const projectStatusLabel: Record<ProjectStatus, string> = {
  idea: "Idea",
  active: "Activo",
  paused: "Pausado",
  done: "Finalizado",
};

export const EVENT_CATEGORIES = [
  "personal",
  "university",
  "work",
  "meeting",
  "payment",
  "renewal",
  "birthday",
  "travel",
  "appointment",
  "sport",
  "other",
] as const;
export type EventCategory = (typeof EVENT_CATEGORIES)[number];
export const eventCategoryLabel: Record<EventCategory, string> = {
  personal: "Personal",
  university: "Universidad",
  work: "Trabajo",
  meeting: "Reunión",
  payment: "Pago",
  renewal: "Renovación",
  birthday: "Cumpleaños",
  travel: "Viaje",
  appointment: "Cita",
  sport: "Deporte",
  other: "Otros",
};

export const RECURRENCES = ["none", "daily", "weekly", "monthly", "yearly"] as const;
export type Recurrence = (typeof RECURRENCES)[number];
export const recurrenceLabel: Record<Recurrence, string> = {
  none: "No se repite",
  daily: "Cada día",
  weekly: "Cada semana",
  monthly: "Cada mes",
  yearly: "Cada año",
};

export const FREQUENCIES = [
  "weekly",
  "every_4_weeks",
  "monthly",
  "quarterly",
  "semiannual",
  "annual",
  "custom",
  // These two never produce a forecast: there is nothing to repeat yet.
  "variable",
  "unknown",
] as const;
export type Frequency = (typeof FREQUENCIES)[number];
export const frequencyLabel: Record<Frequency, string> = {
  weekly: "Semanal",
  every_4_weeks: "Cada 4 semanas",
  monthly: "Mensual",
  quarterly: "Trimestral",
  semiannual: "Semestral",
  annual: "Anual",
  custom: "Personalizada",
  variable: "Variable (por consumo)",
  unknown: "Sin confirmar",
};

export const SUBSCRIPTION_CATEGORIES = [
  "software",
  "hosting",
  "domains",
  "email",
  "ai",
  "tools",
  "gym",
  "phone",
  "insurance",
  "media",
  "housing",
  "bank",
  "other",
] as const;
export type SubscriptionCategory = (typeof SUBSCRIPTION_CATEGORIES)[number];
export const subscriptionCategoryLabel: Record<SubscriptionCategory, string> = {
  software: "Software",
  hosting: "Hosting",
  domains: "Dominios",
  email: "Correo",
  ai: "IA",
  tools: "Herramientas",
  gym: "Gimnasio",
  phone: "Teléfono",
  insurance: "Seguros",
  media: "Ocio y medios",
  housing: "Vivienda y local",
  bank: "Banco",
  other: "Otros",
};

export const MONEY_CATEGORIES = [
  "housing",
  "food",
  "transport",
  "university",
  "business",
  "software",
  "leisure",
  "travel",
  "shopping",
  "income",
  "other",
] as const;
export type MoneyCategory = (typeof MONEY_CATEGORIES)[number];
export const moneyCategoryLabel: Record<MoneyCategory, string> = {
  housing: "Vivienda",
  food: "Comida",
  transport: "Transporte",
  university: "Universidad",
  business: "Negocio",
  software: "Software",
  leisure: "Ocio",
  travel: "Viajes",
  shopping: "Compras",
  income: "Ingreso",
  other: "Otros",
};

export const TRANSACTION_KINDS = ["expense", "income"] as const;
export type TransactionKind = (typeof TRANSACTION_KINDS)[number];
export const transactionKindLabel: Record<TransactionKind, string> = {
  expense: "Gasto",
  income: "Ingreso",
};

export const COURSE_ITEM_KINDS = ["assignment", "exam", "practice", "other"] as const;
export type CourseItemKind = (typeof COURSE_ITEM_KINDS)[number];
export const courseItemKindLabel: Record<CourseItemKind, string> = {
  assignment: "Trabajo",
  exam: "Examen",
  practice: "Práctica",
  other: "Otro",
};

export const VAULT_CATEGORIES = [
  "contracts",
  "university",
  "companies",
  "personal",
  "insurance",
  "domains",
  "invoices",
  "notes",
  "other",
] as const;
export type VaultCategory = (typeof VAULT_CATEGORIES)[number];
export const vaultCategoryLabel: Record<VaultCategory, string> = {
  contracts: "Contratos",
  university: "Universidad",
  companies: "Empresas",
  personal: "Personal",
  insurance: "Seguros",
  domains: "Dominios",
  invoices: "Facturas",
  notes: "Notas",
  other: "Otros",
};

/**
 * How sure we are of a figure or a date. Anything other than `confirmed` is
 * an estimate, and `unknown` means there is no value at all: it shows as
 * "Pendiente de confirmar" and stays out of every total, never counted as 0.
 */
export const CONFIDENCES = ["confirmed", "observed", "communicated", "approximate", "unknown"] as const;
export type Confidence = (typeof CONFIDENCES)[number];
export const confidenceLabel: Record<Confidence, string> = {
  confirmed: "Confirmado",
  observed: "Visto en el extracto",
  communicated: "Comunicado",
  approximate: "Aproximado",
  unknown: "Pendiente de confirmar",
};
/** Short form, for a chip next to a figure. */
export const confidenceShort: Record<Confidence, string> = {
  confirmed: "Confirmado",
  observed: "Observado",
  communicated: "Comunicado",
  approximate: "Aproximado",
  unknown: "Sin confirmar",
};
export const isEstimate = (confidence: Confidence) => confidence !== "confirmed";

/**
 * Las monedas que el panel sabe tratar.
 *
 * El euro es la moneda de la casa: los totales están en euros y nada más se
 * suma a ellos. Un importe en otra moneda se guarda tal cual, se enseña con su
 * símbolo y se queda fuera del total, contado aparte. Sin tipo de cambio no
 * hay conversión posible, y una conversión inventada sería peor que el hueco.
 */
export const CURRENCIES = ["EUR", "USD"] as const;
export type Currency = (typeof CURRENCIES)[number];
export const currencyLabel: Record<Currency, string> = {
  EUR: "Euros (€)",
  USD: "Dólares ($)",
};
export const HOME_CURRENCY: Currency = "EUR";
export const isHomeCurrency = (currency: string | null | undefined) =>
  (currency ?? HOME_CURRENCY) === HOME_CURRENCY;

export const SUBSCRIPTION_STATUSES = ["active", "review", "cancel_pending", "cancelled"] as const;
export type SubscriptionStatus = (typeof SUBSCRIPTION_STATUSES)[number];
export const subscriptionStatusLabel: Record<SubscriptionStatus, string> = {
  active: "Activa",
  review: "Revisar",
  cancel_pending: "Pendiente de cancelar",
  cancelled: "Cancelada",
};

export const TAX_MODES = ["included", "excluded", "unknown"] as const;
export type TaxMode = (typeof TAX_MODES)[number];
export const taxLabel: Record<TaxMode, string> = {
  included: "Impuestos incluidos",
  excluded: "Impuestos aparte",
  unknown: "Impuestos sin confirmar",
};

export const SCOPES = ["personal", "project", "pending"] as const;
export type Scope = (typeof SCOPES)[number];
export const scopeLabel: Record<Scope, string> = {
  personal: "Personal",
  project: "De un proyecto",
  pending: "Sin clasificar",
};

export const ACCOUNT_CHANGES = ["none", "pending", "confirmed"] as const;
export type AccountChange = (typeof ACCOUNT_CHANGES)[number];
export const accountChangeLabel: Record<AccountChange, string> = {
  none: "Sin cambio",
  pending: "Cambio pendiente",
  confirmed: "Cambio confirmado",
};

export const ACCOUNT_KINDS = ["bank", "paypal", "store", "other"] as const;
export type AccountKind = (typeof ACCOUNT_KINDS)[number];
export const accountKindLabel: Record<AccountKind, string> = {
  bank: "Cuenta bancaria",
  paypal: "PayPal",
  store: "Tienda o plataforma",
  other: "Otro",
};

export const CHARGE_KINDS = ["payment", "bank_fee", "invoice", "transfer"] as const;
export type ChargeKind = (typeof CHARGE_KINDS)[number];
export const chargeKindLabel: Record<ChargeKind, string> = {
  payment: "Pago",
  bank_fee: "Gasto bancario",
  invoice: "Factura",
  transfer: "Traspaso entre mis cuentas",
};
/**
 * Un traspaso mueve dinero de un bolsillo propio a otro: no es gasto ni
 * ingreso. Queda fuera de los totales, para que importar los dos extractos
 * que lo reflejan no lo cuente dos veces.
 */
export const isInternalTransfer = (kind: ChargeKind) => kind === "transfer";

/** Only `paid` is money gone. An authorisation or a failed attempt is not. */
export const CHARGE_STATUSES = ["paid", "failed", "authorization", "pending", "refunded", "cancelled"] as const;
export type ChargeStatus = (typeof CHARGE_STATUSES)[number];
export const chargeStatusLabel: Record<ChargeStatus, string> = {
  paid: "Pagado",
  failed: "Fallido",
  authorization: "Autorizacion",
  pending: "Pendiente de pago",
  refunded: "Devuelto",
  cancelled: "Cancelado",
};
export const countsAsSpent = (status: ChargeStatus) => status === "paid";

/**
 * Label colours for projects and calendar categories.
 *
 * A colour is a shortcut, never the message: the name is always next to it,
 * so the screen still reads the same in grey.
 */
export const TAG_COLORS = ["slate", "mint", "sky", "violet", "amber", "rose", "teal", "sand"] as const;
export type TagColor = (typeof TAG_COLORS)[number];
export const tagColorLabel: Record<TagColor, string> = {
  slate: "Gris",
  mint: "Verde",
  sky: "Azul",
  violet: "Violeta",
  amber: "Ámbar",
  rose: "Rosa",
  teal: "Turquesa",
  sand: "Arena",
};

export const INBOX_TARGETS = ["task", "event", "payment", "project", "note"] as const;
export type InboxTarget = (typeof INBOX_TARGETS)[number];
export const inboxTargetLabel: Record<InboxTarget, string> = {
  task: "Tarea",
  event: "Evento",
  payment: "Pago",
  project: "Proyecto",
  note: "Nota",
};

// ---------------------------------------------------------------------------
// Rows
// ---------------------------------------------------------------------------

interface Row {
  id: string;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  user_id: string;
  display_name: string | null;
  timezone: string;
  theme: "system" | "light" | "dark";
}

export interface Project extends Row {
  name: string;
  description: string | null;
  color: TagColor;
  status: ProjectStatus;
  priority: Priority;
  progress: number;
  start_date: ISODate | null;
  target_date: ISODate | null;
  url: string | null;
  notes: string | null;
}

export interface Course extends Row {
  name: string;
  teacher: string | null;
  schedule: string | null;
  room: string | null;
  url: string | null;
  notes: string | null;
  active: boolean;
}

export interface Task extends Row {
  title: string;
  description: string | null;
  due_date: ISODate | null;
  due_time: string | null;
  priority: Priority;
  status: TaskStatus;
  category: string | null;
  project_id: string | null;
  course_id: string | null;
  completed_at: string | null;
  /** Order inside its board column. Dragging rewrites it. */
  position: number;
}

export interface CourseItem extends Row {
  course_id: string;
  kind: CourseItemKind;
  title: string;
  due_date: ISODate | null;
  due_time: string | null;
  status: TaskStatus;
  priority: Priority;
  grade: number | null;
  description: string | null;
  url: string | null;
}

export interface CalendarEvent extends Row {
  title: string;
  date: ISODate;
  end_date: ISODate | null;
  start_time: string | null;
  end_time: string | null;
  category: EventCategory;
  location: string | null;
  notes: string | null;
  recurrence: Recurrence;
  recurrence_interval: number;
  recurrence_until: ISODate | null;
  reminder_minutes: number | null;
}

export interface Subscription extends Row {
  name: string;
  company: string | null;
  category: SubscriptionCategory;
  /** Null when the price is not known. Never 0 standing for "no idea". */
  amount: number | null;
  amount_status: Confidence;
  /** The date the current amount applies from. Older prices are kept apart. */
  amount_as_of: ISODate | null;
  currency: string;
  frequency: Frequency;
  custom_days: number | null;
  /** Null when there is no date to forecast from. */
  next_charge_date: ISODate | null;
  date_status: Confidence;
  tax: TaxMode;
  status: SubscriptionStatus;
  scope: Scope;
  /** What the bank or PayPal calls it, apart from what it really is. */
  merchant: string | null;
  observed_account_id: string | null;
  target_account_id: string | null;
  account_change: AccountChange;
  commitment: string | null;
  commitment_until: ISODate | null;
  payment_method: string | null;
  project_id: string | null;
  url: string | null;
  notes: string | null;
  source: string | null;
  /** Mirrors `status <> cancelled`; the database keeps it in step. */
  active: boolean;
}

export interface Account extends Row {
  name: string;
  institution: string | null;
  kind: AccountKind;
  /** Las cuatro últimas cifras del IBAN. El IBAN completo no se guarda. */
  iban_last4: string | null;
  /** Null cuando no se sabe. Un 0 € declarado sí es un dato: lo dice su estado. */
  balance: number | null;
  balance_as_of: ISODate | null;
  balance_status: Confidence;
  has_card: boolean;
  /** Where subscriptions should end up. A goal, not a fact. */
  is_target: boolean;
  notes: string | null;
  source: string | null;
}

export interface SubscriptionPrice extends Row {
  subscription_id: string;
  amount: number;
  currency: string;
  effective_on: ISODate | null;
  status: Exclude<Confidence, "unknown">;
  notes: string | null;
  source: string | null;
}

export interface Charge extends Row {
  description: string | null;
  kind: ChargeKind;
  status: ChargeStatus;
  amount: number;
  currency: string;
  operation_date: ISODate | null;
  value_date: ISODate | null;
  booking_date: ISODate | null;
  reported_on: ISODate | null;
  /** The instalment this charge settles: the "cuota del 30" paid on the 15th. */
  due_date: ISODate | null;
  period_label: string | null;
  merchant: string | null;
  channel: string | null;
  subscription_id: string | null;
  /** A domain renewal is a charge like any other. */
  domain_id: string | null;
  /** Who paid. Null means you did. */
  paid_by_partner_id: string | null;
  /** Split with the project's partners. The split itself is in charge_shares. */
  shared: boolean;
  /** A possible match nobody has confirmed. */
  candidate_subscription_id: string | null;
  identified: boolean;
  /** The same payment seen twice (PayPal and the bank): counted once. */
  mirror_of_id: string | null;
  account_id: string | null;
  /** The other end of a transfer between your own accounts. */
  counterpart_account_id: string | null;
  project_id: string | null;
  notes: string | null;
  source: string | null;
}

export interface Transaction extends Row {
  kind: TransactionKind;
  amount: number;
  date: ISODate;
  category: MoneyCategory;
  description: string | null;
  planned: boolean;
  project_id: string | null;
  /** En qué cuenta entra el ingreso, o de cuál sale el gasto. */
  account_id: string | null;
  source: string | null;
}

export interface Domain extends Row {
  domain: string;
  project_id: string | null;
  provider: string | null;
  purchased_on: ISODate | null;
  renews_on: ISODate | null;
  renews_status: Confidence;
  account_id: string | null;
  source: string | null;
  cost: number | null;
  auto_renew: boolean;
  email: string | null;
  notes: string | null;
}

export interface Contact extends Row {
  name: string;
  phone: string | null;
  email: string | null;
  company: string | null;
  relationship: string | null;
  birthday: ISODate | null;
  notes: string | null;
  last_interaction: ISODate | null;
  next_action: string | null;
  next_action_date: ISODate | null;
}

export interface VaultItem extends Row {
  title: string;
  category: VaultCategory;
  notes: string | null;
  url: string | null;
  date: ISODate | null;
  expires_on: ISODate | null;
}

export interface Partner extends Row {
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  notes: string | null;
  source: string | null;
}

export interface ProjectPartner extends Row {
  project_id: string;
  partner_id: string;
  /** Percentage of the project's shared costs. Null: still to be agreed. */
  share: number | null;
  role: string | null;
  notes: string | null;
}

export interface ChargeShare extends Row {
  charge_id: string;
  /** Null is your own share. */
  partner_id: string | null;
  share: number | null;
  amount: number | null;
  settled: boolean;
  notes: string | null;
}

export interface InboxItem extends Row {
  text: string;
  category: string | null;
  date: ISODate | null;
  processed_at: string | null;
  converted_to: InboxTarget | "dismissed" | null;
}

/**
 * Una solicitud de diagnóstico llegada desde la web pública.
 *
 * No lleva `user_id`: la escribe alguien sin sesión. Lo que la protege es RLS
 * —insertar sí, leer solo el dueño— y las restricciones de la tabla.
 */
export interface Lead {
  id: string;
  created_at: string;
  name: string;
  company: string;
  sector: string;
  email: string;
  phone: string | null;
  goal: string;
  context: string | null;
  source: string | null;
  processed_at: string | null;
  notes: string | null;
}

