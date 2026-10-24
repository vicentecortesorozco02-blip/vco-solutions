import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

/**
 * Las piezas de un formulario.
 *
 * Etiqueta de verdad, error enlazado con aria-describedby, aria-invalid en el
 * campo que falla y la pista debajo. Las comparten el formulario de contacto
 * y el de diagnóstico para que los dos se comporten igual.
 */

export function inputClass(invalid: boolean, extra?: string) {
  return cn(
    "w-full rounded-sm border bg-surface px-3.5 text-[0.9375rem] text-fg",
    "transition-colors duration-[var(--duration-fast)] placeholder:text-fg-subtle",
    "hover:border-fg-subtle focus:border-accent focus:outline-none",
    invalid ? "border-critical" : "border-line-field",
    extra ?? "min-h-12",
  );
}

interface FieldRenderProps {
  describedBy: string | undefined;
  invalid: boolean;
}

export function Field({
  id,
  label,
  error,
  hint,
  optional,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  optional?: boolean;
  children: (props: FieldRenderProps) => ReactNode;
}) {
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="flex items-baseline gap-2 text-sm text-fg">
        {label}
        {optional ? (
          <span className="text-2xs text-fg-subtle">opcional</span>
        ) : null}
      </label>

      {children({ describedBy, invalid: Boolean(error) })}

      {hint ? (
        <p id={hintId} className="text-2xs text-fg-subtle">
          {hint}
        </p>
      ) : null}

      {error ? (
        <p id={errorId} className="text-sm text-critical">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function TextField({
  id,
  name,
  label,
  value,
  error,
  onChange,
  optional,
  type = "text",
  ...rest
}: {
  id: string;
  name: string;
  label: string;
  value: string;
  error?: string;
  onChange: (value: string) => void;
  optional?: boolean;
  type?: string;
  autoComplete?: string;
  inputMode?: "email" | "tel" | "text";
}) {
  return (
    <Field id={id} label={label} error={error} optional={optional}>
      {({ describedBy, invalid }) => (
        <input
          id={id}
          name={name}
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          aria-invalid={invalid}
          aria-describedby={describedBy}
          className={inputClass(invalid)}
          {...rest}
        />
      )}
    </Field>
  );
}
