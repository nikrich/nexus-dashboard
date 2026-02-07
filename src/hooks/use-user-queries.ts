import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { ApiResponse, User } from "@/types";

export const userKeys = {
  all: ["users"] as const,
  lists: () => [...userKeys.all, "list"] as const,
  detail: (id: string) => [...userKeys.all, "detail", id] as const,
  me: () => [...userKeys.all, "me"] as const,
};

export function useCurrentUser() {
  return useQuery({
    queryKey: userKeys.me(),
    queryFn: () => apiClient.get<ApiResponse<User>>("/api/auth/me"),
  });
}

export function useUser(id: string) {
  return useQuery({
    queryKey: userKeys.detail(id),
    queryFn: () => apiClient.get<ApiResponse<User>>(`/api/users/${id}`),
    enabled: !!id,
  });
}

export function useUsers() {
  return useQuery({
    queryKey: userKeys.lists(),
    queryFn: () => apiClient.get<ApiResponse<User[]>>("/api/users"),
  });
}

export function useUpdateUser(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { name?: string; avatarUrl?: string }) =>
      apiClient.patch<ApiResponse<User>>(`/api/users/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: userKeys.me() });
    },
  });
}
