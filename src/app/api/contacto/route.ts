import { NextResponse } from "next/server";

import { contactSchema } from "@/lib/contact-schema";
import { rateLimit } from "@/lib/rate-limit";

/**
 * Contact endpoint.
 *
 * Order matters: cheap rejections first (size, honeypot, rate limit) so that
 * abuse never reaches parsing or delivery.
 *
 * Delivery is intentionally pluggable and intentionally fails loudly. A form
 * that reports success while dropping the lead on the floor is worse than a
 * form that is honestly unavailable, so with no transport configured in
 * production the endpoint returns 503 and the UI offers the email address.
 *
 * Configure one of:
 *   CONTACT_WEBHOOK_URL  any endpoint that accepts a JSON POST
 * See .env.example.
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

  const parsed = contactSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if (typeof key === "string" && !fieldErrors[key]) {
        fieldErrors[key] = issue.message;
      }
    }
    return NextResponse.json({ error: "invalid", fieldErrors }, { status: 422 });
  }

  const data = parsed.data;

  // Honeypot: answer exactly like a success so a bot learns nothing.
  if (data.website) {
    return NextResponse.json({ ok: true });
  }

  const submission = {
    name: data.name,
    company: data.company,
    email: data.email,
    phone: data.phone || null,
    process: data.process,
    receivedAt: new Date().toISOString(),
    // Attribution, not identity. Useful for knowing which page produced leads.
    source: request.headers.get("referer") ?? null,
  };

  const webhook = process.env.CONTACT_WEBHOOK_URL;

  if (webhook) {
    try {
      const response = await fetch(webhook, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(submission),
      });

      if (!response.ok) {
        console.error("[contacto] webhook rejected", response.status);
        return NextResponse.json({ error: "delivery_failed" }, { status: 502 });
      }

      return NextResponse.json({ ok: true });
    } catch (error) {
      console.error("[contacto] webhook error", error);
      return NextResponse.json({ error: "delivery_failed" }, { status: 502 });
    }
  }

  if (process.env.NODE_ENV !== "production") {
    console.info("[contacto] no transport configured, logging submission", submission);
    return NextResponse.json({ ok: true, transport: "console" });
  }

  console.error("[contacto] no transport configured in production");
  return NextResponse.json({ error: "not_configured" }, { status: 503 });
}
