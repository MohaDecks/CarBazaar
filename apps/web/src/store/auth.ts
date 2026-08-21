"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "@car-marketplace/types";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  setAuth: (user: User, accessToken: string, refreshToken: string) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  logout: () => void;
  /** Returns a valid access token, refreshing if needed */
  getValidToken: () => Promise<string | null>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      setAuth: (user, accessToken, refreshToken) =>
        set({ user, accessToken, refreshToken }),
      setTokens: (accessToken, refreshToken) =>
        set({ accessToken, refreshToken }),
      logout: () =>
        set({ user: null, accessToken: null, refreshToken: null }),
      getValidToken: async () => {
        const { accessToken, refreshToken, setTokens, logout } = get();
        if (!accessToken) return null;

        // Quick local expiry check (JWT payload)
        try {
          const payload = JSON.parse(atob(accessToken.split(".")[1] ?? ""));
          const expMs = (payload.exp as number) * 1000;
          // Refresh 60s before expiry
          if (Date.now() < expMs - 60_000) {
            return accessToken;
          }
        } catch {
          // fall through to refresh
        }

        if (!refreshToken) {
          logout();
          return null;
        }

        try {
          const res = await fetch(`${API}/auth/refresh`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refreshToken }),
          });
          const json = await res.json();
          if (!res.ok) {
            logout();
            return null;
          }
          const nextAccess = json.data.tokens.accessToken as string;
          const nextRefresh = json.data.tokens.refreshToken as string;
          setTokens(nextAccess, nextRefresh);
          return nextAccess;
        } catch {
          logout();
          return null;
        }
      },
    }),
    { name: "driveet-auth" }
  )
);
