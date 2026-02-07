"use client";

import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { KanbanCard } from "./kanban-card";
import type { Task, TaskStatus } from "@/types";

const STATUS_HEADERS: Record<TaskStatus, { label: string; color: string }> = {
  todo: { label: "Todo", color: "bg-secondary" },
  in_progress: {
    label: "In Progress",
    color: "bg-blue-500",
  },
  review: { label: "Review", color: "bg-amber-500" },
  done: { label: "Done", color: "bg-green-500" },
};

interface KanbanColumnProps {
  status: TaskStatus;
  tasks: Task[];
  onAddTask: (status: TaskStatus) => void;
}

export function KanbanColumn({ status, tasks, onAddTask }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: status });
  const header = STATUS_HEADERS[status];

  return (
    <div
      className={`flex min-w-64 flex-col rounded-lg border bg-muted/30 ${
        isOver ? "ring-2 ring-primary/50" : ""
      }`}
    >
      <div className="flex items-center justify-between px-3 py-2 border-b">
        <div className="flex items-center gap-2">
          <div className={`size-2.5 rounded-full ${header.color}`} />
          <h3 className="text-sm font-semibold">{header.label}</h3>
          <span className="text-xs text-muted-foreground rounded-full bg-muted px-1.5">
            {tasks.length}
          </span>
        </div>
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={() => onAddTask(status)}
          aria-label={`Add task to ${header.label}`}
        >
          <Plus className="size-3.5" />
        </Button>
      </div>
      <div ref={setNodeRef} className="flex-1 space-y-2 p-2 min-h-24">
        <SortableContext
          items={tasks.map((t) => t.id)}
          strategy={verticalListSortingStrategy}
        >
          {tasks.map((task) => (
            <KanbanCard key={task.id} task={task} />
          ))}
        </SortableContext>
      </div>
    </div>
  );
}
