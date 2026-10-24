"use client";

import { Trash2, X } from "lucide-react";
import { startTransition, useActionState, useEffect, useId, useRef, useState } from "react";

import { deleteEntity, type FormState, saveEntity } from "@/app/panel/actions";
import { cn } from "@/lib/cn";
import { Select } from "@/components/ui/Select";
import { type EntityDef, type EntityKind, type FieldDef, entities, newLabel } from "@/lib/life/entities";

export interface RelationOption {
  id: string;
  name: string;
}

interface EntityDialogProps {
  kind: EntityKind;
  /** The record being edited. Absent when creating. */
  record?: Record<string, unknown> | null;
  /** Values that prefill a new record (from ?v_field=...). */
  prefill?: Record<string, string>;
  /** Inbox item being converted, marked processed on save. */
  inboxId?: string | null;
  relations: Relations;
  today: string;
  onClose: () => void;
}

/** The lists a relation field can choose from. */
export interface Relations {
  projects: RelationOption[];
  courses: RelationOption[];
  accounts: RelationOption[];
  subscriptions: RelationOption[];
}

const relationsFor = (type: FieldDef["type"], relations: Relations): RelationOption[] => {
  switch (type) {
    case "project":
      return relations.projects;
    case "course":
      return relations.courses;
    case "account":
      return relations.accounts;
    case "subscription":
      return relations.subscriptions;
    default:
      return [];
  }
};

/** "Ninguno" or "Ninguna", so the empty option reads like Spanish. */
const emptyLabel = (type: FieldDef["type"]) =>
  type === "course" || type === "account" || type === "subscription" ? "Ninguna" : "Ninguno";

const initial: FormState = { ok: false };

/**
 * Create, edit and delete any record. A bottom sheet on phones, a centred
 * dialog from 640 px. Built on <dialog>, so focus trapping, Escape and the
 * top layer come from the browser.
 */
export function EntityDialog({ kind, record, prefill = {}, inboxId, relations, today, onClose }: EntityDialogProps) {
  const def: EntityDef = entities[kind];
  const id = typeof record?.id === "string" ? record.id : null;
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const [state, action, pending] = useActionState(saveEntity.bind(null, kind, id), initial);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const dialog = ref.current;
    if (dialog && !dialog.open) dialog.showModal();
  }, []);

  useEffect(() => {
    if (state.savedAt) onClose();
  }, [state.savedAt, onClose]);

  const valueOf = (field: FieldDef): string | number | boolean | null => {
    if (record && field.name in record) return record[field.name] as string | number | boolean | null;
    if (field.name in prefill) return prefill[field.name];
    if (field.defaultValue === "today") return today;
    return field.defaultValue ?? null;
  };

  // Lo que hay escrito ahora mismo en los campos de los que depende otro
  // campo: la frecuencia personalizada pide días, y solo ella.
  const [live, setLive] = useState<Record<string, string>>(() =>
    Object.fromEntries(def.fields.map((field) => [field.name, String(valueOf(field) ?? "")])),
  );
  const watched = new Set(def.fields.map((field) => field.showIf?.field).filter(Boolean) as string[]);
  const shown = (field: FieldDef) => !field.showIf || field.showIf.is.includes(live[field.showIf.field] ?? "");

  const advanced = def.fields.filter((f) => f.advanced && shown(f));
  const basic = def.fields.filter((f) => !f.advanced && shown(f));
  const advancedHasContent = advanced.some((f) => {
    const v = valueOf(f);
    return (v !== null && v !== "" && v !== f.defaultValue && f.type !== "checkbox") || state.fieldErrors?.[f.name];
  });

  async function onDelete() {
    if (!id) return;
    setDeleting(true);
    const result = await deleteEntity(kind, id);
    setDeleting(false);
    if (result.ok) onClose();
    else setDeleteError(result.message ?? "No se pudo borrar.");
  }

  const heading = id ? `Editar ${def.singular.toLowerCase()}` : newLabel(kind);

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        // A click on the backdrop lands on the <dialog> itself.
        if (event.target === ref.current) onClose();
      }}
      className={sheet}
    >
      {/* onSubmit instead of action={...}: React resets a form after an
          action, which would wipe what was typed when validation fails. */}
      <form
        onSubmit={(event) => {
          event.preventDefault();
          const data = new FormData(event.currentTarget);
          startTransition(() => action(data));
        }}
        noValidate
        className="flex max-h-[inherit] flex-col"
      >
        <div className="flex items-center justify-between gap-4 px-6 pt-5 pb-3">
          <h2 id={titleId} className="text-xl font-semibold tracking-[-0.02em]">
            {heading}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="grid size-9 place-items-center rounded-full bg-fill text-fg-muted transition-colors hover:text-fg"
            aria-label="Cerrar"
          >
            <X className="size-4" strokeWidth={2.25} aria-hidden />
          </button>
        </div>

        <div className="flex flex-col gap-4 overflow-y-auto overscroll-contain px-6 pt-1 pb-6">
          {inboxId ? <input type="hidden" name="_inbox" value={inboxId} /> : null}

          <FieldGrid
            fields={basic}
            valueOf={valueOf}
            errors={state.fieldErrors}
            relations={relations}
            autoFocus={!id}
            watched={watched}
            onWatchedChange={(name, value) => setLive((current) => ({ ...current, [name]: value }))}
          />

          {advanced.length ? (
            <details open={advancedHasContent} className="group">
              <summary className="flex min-h-10 cursor-pointer list-none items-center gap-2 text-sm font-medium text-accent-text [&::-webkit-details-marker]:hidden">
                <span className="group-open:hidden">Más detalles</span>
                <span className="hidden group-open:inline">Menos detalles</span>
              </summary>
              <div className="pt-3">
                <FieldGrid
                  fields={advanced}
                  valueOf={valueOf}
                  errors={state.fieldErrors}
                  relations={relations}
                  watched={watched}
                  onWatchedChange={(name, value) => setLive((current) => ({ ...current, [name]: value }))}
                />
              </div>
            </details>
          ) : null}

          {state.message && !state.ok ? (
            <p role="alert" className="rounded-xl bg-critical-quiet px-4 py-3 text-sm text-critical">
              {state.message}
            </p>
          ) : null}
          {deleteError ? (
            <p role="alert" className="rounded-xl bg-critical-quiet px-4 py-3 text-sm text-critical">
              {deleteError}
            </p>
          ) : null}
        </div>

        <div className="flex items-center gap-3 border-t border-line-soft px-6 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          {id ? (
            confirmDelete ? (
              <button
                type="button"
                onClick={onDelete}
                disabled={deleting}
                className="inline-flex min-h-11 items-center gap-2 rounded-full bg-critical-quiet px-4 text-sm font-medium text-critical disabled:opacity-60"
              >
                <Trash2 className="size-4" strokeWidth={2} aria-hidden />
                {deleting ? "Borrando…" : "Sí, borrar"}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                className="inline-flex min-h-11 items-center gap-2 rounded-full px-3 text-sm font-medium text-fg-muted transition-colors hover:text-critical"
              >
                <Trash2 className="size-4" strokeWidth={2} aria-hidden />
                Borrar
              </button>
            )
          ) : null}
          <button
            type="submit"
            disabled={pending}
            className="ml-auto inline-flex min-h-11 items-center rounded-full bg-accent px-6 text-sm font-semibold text-accent-fg transition-colors hover:bg-accent-hover disabled:opacity-60"
          >
            {pending ? "Guardando…" : "Guardar"}
          </button>
        </div>
      </form>
    </dialog>
  );
}

