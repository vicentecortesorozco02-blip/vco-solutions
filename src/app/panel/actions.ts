"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { brand } from "@/config/brand";
import { panelRoutes } from "@/config/site";
import { type EntityDef, type EntityKind, entities, isEntityKind, parseEntityForm } from "@/lib/life/entities";
import { SYSTEM_PROMPT, briefing } from "@/lib/life/ai";
import {
  EVENT_CATEGORIES,
  PRIORITIES,
  SUBSCRIPTION_STATUSES,
  TASK_STATUSES,
  type SubscriptionStatus,
  type TaskStatus,
} from "@/lib/life/model";
import { loadLifeData, requirePanelSession } from "@/lib/life/server";
import { isAllowedEmail, isSupabaseConfigured } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * Every write the panel makes.
 *
 * Server actions are public POST endpoints: each one starts with
 * requirePanelSession(), and every query goes through the user's own
 * Supabase client, so RLS applies even if a check here were wrong.
 */

export interface FormState {
  ok: boolean;
  message?: string;
  fieldErrors?: Record<string, string>;
  /** Changes on every success so the client can react (close, reset). */
  savedAt?: number;
}

const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function refresh() {
  revalidatePath(panelRoutes.home, "layout");
}

function friendly(message: string): string {
  if (message.includes("violates foreign key")) return "El proyecto o la asignatura elegidos ya no existen.";
  if (message.includes("violates check constraint")) return "Hay un valor que no encaja. Revisa los campos.";
  return "No se pudo guardar. Inténtalo de nuevo.";
}

/** What an inbox item becomes when converted into each kind. */
const inboxTarget: Partial<Record<EntityKind, string>> = {
  task: "task",
  event: "event",
  transaction: "payment",
  subscription: "payment",
  project: "project",
  vault: "note",
};

export async function saveEntity(
  kind: EntityKind,
  id: string | null,
  _prev: FormState,
  form: FormData,
): Promise<FormState> {
  if (!isEntityKind(kind) || (id !== null && !uuid.test(id))) return { ok: false, message: "Petición no válida." };
  const { supabase } = await requirePanelSession();
  const def: EntityDef = entities[kind];

  const parsed = parseEntityForm(kind, form);
  if (!parsed.ok) return { ok: false, fieldErrors: parsed.fieldErrors, message: "Revisa los campos marcados." };

  const values = { ...parsed.values };
  if (kind === "task") {
    values.completed_at = values.status === "done" ? new Date().toISOString() : null;
  }

  const query = id
    ? supabase.from(def.table).update(values).eq("id", id)
    : supabase.from(def.table).insert(values);
  const { error } = await query;
  if (error) return { ok: false, message: friendly(error.message) };

  // Converting an inbox item: mark it processed once its new home exists.
  const fromInbox = form.get("_inbox");
  if (!id && typeof fromInbox === "string" && uuid.test(fromInbox)) {
    await supabase
      .from("inbox_items")
      .update({ processed_at: new Date().toISOString(), converted_to: inboxTarget[kind] ?? "note" })
      .eq("id", fromInbox);
  }

  refresh();
  return { ok: true, savedAt: Date.now() };
}

export async function deleteEntity(kind: EntityKind, id: string): Promise<FormState> {
  if (!isEntityKind(kind) || !uuid.test(id)) return { ok: false, message: "Petición no válida." };
  const { supabase } = await requirePanelSession();
  const { error } = await supabase.from(entities[kind].table).delete().eq("id", id);
  if (error) return { ok: false, message: "No se pudo borrar." };
  refresh();
  return { ok: true, savedAt: Date.now() };
}

/** Loads one record for the edit dialog. RLS returns nothing for others' ids. */
export async function loadEntity(kind: EntityKind, id: string): Promise<Record<string, unknown> | null> {
  if (!isEntityKind(kind) || !uuid.test(id)) return null;
  const { supabase } = await requirePanelSession();
  const { data } = await supabase.from(entities[kind].table).select("*").eq("id", id).maybeSingle();
  return data;
}

export async function setTaskDone(id: string, done: boolean): Promise<void> {
  if (!uuid.test(id)) return;
  const { supabase } = await requirePanelSession();
  await supabase
    .from("tasks")
    .update({ status: done ? "done" : "pending", completed_at: done ? new Date().toISOString() : null })
    .eq("id", id);
  refresh();
}

