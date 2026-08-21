import { Router } from "express";
import { z } from "zod";
import { authenticate, type AuthRequest } from "../middleware/auth";
import { asyncHandler, AppError } from "../middleware/error";
import { Notification, User } from "../models";
import { parseBody } from "../validators";

const router = Router();

const registerTokenSchema = z.object({
  token: z.string().min(10),
});

router.get(
  "/",
  authenticate,
  asyncHandler(async (req: AuthRequest, res) => {
    const items = await Notification.find({ userId: req.user!.userId })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    const data = items.map((n) => ({
      ...n,
      data:
        n.data instanceof Map
          ? Object.fromEntries(n.data)
          : (n.data as Record<string, string> | undefined),
    }));

    res.json({ success: true, data });
  })
);

router.get(
  "/unread-count",
  authenticate,
  asyncHandler(async (req: AuthRequest, res) => {
    const count = await Notification.countDocuments({
      userId: req.user!.userId,
      isRead: false,
    });
    res.json({ success: true, data: { count } });
  })
);

router.post(
  "/read-all",
  authenticate,
  asyncHandler(async (req: AuthRequest, res) => {
    await Notification.updateMany(
      { userId: req.user!.userId, isRead: false },
      { isRead: true }
    );
    res.json({ success: true, message: "All marked as read" });
  })
);

router.patch(
  "/:id/read",
  authenticate,
  asyncHandler(async (req: AuthRequest, res) => {
    const item = await Notification.findOne({
      _id: req.params.id,
      userId: req.user!.userId,
    });
    if (!item) throw new AppError("Notification not found", 404);
    item.isRead = true;
    await item.save();
    res.json({ success: true, data: item });
  })
);

router.post(
  "/register-token",
  authenticate,
  asyncHandler(async (req: AuthRequest, res) => {
    const { token } = parseBody(registerTokenSchema, req.body);
    await User.findByIdAndUpdate(req.user!.userId, {
      $addToSet: { fcmTokens: token },
    });
    res.json({ success: true, message: "Device token registered" });
  })
);

router.post(
  "/unregister-token",
  authenticate,
  asyncHandler(async (req: AuthRequest, res) => {
    const { token } = parseBody(registerTokenSchema, req.body);
    await User.findByIdAndUpdate(req.user!.userId, {
      $pull: { fcmTokens: token },
    });
    res.json({ success: true, message: "Device token removed" });
  })
);

export default router;
