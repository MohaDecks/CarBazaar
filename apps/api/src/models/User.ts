import mongoose, { Schema, Document } from "mongoose";
import type { UserRole, LocationData } from "@car-marketplace/types";

export interface IUser extends Document {
  email: string;
  password: string;
  phone?: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  role: UserRole;
  isVerified: boolean;
  isActive: boolean;
  dealerId?: mongoose.Types.ObjectId;
  location?: LocationData;
  refreshToken?: string;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  googleId?: string;
  fcmTokens?: string[];
  preferredLocale?: "en" | "so" | "am" | "ar";
  createdAt: Date;
  updatedAt: Date;
}

const locationSchema = new Schema(
  {
    country: { type: String, default: "Ethiopia" },
    region: String,
    city: String,
    address: String,
    coordinates: {
      lat: Number,
      lng: Number,
    },
  },
  { _id: false }
);

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: { type: String, required: true, select: false },
    phone: { type: String, trim: true },
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    avatar: String,
    role: {
      type: String,
      enum: ["CUSTOMER", "SELLER", "DEALER", "ADMIN", "SUPER_ADMIN"],
      default: "CUSTOMER",
    },
    isVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    dealerId: { type: Schema.Types.ObjectId, ref: "Dealer" },
    location: locationSchema,
    refreshToken: { type: String, select: false },
    resetPasswordToken: { type: String, select: false },
    resetPasswordExpires: { type: Date, select: false },
    googleId: { type: String, unique: true, sparse: true, index: true },
    fcmTokens: { type: [String], default: [] },
    preferredLocale: {
      type: String,
      enum: ["en", "so", "am", "ar"],
      default: "so",
    },
  },
  { timestamps: true }
);

userSchema.index({ role: 1, isActive: 1 });

export const User = mongoose.model<IUser>("User", userSchema);
