import mongoose, { Schema, Document } from "mongoose";

export interface IFavorite extends Document {
  userId: mongoose.Types.ObjectId;
  vehicleId: mongoose.Types.ObjectId;
  createdAt: Date;
}

const favoriteSchema = new Schema<IFavorite>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    vehicleId: {
      type: Schema.Types.ObjectId,
      ref: "Vehicle",
      required: true,
      index: true,
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

favoriteSchema.index({ userId: 1, vehicleId: 1 }, { unique: true });

export const Favorite = mongoose.model<IFavorite>("Favorite", favoriteSchema);
