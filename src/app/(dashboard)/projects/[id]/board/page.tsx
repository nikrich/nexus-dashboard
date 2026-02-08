"use client";

import { use, useCallback, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { useState } from "react";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTasks, taskKeys } from "@/hooks/use-task-queries";
import { apiClient } from "@/lib/api-client";
import { KanbanColumn } from "@/features/tasks/kanban-column";
import { KanbanCard } from "@/features/tasks/kanban-card";
import { CreateTaskDialog } from "@/features/tasks/create-task-dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { LayoutList, Kanban } from "lucide-react";
import type { ApiResponse, Task, TaskStatus } from "@/types";

const COLUMNS: TaskStatus[] = ["todo", "in_progress", "review", "done"];

export default function KanbanBoardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: projectId } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const { data, isLoading } = useTasks({
    projectId,
    pageSize: 200,
  });

  const tasks = useMemo(() => data?.data?.items ?? [], [data]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor)
  );

  const updateTaskMutation = useMutation({
    mutationFn: ({
      taskId,
      status,
    }: {
      taskId: string;
      status: TaskStatus;
    }) =>
      apiClient.patch<ApiResponse<Task>>(`/api/tasks/${taskId}`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
    },
  });

  // Group tasks by status
  const tasksByStatus: Record<TaskStatus, Task[]> = {
    todo: [],
    in_progress: [],
    review: [],
    done: [],
  };
  for (const task of tasks) {
    tasksByStatus[task.status]?.push(task);
  }

  function handleDragStart(event: DragStartEvent) {
    const task = event.active.data.current?.task as Task | undefined;
    if (task) setActiveTask(task);
  }

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      setActiveTask(null);
      const { active, over } = event;
      if (!over) return;

      const taskId = active.id as string;
      const newStatus = over.id as TaskStatus;

      // Find the task being dragged
      const task = tasks.find((t) => t.id === taskId);
      if (!task || task.status === newStatus) return;

      // Optimistic update - update cache immediately
      queryClient.setQueryData(
        taskKeys.list({
          projectId,
          pageSize: 200,
        } as unknown as Record<string, unknown>),
        (old: ApiResponse<{ items: Task[]; total: number; page: number; pageSize: number; hasMore: boolean }> | undefined) => {
          if (!old) return old;
          return {
            ...old,
            data: {
              ...old.data,
              items: old.data.items.map((t) =>
                t.id === taskId ? { ...t, status: newStatus } : t
              ),
            },
          };
        }
      );

      // Fire API call
      updateTaskMutation.mutate(
        { taskId, status: newStatus },
        {
          onError: (err) => {
            // Rollback on error
            queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
            toast.error(
              err instanceof Error
                ? err.message
                : "Failed to update task status"
            );
          },
        }
      );
    },
    [tasks, projectId, queryClient, updateTaskMutation]
  );

  const [createTaskOpen, setCreateTaskOpen] = useState(false);
  const [createTaskStatus, setCreateTaskStatus] = useState<TaskStatus>("todo");

  function handleAddTask(status: TaskStatus) {
    setCreateTaskStatus(status);
    setCreateTaskOpen(true);
  }

  // View toggle
  const currentView = searchParams.get("view") ?? "board";

  function toggleView() {
    const newView = currentView === "board" ? "list" : "board";
    if (newView === "list") {
      router.push(`/projects/${projectId}/list`);
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="flex gap-4 overflow-x-auto">
          {COLUMNS.map((col) => (
            <div key={col} className="min-w-64 space-y-2">
              <Skeleton className="h-10 w-full rounded-lg" />
              <Skeleton className="h-24 w-full rounded-lg" />
              <Skeleton className="h-24 w-full rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Board</h1>
          <p className="text-muted-foreground">
            Drag tasks between columns to update status.
          </p>
        </div>
        <div className="flex items-center gap-1 rounded-md border p-0.5">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleView}
            className="gap-1.5"
          >
            <LayoutList className="size-4" />
            List
          </Button>
          <Button variant="secondary" size="sm" className="gap-1.5">
            <Kanban className="size-4" />
            Board
          </Button>
        </div>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 overflow-x-auto pb-4">
          {COLUMNS.map((status) => (
            <KanbanColumn
              key={status}
              status={status}
              tasks={tasksByStatus[status]}
              onAddTask={handleAddTask}
            />
          ))}
        </div>

        <DragOverlay>
          {activeTask ? <KanbanCard task={activeTask} /> : null}
        </DragOverlay>
      </DndContext>

      <CreateTaskDialog
        projectId={projectId}
        defaultStatus={createTaskStatus}
        open={createTaskOpen}
        onOpenChange={setCreateTaskOpen}
      />
    </div>
  );
}
