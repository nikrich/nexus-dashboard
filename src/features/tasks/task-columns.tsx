"use client";

import { type ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Task, TaskStatus, TaskPriority } from "@/types";

const STATUS_LABELS: Record<TaskStatus, string> = {
  todo: "Todo",
  in_progress: "In Progress",
  review: "Review",
  done: "Done",
};

const STATUS_COLORS: Record<TaskStatus, string> = {
  todo: "bg-secondary text-secondary-foreground",
  in_progress: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  review: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
  done: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
};

const PRIORITY_LABELS: Record<TaskPriority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  critical: "Critical",
};

const PRIORITY_COLORS: Record<TaskPriority, string> = {
  low: "bg-secondary text-secondary-foreground",
  medium: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  high: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  critical: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
};

function SortableHeader({
  label,
  column,
  onSort,
}: {
  label: string;
  column: string;
  onSort: (column: string) => void;
}) {
  return (
    <Button
      variant="ghost"
      size="sm"
      className="-ml-3 h-8"
      onClick={() => onSort(column)}
    >
      {label}
      <ArrowUpDown className="ml-1 size-3.5" />
    </Button>
  );
}

export function createTaskColumns({
  onSort,
  onStatusChange,
}: {
  onSort: (column: string) => void;
  onStatusChange: (taskId: string, status: TaskStatus) => void;
}): ColumnDef<Task>[] {
  return [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) =>
            table.toggleAllPageRowsSelected(!!value)
          }
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
          onClick={(e) => e.stopPropagation()}
        />
      ),
      enableSorting: false,
    },
    {
      accessorKey: "title",
      header: () => (
        <SortableHeader label="Title" column="title" onSort={onSort} />
      ),
      cell: ({ row }) => (
        <span className="font-medium">{row.getValue("title")}</span>
      ),
    },
    {
      accessorKey: "status",
      header: () => (
        <SortableHeader label="Status" column="status" onSort={onSort} />
      ),
      cell: ({ row }) => {
        const status = row.getValue("status") as TaskStatus;
        return (
          <Select
            value={status}
            onValueChange={(v) =>
              onStatusChange(row.original.id, v as TaskStatus)
            }
          >
            <SelectTrigger
              className="h-7 w-32 border-none shadow-none"
              onClick={(e) => e.stopPropagation()}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(STATUS_LABELS) as TaskStatus[]).map((s) => (
                <SelectItem key={s} value={s}>
                  <Badge variant="secondary" className={STATUS_COLORS[s]}>
                    {STATUS_LABELS[s]}
                  </Badge>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      },
    },
    {
      accessorKey: "priority",
      header: () => (
        <SortableHeader label="Priority" column="priority" onSort={onSort} />
      ),
      cell: ({ row }) => {
        const priority = row.getValue("priority") as TaskPriority;
        return (
          <Badge variant="secondary" className={PRIORITY_COLORS[priority]}>
            {PRIORITY_LABELS[priority]}
          </Badge>
        );
      },
    },
    {
      accessorKey: "assigneeId",
      header: () => (
        <SortableHeader label="Assignee" column="assigneeId" onSort={onSort} />
      ),
      cell: ({ row }) => {
        const assigneeId = row.getValue("assigneeId") as string | undefined;
        return (
          <span className="text-muted-foreground">
            {assigneeId ?? "Unassigned"}
          </span>
        );
      },
    },
    {
      accessorKey: "dueDate",
      header: () => (
        <SortableHeader label="Due Date" column="dueDate" onSort={onSort} />
      ),
      cell: ({ row }) => {
        const dueDate = row.getValue("dueDate") as string | undefined;
        if (!dueDate) return <span className="text-muted-foreground">-</span>;
        return (
          <span>
            {new Date(dueDate).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}
          </span>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: () => (
        <SortableHeader label="Created" column="createdAt" onSort={onSort} />
      ),
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          {new Date(row.getValue("createdAt") as string).toLocaleDateString(
            "en-US",
            { month: "short", day: "numeric" }
          )}
        </span>
      ),
    },
  ];
}
