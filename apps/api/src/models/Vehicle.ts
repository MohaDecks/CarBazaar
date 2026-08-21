import mongoose, { Schema, Document } from "mongoose";
import type {
  VehicleCondition,
  VehicleStatus,
  FuelType,
  TransmissionType,
  DriveType,
  ImageType,
  LocationData,
  VehicleFeatures,
} from "@car-marketplace/types";

export interface IVehicleImage {
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

export interface IVehicle extends Document {
  sellerId: mongoose.Types.ObjectId;
  dealerId?: mongoose.Types.ObjectId;
  brandId: mongoose.Types.ObjectId;
  categoryId: mongoose.Types.ObjectId;
  title: string;
  slug: string;
  condition: VehicleCondition;
  year: number;
  price: number;
  currency: string;
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
  images: IVehicleImage[];
  mainImage: string;
  video?: string;
  videoPublicId?: string;
  model3d?: {
    url: string;
    format: "glb" | "gltf";
    thumbnailUrl?: string;
    fileSize?: number;
  };
  gallery360: IVehicleImage[];
  location: LocationData;
  status: VehicleStatus;
  featured: boolean;
  views: number;
  favoritesCount: number;
  rejectionReason?: string;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const imageSchema = new Schema(
  {
    url: { type: String, required: true },
    thumbnailUrl: String,
    blurDataUrl: String,
    publicId: String,
    secureUrl: String,
    format: String,
    bytes: Number,
    isMain: { type: Boolean, default: false },
    type: {
      type: String,
      enum: [
        "MAIN",
        "FRONT",
        "REAR",
        "LEFT",
        "RIGHT",
        "INTERIOR",
        "DASHBOARD",
        "ENGINE",
        "WHEELS",
        "ADDITIONAL",
        "THUMBNAIL",
        "GALLERY_360",
      ],
      default: "ADDITIONAL",
    },
    order: { type: Number, default: 0 },
    width: Number,
    height: Number,
    alt: String,
  },
  { _id: true }
);

const featuresSchema = new Schema(
  {
    safety: { type: [String], default: [] },
    comfort: { type: [String], default: [] },
    technology: { type: [String], default: [] },
    exterior: { type: [String], default: [] },
    interior: { type: [String], default: [] },
  },
  { _id: false }
);

const locationSchema = new Schema(
  {
    country: { type: String, default: "Ethiopia" },
    region: { type: String, required: true },
    city: { type: String, required: true },
    address: String,
    coordinates: {
      lat: Number,
      lng: Number,
    },
  },
  { _id: false }
);

const vehicleSchema = new Schema<IVehicle>(
  {
    sellerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    dealerId: { type: Schema.Types.ObjectId, ref: "Dealer", index: true },
    brandId: {
      type: Schema.Types.ObjectId,
      ref: "Brand",
      required: true,
      index: true,
    },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
      index: true,
    },
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    condition: {
      type: String,
      enum: ["NEW", "USED", "CERTIFIED_USED"],
      required: true,
      index: true,
    },
    year: { type: Number, required: true, min: 1980, max: 2030, index: true },
    price: { type: Number, required: true, min: 0, index: true },
    currency: { type: String, default: "ETB" },
    negotiable: { type: Boolean, default: false },
    mileage: { type: Number, required: true, min: 0 },
    fuel: {
      type: String,
      enum: [
        "PETROL",
        "DIESEL",
        "ELECTRIC",
        "HYBRID",
        "PLUGIN_HYBRID",
        "CNG",
        "LPG",
      ],
      required: true,
    },
    transmission: {
      type: String,
      enum: ["AUTOMATIC", "MANUAL", "CVT", "SEMI_AUTOMATIC"],
      required: true,
    },
    engine: String,
    drive: {
      type: String,
      enum: ["FWD", "RWD", "AWD", "FOUR_WD"],
    },
    color: String,
    bodyType: String,
    vin: String,
    description: { type: String, required: true },
    features: { type: featuresSchema, default: () => ({}) },
    images: { type: [imageSchema], default: [] },
    mainImage: { type: String, required: true },
    video: String,
    videoPublicId: String,
    model3d: {
      url: String,
      format: { type: String, enum: ["glb", "gltf"] },
      thumbnailUrl: String,
      fileSize: Number,
    },
    gallery360: { type: [imageSchema], default: [] },
    location: { type: locationSchema, required: true },
    status: {
      type: String,
      enum: ["DRAFT", "PENDING", "APPROVED", "REJECTED", "SOLD", "ARCHIVED"],
      default: "DRAFT",
      index: true,
    },
    featured: { type: Boolean, default: false, index: true },
    views: { type: Number, default: 0 },
    favoritesCount: { type: Number, default: 0 },
    rejectionReason: String,
    publishedAt: Date,
  },
  { timestamps: true }
);

vehicleSchema.index({ status: 1, featured: -1, publishedAt: -1 });
vehicleSchema.index({ status: 1, price: 1 });
vehicleSchema.index({ status: 1, "location.city": 1 });
vehicleSchema.index({ title: "text", description: "text" });
vehicleSchema.index({ brandId: 1, status: 1 });
vehicleSchema.index({ categoryId: 1, status: 1 });

export const Vehicle = mongoose.model<IVehicle>("Vehicle", vehicleSchema);
