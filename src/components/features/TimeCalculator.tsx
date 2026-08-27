"use client";

import { useId, useMemo, useState } from "react";

import { cn } from "@/lib/cn";
import { track } from "@/lib/analytics";

/**
 * The honest metric.
 *
 * We have no client results to publish yet, and inventing them would be the
 * fastest way to lose a serious reader. What we can show is arithmetic the
 * visitor performs on their own numbers — which converts better than a
 * fabricated percentage and cannot be wrong.
 *
 * This is the seed of the full diagnosis tool. When that arrives it adds
 * sector, tooling and process type on top of exactly this calculation.
 */

const WEEKS_PER_YEAR = 46; // working weeks, holidays already discounted

interface Field {
  key: "minutes" | "timesPerWeek" | "people";
  label: string;
  /** Spanish agreement matters: "1 persona", not "1 personas". */
  suffix: { one: string; other: string };
  min: number;
  max: number;
  step: number;
}

const fields: Field[] = [
  {
    key: "minutes",
    label: "Minutos que consume cada vez",
    suffix: { one: "min", other: "min" },
    min: 2,
    max: 120,
    step: 1,
  },
  {
    key: "timesPerWeek",
    label: "Veces por semana",
    suffix: { one: "vez", other: "veces" },
    min: 1,
    max: 200,
    step: 1,
  },
  {
    key: "people",
    label: "Personas que lo hacen",
    suffix: { one: "persona", other: "personas" },
    min: 1,
    max: 20,
    step: 1,
  },
];

const integer = new Intl.NumberFormat("es-ES", { maximumFractionDigits: 0 });
const decimal = new Intl.NumberFormat("es-ES", { maximumFractionDigits: 1 });

export function TimeCalculator({ className }: { className?: string }) {
  const groupId = useId();
  const [minutes, setMinutes] = useState(12);
  const [timesPerWeek, setTimesPerWeek] = useState(25);
  const [people, setPeople] = useState(1);
  const [rate, setRate] = useState(22);

  const values = { minutes, timesPerWeek, people };
  const setters = {
    minutes: setMinutes,
    timesPerWeek: setTimesPerWeek,
    people: setPeople,
  } as const;

  const result = useMemo(() => {
    const hoursPerWeek = (minutes * timesPerWeek * people) / 60;
    return {
      hoursPerWeek,
      hoursPerMonth: (hoursPerWeek * WEEKS_PER_YEAR) / 12,
      hoursPerYear: hoursPerWeek * WEEKS_PER_YEAR,
      costPerYear: hoursPerWeek * WEEKS_PER_YEAR * rate,
    };
  }, [minutes, timesPerWeek, people, rate]);

  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-10 border border-line bg-surface p-6 sm:p-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-14 lg:p-10",
        className,
      )}
    >
      <div className="flex flex-col gap-7">
        <p className="text-sm text-fg-muted">
          Piensa en una sola tarea repetitiva de tu empresa y ajusta los tres
          números. El cálculo es aritmética, no una promesa nuestra.
        </p>

        <div className="flex flex-col gap-6">
          {fields.map((field) => {
            const id = `${groupId}-${field.key}`;
            const value = values[field.key];

            return (
              <div key={field.key} className="flex flex-col gap-2.5">
                <div className="flex items-baseline justify-between gap-4">
                  <label htmlFor={id} className="text-sm text-fg">
                    {field.label}
                  </label>
                  <output
                    htmlFor={id}
                    className="tnum text-sm font-medium text-fg"
                  >
                    {integer.format(value)}{" "}
                    <span className="text-fg-subtle">
                      {value === 1 ? field.suffix.one : field.suffix.other}
                    </span>
                  </output>
                </div>

                <input
                  id={id}
                  type="range"
                  min={field.min}
                  max={field.max}
                  step={field.step}
                  value={value}
                  onChange={(event) =>
                    setters[field.key](Number(event.target.value))
                  }
                  onPointerUp={() =>
                    track("diagnosis_calculated", {
                      location: "home",
                      value: Math.round(result.hoursPerYear),
                    })
                  }
                  className="h-6 w-full cursor-pointer accent-accent"
                />
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col justify-between gap-8 border-t border-line pt-8 lg:border-l lg:border-t-0 lg:pl-14 lg:pt-0">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <p className="text-2xs font-medium uppercase tracking-[0.16em] text-fg-subtle">
              Esa tarea consume
            </p>
            <p
              aria-live="polite"
              className="tnum font-display text-metric font-normal tracking-[-0.02em] text-fg"
            >
              {integer.format(Math.round(result.hoursPerYear))}
              <span className="ml-2 align-baseline font-sans text-[0.32em] font-medium tracking-normal text-fg-subtle">
                horas al año
              </span>
            </p>
          </div>

          <dl className="grid grid-cols-2 gap-x-8 gap-y-4 border-t border-line pt-6">
            <div className="flex flex-col gap-1">
              <dt className="text-2xs uppercase tracking-[0.1em] text-fg-subtle">
                A la semana
              </dt>
              <dd className="tnum text-h4 text-fg">
                {decimal.format(result.hoursPerWeek)} h
              </dd>
            </div>
            <div className="flex flex-col gap-1">
              <dt className="text-2xs uppercase tracking-[0.1em] text-fg-subtle">
                Al mes
              </dt>
              <dd className="tnum text-h4 text-fg">
                {integer.format(Math.round(result.hoursPerMonth))} h
              </dd>
            </div>
          </dl>
        </div>

        <div className="flex flex-col gap-3 border-t border-line pt-6">
          <div className="flex items-baseline justify-between gap-4">
            <label htmlFor={`${groupId}-rate`} className="text-sm text-fg-muted">
              Coste estimado por hora
            </label>
            <output htmlFor={`${groupId}-rate`} className="tnum text-sm font-medium text-fg">
              {integer.format(rate)} €
            </output>
          </div>
          <input
            id={`${groupId}-rate`}
            type="range"
            min={12}
            max={80}
            step={1}
            value={rate}
            onChange={(event) => setRate(Number(event.target.value))}
            className="h-6 w-full cursor-pointer accent-accent"
          />
          <p className="tnum text-sm text-fg">
            Equivale a unos{" "}
            <strong className="font-medium">
              {integer.format(Math.round(result.costPerYear))} €
            </strong>{" "}
            al año en coste de personal.
          </p>
          <p className="text-2xs text-fg-subtle">
            Cálculo: minutos × veces por semana × personas ÷ 60, sobre{" "}
            {WEEKS_PER_YEAR} semanas laborables.
          </p>
        </div>
      </div>
    </div>
  );
}
