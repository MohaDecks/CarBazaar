import { Router } from "express";
import { Category, Vehicle } from "../models";
import { authenticate, authorize } from "../middleware/auth";
import { asyncHandler, AppError } from "../middleware/error";
import { createCategorySchema, parseBody } from "../validators";
import { slugify } from "@car-marketplace/utils";

const router = Router();

router.get(
  "/",
  asyncHandler(async (_req, res) => {
    const categories = await Category.find({ isActive: true })
      .sort({ order: 1, name: 1 })
      .lean();

    const counts = await Vehicle.aggregate([
      { $match: { status: "APPROVED" } },
      { $group: { _id: "$categoryId", count: { $sum: 1 } } },
    ]);
    const countMap = new Map(counts.map((c) => [c._id.toString(), c.count]));

    res.json({
      success: true,
      data: categories.map((c) => ({
        ...c,
        vehicleCount: countMap.get(c._id.toString()) ?? 0,
      })),
    });
  })
);

router.post(
  "/",
  authenticate,
  authorize("ADMIN", "SUPER_ADMIN"),
  asyncHandler(async (req, res) => {
    const data = parseBody(createCategorySchema, req.body);
    const slug = slugify(data.name);
    const exists = await Category.findOne({ slug });
    if (exists) throw new AppError("Category already exists", 409);

    const category = await Category.create({ ...data, slug });
    res.status(201).json({ success: true, data: category });
  })
);

router.put(
  "/:id",
  authenticate,
  authorize("ADMIN", "SUPER_ADMIN"),
  asyncHandler(async (req, res) => {
    const data = parseBody(createCategorySchema.partial(), req.body);
    const category = await Category.findByIdAndUpdate(req.params.id, data, {
      new: true,
    });
    if (!category) throw new AppError("Category not found", 404);
    res.json({ success: true, data: category });
  })
);

router.delete(
  "/:id",
  authenticate,
  authorize("ADMIN", "SUPER_ADMIN"),
  asyncHandler(async (req, res) => {
    await Category.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ success: true, message: "Category deactivated" });
  })
);

export default router;
