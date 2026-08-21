import type { SortOption, VehicleCondition } from "./enums";
import type { Brand, Category, Dealer, User, Vehicle } from "./models";

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  meta: PaginationMeta;
  message?: string;
}

export interface ApiError {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
  statusCode: number;
}

export interface VehicleSearchParams {
  brand?: string;
  model?: string;
  condition?: VehicleCondition | string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  year?: number;
  minYear?: number;
  maxYear?: number;
  maxMileage?: number;
  fuel?: string;
  transmission?: string;
  bodyType?: string;
  color?: string;
  location?: string;
  region?: string;
  city?: string;
  featured?: boolean;
  status?: string;
  q?: string;
  sort?: SortOption;
  page?: number;
  limit?: number;
  sellerId?: string;
  dealerId?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  user: User;
  tokens: AuthTokens;
}

export interface RegisterInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role?: "CUSTOMER" | "SELLER" | "DEALER";
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface CreateVehicleInput {
  brandId: string;
  categoryId: string;
  title: string;
  condition: VehicleCondition;
  year: number;
  price: number;
  negotiable?: boolean;
  mileage: number;
  fuel: string;
  transmission: string;
  engine?: string;
  drive?: string;
  color?: string;
  bodyType?: string;
  vin?: string;
  description: string;
  features?: {
    safety?: string[];
    comfort?: string[];
    technology?: string[];
    exterior?: string[];
    interior?: string[];
  };
  location: {
    country: string;
    region: string;
    city: string;
    address?: string;
  };
  dealerId?: string;
}

export interface DashboardStats {
  totalVehicles: number;
  published: number;
  pending: number;
  sold: number;
  users: number;
  dealers: number;
  revenue?: number;
}

export interface VehicleCardData {
  _id: string;
  title: string;
  slug: string;
  condition: string;
  year: number;
  price: number;
  currency: string;
  mileage: number;
  fuel: string;
  transmission: string;
  mainImage: string;
  location: {
    city: string;
    region?: string;
    country: string;
  };
  brand?: Pick<Brand, "name" | "slug" | "logo">;
  featured?: boolean;
  isFavorited?: boolean;
}

export type { Brand, Category, Dealer, User, Vehicle };
