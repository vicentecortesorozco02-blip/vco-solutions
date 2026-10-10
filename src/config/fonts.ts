import { Archivo, Geist_Mono } from "next/font/google";

/**
 * Tipografía de marca.
 *
 * Aislada de `app/layout.tsx` para que cambiar de tipografía sea una decisión
 * de marca en `src/config/`, no una edición del layout. `next/font` exige que
 * la carga ocurra en el ámbito de módulo, por eso son constantes y no una
 * función.
 *
 * Una familia en dos anchos y una monoespaciada para etiquetas:
 *  - Archivo, con el eje de anchura (`wdth`). Ancha y en mayúsculas para los
 *    titulares (`type-display`), normal para todo lo que se lee. El eje es lo
 *    que da carácter a los titulares: sin él, `font-stretch` no hace nada.
 *  - Geist Mono, solo para etiquetas pequeñas en mayúsculas (`type-label`).
 *    Nunca para párrafos.
 *
 * Al sustituirlas, mantener los nombres de variable CSS (`--font-brand-*`):
 * el resto del sistema los referencia desde `src/config/brand.css`.
 *
 * `display: "swap"` para no bloquear el primer renderizado. Servidas desde el
 * propio dominio: sin peticiones a terceros.
 */

export const brandSans = Archivo({
  subsets: ["latin"],
  axes: ["wdth"],
  display: "swap",
  variable: "--font-brand-sans",
});

export const brandMono = Geist_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-brand-mono",
  // Solo etiquetas: no compite por el primer renderizado.
  preload: false,
});

/** Clases que el `<html>` necesita para exponer las variables CSS. */
export const fontVariables = `${brandSans.variable} ${brandMono.variable}`;
