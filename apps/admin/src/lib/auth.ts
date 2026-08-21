"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "@car-marketplace/types";

interface AuthState {
  user: User | null;
  accessToken: string | null;
  setAuth: (user: User, accessToken: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      setAuth: (user, accessToken) => set({ user, accessToken }),
      logout: () => set({ user: null, accessToken: null }),
    }),
    { name: "driveet-admin-auth" }
  )
);

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

export async function adminFetch<T>(
  path: string,
  token: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options?.headers,
    },
    cache: "no-store",
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Request failed");
  return json as T;
}
