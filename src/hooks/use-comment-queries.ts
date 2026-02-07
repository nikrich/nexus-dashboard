import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { ApiResponse, Comment, CreateCommentRequest } from "@/types";

export const commentKeys = {
  all: ["comments"] as const,
  list: (taskId: string) => [...commentKeys.all, "list", taskId] as const,
};

export function useComments(taskId: string) {
  return useQuery({
    queryKey: commentKeys.list(taskId),
    queryFn: () =>
      apiClient.get<ApiResponse<Comment[]>>(
        `/api/tasks/${taskId}/comments`
      ),
    enabled: !!taskId,
  });
}

export function useCreateComment(taskId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCommentRequest) =>
      apiClient.post<ApiResponse<Comment>>(
        `/api/tasks/${taskId}/comments`,
        data
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: commentKeys.list(taskId) });
    },
  });
}

export function useDeleteComment(taskId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (commentId: string) =>
      apiClient.delete<ApiResponse<void>>(`/api/comments/${commentId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: commentKeys.list(taskId) });
    },
  });
}
