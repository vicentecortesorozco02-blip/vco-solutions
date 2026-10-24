"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useOptimistic, useTransition } from "react";

import { setTheme } from "@/app/panel/actions";
import { cn } from "@/lib/cn";

type Theme = "system" | "light" | "dark";

const options: { value: Theme; label: string; icon: typeof Sun }[] = [
  { value: "light", label: "Claro", icon: Sun },
  { value: "dark", label: "Oscuro", icon: Moon },
  { value: "system", label: "Automático", icon: Monitor },
];

/** Light, dark or follow the system. Saved to the profile, applied on the server. */
export function ThemeToggle({ theme }: { theme: Theme }) {
  const [current, setCurrent] = useOptimistic(theme);
  const [, startTransition] = useTransition();

  return (
    <div role="radiogroup" aria-label="Apariencia" className="inline-flex gap-0.5 rounded-full bg-fill p-0.5">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          role="radio"
          aria-checked={current === option.value}
          aria-label={option.label}
          title={option.label}
          onClick={() =>
            startTransition(async () => {
              setCurrent(option.value);
              // The panel root reads data-theme: update it now, the server catches up.
              document.querySelector("[data-panel]")?.setAttribute("data-theme", option.value);
              await setTheme(option.value);
            })
          }
          className={cn(
            "grid size-8 place-items-center rounded-full transition-colors",
            current === option.value ? "bg-surface text-fg shadow-[var(--shadow-raise)]" : "text-fg-subtle hover:text-fg",
          )}
        >
          <option.icon className="size-4" strokeWidth={2} aria-hidden />
        </button>
      ))}
    </div>
  );
}
