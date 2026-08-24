export const APP_NAME = "Motora";
export const CURRENCY = "ETB";
export const COUNTRY = "Ethiopia";

export const VEHICLE_CONDITIONS = ["NEW", "USED", "CERTIFIED_USED"] as const;

export const VEHICLE_STATUSES = [
  "DRAFT",
  "PENDING",
  "APPROVED",
  "REJECTED",
  "SOLD",
  "ARCHIVED",
] as const;

export const MAX_VEHICLE_IMAGES = 20;
export const MIN_RECOMMENDED_IMAGES = 5;
export const MAX_IMAGE_SIZE_MB = 10;
