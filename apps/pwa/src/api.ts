import type {
  ApiResponse,
  Brand,
  Category,
  PaginatedResponse,
  Vehicle,
} from "@car-marketplace/types";
import { buildSearchQuery } from "@car-marketplace/utils";
import { API_URL } from "./theme";

async function request<T>(
  path: string,
  options: RequestInit & { token?: string } = {}
): Promise<T> {
  const { token, ...rest } = options;
  const headers: Record<string, string> = {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(rest.headers as Record<string, string> | undefined),
  };
  if (rest.body) headers["Content-Type"] = "application/json";

  const res = await fetch(`${API_URL}${path}`, {
    ...rest,
    headers,
    signal: AbortSignal.timeout(15000),
  });
  const json = (await res.json().catch(() => ({}))) as { message?: string };
  if (!res.ok) throw new Error(json.message || "Request failed");
  return json as T;
}

export const api = {
  getVehicles: (
    params: Record<string, string | number | boolean | undefined> = {}
  ) =>
    request<PaginatedResponse<Vehicle>>(
      `/vehicles${buildSearchQuery(params)}`
    ),
  getVehicle: (slug: string) =>
    request<ApiResponse<Vehicle>>(`/vehicles/slug/${slug}`),
  getBrands: () => request<ApiResponse<Brand[]>>("/brands"),
  getCategories: () => request<ApiResponse<Category[]>>("/categories"),
  login: (email: string, password: string) =>
    request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  loginGoogle: (idToken: string) =>
    request("/auth/google", {
      method: "POST",
      body: JSON.stringify({ idToken }),
    }),
};
