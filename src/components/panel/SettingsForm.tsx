"use client";

import { useActionState } from "react";

import { type FormState, saveProfile } from "@/app/panel/actions";

const initial: FormState = { ok: false };

const themes = [
  { value: "system", label: "Automático" },
  { value: "light", label: "Claro" },
  { value: "dark", label: "Oscuro" },
] as const;

/** The name the home screen greets, and the appearance. */
export function SettingsForm({ name, theme }: { name: string; theme: "system" | "light" | "dark" }) {
  const [state, action, pending] = useActionState(saveProfile, initial);

  return (
    <form action={action} className="flex flex-col gap-5 rounded-2xl bg-surface p-5 sm:p-6">
      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-fg-muted">Cómo quieres que te salude</span>
        <input
          name="display_name"
          defaultValue={name}
          maxLength={60}
          autoComplete="given-name"
          placeholder="Tu nombre"
          className="min-h-11 w-full rounded-xl bg-surface px-3.5 text-[0.9375rem] text-fg ring-1 ring-inset ring-line-field placeholder:text-fg-quiet focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        />
      </label>

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-1.5 text-sm font-medium text-fg-muted">Apariencia</legend>
        <div className="grid grid-cols-3 gap-2">
          {themes.map((t) => (
            <label
              key={t.value}
              className="flex min-h-11 cursor-pointer items-center justify-center rounded-xl bg-fill text-sm font-medium text-fg ring-inset has-[:checked]:bg-accent-quiet has-[:checked]:text-accent-text has-[:checked]:ring-2 has-[:checked]:ring-accent has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-accent"
            >
              <input type="radio" name="theme" value={t.value} defaultChecked={theme === t.value} className="sr-only" />
              {t.label}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex min-h-11 items-center rounded-full bg-accent px-6 text-sm font-semibold text-accent-fg hover:bg-accent-hover disabled:opacity-60"
        >
          {pending ? "Guardando…" : "Guardar"}
        </button>
        <p role="status" className="text-sm text-fg-muted">
          {state.ok ? "Guardado." : state.message ?? ""}
        </p>
      </div>
    </form>
  );
}
