import type {
  Currency,
  DriveType,
  FuelType,
  ImageType,
  MessageStatus,
  NotificationType,
  ReportStatus,
  TransmissionType,
  UserRole,
  VehicleCondition,
  VehicleStatus,
} from "./enums";

export interface LocationData {
  country: string;
  region: string;
  city: string;
  address?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface VehicleImage {
  _id?: string;
  url: string;
  thumbnailUrl?: string;
  blurDataUrl?: string;
  type: ImageType;
  order: number;
  width?: number;
  height?: number;
  alt?: string;
  publicId?: string;
  secureUrl?: string;
  format?: string;
  bytes?: number;
  isMain?: boolean;
}

export interface VehicleFeatures {
  safety: string[];
  comfort: string[];
  technology: string[];
  exterior: string[];
  interior: string[];
}

export interface VehicleModel3D {
  url: string;
  format: "glb" | "gltf";
  thumbnailUrl?: string;
  fileSize?: number;
}

export interface Vehicle {
  _id: string;
  sellerId: string;
  dealerId?: string;
  brandId: string;
  categoryId: string;
  listingTypeId?: string;
  title: string;
  slug: string;
  condition: VehicleCondition;
  year: number;
  price: number;
  currency: Currency;
  negotiable: boolean;
  mileage: number;
  fuel: FuelType;
  transmission: TransmissionType;
  engine?: string;
  drive?: DriveType;
  color?: string;
  bodyType?: string;
  vin?: string;
  description: string;
  features: VehicleFeatures;
  images: VehicleImage[];
  mainImage: string;
  video?: string;
  videoPublicId?: string;
  model3d?: VehicleModel3D;
  gallery360?: VehicleImage[];
  location: LocationData;
  status: VehicleStatus;
  featured: boolean;
  views: number;
  favoritesCount: number;
  rejectionReason?: string;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
  /** Populated fields */
  brand?: Brand;
  category?: Category;
  listingType?: ListingType;
  seller?: Pick<User, "_id" | "firstName" | "lastName" | "phone" | "avatar">;
  dealer?: Dealer;
}

export interface Brand {
  _id: string;
  name: string;
  slug: string;
  logo?: string;
  description?: string;
  isActive: boolean;
  vehicleCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  image?: string;
  isActive: boolean;
  vehicleCount?: number;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface ListingType {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  defaultCondition: VehicleCondition;
  isActive: boolean;
  vehicleCount?: number;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  _id: string;
  email: string;
  phone?: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  role: UserRole;
  isVerified: boolean;
  isActive: boolean;
  dealerId?: string;
  location?: LocationData;
  createdAt: string;
  updatedAt: string;
}

export interface Dealer {
  _id: string;
  userId: string;
  companyName: string;
  slug: string;
  logo?: string;
  description?: string;
  location: LocationData;
  phone: string;
  email: string;
  website?: string;
  socialLinks?: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    telegram?: string;
  };
  verified: boolean;
  isActive: boolean;
  status: "PENDING" | "APPROVED" | "REJECTED" | "SUSPENDED";
  stats: {
    vehicles: number;
    sold: number;
    yearsActive: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Favorite {
  _id: string;
  userId: string;
  vehicleId: string;
  vehicle?: Vehicle;
  createdAt: string;
}

export interface Message {
  _id: string;
  conversationId: string;
  senderId: string;
  receiverId: string;
  vehicleId?: string;
  content: string;
  status: MessageStatus;
  createdAt: string;
  updatedAt: string;
  sender?: Pick<User, "_id" | "firstName" | "lastName" | "avatar">;
  vehicle?: Pick<Vehicle, "_id" | "title" | "slug" | "mainImage" | "price">;
}

export interface Conversation {
  _id: string;
  participants: string[];
  vehicleId?: string;
  lastMessage?: Message;
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
  vehicle?: Pick<Vehicle, "_id" | "title" | "slug" | "mainImage" | "price">;
  otherParticipant?: Pick<User, "_id" | "firstName" | "lastName" | "avatar" | "role">;
}

export interface Location {
  _id: string;
  country: string;
  region: string;
  city: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  _id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  data?: Record<string, string>;
  isRead: boolean;
  createdAt: string;
}

export interface Report {
  _id: string;
  reporterId: string;
  targetType: "VEHICLE" | "USER" | "DEALER" | "MESSAGE";
  targetId: string;
  reason: string;
  description?: string;
  status: ReportStatus;
  resolvedBy?: string;
  resolvedAt?: string;
  createdAt: string;
  updatedAt: string;
}