const sheet =
  "m-0 mt-auto w-full max-w-none overflow-hidden rounded-t-[1.75rem] bg-surface p-0 text-fg " +
  "max-h-[92dvh] backdrop:bg-scrim backdrop:backdrop-blur-[2px] " +
  "sm:m-auto sm:max-h-[85dvh] sm:max-w-lg sm:rounded-[1.75rem] sm:shadow-[var(--shadow-pop)]";

/**
 * The dialog frame with nothing in it yet.
 *
 * Shown while the record is being fetched, so a tap opens something at once
 * instead of leaving the screen still.
 */
export function DialogShell({ title, onClose }: { title: string; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (dialog && !dialog.open) dialog.showModal();
  }, []);

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      aria-busy
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === ref.current) onClose();
      }}
      className={sheet}
    >
      <div className="flex items-center justify-between gap-4 px-6 pt-5 pb-3">
        <h2 id={titleId} className="text-xl font-semibold tracking-[-0.02em]">
          {title}
        </h2>
        <button
          type="button"
          onClick={onClose}
          className="grid size-9 place-items-center rounded-full bg-fill text-fg-muted transition-colors hover:text-fg"
          aria-label="Cerrar"
        >
          <X className="size-4" strokeWidth={2.25} aria-hidden />
        </button>
      </div>
      <div className="flex flex-col gap-4 px-6 pt-1 pb-8" aria-hidden>
        {[0, 1, 2].map((row) => (
          <div key={row} className="flex flex-col gap-2">
            <div className="h-3 w-24 rounded-full bg-fill" />
            <div className="h-11 rounded-xl bg-fill" />
          </div>
        ))}
      </div>
    </dialog>
  );
}

const control =
  "w-full min-h-11 rounded-xl bg-surface px-3.5 text-[0.9375rem] text-fg ring-1 ring-inset ring-line-field transition-shadow " +
  "placeholder:text-fg-quiet focus:outline-none focus-visible:ring-2 focus-visible:ring-accent";

function FieldGrid({
  fields,
  valueOf,
  errors,
  relations,
  autoFocus = false,
  watched,
  onWatchedChange,
}: {
  fields: FieldDef[];
  valueOf: (field: FieldDef) => string | number | boolean | null;
  errors?: Record<string, string>;
  relations: Relations;
  autoFocus?: boolean;
  watched?: Set<string>;
  onWatchedChange?: (name: string, value: string) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-x-3 gap-y-4">
      {fields.map((field, index) => (
        <Field
          key={field.name}
          field={field}
          value={valueOf(field)}
          error={errors?.[field.name]}
          relations={relationsFor(field.type, relations)}
          autoFocus={autoFocus && index === 0}
          onChange={watched?.has(field.name) ? (value) => onWatchedChange?.(field.name, value) : undefined}
        />
      ))}
    </div>
  );
}

