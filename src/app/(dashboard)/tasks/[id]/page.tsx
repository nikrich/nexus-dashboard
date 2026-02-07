"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Calendar, Clock, Link2, User as UserIcon } from "lucide-react";
import { useTask, useUpdateTask } from "@/hooks/use-task-queries";
import { useUsers } from "@/hooks/use-user-queries";
import { EditableTitle } from "@/features/tasks/editable-title";
import { TaskDetailSkeleton } from "@/features/tasks/task-detail-skeleton";
import { TaskComments } from "@/features/tasks/task-comments";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { TaskStatus, TaskPriority } from "@/types";

const STATUS_OPTIONS: { value: TaskStatus; label: string }[] = [
  { value: "todo", label: "Todo" },
  { value: "in_progress", label: "In Progress" },
  { value: "review", label: "Review" },
  { value: "done", label: "Done" },
];

const PRIORITY_OPTIONS: { value: TaskPriority; label: string }[] = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "critical", label: "Critical" },
];

const STATUS_COLORS: Record<TaskStatus, string> = {
  todo: "bg-secondary text-secondary-foreground",
  in_progress: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  review: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
  done: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
};

const PRIORITY_COLORS: Record<TaskPriority, string> = {
  low: "bg-secondary text-secondary-foreground",
  medium: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  high: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  critical: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function TaskDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { data, isLoading, isError } = useTask(id);
  const updateTask = useUpdateTask(id);
  const { data: usersData } = useUsers();

  const task = data?.data;
  const users = usersData?.data ?? [];

  function handleUpdate(field: string, value: unknown) {
    updateTask.mutate(
      { [field]: value },
      {
        onError: (err) => {
          toast.error(
            err instanceof Error ? err.message : "Failed to update task"
          );
        },
      }
    );
  }

  if (isLoading) {
    return <TaskDetailSkeleton />;
  }

  if (isError || !task) {
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
        Failed to load task. It may not exist or you may not have access.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_300px]">
        {/* Main content */}
        <div className="space-y-6">
          <EditableTitle
            value={task.title}
            onSave={(title) => handleUpdate("title", title)}
          />

          {/* Status and priority */}
          <div className="flex flex-wrap gap-3">
            <Select
              value={task.status}
              onValueChange={(v) => handleUpdate("status", v)}
            >
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    <Badge
                      variant="secondary"
                      className={STATUS_COLORS[opt.value]}
                    >
                      {opt.label}
                    </Badge>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={task.priority}
              onValueChange={(v) => handleUpdate("priority", v)}
            >
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PRIORITY_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    <Badge
                      variant="secondary"
                      className={PRIORITY_COLORS[opt.value]}
                    >
                      {opt.label}
                    </Badge>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              defaultValue={task.description}
              rows={6}
              onBlur={(e) => {
                if (e.target.value !== task.description) {
                  handleUpdate("description", e.target.value);
                }
              }}
              placeholder="Add a description..."
            />
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="flex flex-wrap gap-2">
              {task.tags.length > 0 ? (
                task.tags.map((tag) => (
                  <Badge key={tag} variant="outline">
                    {tag}
                  </Badge>
                ))
              ) : (
                <span className="text-sm text-muted-foreground">No tags</span>
              )}
            </div>
          </div>
        </div>

        {/* Metadata sidebar */}
        <div className="space-y-6 rounded-lg border p-4 h-fit">
          <div className="space-y-2">
            <Label className="flex items-center gap-1.5">
              <UserIcon className="size-3.5" />
              Assignee
            </Label>
            <Select
              value={task.assigneeId ?? "unassigned"}
              onValueChange={(v) =>
                handleUpdate("assigneeId", v === "unassigned" ? null : v)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Unassigned" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unassigned">Unassigned</SelectItem>
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-1.5">
              <Calendar className="size-3.5" />
              Due Date
            </Label>
            <Input
              type="date"
              defaultValue={task.dueDate?.split("T")[0] ?? ""}
              onChange={(e) => {
                handleUpdate("dueDate", e.target.value || null);
              }}
            />
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-1.5">
              <Link2 className="size-3.5" />
              Project
            </Label>
            <button
              className="text-sm text-primary hover:underline text-left"
              onClick={() => router.push(`/projects/${task.projectId}`)}
            >
              View project
            </button>
          </div>

          <div className="border-t pt-4 space-y-3">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock className="size-3" />
              <span>Created {formatDate(task.createdAt)}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock className="size-3" />
              <span>Updated {formatDate(task.updatedAt)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Comments section */}
      <div className="lg:col-span-2">
        <TaskComments taskId={id} />
      </div>
    </div>
  );
}
