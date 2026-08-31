import Link from "next/link";

import { brand } from "@/config/brand";
import { routes } from "@/config/site";
import { cn } from "@/lib/cn";

/**
 * SISTEMA DE LOGOTIPO.
 *
 * Único punto de la aplicación que dibuja la identidad. Cabecera, pie, imagen
 * social y cualquier uso futuro pasan por aquí, de modo que sustituir el
 * marcador por un logotipo real no obliga a tocar nada más.
 *
 * Hoy no hay logotipo. Lo que se dibuja es un marcador honesto: un rombo
 * geométrico y el nombre en tipografía de marca. Cuando exista el asset real,
 * `brand.logo.hasCustomAsset` lo activa y el resto del sistema no se entera.
 *
 * Variantes:
 *   lockup    símbolo + denominación. La forma por defecto.
 *   wordmark  solo la denominación. Para cuando el símbolo ya está presente.
 *   symbol    solo el isotipo. Espacios estrechos, avatares, favicon.
 *   compact   lockup con el nombre en su forma corta.
 *
 * Tonos: `default` sobre papel, `inverse` sobre el bloque oscuro.
 */

export type LogoVariant = "lockup" | "wordmark" | "symbol" | "compact";
export type LogoTone = "default" | "inverse";
export type LogoSize = "sm" | "md" | "lg";

const symbolSize: Record<LogoSize, string> = {
  sm: "size-2",
  md: "size-2.5",
  lg: "size-3",
};

const wordSize: Record<LogoSize, string> = {
  sm: "text-sm",
  md: "text-[0.9375rem]",
  lg: "text-lg",
};

interface LogoMarkProps {
  variant?: LogoVariant;
  tone?: LogoTone;
  size?: LogoSize;
  /** Anima el símbolo al pasar por encima del contenedor con `group`. */
  interactive?: boolean;
  className?: string;
}

/**
 * El logotipo sin enlace. Úsalo dentro de otro elemento interactivo o en
 * contextos donde no procede navegar (documentos, cabeceras impresas).
 */
export function LogoMark({
  variant = "lockup",
  tone = "default",
  size = "md",
  interactive = false,
  className,
}: LogoMarkProps) {
  const showSymbol = variant !== "wordmark";
  const showWord = variant !== "symbol";
  const word = variant === "compact" ? brand.shortName : brand.name;

  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      {showSymbol ? <LogoSymbol size={size} interactive={interactive} /> : null}

      {showWord ? (
        <span
          className={cn(
            "font-medium tracking-[-0.01em]",
            wordSize[size],
            tone === "inverse" ? "text-fg-inverse" : "text-fg",
          )}
        >
          {word}
        </span>
      ) : null}
    </span>
  );
}

/**
 * El isotipo aislado.
 *
 * Un rombo: la forma que el sistema ya usa para marcar "resultado" en los
 * diagramas de proceso. Está documentado en docs/BRAND.md como parte del
 * lenguaje visual, no como decoración.
 */
function LogoSymbol({
  size,
  interactive,
}: {
  size: LogoSize;
  interactive: boolean;
}) {
  if (brand.logo.hasCustomAsset && brand.logo.symbolSrc) {
    // Un SVG de marca servido desde /public no necesita el optimizador de
    // imágenes y debe pintarse sin un salto de layout.
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={brand.logo.symbolSrc}
        alt=""
        aria-hidden
        className={cn("shrink-0", symbolSize[size])}
      />
    );
  }

  return (
    <span
      aria-hidden
      className={cn(
        "shrink-0 rotate-45 rounded-[1px] bg-accent",
        symbolSize[size],
        interactive &&
          "transition-transform duration-[var(--duration-base)] ease-[var(--ease-out-quart)] group-hover:rotate-[135deg]",
      )}
    />
  );
}

interface LogoProps extends LogoMarkProps {
  /** Destino. Por defecto, la portada. */
  href?: string;
  /** Etiqueta accesible. Por defecto, el nombre más "inicio". */
  label?: string;
}

/**
 * El logotipo enlazado. Es lo que usan la cabecera y el pie.
 */
export function Logo({
  href = routes.home,
  label,
  variant = "lockup",
  tone = "default",
  size = "md",
  className,
}: LogoProps) {
  return (
    <Link
      href={href}
      aria-label={label ?? `${brand.name} — inicio`}
      className={cn("group inline-flex min-h-8 items-center rounded-xs", className)}
    >
      <LogoMark variant={variant} tone={tone} size={size} interactive />
    </Link>
  );
}
