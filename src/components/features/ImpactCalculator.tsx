"use client";

import { useId, useMemo, useState } from "react";

import { CompareBars, type FigureUnit } from "@/components/ui/Figure";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/cn";
import {
  type AmountKind,
  initialValues,
  type Scenario,
  type ScenarioKey,
  scenarios,
} from "@/lib/impact";

/**
 * Seis escenarios sobre los números del visitante.
 *
 * La aritmética vive en `lib/impact` y está cubierta por pruebas: aquí solo
 * se pintan campos y resultados. Cada cifra dice de qué clase de dinero habla
 * —facturación, ahorro, beneficio o retorno— y debajo se enseña la cuenta
 * entera, porque un número sin su cálculo es una promesa.
 */

const integer = new Intl.NumberFormat("es-ES", { maximumFractionDigits: 0 });
const decimal = new Intl.NumberFormat("es-ES", { maximumFractionDigits: 1 });
const euro = new Intl.NumberFormat("es-ES", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
  // En español 1500 no se agrupa por defecto; en un importe sí se quiere.
  useGrouping: "always",
});

/** La unidad con la que se pintan las barras de cada clase de cifra. */
const barUnit: Record<AmountKind, FigureUnit> = {
  revenue: "eur",
  saving: "eur",
  profit: "eur",
  time: "hours",
  ratio: "count",
};

/** Cómo se escribe cada clase de cifra, y qué palabra la acompaña. */
const kindLabel: Record<AmountKind, string> = {
  revenue: "facturación",
  saving: "ahorro de coste",
  profit: "beneficio",
  time: "tiempo",
  ratio: "",
};

function formatAmount(value: number, kind: AmountKind, label: string): string {
  if (kind === "time") return `${decimal.format(value)} h`;
  if (kind === "ratio") {
    if (label.toLowerCase().includes("porcentaje") || label.includes("Retorno")) {
      return `${decimal.format(value)} %`;
    }
    if (label.toLowerCase().includes("meses")) return `${decimal.format(value)}`;
    return decimal.format(value);
  }
  return euro.format(value);
}

