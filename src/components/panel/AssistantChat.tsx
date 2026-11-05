"use client";

import { ArrowUp, Check, Sparkles } from "lucide-react";
import { useEffect, useId, useRef, useState, useTransition } from "react";

import { type ChatTurn, askAssistant } from "@/app/panel/actions";
import { cn } from "@/lib/cn";

interface Message extends ChatTurn {
  done?: string[];
  error?: string;
}

const suggestions = [
  "¿Qué tengo esta semana?",
  "Tengo una reunión mañana a las 12",
  "¿Qué pagos me vienen en 30 días?",
  "Apunta que tengo que llamar al banco",
];

/**
 * The assistant, as a plain conversation.
 *
 * It keeps the thread in this page only: nothing is stored, so closing the
 * panel closes the conversation. What it creates, however, is real and shows
 * up under the answer.
 */
export function AssistantChat({ configured, compact = false }: { configured: boolean; compact?: boolean }) {
  const inputId = useId();
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const [pending, startTransition] = useTransition();
  const end = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (compact) return;
    end.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, pending, compact]);

  const send = (text: string) => {
    const clean = text.trim();
    if (!clean || pending) return;
    const history = messages.map(({ role, text: body }) => ({ role, text: body }));
    setMessages((prev) => [...prev, { role: "user", text: clean }]);
    setDraft("");
    startTransition(async () => {
      const reply = await askAssistant(history, clean);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: reply.text, done: reply.done, error: reply.error },
      ]);
    });
  };

  return (
    <div className={cn("flex flex-col gap-4", compact ? "gap-3" : "min-h-[60vh]")}>
      <div className={cn("flex flex-1 flex-col gap-4", compact && messages.length > 0 && "absolute top-full right-0 left-0 z-30 mt-2 max-h-[60vh] overflow-y-auto rounded-2xl bg-canvas p-3 shadow-[var(--shadow-pop)]")} aria-live="polite">
        {messages.length === 0 && compact ? null : messages.length === 0 ? (
          <div className="flex flex-col items-center gap-4 rounded-2xl bg-surface px-6 py-12 text-center">
            <span className="grid size-12 place-items-center rounded-full bg-fill text-fg-muted">
              <Sparkles className="size-6" strokeWidth={1.75} aria-hidden />
            </span>
            <p className="text-base font-semibold text-fg">Pregúntame lo que quieras del panel</p>
            <p className="max-w-[46ch] text-sm text-fg-muted">
              Conozco tus tareas, tu agenda, tus pagos, tus proyectos y tus dominios. También puedo apuntar una tarea o
              un evento por ti.
            </p>
            <ul className="flex flex-wrap justify-center gap-2 pt-2">
              {suggestions.map((text) => (
                <li key={text}>
                  <button
                    type="button"
                    onClick={() => send(text)}
                    disabled={!configured}
                    className="inline-flex min-h-10 items-center rounded-full bg-fill px-4 text-sm font-medium text-fg transition-colors hover:bg-fill-strong disabled:opacity-60"
                  >
                    {text}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {messages.map((message, index) => (
          <div
            key={index}
            className={cn(
              "max-w-[46rem] rounded-2xl px-4 py-3 text-[0.9375rem] whitespace-pre-line",
              message.role === "user" ? "self-end bg-accent text-accent-fg" : "self-start bg-surface text-fg",
            )}
          >
            {message.error ? <span className="text-critical">{message.error}</span> : message.text}
            {message.done?.length ? (
              <ul className="mt-3 flex flex-col gap-1 border-t border-line-soft pt-3 text-sm text-fg-muted">
                {message.done.map((line) => (
                  <li key={line} className="flex items-center gap-2">
                    <Check className="size-4 shrink-0 text-positive" strokeWidth={2.2} aria-hidden />
                    {line}
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        ))}

        {pending ? (
          <p className="self-start rounded-2xl bg-surface px-4 py-3 text-[0.9375rem] text-fg-muted">Pensando…</p>
        ) : null}
        <div ref={end} />
      </div>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          send(draft);
        }}
        className={cn("flex items-end gap-2 rounded-2xl bg-surface shadow-[var(--shadow-raise)]", compact ? "rounded-full p-0.5 pl-2" : "p-2", !compact && "sticky bottom-20 lg:bottom-4", compact && "order-first")}
      >
        <label htmlFor={inputId} className="sr-only">
          Escribe tu mensaje
        </label>
        <textarea
          id={inputId}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              send(draft);
            }
          }}
          rows={1}
          placeholder={configured ? "Pregunta o pide que apunte algo…" : "Falta configurar la clave de IA"}
          className={cn("flex-1 resize-none bg-transparent px-2 text-[0.9375rem] text-fg placeholder:text-fg-quiet focus:outline-none", compact ? "max-h-24 min-h-9 py-2 text-sm" : "max-h-40 min-h-11 py-2.5")}
        />
        <button
          type="submit"
          disabled={pending || !draft.trim()}
          className={cn(
            "grid shrink-0 place-items-center rounded-full bg-accent text-accent-fg transition-colors hover:bg-accent-hover disabled:opacity-40",
            compact ? "size-9" : "size-11",
          )}
        >
          <ArrowUp className="size-5" strokeWidth={2.2} aria-hidden />
          <span className="sr-only">Enviar</span>
        </button>
      </form>
    </div>
  );
}
