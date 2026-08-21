import mongoose, { Schema, Document } from "mongoose";

export interface IBrand extends Document {
  name: string;
  slug: string;
  logo?: string;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const brandSchema = new Schema<IBrand>(
  {
    name: { type: String, required: true, unique: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    logo: String,
    description: String,
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Brand = mongoose.model<IBrand>("Brand", brandSchema);