export function ImpactCalculator({
  className,
  initial = "conversion",
  location = "home",
}: {
  className?: string;
  initial?: ScenarioKey;
  /** Para saber desde qué página se usa. */
  location?: string;
}) {
  const groupId = useId();
  const [current, setCurrent] = useState<ScenarioKey>(initial);
  const scenario: Scenario = scenarios.find((item) => item.key === current) ?? scenarios[0];

  const [values, setValues] = useState<Record<ScenarioKey, Record<string, number>>>(() =>
    Object.fromEntries(scenarios.map((item) => [item.key, initialValues(item)])) as Record<
      ScenarioKey,
      Record<string, number>
    >,
  );

  const active = values[scenario.key];
  const result = useMemo(() => scenario.compute(active), [scenario, active]);

  const set = (key: string, value: number) =>
    setValues((state) => ({ ...state, [scenario.key]: { ...state[scenario.key], [key]: value } }));

  return (
    <div className={cn("flex flex-col gap-6", className)}>
      {/* Las pestañas son botones: cambian el cálculo, no la página. */}
      <div
        role="tablist"
        aria-label="Tipo de mejora"
        className="flex flex-wrap gap-2"
      >
        {scenarios.map((item) => {
          const selected = item.key === scenario.key;
          return (
            <button
              key={item.key}
              type="button"
              role="tab"
              id={`${groupId}-tab-${item.key}`}
              aria-selected={selected}
              aria-controls={`${groupId}-panel`}
              onClick={() => {
                setCurrent(item.key);
                track("calculator_scenario", { location, variant: item.key });
              }}
              className={cn(
                "inline-flex min-h-11 items-center rounded-full px-4 text-sm font-medium transition-colors duration-[var(--duration-base)]",
                "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
                selected
                  ? "bg-fg text-bg"
                  : "bg-surface text-fg-muted ring-1 ring-line hover:text-fg",
              )}
            >
              {item.tab}
            </button>
          );
        })}
      </div>

      <div
        id={`${groupId}-panel`}
        role="tabpanel"
        aria-labelledby={`${groupId}-tab-${scenario.key}`}
        className="grid grid-cols-1 gap-10 rounded-2xl bg-surface p-6 ring-1 ring-line sm:p-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-14 lg:p-10"
      >
        <div className="flex flex-col gap-7">
          <div className="flex flex-col gap-2">
            <h3 className="text-h4 text-fg">{scenario.title}</h3>
            <p className="text-sm text-fg-muted">{scenario.question}</p>
          </div>

          <div className="flex flex-col gap-6">
            {scenario.inputs.map((input) => {
              const id = `${groupId}-${scenario.key}-${input.key}`;
              const value = active[input.key];
              return (
                <div key={input.key} className="flex flex-col gap-2.5">
                  <div className="flex items-baseline justify-between gap-4">
                    <label htmlFor={id} className="text-sm text-fg">
                      {input.label}
                    </label>
                    <output htmlFor={id} className="tnum text-sm font-medium text-fg">
                      {integer.format(value)}
                      {input.unit ? <span className="ml-1 text-fg-subtle">{input.unit}</span> : null}
                    </output>
                  </div>
                  <input
                    id={id}
                    type="range"
                    min={input.min}
                    max={input.max}
                    step={input.step}
                    value={value}
                    onChange={(event) => set(input.key, Number(event.target.value))}
                    onPointerUp={() =>
                      track("calculator_used", {
                        location,
                        variant: scenario.key,
                        value: Math.round(result.headline.value),
                      })
                    }
                    className="h-6 w-full cursor-pointer accent-accent"
                  />
                  {input.hint ? <p className="text-xs text-fg-subtle">{input.hint}</p> : null}
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col gap-6 border-t border-line pt-8 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-14">
          <div className="flex flex-col gap-2">
            <p className="type-label text-fg-subtle">{result.headline.label}</p>
            <p aria-live="polite" className="tnum type-display text-metric text-fg">
              {formatAmount(result.headline.value, result.headline.kind, result.headline.label)}
              {kindLabel[result.headline.kind] ? (
                <span className="ml-2 align-baseline font-sans text-[0.3em] font-medium tracking-normal text-fg-subtle">
                  {kindLabel[result.headline.kind]}
                </span>
              ) : null}
            </p>
          </div>

          {result.warning ? (
            <p role="status" className="rounded-xl bg-bg-subtle px-4 py-3 text-sm text-fg-muted">
              {result.warning}
            </p>
          ) : null}

          {result.compare ? (
            <CompareBars
              className="border-t border-line pt-6"
              caption={result.compare.caption}
              unit={barUnit[result.compare.unit]}
              bars={[
                { label: result.compare.now.label, value: result.compare.now.value },
                {
                  label: result.compare.better.label,
                  value: result.compare.better.value,
                  tone: "accent",
                },
              ]}
            />
          ) : null}

          <dl className="grid grid-cols-1 gap-x-8 gap-y-4 border-t border-line pt-6 sm:grid-cols-2">
            {result.lines.map((line) => (
              <div key={line.label} className="flex flex-col gap-1">
                <dt className="type-label text-fg-subtle">{line.label}</dt>
                <dd className="tnum text-h4 text-fg">
                  {formatAmount(line.value, line.kind, line.label)}
                </dd>
                {line.note ? <dd className="text-xs text-fg-subtle">{line.note}</dd> : null}
              </div>
            ))}
          </dl>

          <div className="flex flex-col gap-2 border-t border-line pt-6">
            <p className="type-label text-fg-subtle">La cuenta</p>
            <p className="text-sm leading-relaxed text-fg-muted">{result.workings}</p>
            <p className="text-xs text-fg-subtle">
              Simulación con tus propios números. No es el resultado de ningún cliente ni una
              previsión garantizada.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
