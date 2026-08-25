import mongoose, { Schema, Document } from "mongoose";
import type { VehicleCondition } from "@car-marketplace/types";

export interface IListingType extends Document {
  name: string;
  slug: string;
  description?: string;
  defaultCondition: VehicleCondition;
  isActive: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const listingTypeSchema = new Schema<IListingType>(
  {
    name: { type: String, required: true, unique: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: String,
    defaultCondition: {
      type: String,
      enum: ["NEW", "USED", "CERTIFIED_USED"],
      default: "USED",
    },
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

listingTypeSchema.index({ order: 1, name: 1 });

export const ListingType = mongoose.model<IListingType>(
  "ListingType",
  listingTypeSchema
);
