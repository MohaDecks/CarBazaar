import mongoose, { Schema, Document } from "mongoose";
import type { NotificationType, ReportStatus } from "@car-marketplace/types";

export interface ILocationDoc extends Document {
  country: string;
  region: string;
  city: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface INotification extends Document {
  userId: mongoose.Types.ObjectId;
  type: NotificationType;
  title: string;
  body: string;
  data?: Record<string, string>;
  isRead: boolean;
  createdAt: Date;
}

export interface IReport extends Document {
  reporterId: mongoose.Types.ObjectId;
  targetType: "VEHICLE" | "USER" | "DEALER" | "MESSAGE";
  targetId: mongoose.Types.ObjectId;
  reason: string;
  description?: string;
  status: ReportStatus;
  resolvedBy?: mongoose.Types.ObjectId;
  resolvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const locationDocSchema = new Schema<ILocationDoc>(
  {
    country: { type: String, default: "Ethiopia" },
    region: { type: String, required: true },
    city: { type: String, required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

locationDocSchema.index({ country: 1, region: 1, city: 1 }, { unique: true });

const notificationSchema = new Schema<INotification>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: [
        "VEHICLE_APPROVED",
        "VEHICLE_REJECTED",
        "NEW_MESSAGE",
        "FAVORITE_PRICE_DROP",
        "DEALER_APPROVED",
        "SYSTEM",
      ],
      required: true,
    },
    title: { type: String, required: true },
    body: { type: String, required: true },
    data: { type: Map, of: String },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

const reportSchema = new Schema<IReport>(
  {
    reporterId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    targetType: {
      type: String,
      enum: ["VEHICLE", "USER", "DEALER", "MESSAGE"],
      required: true,
    },
    targetId: { type: Schema.Types.ObjectId, required: true },
    reason: { type: String, required: true },
    description: String,
    status: {
      type: String,
      enum: ["OPEN", "REVIEWING", "RESOLVED", "DISMISSED"],
      default: "OPEN",
      index: true,
    },
    resolvedBy: { type: Schema.Types.ObjectId, ref: "User" },
    resolvedAt: Date,
  },
  { timestamps: true }
);

export const LocationModel = mongoose.model<ILocationDoc>(
  "Location",
  locationDocSchema
);
export const Notification = mongoose.model<INotification>(
  "Notification",
  notificationSchema
);
export const Report = mongoose.model<IReport>("Report", reportSchema);
