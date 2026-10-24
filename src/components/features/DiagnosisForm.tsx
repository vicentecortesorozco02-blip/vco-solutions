"use client";

import { ArrowRight, Check } from "lucide-react";
import { useId, useRef, useState } from "react";

import { Button } from "@/components/ui/Button";
import { Field, inputClass, TextField } from "@/components/ui/FormField";
import { Select } from "@/components/ui/Select";
import { brand } from "@/config/brand";
import { routes } from "@/config/site";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/cn";
import {
  type DiagnosisFieldErrors,
  type DiagnosisInput,
  diagnosisGoals,
  diagnosisSchema,
  diagnosisSectors,
} from "@/lib/diagnosis-schema";

/**
 * Solicitud de la primera conversación.
 *
 * Seis campos y un consentimiento. La validación es la misma que la del
 * servidor; los desplegables son los de la casa, no los del sistema
 * operativo, y el valor viaja en un input oculto, así que el formulario
 * funciona igual.
 *
 * Nunca dice «enviado» sin que lo esté: si el servidor no puede guardar la
 * solicitud, aparece el correo para escribir directamente.
 */

type Status = "idle" | "submitting" | "success" | "error";

type FormValues = Omit<DiagnosisInput, "consent"> & { consent: boolean };

const initial: FormValues = {
  name: "",
  company: "",
  sector: "",
  email: "",
  phone: "",
  goal: "",
  context: "",
  consent: false,
  website: "",
};

const fieldOrder: (keyof DiagnosisInput)[] = [
  "name",
  "company",
  "sector",
  "email",
  "phone",
  "goal",
  "context",
  "consent",
];

export function DiagnosisForm({ className }: { className?: string }) {
  const formId = useId();
  const formRef = useRef<HTMLFormElement>(null);
  const [values, setValues] = useState<FormValues>(initial);
  const [errors, setErrors] = useState<DiagnosisFieldErrors>({});
  const [status, setStatus] = useState<Status>("idle");
  const [started, setStarted] = useState(false);

  function update<K extends keyof FormValues>(key: K, value: FormValues[K]) {
    setValues((current) => ({ ...current, [key]: value }));
    if (errors[key]) setErrors((current) => ({ ...current, [key]: undefined }));
    if (!started) {
      setStarted(true);
      track("form_start", { location: "diagnostico" });
    }
  }

  function focusFirstError(nextErrors: DiagnosisFieldErrors) {
    const first = fieldOrder.find((key) => nextErrors[key]);
    if (!first) return;
    const node = formRef.current?.querySelector<HTMLElement>(
      `[name="${first}"], #${CSS.escape(`${formId}-${first}`)}`,
    );
    node?.focus();
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "submitting") return;

    const parsed = diagnosisSchema.safeParse(values);
    if (!parsed.success) {
      const nextErrors: DiagnosisFieldErrors = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof DiagnosisInput | undefined;
        if (key && !nextErrors[key]) nextErrors[key] = issue.message;
      }
      setErrors(nextErrors);
      focusFirstError(nextErrors);
      track("form_error", { location: "diagnostico" });
      return;
    }

    setStatus("submitting");
    track("form_submit", { location: "diagnostico" });

    try {
      const response = await fetch("/api/diagnostico", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(parsed.data),
      });

      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as
          | { fieldErrors?: DiagnosisFieldErrors }
          | null;
        if (body?.fieldErrors) {
          setErrors(body.fieldErrors);
          focusFirstError(body.fieldErrors);
        }
        setStatus("error");
        track("form_error", { location: "diagnostico" });
        return;
      }

      setStatus("success");
      track("form_success", { location: "diagnostico" });
    } catch {
      setStatus("error");
      track("form_error", { location: "diagnostico" });
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
          <Check className="size-5" strokeWidth={2} aria-hidden />
        </span>
        <h2 className="type-display text-h3 text-fg">Recibido. Gracias.</h2>
        <p className="max-w-[52ch] text-fg-muted">
          Lo leemos nosotros, no un formulario automático. Te escribimos en un día laborable para
          proponerte la conversación de veinte minutos y qué conviene mirar antes.
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

        <Field id={`${formId}-sector`} label="Sector" error={errors.sector}>
          {({ describedBy, invalid }) => (
            <Select
              id={`${formId}-sector`}
              name="sector"
              value={values.sector}
              onValueChange={(value) => update("sector", value)}
              placeholder="Elige tu sector"
              aria-invalid={invalid}
              aria-describedby={describedBy}
              options={diagnosisSectors.map((sector) => ({ ...sector }))}
            />
          )}
        </Field>

        <TextField
          id={`${formId}-email`}
          name="email"
          label="Email profesional"
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

        <Field
          id={`${formId}-goal`}
          label="¿Por dónde quieres empezar?"
          error={errors.goal}
        >
          {({ describedBy, invalid }) => (
            <Select
              id={`${formId}-goal`}
              name="goal"
              value={values.goal}
              onValueChange={(value) => update("goal", value)}
              placeholder="Elige un objetivo"
              aria-invalid={invalid}
              aria-describedby={describedBy}
              options={diagnosisGoals.map((goal) => ({ ...goal }))}
            />
          )}
        </Field>
      </div>

      <Field
        id={`${formId}-context`}
        label="Cuéntanos el problema principal"
        optional
        error={errors.context}
        hint="Con dos líneas vale. Por ejemplo: «entran muchas peticiones y no sé cuántas acabamos contestando»."
      >
        {({ describedBy, invalid }) => (
          <textarea
            id={`${formId}-context`}
            name="context"
            rows={4}
            value={values.context ?? ""}
            onChange={(event) => update("context", event.target.value)}
            aria-invalid={invalid}
            aria-describedby={describedBy}
            className={inputClass(invalid, "min-h-28 py-3")}
          />
        )}
      </Field>

      {/* Señuelo: oculto con el atributo, no con CSS, y fuera del tabulador. */}
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
        <Button type="submit" size="lg" block className="xs:w-auto" disabled={status === "submitting"}>
          {status === "submitting" ? "Enviando…" : "Pedir la conversación de 20 minutos"}
          <ArrowRight className="size-4" strokeWidth={2} />
        </Button>

        <p aria-live="polite" className="text-sm">
          {status === "error" ? (
            <span className="text-critical">
              No hemos podido enviarlo. Escríbenos directamente a{" "}
              <a href={`mailto:${brand.email}`} className="underline underline-offset-4">
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
