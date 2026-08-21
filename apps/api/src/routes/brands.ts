import { Router } from "express";
import { Brand, Vehicle } from "../models";
import { authenticate, authorize } from "../middleware/auth";
import { asyncHandler, AppError } from "../middleware/error";
import { createBrandSchema, parseBody } from "../validators";
import { slugify } from "@car-marketplace/utils";

const router = Router();

router.get(
  "/",
  asyncHandler(async (_req, res) => {
    const brands = await Brand.find({ isActive: true }).sort({ name: 1 }).lean();
    const counts = await Vehicle.aggregate([
      { $match: { status: "APPROVED" } },
      { $group: { _id: "$brandId", count: { $sum: 1 } } },
    ]);
    const countMap = new Map(counts.map((c) => [c._id.toString(), c.count]));

    res.json({
      success: true,
      data: brands.map((b) => ({
        ...b,
        vehicleCount: countMap.get(b._id.toString()) ?? 0,
      })),
    });
  })
);

router.get(
  "/:slug",
  asyncHandler(async (req, res) => {
    const brand = await Brand.findOne({ slug: req.params.slug });
    if (!brand) throw new AppError("Brand not found", 404);
    res.json({ success: true, data: brand });
  })
);

router.post(
  "/",
  authenticate,
  authorize("ADMIN", "SUPER_ADMIN"),
  asyncHandler(async (req, res) => {
    const data = parseBody(createBrandSchema, req.body);
    const slug = slugify(data.name);
    const exists = await Brand.findOne({ $or: [{ slug }, { name: data.name }] });
    if (exists) throw new AppError("Brand already exists", 409);

    const brand = await Brand.create({ ...data, slug });
    res.status(201).json({ success: true, data: brand });
  })
);

router.put(
  "/:id",
  authenticate,
  authorize("ADMIN", "SUPER_ADMIN"),
  asyncHandler(async (req, res) => {
    const data = parseBody(createBrandSchema.partial(), req.body);
    const brand = await Brand.findByIdAndUpdate(req.params.id, data, {
      new: true,
    });
    if (!brand) throw new AppError("Brand not found", 404);
    res.json({ success: true, data: brand });
  })
);

router.delete(
  "/:id",
  authenticate,
  authorize("ADMIN", "SUPER_ADMIN"),
  asyncHandler(async (req, res) => {
    const inUse = await Vehicle.exists({ brandId: req.params.id });
    if (inUse) {
      await Brand.findByIdAndUpdate(req.params.id, { isActive: false });
      return res.json({
        success: true,
        message: "Brand deactivated (vehicles still reference it)",
      });
    }
    await Brand.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Brand deleted" });
  })
);

export default router;
