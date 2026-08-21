import { Router } from "express";
import { Dealer, User, Vehicle } from "../models";
import { authenticate, authorize, AuthRequest } from "../middleware/auth";
import { asyncHandler, AppError } from "../middleware/error";
import { createDealerSchema, parseBody } from "../validators";
import { slugify } from "@car-marketplace/utils";
import { z } from "zod";

const router = Router();

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const { status = "APPROVED", page = "1", limit = "12" } = req.query;
    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.min(50, Number(limit));

    const filter: Record<string, unknown> = { isActive: true };
    if (status) filter.status = String(status);

    const [items, total] = await Promise.all([
      Dealer.find(filter)
        .sort({ verified: -1, createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
        .lean(),
      Dealer.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: items,
      meta: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum) || 1,
        hasNext: pageNum * limitNum < total,
        hasPrev: pageNum > 1,
      },
    });
  })
);

router.get(
  "/:slug",
  asyncHandler(async (req, res) => {
    const dealer = await Dealer.findOne({
      slug: req.params.slug,
      status: "APPROVED",
    }).lean();
    if (!dealer) throw new AppError("Dealer not found", 404);

    const vehicles = await Vehicle.find({
      dealerId: dealer._id,
      status: "APPROVED",
    })
      .populate([
        { path: "brandId", select: "name slug logo" },
        { path: "categoryId", select: "name slug" },
      ])
      .sort({ publishedAt: -1 })
      .limit(12)
      .lean();

    res.json({
      success: true,
      data: {
        ...dealer,
        vehicles: vehicles.map((v) => ({
          ...v,
          brand: v.brandId,
          category: v.categoryId,
        })),
      },
    });
  })
);

router.post(
  "/",
  authenticate,
  asyncHandler(async (req: AuthRequest, res) => {
    const data = parseBody(createDealerSchema, req.body);
    const existing = await Dealer.findOne({ userId: req.user!.userId });
    if (existing) throw new AppError("You already have a dealer profile", 409);

    const slug = slugify(data.companyName);
    const dealer = await Dealer.create({
      ...data,
      slug,
      userId: req.user!.userId,
      status: "PENDING",
    });

    await User.findByIdAndUpdate(req.user!.userId, {
      role: "DEALER",
      dealerId: dealer._id,
    });

    res.status(201).json({
      success: true,
      data: dealer,
      message: "Dealer application submitted for approval",
    });
  })
);

router.patch(
  "/:id/status",
  authenticate,
  authorize("ADMIN", "SUPER_ADMIN"),
  asyncHandler(async (req, res) => {
    const schema = z.object({
      status: z.enum(["APPROVED", "REJECTED", "SUSPENDED"]),
      verified: z.boolean().optional(),
      rejectionReason: z.string().optional(),
    });
    const data = parseBody(schema, req.body);

    const dealer = await Dealer.findById(req.params.id);
    if (!dealer) throw new AppError("Dealer not found", 404);

    dealer.status = data.status;
    if (data.status === "APPROVED") {
      dealer.verified = data.verified ?? true;
      dealer.rejectionReason = undefined;
    }
    if (data.status === "REJECTED") {
      dealer.rejectionReason = data.rejectionReason;
      dealer.verified = false;
    }

    await dealer.save();
    res.json({ success: true, data: dealer });
  })
);

export default router;