function Field({
  field,
  value,
  error,
  relations,
  autoFocus,
  onChange,
}: {
  field: FieldDef;
  value: string | number | boolean | null;
  error?: string;
  relations: RelationOption[];
  autoFocus: boolean;
  /** Set when another field's visibility depends on this one. */
  onChange?: (value: string) => void;
}) {
  const id = useId();
  const errorId = `${id}-error`;
  const span = field.half ? "col-span-2 xs:col-span-1" : "col-span-2";
  const describedBy = error ? errorId : field.hint ? `${id}-hint` : undefined;
  const text = value === null || value === undefined ? "" : String(value);
  const common = {
    id,
    name: field.name,
    required: field.required,
    "aria-invalid": error ? true : undefined,
    "aria-describedby": describedBy,
    autoFocus,
  } as const;

  if (field.type === "checkbox") {
    return (
      <label htmlFor={id} className="col-span-2 flex min-h-11 cursor-pointer items-center justify-between gap-4 rounded-xl">
        <span className="flex flex-col">
          <span className="text-[0.9375rem] text-fg">{field.label}</span>
          {field.hint ? <span className="text-xs text-fg-subtle">{field.hint}</span> : null}
        </span>
        <input
          {...common}
          type="checkbox"
          defaultChecked={value === true || value === "true"}
          className="peer relative h-7 w-12 shrink-0 cursor-pointer appearance-none rounded-full bg-fill-strong ring-1 ring-inset ring-line-field transition-colors before:absolute before:top-0.5 before:left-0.5 before:size-6 before:rounded-full before:bg-surface before:shadow-[var(--shadow-raise)] before:transition-transform checked:bg-accent checked:ring-accent checked:before:translate-x-5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        />
      </label>
    );
  }

  let input: React.ReactNode;
  switch (field.type) {
    case "textarea":
      input = <textarea {...common} defaultValue={text} rows={3} placeholder={field.placeholder} className={cn(control, "py-3")} />;
      break;
    case "select":
      input = (
        <Select
          id={id}
          name={field.name}
          defaultValue={text}
          autoFocus={autoFocus}
          onValueChange={onChange}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          options={[...(field.options ?? [])]}
        />
      );
      break;
    case "project":
    case "course":
    case "account":
    case "subscription":
      input = (
        <Select
          id={id}
          name={field.name}
          defaultValue={text}
          autoFocus={autoFocus}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          placeholder={field.required ? "Elige una" : emptyLabel(field.type)}
          options={[
            ...(field.required ? [] : [{ value: "", label: emptyLabel(field.type) }]),
            ...relations.map((option) => ({ value: option.id, label: option.name })),
          ]}
        />
      );
      break;
    case "range":
      input = <RangeInput common={common} value={Number(text || 0)} min={field.min ?? 0} max={field.max ?? 100} />;
      break;
    case "money":
      input = (
        <div className="relative">
          <input
            {...common}
            type="text"
            inputMode="decimal"
            defaultValue={text}
            placeholder="0,00"
            className={cn(control, "tnum pr-9")}
          />
          <span aria-hidden className="pointer-events-none absolute inset-y-0 right-3.5 grid place-items-center text-sm text-fg-subtle">
            €
          </span>
        </div>
      );
      break;
    default:
      input = (
        <input
          {...common}
          type={field.type === "number" ? "number" : field.type === "text" ? "text" : field.type}
          inputMode={field.type === "number" ? "numeric" : undefined}
          min={field.min}
          max={field.max}
          defaultValue={text}
          placeholder={field.placeholder}
          className={cn(control, (field.type === "date" || field.type === "time" || field.type === "number") && "tnum")}
        />
      );
  }

  return (
    <div className={cn("flex flex-col gap-1.5", span)}>
      <label htmlFor={id} className="text-sm font-medium text-fg-muted">
        {field.label}
        {field.required ? <span className="sr-only"> (obligatorio)</span> : null}
      </label>
      {input}
      {error ? (
        <p id={errorId} className="text-sm text-critical">
          {error}
        </p>
      ) : field.hint ? (
        <p id={`${id}-hint`} className="text-xs text-fg-subtle">
          {field.hint}
        </p>
      ) : null}
    </div>
  );
}

function RangeInput({
  common,
  value,
  min,
  max,
}: {
  common: Record<string, unknown>;
  value: number;
  min: number;
  max: number;
}) {
  const [current, setCurrent] = useState(value);
  return (
    <div className="flex items-center gap-4">
      <input
        {...common}
        type="range"
        min={min}
        max={max}
        step={5}
        value={current}
        onChange={(event) => setCurrent(Number(event.target.value))}
        className="h-11 flex-1 accent-[var(--color-accent)]"
      />
      <output htmlFor={String(common.id)} className="tnum w-12 text-right text-[0.9375rem] font-semibold">
        {current}%
      </output>
    </div>
  );
}
