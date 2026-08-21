import mongoose, { Schema, Document } from "mongoose";
import type { MessageStatus } from "@car-marketplace/types";

export interface IMessage extends Document {
  conversationId: mongoose.Types.ObjectId;
  senderId: mongoose.Types.ObjectId;
  receiverId: mongoose.Types.ObjectId;
  vehicleId?: mongoose.Types.ObjectId;
  content: string;
  status: MessageStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface IConversation extends Document {
  participants: mongoose.Types.ObjectId[];
  vehicleId?: mongoose.Types.ObjectId;
  lastMessageAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const conversationSchema = new Schema<IConversation>(
  {
    participants: [
      { type: Schema.Types.ObjectId, ref: "User", required: true },
    ],
    vehicleId: { type: Schema.Types.ObjectId, ref: "Vehicle" },
    lastMessageAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

conversationSchema.index({ participants: 1 });
conversationSchema.index({ lastMessageAt: -1 });

const messageSchema = new Schema<IMessage>(
  {
    conversationId: {
      type: Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
      index: true,
    },
    senderId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    receiverId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    vehicleId: { type: Schema.Types.ObjectId, ref: "Vehicle" },
    content: { type: String, required: true, trim: true, maxlength: 2000 },
    status: {
      type: String,
      enum: ["SENT", "DELIVERED", "READ"],
      default: "SENT",
    },
  },
  { timestamps: true }
);

messageSchema.index({ conversationId: 1, createdAt: -1 });

export const Conversation = mongoose.model<IConversation>(
  "Conversation",
  conversationSchema
);
export const Message = mongoose.model<IMessage>("Message", messageSchema);
