import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type {
  ApiResponse,
  WebhookConfig,
  NotificationType,
} from "@/types";

export const webhookKeys = {
  all: ["webhooks"] as const,
  lists: () => [...webhookKeys.all, "list"] as const,
  detail: (id: string) => [...webhookKeys.all, "detail", id] as const,
};

export function useWebhooks() {
  return useQuery({
    queryKey: webhookKeys.lists(),
    queryFn: () =>
      apiClient.get<ApiResponse<WebhookConfig[]>>("/api/webhooks"),
  });
}

export function useWebhook(id: string) {
  return useQuery({
    queryKey: webhookKeys.detail(id),
    queryFn: () =>
      apiClient.get<ApiResponse<WebhookConfig>>(`/api/webhooks/${id}`),
    enabled: !!id,
  });
}

export interface CreateWebhookRequest {
  url: string;
  secret: string;
  events: NotificationType[];
  active: boolean;
}

export interface UpdateWebhookRequest {
  url?: string;
  secret?: string;
  events?: NotificationType[];
  active?: boolean;
}

export function useCreateWebhook() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateWebhookRequest) =>
      apiClient.post<ApiResponse<WebhookConfig>>("/api/webhooks", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: webhookKeys.lists() });
    },
  });
}

export function useUpdateWebhook() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateWebhookRequest }) =>
      apiClient.patch<ApiResponse<WebhookConfig>>(
        `/api/webhooks/${id}`,
        data
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: webhookKeys.lists() });
    },
  });
}

export function useDeleteWebhook() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      apiClient.delete<ApiResponse<void>>(`/api/webhooks/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: webhookKeys.lists() });
    },
  });
}

export function useToggleWebhook() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) =>
      apiClient.patch<ApiResponse<WebhookConfig>>(
        `/api/webhooks/${id}`,
        { active }
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: webhookKeys.lists() });
    },
  });
}
