import type { Metadata } from "next";

import { AssistantChat } from "@/components/panel/AssistantChat";
import { PageHeader } from "@/components/panel/ui";
import { requirePanelSession } from "@/lib/life/server";

export const metadata: Metadata = { title: "IA" };

/** Pregúntale al panel. */
export default async function AssistantPage() {
  await requirePanelSession();
  const configured = Boolean(process.env.GEMINI_API_KEY);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="IA" question="Pregunta por tu panel, o dime qué apunto" />
      {configured ? null : (
        <p className="rounded-2xl bg-surface px-5 py-4 text-sm text-fg-muted">
          Falta la clave de la IA. Añade <code className="text-fg">GEMINI_API_KEY</code> al entorno (en Vercel y en tu
          <code className="text-fg"> .env.local</code>) y este chat empezará a responder. Mientras tanto, el panel
          funciona igual.
        </p>
      )}
      <AssistantChat configured={configured} />
    </div>
  );
}
