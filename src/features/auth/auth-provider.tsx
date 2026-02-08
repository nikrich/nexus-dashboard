"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/stores/auth-store";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const hydrate = useAuthStore((state) => state.hydrate);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  // Token validation happens naturally via the API gateway on every request.
  // If a token is expired/invalid, the 401 handler in api-client.ts will
  // clear auth and redirect to /login. No need to eagerly validate here,
  // which avoids race conditions with login navigation.

  return <>{children}</>;
}
