"use client";

import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { useCreateTask } from "@/hooks/use-task-queries";
import { Button } from "@/components/ui/button";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import type { TaskPriority } from "@/types";

const createTaskSchema = z.object({
  title: z
    .string()
    .min(1, "Task title is required")
    .max(200, "Title must be 200 characters or less"),
  description: z
    .string()
    .min(1, "Description is required")
    .max(2000, "Description must be 2000 characters or less"),
  priority: z.enum(["low", "medium", "high", "critical"], {
    required_error: "Priority is required",
  }),
  assigneeId: z.string().optional(),
  dueDate: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

type CreateTaskFormData = z.infer<typeof createTaskSchema>;

const PRIORITY_OPTIONS: { value: TaskPriority; label: string }[] = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "critical", label: "Critical" },
];

interface CreateTaskDialogProps {
  projectId: string;
  trigger?: React.ReactNode;
}

export function CreateTaskDialog({
  projectId,
  trigger,
}: CreateTaskDialogProps) {
  const [open, setOpen] = useState(false);
  const [errors, setErrors] = useState<
    Partial<Record<keyof CreateTaskFormData, string>>
  >({});
  const [priority, setPriority] = useState<TaskPriority>("medium");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const createTask = useCreateTask(projectId);

  function handleAddTag() {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  }

  function handleRemoveTag(tag: string) {
    setTags(tags.filter((t) => t !== tag));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrors({});

    const formData = new FormData(e.currentTarget);
    const data = {
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      priority: priority,
      assigneeId: formData.get("assigneeId") as string | undefined,
      dueDate: formData.get("dueDate") as string | undefined,
      tags: tags.length > 0 ? tags : undefined,
    };

    // Remove empty optional fields
    if (!data.assigneeId) delete data.assigneeId;
    if (!data.dueDate) delete data.dueDate;

    const result = createTaskSchema.safeParse(data);
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof CreateTaskFormData, string>> =
        {};
      for (const issue of result.error.issues) {
        const field = issue.path[0] as keyof CreateTaskFormData;
        fieldErrors[field] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }

    try {
      await createTask.mutateAsync(result.data);
      toast.success("Task created successfully");
      setOpen(false);
      setPriority("medium");
      setTags([]);
      (e.target as HTMLFormElement).reset();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to create task"
      );
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Plus />
            New Task
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Task</DialogTitle>
          <DialogDescription>
            Add a new task to this project.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="task-title">Title</Label>
            <Input
              id="task-title"
              name="title"
              placeholder="Task title"
              required
            />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="task-description">Description</Label>
            <Textarea
              id="task-description"
              name="description"
              placeholder="Describe the task..."
              rows={3}
              required
            />
            {errors.description && (
              <p className="text-sm text-destructive">{errors.description}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="task-priority">Priority</Label>
            <Select value={priority} onValueChange={(v) => setPriority(v as TaskPriority)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PRIORITY_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.priority && (
              <p className="text-sm text-destructive">{errors.priority}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="task-assignee">Assignee (optional)</Label>
            <Input
              id="task-assignee"
              name="assigneeId"
              placeholder="User ID"
              type="text"
            />
            <p className="text-sm text-muted-foreground">
              Enter the user ID to assign this task
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="task-due-date">Due Date (optional)</Label>
            <Input
              id="task-due-date"
              name="dueDate"
              type="date"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="task-tags">Tags (optional)</Label>
            <div className="flex gap-2">
              <Input
                id="task-tags"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="Add a tag"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleAddTag}
                size="sm"
              >
                Add
              </Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 rounded-md bg-secondary px-2 py-1 text-xs font-medium"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setOpen(false);
                setPriority("medium");
                setTags([]);
              }}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createTask.isPending}>
              {createTask.isPending ? "Creating..." : "Create Task"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