export async function setCourseItemDone(id: string, done: boolean): Promise<void> {
  if (!uuid.test(id)) return;
  const { supabase } = await requirePanelSession();
  await supabase.from("course_items").update({ status: done ? "done" : "pending" }).eq("id", id);
  refresh();
}

/** A planned payment was paid: it becomes a regular expense. */
export async function markPaid(id: string): Promise<void> {
  if (!uuid.test(id)) return;
  const { supabase, today } = await requirePanelSession();
  await supabase.from("transactions").update({ planned: false, date: today }).eq("id", id).eq("planned", true);
  refresh();
}

export async function captureInbox(_prev: FormState, form: FormData): Promise<FormState> {
  const { supabase } = await requirePanelSession();
  const parsed = parseEntityForm("inbox", form);
  if (!parsed.ok) return { ok: false, fieldErrors: parsed.fieldErrors };
  const { error } = await supabase.from("inbox_items").insert(parsed.values);
  if (error) return { ok: false, message: friendly(error.message) };
  refresh();
  return { ok: true, savedAt: Date.now() };
}

export async function dismissInbox(id: string): Promise<void> {
  if (!uuid.test(id)) return;
  const { supabase } = await requirePanelSession();
  await supabase
    .from("inbox_items")
    .update({ processed_at: new Date().toISOString(), converted_to: "dismissed" })
    .eq("id", id);
  refresh();
}

/** Marca una solicitud de diagnóstico como atendida, o la devuelve a pendientes. */
export async function setLeadProcessed(id: string, processed: boolean): Promise<void> {
  if (!uuid.test(id)) return;
  const { supabase } = await requirePanelSession();
  await supabase
    .from("leads")
    .update({ processed_at: processed ? new Date().toISOString() : null })
    .eq("id", id);
  refresh();
}

export async function saveProfile(_prev: FormState, form: FormData): Promise<FormState> {
  const { supabase, userId } = await requirePanelSession();
  const name = String(form.get("display_name") ?? "").trim().slice(0, 60) || null;
  const theme = String(form.get("theme") ?? "system");
  if (!["system", "light", "dark"].includes(theme)) return { ok: false, message: "Tema no válido." };
  const { error } = await supabase.from("profiles").upsert({ user_id: userId, display_name: name, theme });
  if (error) return { ok: false, message: "No se pudo guardar." };
  refresh();
  return { ok: true, savedAt: Date.now() };
}

export async function setTheme(theme: "system" | "light" | "dark"): Promise<void> {
  if (!["system", "light", "dark"].includes(theme)) return;
  const { supabase, userId, profile } = await requirePanelSession();
  await supabase.from("profiles").upsert({ user_id: userId, display_name: profile.display_name, theme });
  refresh();
}

/**
 * Adds the projects this site already knows about, once. Names only: no
 * progress, dates or costs are invented. Skips any that already exist.
 */
export async function addKnownProjects(): Promise<void> {
  const { supabase } = await requirePanelSession();
  const known = [
    { name: "WAT — We Are Transfers", description: null, url: null },
    { name: "WAT Sales", description: null, url: null },
    { name: "YourHotelWeb", description: "La web, el CRM y los cobros de un hotel en un solo sistema.", url: "https://yourhotelweb.vercel.app" },
    { name: brand.name, description: brand.tagline, url: null },
  ];
  const { data: existing } = await supabase.from("projects").select("name");
  const names = new Set((existing ?? []).map((p) => p.name.toLowerCase()));
  const missing = known.filter((p) => !names.has(p.name.toLowerCase()));
  if (missing.length) await supabase.from("projects").insert(missing.map((p) => ({ ...p, status: "active" })));
  refresh();
}

// ---------------------------------------------------------------------------
// Search
// ---------------------------------------------------------------------------

export interface SearchHit {
  kind: EntityKind;
  id: string;
  title: string;
  detail: string;
}

const searchable: EntityKind[] = [
  "task",
  "event",
  "project",
  "contact",
  "course",
  "courseItem",
  "subscription",
  "charge",
  "account",
  "domain",
  "vault",
  "transaction",
  "inbox",
];

