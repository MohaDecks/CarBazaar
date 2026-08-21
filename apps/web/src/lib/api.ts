import type {
  ApiResponse,
  AuthResponse,
  Brand,
  Category,
  Dealer,
  PaginatedResponse,
  User,
  Vehicle,
  VehicleSearchParams,
} from "@car-marketplace/types";
import { buildSearchQuery } from "@car-marketplace/utils";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

type FetchOptions = RequestInit & {
  token?: string | null;
};

async function apiFetch<T>(
  path: string,
  options: FetchOptions = {}
): Promise<T> {
  const { token, headers, ...rest } = options;
  const res = await fetch(`${API_URL}${path}`, {
    ...rest,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    next: rest.cache === "no-store" ? undefined : { revalidate: 60 },
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.message || "Request failed");
  }
  return json as T;
}

export const api = {
  getVehicles: (params: VehicleSearchParams = {}, token?: string) =>
    apiFetch<PaginatedResponse<Vehicle>>(
      `/vehicles${buildSearchQuery(params as Record<string, string | number | boolean | undefined | null>)}`,
      { token, cache: "no-store" }
    ),

  getVehicleBySlug: (slug: string, token?: string) =>
    apiFetch<ApiResponse<Vehicle & { isFavorited?: boolean }>>(
      `/vehicles/slug/${slug}`,
      { token, cache: "no-store" }
    ),

  getSimilar: (id: string) =>
    apiFetch<ApiResponse<Vehicle[]>>(`/vehicles/${id}/similar`),

  getBrands: () => apiFetch<ApiResponse<Brand[]>>("/brands"),

  getCategories: () => apiFetch<ApiResponse<Category[]>>("/categories"),

  getDealers: (params?: { page?: number; limit?: number }) =>
    apiFetch<PaginatedResponse<Dealer>>(
      `/dealers${buildSearchQuery(params ?? {})}`
    ),

  getDealer: (slug: string) =>
    apiFetch<ApiResponse<Dealer & { vehicles: Vehicle[] }>>(
      `/dealers/${slug}`
    ),

  login: (email: string, password: string) =>
    apiFetch<ApiResponse<AuthResponse>>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
      cache: "no-store",
    }),

  register: (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
    role?: string;
  }) =>
    apiFetch<ApiResponse<AuthResponse>>("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
      cache: "no-store",
    }),

  me: (token: string) =>
    apiFetch<ApiResponse<User>>("/auth/me", { token, cache: "no-store" }),

  toggleFavorite: async (vehicleId: string, token: string, favorited: boolean) => {
    if (favorited) {
      return apiFetch(`/favorites/${vehicleId}`, {
        method: "DELETE",
        token,
        cache: "no-store",
      });
    }
    return apiFetch(`/favorites`, {
      method: "POST",
      token,
      body: JSON.stringify({ vehicleId }),
      cache: "no-store",
    });
  },

  getFavorites: (token: string) =>
    apiFetch<ApiResponse<Array<{ _id: string; vehicle: Vehicle }>>>(
      "/favorites",
      { token, cache: "no-store" }
    ),

  sendMessage: (
    token: string,
    data: { receiverId: string; content: string; vehicleId?: string }
  ) =>
    apiFetch("/messages", {
      method: "POST",
      token,
      body: JSON.stringify(data),
      cache: "no-store",
    }),
};
