"use client";

import { startTransition, useActionState, useState } from "react";

import { type FormState, signIn, signUp } from "@/app/panel/actions";
import { cn } from "@/lib/cn";

const initial: FormState = { ok: false };

const control =
  "w-full min-h-12 rounded-xl bg-surface px-4 text-base text-fg ring-1 ring-inset ring-line-field " +
  "placeholder:text-fg-quiet focus:outline-none focus-visible:ring-2 focus-visible:ring-accent";

/** Email and password. "Crear cuenta" exists for the first visit only. */
export function SignInForm() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [inState, inAction, inPending] = useActionState(signIn, initial);
  const [upState, upAction, upPending] = useActionState(signUp, initial);
  const state = mode === "signin" ? inState : upState;
  const pending = mode === "signin" ? inPending : upPending;

  return (
    <div className="flex flex-col gap-4">
      {/* onSubmit, not action={...}: a failed attempt must not wipe the email. */}
      <form
        onSubmit={(event) => {
          event.preventDefault();
          const data = new FormData(event.currentTarget);
          startTransition(() => (mode === "signin" ? inAction : upAction)(data));
        }}
        className="flex flex-col gap-3 rounded-[1.5rem] bg-surface p-5"
      >
        {mode === "signup" ? (
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-fg-muted">Tu nombre</span>
            <input name="display_name" autoComplete="given-name" maxLength={60} className={control} />
          </label>
        ) : null}
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-fg-muted">Correo</span>
          <input name="email" type="email" autoComplete="email" required className={control} />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-fg-muted">Contraseña</span>
          <input
            name="password"
            type="password"
            autoComplete={mode === "signin" ? "current-password" : "new-password"}
            required
            minLength={mode === "signup" ? 10 : undefined}
            aria-describedby={state.fieldErrors?.password ? "password-error" : undefined}
            className={control}
          />
          {state.fieldErrors?.password ? (
            <span id="password-error" className="text-sm text-critical">
              {state.fieldErrors.password}
            </span>
          ) : null}
        </label>

        {state.message ? (
          <p
            role={state.ok ? "status" : "alert"}
            className={cn(
              "rounded-xl px-4 py-3 text-sm",
              state.ok ? "bg-positive-quiet text-positive" : "bg-critical-quiet text-critical",
            )}
          >
            {state.message}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={pending}
          className="mt-1 inline-flex min-h-12 items-center justify-center rounded-full bg-accent px-6 text-[0.9375rem] font-semibold text-accent-fg transition-colors hover:bg-accent-hover disabled:opacity-60"
        >
          {pending ? "Un momento…" : mode === "signin" ? "Entrar" : "Crear cuenta"}
        </button>
      </form>

      <button
        type="button"
        onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
        className="mx-auto min-h-11 text-sm text-fg-muted underline decoration-line-strong underline-offset-4 hover:text-fg"
      >
        {mode === "signin" ? "Primera vez: crear cuenta" : "Ya tengo cuenta: entrar"}
      </button>
    </div>
  );
}
