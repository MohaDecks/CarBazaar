export type UserRole =
  | "CUSTOMER"
  | "SELLER"
  | "DEALER"
  | "ADMIN"
  | "SUPER_ADMIN";

export type VehicleCondition = "NEW" | "USED" | "CERTIFIED_USED";

export type VehicleStatus =
  | "DRAFT"
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "SOLD"
  | "ARCHIVED";

export type FuelType =
  | "PETROL"
  | "DIESEL"
  | "ELECTRIC"
  | "HYBRID"
  | "PLUGIN_HYBRID"
  | "CNG"
  | "LPG";

export type TransmissionType = "AUTOMATIC" | "MANUAL" | "CVT" | "SEMI_AUTOMATIC";

export type DriveType = "FWD" | "RWD" | "AWD" | "FOUR_WD";

export type ImageType =
  | "MAIN"
  | "FRONT"
  | "REAR"
  | "LEFT"
  | "RIGHT"
  | "INTERIOR"
  | "DASHBOARD"
  | "ENGINE"
  | "WHEELS"
  | "ADDITIONAL"
  | "THUMBNAIL"
  | "GALLERY_360";

export type SortOption =
  | "newest"
  | "price_asc"
  | "price_desc"
  | "mileage"
  | "featured";

export type Currency = "ETB";

export type MessageStatus = "SENT" | "DELIVERED" | "READ";

export type ReportStatus = "OPEN" | "REVIEWING" | "RESOLVED" | "DISMISSED";

export type NotificationType =
  | "VEHICLE_APPROVED"
  | "VEHICLE_REJECTED"
  | "NEW_MESSAGE"
  | "FAVORITE_PRICE_DROP"
  | "DEALER_APPROVED"
  | "SYSTEM";
