"use client";

import { GripVertical } from "lucide-react";
import Link from "next/link";
import { useOptimistic, useState, useTransition } from "react";

import { moveTask } from "@/app/panel/actions";
import { cn } from "@/lib/cn";
import { editHref } from "@/lib/life/links";
import { TASK_STATUSES, type TagColor, type TaskStatus, priorityLabel, taskStatusLabel } from "@/lib/life/model";

import { Select } from "@/components/ui/Select";
import { tagClass } from "./ui";

export interface BoardTask {
  id: string;
  title: string;
  status: TaskStatus;
  position: number;
  dueLabel: string | null;
  overdue: boolean;
  priority: "low" | "normal" | "high" | "urgent";
  projectName: string | null;
  projectColor: TagColor | null;
}

const columns: { status: TaskStatus; hint: string }[] = [
  { status: "pending", hint: "Por empezar" },
  { status: "in_progress", hint: "En marcha" },
  { status: "done", hint: "Terminadas" },
  { status: "postponed", hint: "Para más adelante" },
];

/**
 * The tasks as a board you can drag.
 *
 * Dragging is the quick way; it is not the only way. Every card carries a
 * menu with the same four columns, because a drag does not exist on a phone
 * and does not exist for a keyboard either.
 */
export function TaskBoard({ tasks, here }: { tasks: BoardTask[]; here: string }) {
  const [, startTransition] = useTransition();
  const [optimistic, apply] = useOptimistic(tasks, (state: BoardTask[], move: { id: string; status: TaskStatus; position: number }) =>
    state.map((task) => (task.id === move.id ? { ...task, status: move.status, position: move.position } : task)),
  );
  const [dragging, setDragging] = useState<string | null>(null);
  const [over, setOver] = useState<TaskStatus | null>(null);

  const inColumn = (status: TaskStatus) =>
    optimistic.filter((task) => task.status === status).sort((a, b) => a.position - b.position);

  const move = (id: string, status: TaskStatus, before?: BoardTask) => {
    const list = inColumn(status).filter((task) => task.id !== id);
    const index = before ? list.findIndex((task) => task.id === before.id) : list.length;
    const previous = list[index - 1]?.position ?? (list.length ? list[0].position - 2 : 0);
    const next = list[index]?.position ?? previous + 2;
    const position = (previous + next) / 2;

    startTransition(async () => {
      apply({ id, status, position });
      await moveTask(id, status, position);
    });
    setDragging(null);
    setOver(null);
  };

  return (
    <div className="-mx-1 overflow-x-auto px-1 pb-2">
      <div className="grid min-w-[52rem] grid-cols-4 gap-3">
        {columns.map(({ status, hint }) => {
          const list = inColumn(status);
          return (
            <section
              key={status}
              aria-label={taskStatusLabel[status]}
              onDragOver={(event) => {
                event.preventDefault();
                setOver(status);
              }}
              onDragLeave={() => setOver((current) => (current === status ? null : current))}
              onDrop={() => dragging && move(dragging, status)}
              className={cn(
                "flex min-h-64 flex-col gap-2 rounded-2xl p-2 transition-colors",
                over === status ? "bg-accent-quiet" : "bg-fill",
              )}
            >
              <header className="flex items-baseline justify-between gap-2 px-2 pt-1">
                <h2 className="text-sm font-semibold text-fg">{taskStatusLabel[status]}</h2>
                <span className="tnum text-xs text-fg-subtle">{list.length}</span>
              </header>
              <p className="px-2 text-xs text-fg-subtle">{hint}</p>

              <ul className="flex flex-col gap-2">
                {list.map((task) => (
                  <li
                    key={task.id}
                    draggable
                    onDragStart={() => setDragging(task.id)}
                    onDragEnd={() => setDragging(null)}
                    onDrop={(event) => {
                      event.stopPropagation();
                      if (dragging) move(dragging, status, task);
                    }}
                    className={cn(
                      "flex cursor-grab flex-col gap-1.5 rounded-xl bg-surface p-3 shadow-[var(--shadow-raise)] active:cursor-grabbing",
                      dragging === task.id && "opacity-50",
                    )}
                  >
                    <div className="flex items-start gap-2">
                      <GripVertical className="mt-0.5 size-4 shrink-0 text-fg-quiet" strokeWidth={2} aria-hidden />
                      <Link
                        href={editHref("task", task.id, here)}
                        scroll={false}
                        className={cn(
                          "min-w-0 flex-1 text-[0.9375rem] font-medium text-fg",
                          status === "done" && "text-fg-muted line-through",
                        )}
                      >
                        {task.title}
                      </Link>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 pl-6 text-xs">
                      {task.projectName ? (
                        <span className={cn("inline-flex max-w-full items-center rounded-full px-2 py-0.5", tagClass(task.projectColor ?? "slate"))}>
                          <span className="truncate">{task.projectName}</span>
                        </span>
                      ) : null}
                      {task.dueLabel ? (
                        <span className={task.overdue ? "text-critical" : "text-fg-muted"}>{task.dueLabel}</span>
                      ) : null}
                      {task.priority === "urgent" || task.priority === "high" ? (
                        <span className="text-caution">{priorityLabel[task.priority]}</span>
                      ) : null}
                    </div>

                    <div className="pl-6">
                      <Select
                        size="sm"
                        aria-label={`Mover «${task.title}» a`}
                        value={task.status}
                        onValueChange={(value) => move(task.id, value as TaskStatus)}
                        options={TASK_STATUSES.map((value) => ({ value, label: taskStatusLabel[value] }))}
                      />
                    </div>
                  </li>
                ))}
                {list.length === 0 ? <li className="px-2 py-6 text-center text-xs text-fg-quiet">Vacío</li> : null}
              </ul>
            </section>
          );
        })}
      </div>
    </div>
  );
}
