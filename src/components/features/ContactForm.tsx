"use client";

import { useId, useRef, useState } from "react";
import { ArrowRight, Check } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { brand } from "@/config/brand";
import { routes } from "@/config/site";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/cn";
import {
  contactSchema,
  type ContactFieldErrors,
  type ContactInput,
} from "@/lib/contact-schema";

/**
 * The only form on the site.
 *
 * Four fields and a consent checkbox. Every extra field costs conversions, so
 * anything we could ask later is asked later — in the reply.
 *
 * Accessibility: real labels, errors wired with aria-describedby, aria-invalid
 * on the offending field, focus moved to the first error, and a live region
 * for the submission result.
 */

type Status = "idle" | "submitting" | "success" | "error";

/** Form state is looser than the payload: consent is a plain boolean until it
 *  passes validation, at which point the schema narrows it to `true`. */
type FormValues = Omit<ContactInput, "consent"> & { consent: boolean };

const initial: FormValues = {
  name: "",
  company: "",
  email: "",
  phone: "",
  process: "",
  consent: false,
  website: "",
};

const fieldOrder: (keyof ContactInput)[] = [
  "name",
  "company",
  "email",
  "phone",
  "process",
  "consent",
];

export function ContactForm({ className }: { className?: string }) {
  const formId = useId();
  const formRef = useRef<HTMLFormElement>(null);
  const [values, setValues] = useState<FormValues>(initial);
  const [errors, setErrors] = useState<ContactFieldErrors>({});
  const [status, setStatus] = useState<Status>("idle");
  const [started, setStarted] = useState(false);

  function update<K extends keyof FormValues>(key: K, value: FormValues[K]) {
    setValues((current) => ({ ...current, [key]: value }));
    if (errors[key]) setErrors((current) => ({ ...current, [key]: undefined }));

    if (!started) {
      setStarted(true);
      track("form_start", { location: "contacto" });
    }
  }

  function focusFirstError(nextErrors: ContactFieldErrors) {
    const first = fieldOrder.find((key) => nextErrors[key]);
    if (!first) return;
    const node = formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`);
    node?.focus();
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "submitting") return;

    const parsed = contactSchema.safeParse(values);

    if (!parsed.success) {
      const nextErrors: ContactFieldErrors = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof ContactInput | undefined;
        if (key && !nextErrors[key]) nextErrors[key] = issue.message;
      }
      setErrors(nextErrors);
      focusFirstError(nextErrors);
      track("form_error", { location: "contacto" });
      return;
    }

    setStatus("submitting");
    track("form_submit", { location: "contacto" });

    try {
      const response = await fetch("/api/contacto", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(parsed.data),
      });

      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as
          | { fieldErrors?: ContactFieldErrors }
          | null;

        if (body?.fieldErrors) {
          setErrors(body.fieldErrors);
          focusFirstError(body.fieldErrors);
        }

        setStatus("error");
        track("form_error", { location: "contacto" });
        return;
      }

      setStatus("success");
      track("form_success", { location: "contacto" });
    } catch {
      setStatus("error");
      track("form_error", { location: "contacto" });
    }
  }

  if (status === "success") {
    return (
      <div
        role="status"
        className={cn(
          "flex flex-col items-start gap-4 border border-line bg-surface p-8 lg:p-10",
          className,
        )}
      >
        <span className="flex size-10 items-center justify-center rounded-full bg-accent text-accent-fg">
          <Check className="size-5" strokeWidth={2} />
        </span>
        <h2 className="font-display text-h3 text-fg">Recibido. Gracias.</h2>
        <p className="max-w-[50ch] text-fg-muted">
          Lo leemos nosotros, no un formulario automático. Te contestamos en un
          día laborable con una opinión concreta sobre el proceso que nos has
          contado.
        </p>
      </div>
    );
  }

  return (
    <form
      ref={formRef}
      onSubmit={onSubmit}
      noValidate
      className={cn("flex flex-col gap-6", className)}
    >
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <TextField
          id={`${formId}-name`}
          name="name"
          label="Nombre"
          autoComplete="name"
          value={values.name}
          error={errors.name}
          onChange={(value) => update("name", value)}
        />
        <TextField
          id={`${formId}-company`}
          name="company"
          label="Empresa"
          autoComplete="organization"
          value={values.company}
          error={errors.company}
          onChange={(value) => update("company", value)}
        />
        <TextField
          id={`${formId}-email`}
          name="email"
          label="Email"
          type="email"
          inputMode="email"
          autoComplete="email"
          value={values.email}
          error={errors.email}
          onChange={(value) => update("email", value)}
        />
        <TextField
          id={`${formId}-phone`}
          name="phone"
          label="Teléfono"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          optional
          value={values.phone ?? ""}
          error={errors.phone}
          onChange={(value) => update("phone", value)}
        />
      </div>

      <Field
        id={`${formId}-process`}
        label="¿Qué tarea o proceso quieres mejorar?"
        error={errors.process}
        hint="Con dos líneas nos vale. Por ejemplo: “cada presupuesto nos lleva media hora y los hace siempre la misma persona”."
      >
        {({ describedBy, invalid }) => (
          <textarea
            id={`${formId}-process`}
            name="process"
            rows={5}
            value={values.process}
            onChange={(event) => update("process", event.target.value)}
            aria-invalid={invalid}
            aria-describedby={describedBy}
            className={inputClass(invalid, "min-h-32 py-3")}
          />
        )}
      </Field>

      {/*
       * Honeypot. The native `hidden` attribute (not a CSS class) so it stays
       * hidden even if the stylesheet fails to load, and is removed from the
       * accessibility tree without an aria-hidden wrapper around a focusable
       * input, which would be an ARIA violation. tabIndex -1 keeps it out of
       * the tab order.
       */}
      <div hidden>
        <label htmlFor={`${formId}-website`}>No rellenar</label>
        <input
          id={`${formId}-website`}
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={values.website ?? ""}
          onChange={(event) =>
            setValues((current) => ({
              ...current,
              website: event.target.value as FormValues["website"],
            }))
          }
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="flex cursor-pointer items-start gap-3 text-sm text-fg-muted">
          <input
            type="checkbox"
            name="consent"
            checked={values.consent === true}
            onChange={(event) => update("consent", event.target.checked)}
            aria-invalid={Boolean(errors.consent)}
            aria-describedby={errors.consent ? `${formId}-consent-error` : undefined}
            className="mt-0.5 size-4 shrink-0 cursor-pointer accent-accent"
          />
          <span>
            He leído y acepto la{" "}
            <a
              href={routes.legal.privacy}
              className="text-fg underline decoration-line-strong underline-offset-4 hover:decoration-accent"
            >
              política de privacidad
            </a>
            . Usaremos tus datos solo para responderte.
          </span>
        </label>
        {errors.consent ? (
          <p id={`${formId}-consent-error`} className="text-sm text-critical">
            {errors.consent}
          </p>
        ) : null}
      </div>

      <div className="flex flex-col items-start gap-4 pt-1">
        <Button
          type="submit"
          size="lg"
          block
          className="xs:w-auto"
          disabled={status === "submitting"}
        >
          {status === "submitting" ? "Enviando…" : "Enviar y que lo miremos"}
          <ArrowRight className="size-4" strokeWidth={2} />
        </Button>

        <p aria-live="polite" className="text-sm">
          {status === "error" ? (
            <span className="text-critical">
              No hemos podido enviarlo. Escríbenos directamente a{" "}
              <a
                href={`mailto:${brand.email}`}
                className="underline underline-offset-4"
              >
                {brand.email}
              </a>{" "}
              y lo resolvemos.
            </span>
          ) : (
            <span className="text-fg-subtle">
              Te contestamos en un día laborable. Sin llamadas comerciales.
            </span>
          )}
        </p>
      </div>
    </form>
  );
}

function inputClass(invalid: boolean, extra?: string) {
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

function Field({
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
  children: (props: FieldRenderProps) => React.ReactNode;
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

function TextField({
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
