import { Instrument_Sans, Instrument_Serif } from "next/font/google";

/**
 * Tipografía de marca.
 *
 * Aislada de `app/layout.tsx` para que cambiar de tipografía sea una decisión
 * de marca en `src/config/`, no una edición del layout. `next/font` exige que
 * la carga ocurra en el ámbito de módulo, por eso son constantes y no una
 * función.
 *
 * Al sustituirlas, mantener los nombres de variable CSS (`--font-brand-sans`,
 * `--font-brand-display`): el resto del sistema los referencia desde
 * `src/config/brand.css` y no debería enterarse del cambio.
 *
 * Reglas heredadas del sistema de diseño:
 *  - Display solo para titulares y cifras. Sans para todo lo que se lee.
 *  - `display: "swap"` para no bloquear el primer renderizado.
 *  - Servidas desde el propio dominio: sin peticiones a terceros.
 */

export const brandSans = Instrument_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-brand-sans",
});

export const brandDisplay = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  display: "swap",
  variable: "--font-brand-display",
});

/** Clases que el `<html>` necesita para exponer las variables CSS. */
export const fontVariables = `${brandSans.variable} ${brandDisplay.variable}`;
