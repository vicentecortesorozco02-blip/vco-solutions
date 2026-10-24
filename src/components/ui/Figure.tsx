import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

/**
 * Figuras de datos.
 *
 * La web tiene papel, tinta y un acento: no hay paleta de series ni la hace
 * falta, porque aquí nunca se comparan más de dos cosas. La situación de hoy
 * se pinta en tinta y el escenario de mejora en el acento, y las dos llevan su
 * número escrito al lado — el color no es nunca el único portador de
 * significado.
 *
 * Debajo de cada figura va la cuenta, y cada cifra dice de qué unidad habla.
 * Ninguna de estas cifras es el resultado de un cliente: o es aritmética sobre
 * un ejemplo, o son los números que ha escrito el propio visitante.
 */

export type FigureUnit = "eur" | "count" | "hours" | "percent";

const integer = new Intl.NumberFormat("es-ES", {
  maximumFractionDigits: 0,
  useGrouping: "always",
});

const decimal = new Intl.NumberFormat("es-ES", {
  maximumFractionDigits: 1,
  useGrouping: "always",
});

const euro = new Intl.NumberFormat("es-ES", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
  useGrouping: "always",
});

export function formatFigure(value: number, unit: FigureUnit): string {
  switch (unit) {
    case "eur":
      return euro.format(value);
    case "hours":
      return `${decimal.format(value)} h`;
    case "percent":
      return `${decimal.format(value)} %`;
    default:
      return Number.isInteger(value) ? integer.format(value) : decimal.format(value);
  }
}

export interface Bar {
  label: string;
  value: number;
  /** El acento marca el escenario de mejora; la tinta, la situación de hoy. */
  tone?: "ink" | "accent";
}

/**
 * Dos barras comparadas.
 *
 * Horizontales porque las etiquetas son frases, no años. La escala arranca en
 * cero siempre: una barra recortada miente sobre la proporción.
 */
export function CompareBars({
  caption,
  unit,
  bars,
  className,
}: {
  /** Qué se compara. Hace de nombre accesible de la tabla. */
  caption: string;
  unit: FigureUnit;
  bars: Bar[];
  className?: string;
}) {
  const max = Math.max(...bars.map((bar) => bar.value), 1);

  return (
    <figure className={cn("flex flex-col gap-4", className)}>
      <figcaption className="type-label text-fg-subtle">{caption}</figcaption>

      {/* Una tabla de verdad: se lee con lector de pantalla y sin estilos. */}
      <table className="w-full border-collapse">
        <caption className="sr-only">{caption}</caption>
        <tbody>
          {bars.map((bar) => {
            const accent = bar.tone === "accent";
            return (
              <tr key={bar.label} className="align-middle">
                <th
                  scope="row"
                  className="w-[46%] py-2 pr-4 text-left text-sm font-normal text-fg-muted sm:w-[40%]"
                >
                  {bar.label}
                </th>
                <td className="py-2">
                  <span className="flex items-center gap-3">
                    <span
                      aria-hidden
                      className="h-2.5 min-w-[2px] rounded-[4px] bg-current"
                      style={{
                        width: `${Math.max(2, (bar.value / max) * 100)}%`,
                        color: accent ? "var(--color-accent)" : "var(--color-line-strong)",
                      }}
                    />
                    <span
                      className={cn(
                        "tnum shrink-0 text-sm",
                        accent ? "font-semibold text-fg" : "text-fg-muted",
                      )}
                    >
                      {formatFigure(bar.value, unit)}
                    </span>
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </figure>
  );
}

export interface Stat {
  label: string;
  /** Un número se formatea con su unidad; un texto se escribe tal cual
   *  («25 min → 2 min»), que a veces es la cifra honesta. */
  value: number | string;
  unit?: FigureUnit;
  note?: string;
}

/** Tres o cuatro cifras en fila, como las de un informe. */
export function StatRow({
  stats,
  className,
  size = "default",
  tone = "default",
}: {
  stats: Stat[];
  className?: string;
  size?: "default" | "large";
  tone?: "default" | "inverse";
}) {
  const inverse = tone === "inverse";
  return (
    <dl
      className={cn(
        "grid grid-cols-2 gap-x-8 gap-y-6",
        stats.length > 2 && "sm:grid-cols-3",
        stats.length > 3 && "lg:grid-cols-4",
        className,
      )}
    >
      {stats.map((stat) => (
        <div
          key={stat.label}
          className={cn(
            "flex flex-col gap-1.5 border-t pt-4",
            inverse ? "border-line-inverse" : "border-line-strong",
          )}
        >
          <dt className={cn("type-label", inverse ? "text-fg-inverse-muted" : "text-fg-subtle")}>
            {stat.label}
          </dt>
          <dd
            className={cn(
              "tnum",
              inverse ? "text-fg-inverse" : "text-fg",
              size === "large" ? "type-display text-h2" : "text-h4",
            )}
          >
            {typeof stat.value === "number" ? formatFigure(stat.value, stat.unit ?? "count") : stat.value}
          </dd>
          {stat.note ? (
            <dd className={cn("text-sm", inverse ? "text-fg-inverse-muted" : "text-fg-muted")}>
              {stat.note}
            </dd>
          ) : null}
        </div>
      ))}
    </dl>
  );
}

/** El pie de una figura: la cuenta y, si hace falta, de dónde sale. */
export function FigureNote({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cn("text-sm leading-relaxed text-fg-muted", className)}>{children}</p>;
}
