import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { TaskStatus } from "@/types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getStatusColor(status: TaskStatus): string {
  const colorMap: Record<TaskStatus, string> = {
    todo: "bg-status-todo text-status-todo-foreground",
    in_progress: "bg-status-in-progress text-status-in-progress-foreground",
    review: "bg-status-review text-status-review-foreground",
    done: "bg-status-done text-status-done-foreground",
  }
  return colorMap[status] || colorMap.todo
}

export function getStatusLabel(status: TaskStatus): string {
  const labelMap: Record<TaskStatus, string> = {
    todo: "To Do",
    in_progress: "In Progress",
    review: "Review",
    done: "Done",
  }
  return labelMap[status] || status
}
