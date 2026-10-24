import Link from "next/link";

import { panelRoutes } from "@/config/site";

export default function PanelNotFound() {
  return (
    <div className="flex flex-col items-start gap-4 pt-8">
      <h1 className="text-title font-semibold tracking-[-0.025em] text-fg">No está aquí</h1>
      <p className="text-[0.9375rem] text-fg-muted">Puede que lo hayas borrado.</p>
      <Link href={panelRoutes.home} className="inline-flex min-h-11 items-center rounded-full bg-accent px-5 text-sm font-semibold text-accent-fg">
        Volver al inicio
      </Link>
    </div>
  );
}
