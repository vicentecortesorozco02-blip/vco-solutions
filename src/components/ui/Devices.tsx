import Image from "next/image";

import { cn } from "@/lib/cn";

/**
 * Capturas de trabajo real.
 *
 * Las pantallas son capturas de verdad (`public/trabajos/`), así que una
 * imagen nunca puede enseñar algo que no esté construido. Van sin marco de
 * portátil ni de móvil: ese dibujo no añadía información, solo decoración, y
 * tapaba la propia captura.
 */

interface ScreenProps {
  src: string;
  alt: string;
  priority?: boolean;
  sizes: string;
}

function Screen({ src, alt, priority, sizes }: ScreenProps) {
  return (
    <Image
      src={src}
      alt={alt}
      fill
      priority={priority}
      sizes={sizes}
      quality={85}
      className="object-cover object-top"
    />
  );
}

/**
 * Una captura, sin disfraz.
 *
 * Un marco de portátil o de móvil no añade información: solo dice «esto es
 * una web», que ya se sabe. La captura va en su propio recuadro, con la misma
 * línea que el resto de la página, y el pie cuenta qué se está mirando.
 */
export function Screenshot({
  className,
  ratio = "16/10",
  ...screen
}: ScreenProps & { className?: string; ratio?: "16/10" | "390/844" }) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl bg-bg-subtle ring-1 ring-line",
        className,
      )}
      style={{ aspectRatio: ratio }}
    >
      <Screen {...screen} />
    </div>
  );
}
