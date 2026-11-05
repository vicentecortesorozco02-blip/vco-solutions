"use client";

import { Camera, X } from "lucide-react";
import { useRef, useState, useTransition } from "react";

import { setProjectLogo } from "@/app/panel/actions";
import { cn } from "@/lib/cn";
import type { TagColor } from "@/lib/life/model";

import { tagClass } from "./ui";

/** Shrinks an image file to a square 256 px WebP data URL. */
async function shrink(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const side = Math.min(bitmap.width, bitmap.height);
  ctx.drawImage(bitmap, (bitmap.width - side) / 2, (bitmap.height - side) / 2, side, side, 0, 0, size, size);
  return canvas.toDataURL("image/webp", 0.85);
}

/** The project's picture. Click to choose a new one; the cross removes it. */
export function ProjectLogo({ id, name, logo, color }: { id: string; name: string; logo: string | null; color: TagColor }) {
  const input = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState(logo);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const save = (value: string | null) =>
    start(async () => {
      const previous = preview;
      setPreview(value);
      const result = await setProjectLogo(id, value);
      if (!result.ok) {
        setPreview(previous);
        setError(result.message ?? "No se pudo guardar el logo.");
      } else setError(null);
    });

  return (
    <span className="relative inline-flex shrink-0 flex-col items-start gap-1">
      <button
        type="button"
        onClick={() => input.current?.click()}
        disabled={pending}
        aria-label={preview ? `Cambiar el logo de ${name}` : `Poner un logo a ${name}`}
        className={cn(
          "group relative grid size-16 place-items-center overflow-hidden rounded-2xl text-xl font-semibold",
          preview ? "bg-surface" : tagClass(color),
          pending && "opacity-60",
        )}
      >
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element -- data URL, nothing to optimise
          <img src={preview} alt="" className="size-full object-cover" />
        ) : (
          <span aria-hidden>{name.slice(0, 1).toUpperCase()}</span>
        )}
        <span className="absolute inset-0 grid place-items-center bg-scrim text-accent-fg opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
          <Camera className="size-5" aria-hidden />
        </span>
      </button>
      {preview ? (
        <button
          type="button"
          onClick={() => save(null)}
          aria-label={`Quitar el logo de ${name}`}
          className="absolute -top-2 -right-2 grid size-8 place-items-center rounded-full bg-surface-raised text-fg-muted shadow-[var(--shadow-raise)] hover:text-critical"
        >
          <X className="size-4" aria-hidden />
        </button>
      ) : null}
      <input
        ref={input}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="sr-only"
        tabIndex={-1}
        onChange={async (event) => {
          const file = event.target.files?.[0];
          event.target.value = "";
          if (!file) return;
          try {
            save(await shrink(file));
          } catch {
            setError("No se pudo leer esa imagen.");
          }
        }}
      />
      {error ? <span role="alert" className="text-xs text-critical">{error}</span> : null}
    </span>
  );
}
