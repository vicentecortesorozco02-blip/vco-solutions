import { FolderKanban, Plus } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { AddKnownProjectsButton } from "@/components/panel/Actions";
import { EmptyState, HeaderLink, PageHeader, Pill, ProgressBar, tagClass } from "@/components/panel/ui";
import { panelRoutes } from "@/config/site";
import { cn } from "@/lib/cn";
import { countdown } from "@/lib/life/dates";
import { newHref } from "@/lib/life/links";
import { formatMoney } from "@/lib/life/money";
import { type Project, type ProjectStatus, priorityLabel, priorityWeight, projectStatusLabel } from "@/lib/life/model";
import { monthlyCost } from "@/lib/life/recurrence";
import { loadLifeData, requirePanelSession } from "@/lib/life/server";

export const metadata: Metadata = { title: "Proyectos" };

const order: ProjectStatus[] = ["active", "idea", "paused", "done"];
const sectionTitle: Record<ProjectStatus, string> = {
  active: "Activos",
  idea: "Ideas",
  paused: "Pausados",
  done: "Finalizados",
};

/** ¿En qué estoy trabajando? */
export default async function ProjectsPage() {
  const { today } = await requirePanelSession();
  const data = await loadLifeData();

  const stats = (project: Project) => ({
    openTasks: data.tasks.filter((t) => t.project_id === project.id && t.status !== "done").length,
    partners: data.projectPartners.filter((link) => link.project_id === project.id).length,
    monthly:
      data.subscriptions
        .filter((s) => s.status !== "cancelled" && s.project_id === project.id)
        .reduce((sum, s) => sum + (monthlyCost(s) ?? 0), 0) +
      data.domains.filter((d) => d.project_id === project.id).reduce((sum, d) => sum + Number(d.cost ?? 0) / 12, 0),
  });

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Proyectos"
        question="¿En qué estoy trabajando?"
        actions={
          <HeaderLink primary icon={Plus} href={newHref("project", panelRoutes.projects)}>
            Nuevo proyecto
          </HeaderLink>
        }
      />

      {data.projects.length === 0 ? (
        <EmptyState icon={FolderKanban} title="Sin proyectos todavía" action={<AddKnownProjectsButton />}>
          Añade de un toque los que ya conocemos. Sin fechas ni progreso inventados: eso lo pones tú.
        </EmptyState>
      ) : (
        order.map((status) => {
          const list = data.projects
            .filter((p) => p.status === status)
            .sort((a, b) => priorityWeight[b.priority] - priorityWeight[a.priority] || a.name.localeCompare(b.name, "es"));
          if (!list.length) return null;
          const grid = (
            <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {list.map((project) => {
                const s = stats(project);
                return (
                  <li key={project.id}>
                    <Link
                      href={panelRoutes.project(project.id)}
                      className="flex h-full flex-col gap-4 overflow-hidden rounded-2xl bg-surface p-5 transition-[background-color,transform] duration-[var(--duration-base)] hover:bg-surface-raised active:scale-[0.99]"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <span className="flex min-w-0 items-center gap-2 text-lg font-semibold tracking-[-0.015em] text-fg">
                          <span className={cn("size-2.5 shrink-0 rounded-full", tagClass(project.color, "fill"))} aria-hidden />
                          <span className="truncate">{project.name}</span>
                        </span>
                        {priorityWeight[project.priority] >= 2 ? (
                          <Pill tone={project.priority === "urgent" ? "critical" : "caution"}>{priorityLabel[project.priority]}</Pill>
                        ) : null}
                      </div>
                      {project.description ? <p className="line-clamp-2 text-sm text-fg-muted">{project.description}</p> : null}
                      <div className="mt-auto flex flex-col gap-2">
                        <div className="flex items-baseline justify-between text-sm">
                          <span className="text-fg-subtle">{projectStatusLabel[project.status]}</span>
                          <span className="tnum font-semibold text-fg">{project.progress} %</span>
                        </div>
                        <ProgressBar value={project.progress} label={`Progreso de ${project.name}`} />
                        <p className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-fg-subtle">
                          <span>
                            {s.openTasks} tarea{s.openTasks === 1 ? "" : "s"} abierta{s.openTasks === 1 ? "" : "s"}
                          </span>
                          {s.monthly > 0 ? <span>{formatMoney(s.monthly)}/mes</span> : null}
                          {s.partners > 0 ? <span>{s.partners === 1 ? "1 socio" : `${s.partners} socios`}</span> : null}
                          {project.target_date ? <span>objetivo {countdown(project.target_date, today).replace("quedan ", "en ")}</span> : null}
                        </p>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          );
          return (
            <section key={status} aria-labelledby={`s-${status}`} className="flex flex-col gap-3">
              {status === "done" ? (
                <details>
                  <summary id={`s-${status}`} className="min-h-10 cursor-pointer px-1 text-sm font-semibold text-fg-subtle">
                    {sectionTitle[status]} ({list.length})
                  </summary>
                  <div className="pt-3">{grid}</div>
                </details>
              ) : (
                <>
                  <h2 id={`s-${status}`} className="px-1 text-sm font-semibold text-fg-subtle">
                    {sectionTitle[status]}
                  </h2>
                  {grid}
                </>
              )}
            </section>
          );
        })
      )}
    </div>
  );
}
