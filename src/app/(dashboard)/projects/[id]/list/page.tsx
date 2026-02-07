"use client";

import { use, useMemo, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from "@tanstack/react-table";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTasks, taskKeys } from "@/hooks/use-task-queries";
import { apiClient } from "@/lib/api-client";
import type { ApiResponse, Task, TaskStatus, UpdateTaskRequest } from "@/types";
import { createTaskColumns } from "@/features/tasks/task-columns";
import { TaskListToolbar } from "@/features/tasks/task-list-toolbar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

const PAGE_SIZES = [20, 50, 100];

export default function TaskListPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: projectId } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Read filters from URL params
  const page = Number(searchParams.get("page")) || 1;
  const pageSize = Number(searchParams.get("pageSize")) || 20;
  const search = searchParams.get("search") ?? "";
  const statusFilter = searchParams.get("status") ?? "all";
  const priorityFilter = searchParams.get("priority") ?? "all";
  const sortBy = searchParams.get("sortBy") ?? "createdAt";
  const sortOrder =
    (searchParams.get("sortOrder") as "asc" | "desc") ?? "desc";

  // Update URL params helper
  const updateParams = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (value === null || value === "" || value === "all") {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      }
      router.push(`?${params.toString()}`, { scroll: false });
    },
    [searchParams, router]
  );

  // Fetch tasks
  const { data, isLoading } = useTasks({
    projectId,
    page,
    pageSize,
    status: statusFilter !== "all" ? (statusFilter as TaskStatus) : undefined,
    priority:
      priorityFilter !== "all"
        ? (priorityFilter as "low" | "medium" | "high" | "critical")
        : undefined,
    search: search || undefined,
    sortBy,
    sortOrder,
  });

  const tasks = data?.data?.items ?? [];
  const total = data?.data?.total ?? 0;
  const totalPages = Math.ceil(total / pageSize);

  // Mutations - use direct apiClient for per-row updates
  const queryClient = useQueryClient();

  const updateTaskMutation = useMutation({
    mutationFn: ({ taskId, data }: { taskId: string; data: UpdateTaskRequest }) =>
      apiClient.patch<ApiResponse<Task>>(`/api/tasks/${taskId}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: (taskId: string) =>
      apiClient.delete<ApiResponse<void>>(`/api/tasks/${taskId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
    },
  });

  const handleStatusChange = useCallback(
    (taskId: string, status: TaskStatus) => {
      updateTaskMutation.mutate(
        { taskId, data: { status } },
        {
          onError: (err) =>
            toast.error(
              err instanceof Error ? err.message : "Failed to update status"
            ),
        }
      );
    },
    [updateTaskMutation]
  );

  const handleSort = useCallback(
    (column: string) => {
      const newOrder =
        sortBy === column && sortOrder === "asc" ? "desc" : "asc";
      updateParams({ sortBy: column, sortOrder: newOrder, page: "1" });
    },
    [sortBy, sortOrder, updateParams]
  );

  // Column definitions
  const columns = useMemo(
    () =>
      createTaskColumns({
        onSort: handleSort,
        onStatusChange: handleStatusChange,
      }),
    [handleSort, handleStatusChange]
  );

  // Table instance
  const table = useReactTable({
    data: tasks,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualSorting: true,
    manualPagination: true,
    pageCount: totalPages,
    getRowId: (row) => row.id,
  });

  // Bulk actions
  const selectedRows = table.getFilteredSelectedRowModel().rows;
  const selectedIds = selectedRows.map((r) => r.original.id);

  function handleBulkStatusChange(status: TaskStatus) {
    for (const id of selectedIds) {
      handleStatusChange(id, status);
    }
    table.resetRowSelection();
  }

  function handleBulkDelete() {
    for (const id of selectedIds) {
      deleteTaskMutation.mutate(id, {
        onError: (err) =>
          toast.error(
            err instanceof Error ? err.message : "Failed to delete task"
          ),
      });
    }
    table.resetRowSelection();
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Tasks</h1>
        <p className="text-muted-foreground">
          {total} task{total !== 1 ? "s" : ""} in this project
        </p>
      </div>

      <TaskListToolbar
        search={search}
        onSearchChange={(v) => updateParams({ search: v, page: "1" })}
        statusFilter={statusFilter}
        onStatusFilterChange={(v) => updateParams({ status: v, page: "1" })}
        priorityFilter={priorityFilter}
        onPriorityFilterChange={(v) =>
          updateParams({ priority: v, page: "1" })
        }
        selectedCount={selectedIds.length}
        onBulkStatusChange={handleBulkStatusChange}
        onBulkDelete={handleBulkDelete}
      />

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {columns.map((_, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-5 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : tasks.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-muted-foreground"
                >
                  No tasks found.
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="cursor-pointer"
                  onClick={() => router.push(`/tasks/${row.original.id}`)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Rows per page</span>
          <Select
            value={String(pageSize)}
            onValueChange={(v) =>
              updateParams({ pageSize: v, page: "1" })
            }
          >
            <SelectTrigger className="h-8 w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PAGE_SIZES.map((size) => (
                <SelectItem key={size} value={String(size)}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            Page {page} of {totalPages || 1}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => updateParams({ page: String(page - 1) })}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => updateParams({ page: String(page + 1) })}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
