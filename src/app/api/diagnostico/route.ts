import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

import { diagnosisSchema } from "@/lib/diagnosis-schema";
import { rateLimit } from "@/lib/rate-limit";
import { isSupabaseConfigured, supabaseKey, supabaseUrl } from "@/lib/supabase/config";

/**
 * Solicitudes de diagnóstico.
 *
 * El orden importa: primero los rechazos baratos (tamaño, límite por IP,
 * señuelo) para que el abuso no llegue nunca a validar ni a escribir.
 *
 * La solicitud se guarda en la tabla `leads`, que tiene RLS: cualquiera puede
 * insertar y solo el dueño del panel puede leer. Si además hay un webhook
 * configurado, se avisa por ahí; que el aviso falle no pierde la solicitud,
 * porque ya está guardada.
 *
 * Si no hay dónde guardarla, la respuesta es 503 y la interfaz ofrece el
 * correo. Un formulario que dice «enviado» y tira el contacto a la basura es
 * peor que uno que reconoce que no está disponible.
 */

export const runtime = "nodejs";

const MAX_BODY_BYTES = 16 * 1024;

function clientKey(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]!.trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}

export async function POST(request: Request) {
  const declaredLength = Number(request.headers.get("content-length") ?? 0);
  if (declaredLength > MAX_BODY_BYTES) {
    return NextResponse.json({ error: "payload_too_large" }, { status: 413 });
  }

  const limit = rateLimit(clientKey(request));
  if (!limit.ok) {
    return NextResponse.json(
      { error: "rate_limited" },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } },
    );
  }

  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const parsed = diagnosisSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if (typeof key === "string" && !fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return NextResponse.json({ error: "invalid", fieldErrors }, { status: 422 });
  }

  const data = parsed.data;

  // Señuelo: se contesta igual que un envío correcto para no enseñar nada.
  if (data.website) return NextResponse.json({ ok: true });

  const lead = {
    name: data.name,
    company: data.company,
    sector: data.sector,
    email: data.email,
    phone: data.phone || null,
    goal: data.goal,
    context: data.context || null,
    // Atribución, no identidad: desde qué página se envió.
    source: request.headers.get("referer")?.slice(0, 300) ?? null,
  };

  let stored = false;

  if (isSupabaseConfigured()) {
    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { error } = await supabase.from("leads").insert(lead);
    if (error) {
      console.error("[diagnostico] no se pudo guardar", error.message);
    } else {
      stored = true;
    }
  }

  const webhook = process.env.CONTACT_WEBHOOK_URL;
  if (webhook) {
    try {
      const response = await fetch(webhook, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...lead, receivedAt: new Date().toISOString(), kind: "diagnostico" }),
      });
      if (response.ok) stored = true;
      else console.error("[diagnostico] webhook rechazado", response.status);
    } catch (error) {
      console.error("[diagnostico] error de webhook", error);
    }
  }

  if (stored) return NextResponse.json({ ok: true });

  if (process.env.NODE_ENV !== "production") {
    console.info("[diagnostico] sin destino configurado, solicitud en consola", lead);
    return NextResponse.json({ ok: true, transport: "console" });
  }

  console.error("[diagnostico] sin destino configurado en producción");
  return NextResponse.json({ error: "not_configured" }, { status: 503 });
}
