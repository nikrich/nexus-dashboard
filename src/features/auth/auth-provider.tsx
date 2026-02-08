"use client";

import { useEffect, useRef } from "react";
import { useAuthStore } from "@/stores/auth-store";
import { apiClient } from "@/lib/api-client";
import type { ApiResponse, User } from "@/types";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { token, hydrate, setAuth, clearAuth } = useAuthStore();
  const hasValidated = useRef(false);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (!token || hasValidated.current) return;
    hasValidated.current = true;

    // Validate the token by refreshing it - this endpoint actually exists
    // unlike /api/auth/me which the user service doesn't implement
    apiClient
      .post<ApiResponse<{ token: string; user: User }>>("/api/auth/refresh")
      .then((res) => {
        setAuth(res.data.token, res.data.user);
      })
      .catch(() => {
        clearAuth();
      });
  }, [token, setAuth, clearAuth]);

  return <>{children}</>;
}
