import { create } from "zustand";
import type { User } from "@/types";

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  setAuth: (token: string, user: User) => void;
  clearAuth: () => void;
  hydrate: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  isAuthenticated: false,

  setAuth: (token, user) => {
    localStorage.setItem("nexus-token", token);
    document.cookie = `nexus-token=${token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
    set({ token, user, isAuthenticated: true });
  },

  clearAuth: () => {
    localStorage.removeItem("nexus-token");
    document.cookie = "nexus-token=; path=/; max-age=0";
    set({ token: null, user: null, isAuthenticated: false });
  },

  hydrate: () => {
    const token = localStorage.getItem("nexus-token");
    if (token) {
      set({ token, isAuthenticated: true });
    }
  },
}));
