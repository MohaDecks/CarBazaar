import mongoose, { Schema, Document } from "mongoose";
import type { LocationData } from "@car-marketplace/types";

export interface IDealer extends Document {
  userId: mongoose.Types.ObjectId;
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
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const locationSchema = new Schema(
  {
    country: { type: String, default: "Ethiopia" },
    region: { type: String, required: true },
    city: { type: String, required: true },
    address: String,
    coordinates: { lat: Number, lng: Number },
  },
  { _id: false }
);

const dealerSchema = new Schema<IDealer>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    companyName: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    logo: String,
    description: String,
    location: { type: locationSchema, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true, lowercase: true },
    website: String,
    socialLinks: {
      facebook: String,
      twitter: String,
      instagram: String,
      telegram: String,
    },
    verified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED", "SUSPENDED"],
      default: "PENDING",
      index: true,
    },
    stats: {
      vehicles: { type: Number, default: 0 },
      sold: { type: Number, default: 0 },
      yearsActive: { type: Number, default: 0 },
    },
    rejectionReason: String,
  },
  { timestamps: true }
);

export const Dealer = mongoose.model<IDealer>("Dealer", dealerSchema);
