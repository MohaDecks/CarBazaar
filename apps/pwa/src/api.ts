import type {
  ApiResponse,
  Brand,
  Category,
  ListingType,
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
  if (rest.body && !(rest.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  const res = await fetch(`${API_URL}${path}`, {
    ...rest,
    headers,
    signal: AbortSignal.timeout(20000),
  });
  const json = (await res.json().catch(() => ({}))) as {
    message?: string;
    errors?: Record<string, string[]>;
  };
  if (!res.ok) {
    const details = json.errors
      ? Object.values(json.errors).flat().join(" · ")
      : "";
    throw new Error(details || json.message || "Request failed");
  }
  return json as T;
}

export const api = {
  getVehicles: (
    params: Record<string, string | number | boolean | undefined> = {},
    token?: string
  ) =>
    request<PaginatedResponse<Vehicle>>(
      `/vehicles${buildSearchQuery(params)}`,
      { token }
    ),
  getVehicle: (slug: string) =>
    request<ApiResponse<Vehicle>>(`/vehicles/slug/${slug}`),
  getBrands: () => request<ApiResponse<Brand[]>>("/brands"),
  getCategories: () => request<ApiResponse<Category[]>>("/categories"),
  getListingTypes: () => request<ApiResponse<ListingType[]>>("/listing-types"),
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
  createVehicle: (body: Record<string, unknown>, token: string) =>
    request<ApiResponse<Vehicle>>("/vehicles", {
      method: "POST",
      token,
      body: JSON.stringify(body),
    }),
  uploadImage: async (file: File, token: string) => {
    const body = new FormData();
    body.append("image", file);
    return request<
      ApiResponse<{
        url: string;
        thumbnailUrl?: string;
        publicId?: string;
        secureUrl?: string;
        width?: number;
        height?: number;
        format?: string;
        bytes?: number;
      }>
    >("/uploads/image?type=additional", {
      method: "POST",
      token,
      body,
    });
  },
};
