import type { Vehicle } from "@car-marketplace/types";
import {
  formatMileage,
  formatPrice,
  optimizeMediaUrl,
  type MediaPreset,
} from "@car-marketplace/utils";
import { UPLOAD_URL } from "../theme";

export function getBrandName(vehicle: Vehicle): string {
  if (vehicle.brand?.name) return vehicle.brand.name;
  if (
    typeof vehicle.brandId === "object" &&
    vehicle.brandId &&
    "name" in vehicle.brandId
  ) {
    return (vehicle.brandId as { name: string }).name;
  }
  return "";
}

export function mediaUrl(
  path?: string | null,
  preset: MediaPreset = "card"
): string | null {
  if (!path) return null;
  const resolved = path.startsWith("http") ? path : `${UPLOAD_URL}${path}`;
  return optimizeMediaUrl(resolved, preset) || resolved;
}

export function compactMileage(km: number): string {
  if (km === 0) return "0 KM";
  if (km >= 1000) {
    const k = km / 1000;
    return `${k % 1 === 0 ? k.toFixed(0) : k.toFixed(1)}K KM`;
  }
  return formatMileage(km);
}

export function compactPrice(amount: number, currency = "ETB"): string {
  if (amount >= 1_000_000) {
    const m = amount / 1_000_000;
    const formatted = m % 1 === 0 ? m.toFixed(0) : m.toFixed(1);
    return `${currency} ${formatted}M`;
  }
  return formatPrice(amount, currency);
}

export function conditionLabel(condition: string): string {
  if (condition === "NEW") return "NEW";
  if (condition === "CERTIFIED_USED") return "VERIFIED";
  return "USED";
}
