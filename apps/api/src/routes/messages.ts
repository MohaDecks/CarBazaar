import { Router } from "express";
import { Conversation, Message, User } from "../models";
import { authenticate, AuthRequest } from "../middleware/auth";
import { asyncHandler, AppError } from "../middleware/error";
import { sendMessageSchema, parseBody } from "../validators";
import { notifyUser } from "../services/notifications";

const router = Router();

router.get(
  "/conversations",
  authenticate,
  asyncHandler(async (req: AuthRequest, res) => {
    const conversations = await Conversation.find({
      participants: req.user!.userId,
    })
      .sort({ lastMessageAt: -1 })
      .populate("vehicleId", "title slug mainImage price")
      .populate("participants", "firstName lastName avatar role")
      .lean();

    const withMeta = await Promise.all(
      conversations.map(async (c) => {
        const lastMessage = await Message.findOne({ conversationId: c._id })
          .sort({ createdAt: -1 })
          .lean();
        const unreadCount = await Message.countDocuments({
          conversationId: c._id,
          receiverId: req.user!.userId,
          status: { $ne: "READ" },
        });
        const other = (c.participants as unknown as Array<{ _id: { toString: () => string } }>).find(
          (p) => p._id.toString() !== req.user!.userId
        );

        return {
          ...c,
          lastMessage,
          unreadCount,
          otherParticipant: other,
          vehicle: c.vehicleId,
        };
      })
    );

    res.json({ success: true, data: withMeta });
  })
);

router.get(
  "/conversations/:id",
  authenticate,
  asyncHandler(async (req: AuthRequest, res) => {
    const conversation = await Conversation.findById(req.params.id);
    if (!conversation) throw new AppError("Conversation not found", 404);

    if (
      !conversation.participants.some(
        (p) => p.toString() === req.user!.userId
      )
    ) {
      throw new AppError("Forbidden", 403);
    }

    const messages = await Message.find({ conversationId: conversation._id })
      .sort({ createdAt: 1 })
      .populate("senderId", "firstName lastName avatar")
      .lean();

    await Message.updateMany(
      {
        conversationId: conversation._id,
        receiverId: req.user!.userId,
        status: { $ne: "READ" },
      },
      { status: "READ" }
    );

    res.json({
      success: true,
      data: {
        conversation,
        messages: messages.map((m) => ({
          ...m,
          sender: m.senderId,
        })),
      },
    });
  })
);

router.post(
  "/",
  authenticate,
  asyncHandler(async (req: AuthRequest, res) => {
    const data = parseBody(sendMessageSchema, req.body);

    if (data.receiverId === req.user!.userId) {
      throw new AppError("Cannot message yourself", 400);
    }

    const receiver = await User.findById(data.receiverId);
    if (!receiver) throw new AppError("Recipient not found", 404);

    let conversation;
    if (data.conversationId) {
      conversation = await Conversation.findById(data.conversationId);
      if (!conversation) throw new AppError("Conversation not found", 404);
    } else {
      conversation = await Conversation.findOne({
        participants: { $all: [req.user!.userId, data.receiverId] },
        ...(data.vehicleId
          ? { vehicleId: data.vehicleId }
          : { vehicleId: { $exists: false } }),
      });

      if (!conversation) {
        conversation = await Conversation.create({
          participants: [req.user!.userId, data.receiverId],
          vehicleId: data.vehicleId,
        });
      }
    }

    const message = await Message.create({
      conversationId: conversation._id,
      senderId: req.user!.userId,
      receiverId: data.receiverId,
      vehicleId: data.vehicleId,
      content: data.content,
      status: "SENT",
    });

    conversation.lastMessageAt = new Date();
    await conversation.save();

    const preview =
      data.content.length > 80
        ? `${data.content.slice(0, 80)}…`
        : data.content;

    await notifyUser({
      userId: data.receiverId,
      type: "NEW_MESSAGE",
      title: "New message",
      body: preview,
      data: {
        conversationId: conversation._id.toString(),
        type: "NEW_MESSAGE",
        senderId: req.user!.userId,
      },
    }).catch(() => undefined);

    res.status(201).json({ success: true, data: message });
  })
);

export default router;
