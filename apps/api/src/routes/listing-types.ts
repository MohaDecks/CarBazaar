import { Router } from "express";
import { ListingType } from "../models/ListingType";
import { Vehicle } from "../models";
import { authenticate, authorize } from "../middleware/auth";
import { asyncHandler, AppError } from "../middleware/error";
import { createListingTypeSchema, parseBody } from "../validators";
import { slugify } from "@car-marketplace/utils";
import {
  backfillVehicleListingTypes,
  ensureDefaultListingTypes,
} from "../services/listing-types";

const router = Router();

router.get(
  "/",
  asyncHandler(async (_req, res) => {
    await ensureDefaultListingTypes();
    await backfillVehicleListingTypes();

    const types = await ListingType.find({ isActive: true }).sort({
      order: 1,
      name: 1,
    });

    const counts = await Vehicle.aggregate([
      { $match: { status: "APPROVED", listingTypeId: { $ne: null } } },
      { $group: { _id: "$listingTypeId", count: { $sum: 1 } } },
    ]);
    const countMap = new Map(counts.map((c) => [String(c._id), c.count]));

    res.json({
      success: true,
      data: types.map((t) => ({
        ...t.toObject(),
        vehicleCount: countMap.get(String(t._id)) ?? 0,
      })),
    });
  })
);

router.post(
  "/",
  authenticate,
  authorize("ADMIN", "SUPER_ADMIN"),
  asyncHandler(async (req, res) => {
    const data = parseBody(createListingTypeSchema, req.body);
    const slug = slugify(data.name);
    const exists = await ListingType.findOne({
      $or: [{ slug }, { name: data.name }],
    });
    if (exists) throw new AppError("Listing type already exists", 409);

    const last = await ListingType.findOne().sort({ order: -1 }).select("order");
    const listingType = await ListingType.create({
      ...data,
      slug,
      order: data.order ?? (last?.order ?? 0) + 1,
    });
    res.status(201).json({ success: true, data: listingType });
  })
);

router.put(
  "/:id",
  authenticate,
  authorize("ADMIN", "SUPER_ADMIN"),
  asyncHandler(async (req, res) => {
    const data = parseBody(createListingTypeSchema.partial(), req.body);
    const listingType = await ListingType.findByIdAndUpdate(
      req.params.id,
      data,
      { new: true }
    );
    if (!listingType) throw new AppError("Listing type not found", 404);
    res.json({ success: true, data: listingType });
  })
);

router.delete(
  "/:id",
  authenticate,
  authorize("ADMIN", "SUPER_ADMIN"),
  asyncHandler(async (req, res) => {
    await ListingType.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ success: true, message: "Listing type deactivated" });
  })
);

export default router;
