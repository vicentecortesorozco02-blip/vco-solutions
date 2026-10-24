"use client";

import { ArrowUp, Check, X } from "lucide-react";
import { startTransition, useActionState, useEffect, useOptimistic, useRef, useState, useTransition } from "react";

import {
  addKnownProjects,
  captureInbox,
  dismissInbox,
  markPaid,
  setCourseItemDone,
  setLeadProcessed,
  setSubscriptionStatus,
  setTaskDone,
  type FormState,
} from "@/app/panel/actions";
import { cn } from "@/lib/cn";
import type { SubscriptionStatus } from "@/lib/life/model";

/**
 * Completing a task is one tap: the circle fills at once and the server
 * catches up. 44 px of target around a 22 px circle.
 */
export function DoneToggle({
  id,
  done,
  label,
  kind = "task",
}: {
  id: string;
  done: boolean;
  label: string;
  kind?: "task" | "courseItem";
}) {
  const [optimistic, setOptimistic] = useOptimistic(done);
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={optimistic}
      aria-label={optimistic ? `Marcar «${label}» como pendiente` : `Completar «${label}»`}
      onClick={() =>
        startTransition(async () => {
          setOptimistic(!optimistic);
          await (kind === "task" ? setTaskDone(id, !optimistic) : setCourseItemDone(id, !optimistic));
        })
      }
      className="group/check -m-1.5 grid size-11 shrink-0 place-items-center rounded-full"
    >
      <span
        className={cn(
          "grid size-[1.375rem] place-items-center rounded-full ring-[1.5px] ring-inset transition-colors duration-[var(--duration-fast)]",
          optimistic ? "bg-accent text-accent-fg ring-accent" : "text-transparent ring-line-field group-hover/check:ring-accent",
        )}
      >
        <Check className="size-3.5" strokeWidth={3} aria-hidden />
      </span>
    </button>
  );
}

export function MarkPaidButton({ id }: { id: string }) {
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => start(() => markPaid(id))}
      className="inline-flex min-h-9 items-center gap-1.5 rounded-full bg-fill px-3 text-xs font-medium text-fg transition-colors hover:bg-fill-strong disabled:opacity-60"
    >
      <Check className="size-3.5" strokeWidth={2.5} aria-hidden />
      {pending ? "…" : "Pagado"}
    </button>
  );
}

export function DismissInboxButton({ id }: { id: string }) {
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      aria-label="Descartar"
      title="Descartar"
      onClick={() => start(() => dismissInbox(id))}
      className="grid size-9 place-items-center rounded-full text-fg-subtle transition-colors hover:bg-fill hover:text-fg disabled:opacity-60"
    >
      <X className="size-4" strokeWidth={2.25} aria-hidden />
    </button>
  );
}

/** Atendida o pendiente, para una solicitud de diagnóstico. */
export function LeadProcessedButton({ id, processed }: { id: string; processed: boolean }) {
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => start(() => setLeadProcessed(id, !processed))}
      className="inline-flex min-h-9 items-center rounded-full bg-fill px-3 text-xs font-medium text-fg-muted transition-colors hover:text-fg disabled:opacity-60"
    >
      {processed ? "Volver a pendiente" : "Marcar atendida"}
    </button>
  );
}

const initial: FormState = { ok: false };

/**
 * Capture first, decide later. Type, press Enter, done; the field empties
 * and keeps focus for the next thought.
 */
export function InboxCapture({ autoFocus = false }: { autoFocus?: boolean }) {
  const [state, action, pending] = useActionState(captureInbox, initial);
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (state.savedAt && input.current) {
      input.current.value = "";
      input.current.focus();
    }
  }, [state.savedAt]);

  return (
    <form action={action} className="flex flex-col gap-2">
      <div className="flex items-center gap-2 rounded-2xl bg-surface p-1.5 pl-4 ring-1 ring-inset ring-line-soft focus-within:ring-2 focus-within:ring-accent">
        <label htmlFor="inbox-text" className="sr-only">
          Apunta algo para no olvidarlo
        </label>
        <input
          ref={input}
          id="inbox-text"
          name="text"
          required
          maxLength={500}
          autoComplete="off"
          autoFocus={autoFocus}
          placeholder="Pagar seguro coche el viernes…"
          className="min-h-11 flex-1 bg-transparent text-[0.9375rem] text-fg placeholder:text-fg-quiet focus:outline-none"
        />
        <button
          type="submit"
          disabled={pending}
          aria-label="Guardar en el inbox"
          className="grid size-10 shrink-0 place-items-center rounded-full bg-accent text-accent-fg transition-colors hover:bg-accent-hover disabled:opacity-60"
        >
          <ArrowUp className="size-5" strokeWidth={2.25} aria-hidden />
        </button>
      </div>
      {state.fieldErrors?.text || (state.message && !state.ok) ? (
        <p role="alert" className="px-1 text-sm text-critical">
          {state.fieldErrors?.text ?? state.message}
        </p>
      ) : null}
    </form>
  );
}

export function AddKnownProjectsButton() {
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => start(() => addKnownProjects())}
      className="inline-flex min-h-11 items-center rounded-full bg-accent px-5 text-sm font-semibold text-accent-fg transition-colors hover:bg-accent-hover disabled:opacity-60"
    >
      {pending ? "Añadiendo…" : "Añadir WAT, WAT Sales, YourHotelWeb y esta web"}
    </button>
  );
}

/**
 * Cancel a subscription, or bring it back. Two steps when cancelling: it
 * changes what the forecasts say, so it should not happen by accident.
 */
export function SubscriptionStatusButton({ id, status }: { id: string; status: SubscriptionStatus }) {
  const [pending, startTransition] = useTransition();
  const [confirming, setConfirming] = useState(false);
  const cancelled = status === "cancelled";

  const apply = (next: SubscriptionStatus) => {
    setConfirming(false);
    startTransition(async () => {
      await setSubscriptionStatus(id, next);
    });
  };

  if (cancelled) {
    return (
      <button
        type="button"
        onClick={() => apply("active")}
        disabled={pending}
        className="inline-flex min-h-10 items-center rounded-full bg-surface px-4 text-sm font-medium text-fg hover:bg-surface-raised disabled:opacity-60"
      >
        {pending ? "Reactivando…" : "Reactivar"}
      </button>
    );
  }

  if (confirming) {
    return (
      <span className="inline-flex items-center gap-2">
        <button
          type="button"
          onClick={() => apply("cancelled")}
          disabled={pending}
          className="inline-flex min-h-10 items-center rounded-full bg-critical px-4 text-sm font-semibold text-fg-inverse disabled:opacity-60"
        >
          {pending ? "Anulando…" : "Sí, anular"}
        </button>
        <button
          type="button"
          onClick={() => setConfirming(false)}
          className="inline-flex min-h-10 items-center rounded-full px-3 text-sm font-medium text-fg-muted hover:text-fg"
        >
          No
        </button>
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setConfirming(true)}
      className="inline-flex min-h-10 items-center rounded-full bg-surface px-4 text-sm font-medium text-fg hover:bg-surface-raised"
    >
      Anular suscripción
    </button>
  );
}
