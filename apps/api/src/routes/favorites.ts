import { Router } from "express";
import { Favorite, Vehicle } from "../models";
import { authenticate, AuthRequest } from "../middleware/auth";
import { asyncHandler, AppError } from "../middleware/error";

const router = Router();

router.get(
  "/",
  authenticate,
  asyncHandler(async (req: AuthRequest, res) => {
    const favorites = await Favorite.find({ userId: req.user!.userId })
      .sort({ createdAt: -1 })
      .populate({
        path: "vehicleId",
        populate: [
          { path: "brandId", select: "name slug logo" },
          { path: "categoryId", select: "name slug" },
        ],
      })
      .lean();

    const data = favorites
      .filter((f) => f.vehicleId)
      .map((f) => {
        const v = f.vehicleId as unknown as Record<string, unknown>;
        return {
          _id: f._id,
          createdAt: f.createdAt,
          vehicle: {
            ...v,
            brand: v.brandId,
            category: v.categoryId,
            isFavorited: true,
          },
        };
      });

    res.json({ success: true, data });
  })
);

router.post(
  "/",
  authenticate,
  asyncHandler(async (req: AuthRequest, res) => {
    const { vehicleId } = req.body as { vehicleId?: string };
    if (!vehicleId) throw new AppError("vehicleId is required", 400);

    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle || vehicle.status !== "APPROVED") {
      throw new AppError("Vehicle not found", 404);
    }

    const existing = await Favorite.findOne({
      userId: req.user!.userId,
      vehicleId,
    });
    if (existing) {
      return res.json({ success: true, data: existing, message: "Already favorited" });
    }

    const favorite = await Favorite.create({
      userId: req.user!.userId,
      vehicleId,
    });
    await Vehicle.updateOne({ _id: vehicleId }, { $inc: { favoritesCount: 1 } });

    res.status(201).json({ success: true, data: favorite });
  })
);

router.delete(
  "/:vehicleId",
  authenticate,
  asyncHandler(async (req: AuthRequest, res) => {
    const result = await Favorite.findOneAndDelete({
      userId: req.user!.userId,
      vehicleId: req.params.vehicleId,
    });

    if (result) {
      await Vehicle.updateOne(
        { _id: req.params.vehicleId },
        { $inc: { favoritesCount: -1 } }
      );
    }

    res.json({ success: true, message: "Removed from favorites" });
  })
);

export default router;
