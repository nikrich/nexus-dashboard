"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/stores/auth-store";
import { apiClient } from "@/lib/api-client";
import type { ApiResponse, User } from "@/types";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { token, hydrate, setAuth, clearAuth } = useAuthStore();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (!token) return;

    apiClient
      .get<ApiResponse<User>>("/api/auth/me")
      .then((res) => {
        setAuth(token, res.data);
      })
      .catch(() => {
        clearAuth();
      });
  }, [token, setAuth, clearAuth]);

  return <>{children}</>;
}
