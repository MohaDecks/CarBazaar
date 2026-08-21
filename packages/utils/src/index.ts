/**
 * Format price in Ethiopian Birr (ETB)
 */
export function formatPrice(
  amount: number,
  currency: string = "ETB",
  options?: { compact?: boolean }
): string {
  if (options?.compact && amount >= 1_000_000) {
    const millions = amount / 1_000_000;
    const formatted =
      millions % 1 === 0 ? millions.toFixed(0) : millions.toFixed(1);
    return `${currency} ${formatted}M`;
  }

  return `${currency} ${amount.toLocaleString("en-ET")}`;
}

/**
 * Format mileage with unit
 */
export function formatMileage(km: number): string {
  if (km === 0) return "0 KM";
  return `${km.toLocaleString("en-ET")} KM`;
}

/**
 * Generate URL-safe slug
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Build vehicle SEO slug: brand/model-year
 */
export function vehicleSlug(
  brand: string,
  model: string,
  year: number
): string {
  return `${slugify(brand)}/${slugify(model)}-${year}`;
}

/**
 * Format condition for display
 */
export function formatCondition(condition: string): string {
  const map: Record<string, string> = {
    NEW: "New",
    USED: "Used",
    CERTIFIED_USED: "Certified",
  };
  return map[condition] ?? condition;
}

/**
 * Format fuel type for display
 */
export function formatFuel(fuel: string): string {
  const map: Record<string, string> = {
    PETROL: "Petrol",
    DIESEL: "Diesel",
    ELECTRIC: "Electric",
    HYBRID: "Hybrid",
    PLUGIN_HYBRID: "Plug-in Hybrid",
    CNG: "CNG",
    LPG: "LPG",
  };
  return map[fuel] ?? fuel;
}

/**
 * Format transmission for display
 */
export function formatTransmission(transmission: string): string {
  const map: Record<string, string> = {
    AUTOMATIC: "Automatic",
    MANUAL: "Manual",
    CVT: "CVT",
    SEMI_AUTOMATIC: "Semi-Auto",
  };
  return map[transmission] ?? transmission;
}

/**
 * Build query string from search params (omits empty values)
 */
export function buildSearchQuery(
  params: Record<string, string | number | boolean | undefined | null>
): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") continue;
    search.set(key, String(value));
  }
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength).trim()}…`;
}

/**
 * Get initials from name
 */
export function getInitials(firstName: string, lastName?: string): string {
  const first = firstName?.charAt(0) ?? "";
  const last = lastName?.charAt(0) ?? "";
  return `${first}${last}`.toUpperCase();
}

/**
 * Relative time formatter
 */
export function timeAgo(date: string | Date): string {
  const now = Date.now();
  const then = new Date(date).getTime();
  const seconds = Math.floor((now - then) / 1000);

  if (seconds < 60) return "Just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return new Date(date).toLocaleDateString("en-ET", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export type MediaPreset = "thumb" | "card" | "detail" | "full";

const MEDIA_TRANSFORMS: Record<MediaPreset, string> = {
  thumb: "f_auto,q_auto,c_fill,g_auto,w_240,h_160",
  card: "f_auto,q_auto,c_fill,g_auto,w_800",
  detail: "f_auto,q_auto,c_limit,w_1600",
  full: "f_auto,q_auto",
};

export function isCloudinaryUrl(url: string): boolean {
  return url.includes("res.cloudinary.com") && url.includes("/upload/");
}

/**
 * Insert Cloudinary transformations into a delivery URL.
 * Safe for local / Unsplash URLs (returned unchanged).
 * Does not require Cloudinary credentials.
 */
export function optimizeMediaUrl(
  url?: string | null,
  preset: MediaPreset = "card"
): string {
  if (!url) return "";
  if (!isCloudinaryUrl(url)) return url;

  const [withoutQuery] = url.split("?");
  const transform = MEDIA_TRANSFORMS[preset];
  if (/\/upload\/[^/]*?(?:f_auto|q_auto|w_|c_)/.test(withoutQuery)) {
    return withoutQuery.replace(/\/upload\/[^/]+\//, `/upload/${transform}/`);
  }
  return withoutQuery.replace("/upload/", `/upload/${transform}/`);
}

/**
 * Validate image file client-side
 */
export function validateImageFile(
  file: { type: string; size: number },
  options?: { maxSizeMB?: number }
): { valid: boolean; error?: string } {
  const allowed = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/avif",
  ];
  const maxMB = options?.maxSizeMB ?? 10;

  if (!allowed.includes(file.type)) {
    return {
      valid: false,
      error: "Only JPEG, PNG, WebP, and AVIF images are allowed.",
    };
  }
  if (file.size > maxMB * 1024 * 1024) {
    return { valid: false, error: `Image must be under ${maxMB}MB.` };
  }
  return { valid: true };
}

/**
 * Ethiopian regions (initial set)
 */
export const ETHIOPIA_REGIONS = [
  "Addis Ababa",
  "Afar",
  "Amhara",
  "Benishangul-Gumuz",
  "Dire Dawa",
  "Gambela",
  "Harari",
  "Oromia",
  "Sidama",
  "Somali",
  "South Ethiopia",
  "Southwest Ethiopia",
  "Tigray",
  "Central Ethiopia",
] as const;

export const ETHIOPIA_CITIES = [
  "Addis Ababa",
  "Adama",
  "Bahir Dar",
  "Dire Dawa",
  "Hawassa",
  "Jimma",
  "Jijiga",
  "Mekelle",
  "Gondar",
  "Dessie",
  "Harar",
  "Assosa",
  "Gambela",
  "Semera",
] as const;
