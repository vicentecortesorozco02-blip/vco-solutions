import { LogOut } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

import { signOut } from "@/app/panel/actions";
import { CommandMenu } from "@/components/panel/CommandMenu";
import { SidebarNav, TabBar } from "@/components/panel/Nav";
import { PanelDialogs } from "@/components/panel/PanelDialogs";
import { QuickAdd } from "@/components/panel/QuickAdd";
import { ThemeToggle } from "@/components/panel/ThemeToggle";
import { panelRoutes } from "@/config/site";
import { loadInbox, loadLifeData, requirePanelSession } from "@/lib/life/server";

/**
 * The panel chrome: sidebar from 1024 px, a bottom tab bar below it, search
 * and "+" always one tap away. Every page inside renders on the canvas.
 */
export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const session = await requirePanelSession();
  const [data, inbox] = await Promise.all([loadLifeData(), loadInbox()]);

  const projects = data.projects
    .filter((p) => p.status !== "done")
    .map((p) => ({ id: p.id, name: p.name }));
  const courses = data.courses.map((c) => ({ id: c.id, name: c.name }));
  const relations = {
    projects,
    courses,
    accounts: data.accounts.map((a) => ({ id: a.id, name: a.name })),
    subscriptions: data.subscriptions.map((s) => ({ id: s.id, name: s.name })),
  };
  const name = session.profile.display_name || session.email.split("@")[0];

  return (
    <div data-panel data-theme={session.profile.theme} className="min-h-dvh bg-canvas text-fg">
      <a
        href="#panel-main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[var(--z-modal)] focus:rounded-full focus:bg-surface focus:px-4 focus:py-2 focus:text-sm"
      >
        Saltar al contenido
      </a>

      <div className="mx-auto flex max-w-[90rem]">
        <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col gap-8 overflow-y-auto px-4 py-6 lg:flex">
          <Link
            href={panelRoutes.settings}
            className="flex items-center gap-3 rounded-xl px-3 py-1.5 transition-colors hover:bg-fill"
          >
            <span className="grid size-9 place-items-center rounded-full bg-accent text-sm font-semibold text-accent-fg uppercase" aria-hidden>
              {name.slice(0, 1)}
            </span>
            <span className="flex min-w-0 flex-col">
              <span className="truncate text-sm font-semibold text-fg">{name}</span>
              <span className="text-xs text-fg-subtle">Ajustes</span>
            </span>
          </Link>
          <SidebarNav inboxCount={inbox.length} />
          <div className="mt-auto flex items-center justify-between gap-2 px-1">
            <ThemeToggle theme={session.profile.theme} />
            <form action={signOut}>
              <button
                type="submit"
                className="grid size-9 place-items-center rounded-full text-fg-subtle transition-colors hover:bg-fill hover:text-fg"
                aria-label="Cerrar sesión"
                title="Cerrar sesión"
              >
                <LogOut className="size-4" strokeWidth={2} aria-hidden />
              </button>
            </form>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <div className="sticky top-0 z-[var(--z-sticky)] flex items-center gap-3 bg-canvas/85 px-4 pt-[max(0.75rem,env(safe-area-inset-top))] pb-3 backdrop-blur-xl sm:px-6 lg:px-10 lg:pt-6">
            <div className="flex-1">
              <CommandMenu />
            </div>
            <div className="flex items-center gap-2 lg:hidden">
              <ThemeToggle theme={session.profile.theme} />
            </div>
            <div className="hidden lg:block">
              <QuickAdd />
            </div>
          </div>

          <main id="panel-main" className="flex-1 px-4 pt-3 pb-32 sm:px-6 lg:px-10 lg:pt-6 lg:pb-16">
            {children}
          </main>
        </div>
      </div>

      <QuickAdd floating />
      <TabBar inboxCount={inbox.length} />

      <Suspense>
        <PanelDialogs relations={relations} today={session.today} />
      </Suspense>
    </div>
  );
}
