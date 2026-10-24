import type { Metadata } from "next";

import { SignInForm } from "@/components/panel/SignInForm";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export const metadata: Metadata = { title: "Entrar" };

export default function SignInPage() {
  return (
    <div data-panel data-theme="system" className="grid min-h-dvh place-items-center bg-canvas px-4 py-12 text-fg">
      <main className="flex w-full max-w-sm flex-col gap-8">
        <div className="flex flex-col gap-2 text-center">
          <h1 className="text-title font-semibold tracking-[-0.025em]">Tu centro de control</h1>
          <p className="text-sm text-fg-muted">Privado. Solo entra quien tiene acceso.</p>
        </div>
        {isSupabaseConfigured() ? (
          <SignInForm />
        ) : (
          <p role="alert" className="rounded-2xl bg-caution-quiet px-5 py-4 text-sm text-caution">
            Este entorno no tiene Supabase configurado. Añade NEXT_PUBLIC_SUPABASE_URL,
            NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY y PANEL_ALLOWED_EMAILS.
          </p>
        )}
      </main>
    </div>
  );
}
