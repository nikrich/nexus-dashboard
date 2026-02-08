import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type {
  ApiResponse,
  PaginatedResponse,
  Task,
  CreateTaskRequest,
  UpdateTaskRequest,
  TaskStatus,
  TaskPriority,
} from "@/types";

export const taskKeys = {
  all: ["tasks"] as const,
  lists: () => [...taskKeys.all, "list"] as const,
  list: (params?: Record<string, unknown>) =>
    [...taskKeys.lists(), params] as const,
  details: () => [...taskKeys.all, "detail"] as const,
  detail: (id: string) => [...taskKeys.details(), id] as const,
  stats: () => [...taskKeys.all, "stats"] as const,
};

interface TaskListParams {
  projectId: string;
  page?: number;
  pageSize?: number;
  status?: TaskStatus;
  priority?: TaskPriority;
  assigneeId?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export function useTasks(params: TaskListParams) {
  return useQuery({
    queryKey: taskKeys.list(params as unknown as Record<string, unknown>),
    queryFn: () => {
      const searchParams = new URLSearchParams();
      if (params.page) searchParams.set("page", String(params.page));
      if (params.pageSize) searchParams.set("pageSize", String(params.pageSize));
      if (params.status) searchParams.set("status", params.status);
      if (params.priority) searchParams.set("priority", params.priority);
      if (params.assigneeId) searchParams.set("assigneeId", params.assigneeId);
      if (params.search) searchParams.set("search", params.search);
      if (params.sortBy) searchParams.set("sortBy", params.sortBy);
      if (params.sortOrder) searchParams.set("sortOrder", params.sortOrder);
      const qs = searchParams.toString();
      return apiClient.get<ApiResponse<PaginatedResponse<Task>>>(
        `/api/projects/${params.projectId}/tasks${qs ? `?${qs}` : ""}`
      );
    },
    enabled: !!params.projectId,
  });
}

export function useTask(id: string) {
  return useQuery({
    queryKey: taskKeys.detail(id),
    queryFn: () =>
      apiClient.get<ApiResponse<Task>>(`/api/tasks/${id}`),
    enabled: !!id,
  });
}

export function useCreateTask(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTaskRequest) =>
      apiClient.post<ApiResponse<Task>>(
        `/api/projects/${projectId}/tasks`,
        data
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
    },
  });
}

export function useUpdateTask(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateTaskRequest) =>
      apiClient.patch<ApiResponse<Task>>(`/api/tasks/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
    },
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      apiClient.delete<ApiResponse<void>>(`/api/tasks/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
    },
  });
}

interface GlobalTaskStatsParams {
  assigneeId?: string;
}

export function useGlobalTaskStats(params?: GlobalTaskStatsParams) {
  return useQuery({
    queryKey: taskKeys.stats(),
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      searchParams.set("pageSize", "1");
      if (params?.assigneeId) {
        searchParams.set("assigneeId", params.assigneeId);
      }

      try {
        const response = await apiClient.get<ApiResponse<PaginatedResponse<Task>>>(
          `/api/tasks?${searchParams.toString()}`
        );
        return { total: response.data.total };
      } catch {
        return { total: 0 };
      }
    },
  });
}