export async function searchEverything(rawQuery: string): Promise<SearchHit[]> {
  // PostgREST filter syntax uses , ( ) and * — strip them from user input.
  const query = rawQuery.replace(/[,()*%\\]/g, " ").trim().slice(0, 80);
  if (query.length < 2) return [];
  const { supabase } = await requirePanelSession();

  const results = await Promise.all(
    searchable.map(async (kind) => {
      const def: EntityDef = entities[kind];
      const filter = def.searchFields.map((field) => `${field}.ilike.*${query}*`).join(",");
      const { data } = await supabase.from(def.table).select("*").or(filter).limit(6);
      return (data ?? []).map((row: Record<string, unknown>) => ({
        kind,
        id: String(row.id),
        title: String(row[def.titleField] ?? def.singular),
        detail: def.singular,
      }));
    }),
  );

  return results.flat().slice(0, 40);
}

// ---------------------------------------------------------------------------
// Sign-in
// ---------------------------------------------------------------------------

export async function signIn(_prev: FormState, form: FormData): Promise<FormState> {
  if (!isSupabaseConfigured()) return { ok: false, message: "Falta configurar Supabase en este entorno." };
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  const password = String(form.get("password") ?? "");
  if (!email || !password) return { ok: false, message: "Escribe tu correo y tu contraseña." };
  if (!isAllowedEmail(email)) return { ok: false, message: "Correo o contraseña incorrectos." };

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    return {
      ok: false,
      message: error.message.includes("Email not confirmed")
        ? "Confirma tu correo con el enlace que te enviamos y vuelve a entrar."
        : "Correo o contraseña incorrectos.",
    };
  }
  redirect(panelRoutes.home);
}

export async function signUp(_prev: FormState, form: FormData): Promise<FormState> {
  if (!isSupabaseConfigured()) return { ok: false, message: "Falta configurar Supabase en este entorno." };
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  const password = String(form.get("password") ?? "");
  if (!isAllowedEmail(email)) return { ok: false, message: "Este panel es privado: ese correo no tiene acceso." };
  if (password.length < 10) return { ok: false, fieldErrors: { password: "Usa al menos 10 caracteres." } };

  const supabase = await createSupabaseServerClient();
  const displayName = String(form.get("display_name") ?? "").trim().slice(0, 60);
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: displayName ? { display_name: displayName } : undefined },
  });
  if (error) return { ok: false, message: "No se pudo crear la cuenta. ¿Ya existe? Prueba a entrar." };
  if (data.session) redirect(panelRoutes.home);
  return { ok: true, message: "Te hemos enviado un correo para confirmar la cuenta. Ábrelo y vuelve aquí para entrar." };
}

export async function signOut(): Promise<void> {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect(panelRoutes.signIn);
}

// ---------------------------------------------------------------------------
// Board, subscriptions and partners
// ---------------------------------------------------------------------------

/**
 * Drag and drop on the task board: a column and a place inside it.
 *
 * The position is a plain number and new cards land halfway between their
 * neighbours, so moving one card rewrites one row.
 */
export async function moveTask(id: string, status: TaskStatus, position: number): Promise<void> {
  if (!uuid.test(id) || !TASK_STATUSES.includes(status) || !Number.isFinite(position)) return;
  const { supabase } = await requirePanelSession();
  await supabase
    .from("tasks")
    .update({
      status,
      position,
      completed_at: status === "done" ? new Date().toISOString() : null,
    })
    .eq("id", id);
  refresh();
}

/** Cancel a subscription, or bring it back. The history is kept either way. */
export async function setSubscriptionStatus(id: string, status: SubscriptionStatus): Promise<FormState> {
  if (!uuid.test(id) || !SUBSCRIPTION_STATUSES.includes(status)) return { ok: false, message: "Petición no válida." };
  const { supabase } = await requirePanelSession();
  const { error } = await supabase.from("subscriptions").update({ status }).eq("id", id);
  if (error) return { ok: false, message: "No se pudo cambiar el estado." };
  refresh();
  return { ok: true, savedAt: Date.now() };
}

/** A shared expense was settled with a partner. */
export async function settleShare(id: string, settled: boolean): Promise<void> {
  if (!uuid.test(id)) return;
  const { supabase } = await requirePanelSession();
  await supabase.from("charge_shares").update({ settled }).eq("id", id);
  refresh();
}

