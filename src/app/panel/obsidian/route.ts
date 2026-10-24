import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

import { isAllowedEmail, isSupabaseConfigured, supabaseKey, supabaseUrl } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { todayIn } from "@/lib/life/dates";
import { VAULT_FOLDER, vaultFiles } from "@/lib/life/markdown";
import { fetchLifeData } from "@/lib/life/server";

export const dynamic = "force-dynamic";

/**
 * El panel escrito en Markdown, para el script que lo deja en el vault.
 *
 * Acepta la sesión del navegador o un `Authorization: Bearer <token>` de
 * Supabase, que es lo que usa `npm run obsidian` desde tu ordenador. En los
 * dos casos la consulta corre como tu usuario: RLS decide qué sale, y la
 * lista de correos permitidos sigue mandando.
 */
export async function GET(request: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "El panel no tiene Supabase configurado." }, { status: 503 });
  }

  const header = request.headers.get("authorization");
  const token = header?.toLowerCase().startsWith("bearer ") ? header.slice(7).trim() : null;

  const supabase = token
    ? createClient(supabaseUrl, supabaseKey, {
        auth: { persistSession: false, autoRefreshToken: false },
        global: { headers: { Authorization: `Bearer ${token}` } },
      })
    : await createSupabaseServerClient();

  const { data: user } = await supabase.auth.getUser(token ?? undefined);
  const email = user?.user?.email ?? null;
  if (!user?.user || !isAllowedEmail(email)) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("timezone")
    .eq("user_id", user.user.id)
    .maybeSingle();
  const today = todayIn(profile?.timezone || "Europe/Madrid");

  const data = await fetchLifeData(supabase as Awaited<ReturnType<typeof createSupabaseServerClient>>);
  const generatedAt = new Date().toISOString();

  return NextResponse.json(
    { folder: VAULT_FOLDER, today, generatedAt, files: vaultFiles(data, today, generatedAt) },
    { headers: { "cache-control": "no-store" } },
  );
}
