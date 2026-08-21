import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import {
  optimizeMediaUrl,
  type MediaPreset,
} from "@car-marketplace/utils";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function mediaUrl(
  path?: string | null,
  preset: MediaPreset = "detail"
): string {
  if (!path) return "/placeholder-car.svg";
  const resolved = path.startsWith("http")
    ? path
    : `${process.env.NEXT_PUBLIC_UPLOAD_URL ?? "http://localhost:4000"}${path}`;
  return optimizeMediaUrl(resolved, preset) || resolved;
}
