import "server-only";

import { redirect } from "next/navigation";
import { cache } from "react";

import { panelRoutes } from "@/config/site";
import { isAllowedEmail, isSupabaseConfigured } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";

import type { LifeData } from "./agenda";
import { hourIn, todayIn } from "./dates";
import type { Lead, Profile } from "./model";

const DEFAULT_ZONE = "Europe/Madrid";

export interface PanelSession {
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>;
  userId: string;
  email: string;
  profile: Profile;
  today: string;
  hour: number;
}

/**
 * The signed-in, allowed user for this request, or a redirect to sign-in.
 *
 * Called by the panel layout, every panel page and every server action:
 * server actions are public POST endpoints, so none of them may trust that
 * the layout already checked.
 */
export const requirePanelSession = cache(async (): Promise<PanelSession> => {
  if (!isSupabaseConfigured()) redirect(panelRoutes.signIn);

  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;
  const email = typeof claims?.email === "string" ? claims.email : null;

  if (!claims?.sub || !isAllowedEmail(email)) redirect(panelRoutes.signIn);

  const { data: row } = await supabase.from("profiles").select("*").eq("user_id", claims.sub).maybeSingle();

  // The name typed at sign-up lives in the user's metadata until a profile
  // row exists (the first time Ajustes or the theme is saved).
  const metadataName =
    typeof claims.user_metadata?.display_name === "string" ? claims.user_metadata.display_name : null;
  const profile: Profile = {
    user_id: claims.sub,
    timezone: DEFAULT_ZONE,
    theme: "system",
    ...row,
    display_name: row?.display_name || metadataName,
  };

  return {
    supabase,
    userId: claims.sub,
    email: email!,
    profile,
    today: todayIn(profile.timezone || DEFAULT_ZONE),
    hour: hourIn(profile.timezone || DEFAULT_ZONE),
  };
});

/**
 * Everything the user has, in one round of parallel queries.
 *
 * A personal life fits in a few thousand rows; loading it whole keeps every
 * screen consistent (the home page and the calendar read the same agenda)
 * and is cheaper than a query per widget.
 */
export const loadLifeData = cache(async (): Promise<LifeData> => {
  const { supabase } = await requirePanelSession();
  return fetchLifeData(supabase);
});

/** Lo mismo, con un cliente ya creado: lo usa la exportación a Obsidian. */
export async function fetchLifeData(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
): Promise<LifeData> {
  const [
    events,
    tasks,
    subscriptions,
    transactions,
    charges,
    prices,
    accounts,
    partners,
    projectPartners,
    chargeShares,
    domains,
    vault,
    contacts,
    courses,
    courseItems,
    projects,
  ] = await Promise.all([
    supabase.from("events").select("*").order("date"),
    supabase.from("tasks").select("*").order("due_date", { nullsFirst: false }),
    supabase.from("subscriptions").select("*").order("next_charge_date", { nullsFirst: false }),
    supabase.from("transactions").select("*").order("date", { ascending: false }),
    supabase.from("charges").select("*").order("operation_date", { ascending: false, nullsFirst: false }),
    supabase.from("subscription_prices").select("*").order("effective_on", { nullsFirst: false }),
    supabase.from("accounts").select("*").order("name"),
    supabase.from("partners").select("*").order("name"),
    supabase.from("project_partners").select("*"),
    supabase.from("charge_shares").select("*"),
    supabase.from("domains").select("*").order("renews_on", { nullsFirst: false }),
    supabase.from("vault_items").select("*").order("created_at", { ascending: false }),
    supabase.from("contacts").select("*").order("name"),
    supabase.from("courses").select("*").order("name"),
    supabase.from("course_items").select("*").order("due_date", { nullsFirst: false }),
    supabase.from("projects").select("*").order("created_at"),
  ]);

  const firstError = [
    events,
    tasks,
    subscriptions,
    transactions,
    charges,
    prices,
    accounts,
    partners,
    projectPartners,
    chargeShares,
    domains,
    vault,
    contacts,
    courses,
    courseItems,
    projects,
  ].find((result) => result.error)?.error;
  if (firstError) throw new Error(`No se pudieron cargar tus datos: ${firstError.message}`);

  return {
    events: events.data ?? [],
    tasks: tasks.data ?? [],
    subscriptions: subscriptions.data ?? [],
    transactions: transactions.data ?? [],
    charges: charges.data ?? [],
    prices: prices.data ?? [],
    accounts: accounts.data ?? [],
    partners: partners.data ?? [],
    projectPartners: projectPartners.data ?? [],
    chargeShares: chargeShares.data ?? [],
    domains: domains.data ?? [],
    vault: vault.data ?? [],
    contacts: contacts.data ?? [],
    courses: courses.data ?? [],
    courseItems: courseItems.data ?? [],
    projects: projects.data ?? [],
  };
}

export const loadInbox = cache(async () => {
  const { supabase } = await requirePanelSession();
  const { data, error } = await supabase
    .from("inbox_items")
    .select("*")
    .is("processed_at", null)
    .order("created_at", { ascending: false });
  if (error) throw new Error(`No se pudo cargar la bandeja: ${error.message}`);
  return data ?? [];
});

/**
 * Las solicitudes de diagnóstico de la web.
 *
 * Viven en `leads`, fuera del resto de datos del panel, porque las escribe
 * gente sin sesión. Aquí solo se leen: la política de RLS exige que el usuario
 * esté en `panel_owners`.
 */
export const loadLeads = cache(async (): Promise<Lead[]> => {
  const { supabase } = await requirePanelSession();
  const { data, error } = await supabase
    .from("leads")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);
  if (error) throw new Error(`No se pudieron cargar las solicitudes: ${error.message}`);
  return data ?? [];
});

