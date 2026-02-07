import { useMutation } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type {
  ApiResponse,
  AuthResponse,
  LoginRequest,
  RegisterRequest,
} from "@/types";

export function useLogin() {
  return useMutation({
    mutationFn: (data: LoginRequest) =>
      apiClient.post<ApiResponse<AuthResponse>>("/api/auth/login", data),
  });
}

export function useRegister() {
  return useMutation({
    mutationFn: (data: RegisterRequest) =>
      apiClient.post<ApiResponse<AuthResponse>>("/api/auth/register", data),
  });
}