// ---------------------------------------------------------------------------
// Assistant
// ---------------------------------------------------------------------------

export interface ChatTurn {
  role: "user" | "assistant";
  text: string;
}

export interface ChatReply {
  text: string;
  /** What it created, in Spanish, to show under the answer. */
  done: string[];
  error?: string;
}

const MODEL = "gemini-2.0-flash";

/**
 * Asks the assistant, with a written briefing of the panel attached, and
 * carries out what it proposes.
 *
 * Only three things can be created from here (tarea, evento, nota) and every
 * insert goes through the user's own client, so RLS still decides. Without an
 * API key the panel says so instead of pretending to think.
 */
export async function askAssistant(history: ChatTurn[], message: string): Promise<ChatReply> {
  const { supabase, today } = await requirePanelSession();
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    return {
      text: "Todavía no hay una clave de IA configurada. Cuando añadas GEMINI_API_KEY en el entorno, este chat podrá responder y apuntar cosas por ti.",
      done: [],
    };
  }

  const text = message.trim().slice(0, 2000);
  if (!text) return { text: "Escríbeme algo y te ayudo.", done: [] };

  const data = await loadLifeData();
  const contents = [
    ...history.slice(-10).map((turn) => ({
      role: turn.role === "user" ? "user" : "model",
      parts: [{ text: turn.text }],
    })),
    { role: "user", parts: [{ text: `Resumen del panel:\n\n${briefing(data, today)}\n\nMensaje: ${text}` }] },
  ];

  let reply: { respuesta?: string; acciones?: Record<string, string>[] };
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`,
      {
        method: "POST",
        headers: { "content-type": "application/json", "x-goog-api-key": key },
        body: JSON.stringify({
          contents,
          systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
          generationConfig: { responseMimeType: "application/json", temperature: 0.2 },
        }),
      },
    );
    if (!response.ok) {
      return { text: "", done: [], error: `La IA no ha respondido (${response.status}). Inténtalo otra vez.` };
    }
    const body = await response.json();
    const raw = body?.candidates?.[0]?.content?.parts?.[0]?.text ?? "{}";
    reply = JSON.parse(raw);
  } catch {
    return { text: "", done: [], error: "No se ha podido hablar con la IA. Revisa la conexión y vuelve a intentarlo." };
  }

  const done: string[] = [];
  for (const action of (reply.acciones ?? []).slice(0, 5)) {
    const title = String(action.titulo ?? action.texto ?? "").trim().slice(0, 200);
    if (!title) continue;
    const date = /^\d{4}-\d{2}-\d{2}$/.test(String(action.fecha)) ? String(action.fecha) : null;

    if (action.tipo === "tarea") {
      const { error } = await supabase.from("tasks").insert({
        title,
        due_date: date,
        due_time: time(action.hora),
        priority: PRIORITIES.includes(action.prioridad as never) ? action.prioridad : "normal",
        description: action.notas ?? null,
      });
      if (!error) done.push(`Tarea añadida: ${title}${date ? ` (${date})` : ""}`);
    } else if (action.tipo === "evento") {
      const { error } = await supabase.from("events").insert({
        title,
        date: date ?? today,
        start_time: time(action.hora_inicio ?? action.hora),
        end_time: time(action.hora_fin),
        category: EVENT_CATEGORIES.includes(action.categoria as never) ? action.categoria : "personal",
        location: action.lugar ?? null,
        notes: action.notas ?? null,
      });
      if (!error) done.push(`Evento añadido: ${title} (${date ?? today}${action.hora_inicio ? ` ${action.hora_inicio}` : ""})`);
    } else if (action.tipo === "nota") {
      const { error } = await supabase.from("inbox_items").insert({ text: title.slice(0, 500) });
      if (!error) done.push(`Nota guardada: ${title}`);
    }
  }

  if (done.length) refresh();
  return { text: String(reply.respuesta ?? "").slice(0, 4000) || "Hecho.", done };
}

const time = (value: unknown): string | null =>
  typeof value === "string" && /^([01]\d|2[0-3]):[0-5]\d$/.test(value) ? value : null;
