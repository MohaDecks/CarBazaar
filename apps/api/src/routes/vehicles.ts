import { Router } from "express";
import { FilterQuery } from "mongoose";
import { Brand, Category, Favorite, User, Vehicle } from "../models";
import { ListingType } from "../models/ListingType";
import type { IVehicle } from "../models/Vehicle";
import {
  authenticate,
  authorize,
  optionalAuth,
  AuthRequest,
} from "../middleware/auth";
import { asyncHandler, AppError } from "../middleware/error";
import {
  createVehicleSchema,
  updateVehicleSchema,
  vehicleStatusSchema,
  parseBody,
} from "../validators";
import { slugify } from "@car-marketplace/utils";
import { notifyUser } from "../services/notifications";
import {
  deleteStoredMedia,
  deleteVehicleMedia,
  relocateVehicleMedia,
} from "../services/storage/vehicle-media";
import {
  backfillVehicleListingTypes,
  resolveListingTypeId,
} from "../services/listing-types";
import { env } from "../config/env";

const router = Router();

const POPULATE = [
  { path: "brandId", select: "name slug logo" },
  { path: "categoryId", select: "name slug" },
  { path: "listingTypeId", select: "name slug defaultCondition" },
  { path: "sellerId", select: "firstName lastName phone avatar" },
  {
    path: "dealerId",
    select: "companyName slug logo verified location phone email stats",
  },
];

function publicAssetUrl(url?: string | null): string {
  if (!url) return "";
  if (/^https?:\/\//i.test(url)) return url;
  const base = env.publicBaseUrl;
  if (!base) return url;
  return `${base}${url.startsWith("/") ? url : `/${url}`}`;
}

function resolveMainImage(v: Record<string, unknown>): string {
  const images = (Array.isArray(v.images) ? v.images : []) as Array<{
    url?: string;
    isMain?: boolean;
    type?: string;
  }>;
  const preferred =
    images.find((img) => img.isMain) ??
    images.find((img) => img.type === "MAIN") ??
    images[0];
  const current = typeof v.mainImage === "string" ? v.mainImage : "";
  if (preferred?.url && (!current || current.includes("/temp/"))) {
    return publicAssetUrl(preferred.url);
  }
  return publicAssetUrl(current || preferred?.url || "");
}

function mapVehicle(doc: InstanceType<typeof Vehicle> | Record<string, unknown>) {
  const v = typeof (doc as { toObject?: () => Record<string, unknown> }).toObject === "function"
    ? (doc as { toObject: () => Record<string, unknown> }).toObject()
    : (doc as Record<string, unknown>);

  const images = Array.isArray(v.images)
    ? (v.images as Array<Record<string, unknown>>).map((img) => ({
        ...img,
        url: publicAssetUrl(typeof img.url === "string" ? img.url : ""),
        thumbnailUrl: publicAssetUrl(
          typeof img.thumbnailUrl === "string" ? img.thumbnailUrl : ""
        ),
        secureUrl: publicAssetUrl(
          typeof img.secureUrl === "string" ? img.secureUrl : ""
        ),
      }))
    : [];

  return {
    ...v,
    images,
    mainImage: resolveMainImage({ ...v, images }),
    brand: v.brandId,
    category: v.categoryId,
    listingType: v.listingTypeId,
    seller: v.sellerId,
    dealer: v.dealerId,
  };
}

async function uniqueSlug(base: string): Promise<string> {
  let slug = slugify(base);
  let n = 0;
  while (await Vehicle.exists({ slug: n ? `${slug}-${n}` : slug })) {
    n += 1;
  }
  return n ? `${slug}-${n}` : slug;
}

router.get(
  "/",
  optionalAuth,
  asyncHandler(async (req: AuthRequest, res) => {
    const {
      brand,
      condition,
      category,
      listingType,
      minPrice,
      maxPrice,
      year,
      minYear,
      maxYear,
      maxMileage,
      fuel,
      transmission,
      bodyType,
      color,
      location,
      city,
      region,
      featured,
      status,
      q,
      sort = "newest",
      page = "1",
      limit = "12",
      sellerId,
      dealerId,
    } = req.query;

    const filter: FilterQuery<IVehicle> = {};

    await backfillVehicleListingTypes();

    // Public listings are APPROVED only unless admin/seller filtering own
    const isAdmin =
      req.user?.role === "ADMIN" || req.user?.role === "SUPER_ADMIN";

    if (status && isAdmin) {
      filter.status = String(status);
    } else if (sellerId && req.user?.userId === String(sellerId)) {
      if (status) filter.status = String(status);
    } else if (sellerId || dealerId) {
      filter.status = "APPROVED";
      if (sellerId) filter.sellerId = String(sellerId);
      if (dealerId) filter.dealerId = String(dealerId);
    } else {
      filter.status = "APPROVED";
    }

    if (brand) {
      const brandDoc = await Brand.findOne({
        $or: [{ slug: brand }, { name: new RegExp(`^${brand}$`, "i") }],
      });
      if (brandDoc) filter.brandId = brandDoc._id;
    }

    if (category) {
      const catDoc = await Category.findOne({
        $or: [{ slug: category }, { name: new RegExp(`^${category}$`, "i") }],
      });
      if (catDoc) filter.categoryId = catDoc._id;
    }

    if (listingType) {
      const typeDoc = await ListingType.findOne({
        $or: [
          { slug: listingType },
          { name: new RegExp(`^${listingType}$`, "i") },
        ],
      });
      if (typeDoc) filter.listingTypeId = typeDoc._id;
    }

    if (condition) filter.condition = String(condition).toUpperCase();
    if (fuel) filter.fuel = String(fuel).toUpperCase();
    if (transmission) filter.transmission = String(transmission).toUpperCase();
    if (bodyType) filter.bodyType = String(bodyType);
    if (color) filter.color = new RegExp(String(color), "i");
    if (featured === "true") filter.featured = true;
    if (year) filter.year = Number(year);
    if (minYear || maxYear) {
      filter.year = {};
      if (minYear) (filter.year as Record<string, number>).$gte = Number(minYear);
      if (maxYear) (filter.year as Record<string, number>).$lte = Number(maxYear);
    }
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) (filter.price as Record<string, number>).$gte = Number(minPrice);
      if (maxPrice) (filter.price as Record<string, number>).$lte = Number(maxPrice);
    }
    if (maxMileage) filter.mileage = { $lte: Number(maxMileage) };
    if (city) filter["location.city"] = new RegExp(String(city), "i");
    if (region) filter["location.region"] = new RegExp(String(region), "i");
    if (location) {
      filter.$or = [
        { "location.city": new RegExp(String(location), "i") },
        { "location.region": new RegExp(String(location), "i") },
      ];
    }
    if (q) filter.$text = { $search: String(q) };

    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.min(50, Math.max(1, Number(limit)));
    const skip = (pageNum - 1) * limitNum;

    let sortQuery: Record<string, 1 | -1> = { publishedAt: -1 };
    switch (sort) {
      case "price_asc":
        sortQuery = { price: 1 };
        break;
      case "price_desc":
        sortQuery = { price: -1 };
        break;
      case "mileage":
        sortQuery = { mileage: 1 };
        break;
      case "featured":
        sortQuery = { featured: -1, publishedAt: -1 };
        break;
      default:
        sortQuery = { publishedAt: -1, createdAt: -1 };
    }

    const [items, total] = await Promise.all([
      Vehicle.find(filter)
        .populate(POPULATE)
        .sort(sortQuery)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Vehicle.countDocuments(filter),
    ]);

    let favoritedIds = new Set<string>();
    if (req.user) {
      const favs = await Favorite.find({
        userId: req.user.userId,
        vehicleId: { $in: items.map((i) => i._id) },
      }).lean();
      favoritedIds = new Set(favs.map((f) => f.vehicleId.toString()));
    }

    const data = items.map((item) => ({
      ...mapVehicle(item),
      isFavorited: favoritedIds.has(item._id.toString()),
    }));

    res.json({
      success: true,
      data,
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
  "/slug/*",
  optionalAuth,
  asyncHandler(async (req: AuthRequest, res) => {
    const slug = (req.params as Record<string, string>)[0] ?? "";
    if (!slug) throw new AppError("Vehicle not found", 404);
    const vehicle = await Vehicle.findOne({ slug }).populate(POPULATE);
    if (!vehicle) throw new AppError("Vehicle not found", 404);

    const isOwner = req.user?.userId === vehicle.sellerId.toString();
    const isAdmin =
      req.user?.role === "ADMIN" || req.user?.role === "SUPER_ADMIN";

    if (vehicle.status !== "APPROVED" && !isOwner && !isAdmin) {
      throw new AppError("Vehicle not found", 404);
    }

    // Increment views asynchronously
    Vehicle.updateOne({ _id: vehicle._id }, { $inc: { views: 1 } }).exec();

    let isFavorited = false;
    if (req.user) {
      const fav = await Favorite.exists({
        userId: req.user.userId,
        vehicleId: vehicle._id,
      });
      isFavorited = Boolean(fav);
    }

    res.json({
      success: true,
      data: { ...mapVehicle(vehicle), isFavorited },
    });
  })
);

router.get(
  "/:id",
  optionalAuth,
  asyncHandler(async (req: AuthRequest, res) => {
    const vehicle = await Vehicle.findById(req.params.id).populate(POPULATE);
    if (!vehicle) throw new AppError("Vehicle not found", 404);

    const isOwner = req.user?.userId === vehicle.sellerId.toString();
    const isAdmin =
      req.user?.role === "ADMIN" || req.user?.role === "SUPER_ADMIN";

    if (vehicle.status !== "APPROVED" && !isOwner && !isAdmin) {
      throw new AppError("Vehicle not found", 404);
    }

    res.json({ success: true, data: mapVehicle(vehicle) });
  })
);

router.post(
  "/",
  authenticate,
  authorize("CUSTOMER", "SELLER", "DEALER", "ADMIN", "SUPER_ADMIN"),
  asyncHandler(async (req: AuthRequest, res) => {
    const data = parseBody(createVehicleSchema, req.body);

    const brand = await Brand.findById(data.brandId);
    if (!brand) throw new AppError("Brand not found", 404);
    const category = await Category.findById(data.categoryId);
    if (!category) throw new AppError("Category not found", 404);

    let listingType;
    try {
      listingType = await resolveListingTypeId(
        data.listingTypeId,
        data.condition
      );
    } catch {
      throw new AppError("Listing type not found", 400);
    }
    if (!listingType) throw new AppError("Listing type not found", 400);

    // First listing upgrades CUSTOMER → SELLER
    if (req.user!.role === "CUSTOMER") {
      await User.findByIdAndUpdate(req.user!.userId, { role: "SELLER" });
    }

    const slug = await uniqueSlug(`${brand.slug}/${slugify(data.title)}-${data.year}`);

    if ((data.images?.length ?? 0) > env.maxImagesPerVehicle) {
      throw new AppError(
        `Maximum ${env.maxImagesPerVehicle} images per vehicle`,
        400
      );
    }
    const images = data.images ?? [];

    const owner = await User.findById(req.user!.userId).select("role dealerId");
    const { submit, listingTypeId: _listingTypeId, dealerId: _dealerId, ...payload } =
      data;

    const vehicle = await Vehicle.create({
      ...payload,
      listingTypeId: listingType._id,
      sellerId: req.user!.userId,
      dealerId: owner?.dealerId,
      slug,
      currency: "ETB",
      features: {
        safety: data.features?.safety ?? [],
        comfort: data.features?.comfort ?? [],
        technology: data.features?.technology ?? [],
        exterior: data.features?.exterior ?? [],
        interior: data.features?.interior ?? [],
      },
      images,
      status: submit ? "PENDING" : "DRAFT",
    });

    await relocateVehicleMedia(vehicle);

    const populated = await Vehicle.findById(vehicle._id).populate(POPULATE);
    res.status(201).json({
      success: true,
      data: mapVehicle(populated!),
      message: submit
        ? "Vehicle submitted for approval"
        : "Draft saved successfully",
    });
  })
);

router.put(
  "/:id",
  authenticate,
  authorize("CUSTOMER", "SELLER", "DEALER", "ADMIN", "SUPER_ADMIN"),
  asyncHandler(async (req: AuthRequest, res) => {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) throw new AppError("Vehicle not found", 404);

    const isOwner = vehicle.sellerId.toString() === req.user!.userId;
    const isAdmin =
      req.user!.role === "ADMIN" || req.user!.role === "SUPER_ADMIN";
    if (!isOwner && !isAdmin) {
      throw new AppError("You do not own this vehicle", 403);
    }

    const data = parseBody(updateVehicleSchema, req.body);

    if (data.images) {
      if (data.images.length > env.maxImagesPerVehicle) {
        throw new AppError(
          `Maximum ${env.maxImagesPerVehicle} images per vehicle`,
          400
        );
      }
      const nextIds = new Set(
        data.images.map((img) => img.publicId).filter(Boolean) as string[]
      );
      const removed = (vehicle.images ?? []).filter(
        (img) => img.publicId && !nextIds.has(img.publicId)
      );
      await Promise.all(
        removed.map((img) =>
          deleteStoredMedia({ publicId: img.publicId, url: img.url })
        )
      );
    }

    Object.assign(vehicle, data);

    if (data.submit) {
      vehicle.status = "PENDING";
    }

    await vehicle.save();
    await relocateVehicleMedia(vehicle);
    const populated = await Vehicle.findById(vehicle._id).populate(POPULATE);

    res.json({
      success: true,
      data: mapVehicle(populated!),
      message: "Vehicle updated",
    });
  })
);

router.patch(
  "/:id/status",
  authenticate,
  authorize("ADMIN", "SUPER_ADMIN", "SELLER", "DEALER"),
  asyncHandler(async (req: AuthRequest, res) => {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) throw new AppError("Vehicle not found", 404);

    const data = parseBody(vehicleStatusSchema, req.body);
    const isAdmin =
      req.user!.role === "ADMIN" || req.user!.role === "SUPER_ADMIN";
    const isOwner = vehicle.sellerId.toString() === req.user!.userId;

    // Sellers can only mark SOLD/ARCHIVED/PENDING on their own
    if (!isAdmin) {
      if (!isOwner) throw new AppError("Forbidden", 403);
      const allowed = ["SOLD", "ARCHIVED", "PENDING", "DRAFT"];
      if (!allowed.includes(data.status)) {
        throw new AppError("You cannot set this status", 403);
      }
    }

    vehicle.status = data.status;
    if (data.status === "APPROVED") {
      vehicle.publishedAt = new Date();
      vehicle.rejectionReason = undefined;
      const featuredCount = await Vehicle.countDocuments({
        status: "APPROVED",
        featured: true,
        _id: { $ne: vehicle._id },
      });
      if (featuredCount === 0) vehicle.featured = true;
    }
    if (data.status === "REJECTED") {
      vehicle.rejectionReason = data.rejectionReason ?? "Does not meet guidelines";
    }
    if (typeof data.featured === "boolean" && isAdmin) {
      vehicle.featured = data.featured;
    }

    await vehicle.save();

    if (isAdmin && (data.status === "APPROVED" || data.status === "REJECTED")) {
      const sellerId = vehicle.sellerId.toString();
      if (data.status === "APPROVED") {
        await notifyUser({
          userId: sellerId,
          type: "VEHICLE_APPROVED",
          title: "Vehicle approved",
          body: `"${vehicle.title}" is now live on Motora.`,
          data: { vehicleId: vehicle._id.toString(), type: "VEHICLE_APPROVED" },
        });
      } else {
        await notifyUser({
          userId: sellerId,
          type: "VEHICLE_REJECTED",
          title: "Vehicle rejected",
          body:
            vehicle.rejectionReason ||
            `"${vehicle.title}" was rejected. Please update and resubmit.`,
          data: { vehicleId: vehicle._id.toString(), type: "VEHICLE_REJECTED" },
        });
      }
    }

    res.json({ success: true, data: mapVehicle(vehicle), message: "Status updated" });
  })
);

router.delete(
  "/:id",
  authenticate,
  authorize("SELLER", "DEALER", "ADMIN", "SUPER_ADMIN"),
  asyncHandler(async (req: AuthRequest, res) => {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) throw new AppError("Vehicle not found", 404);

    const isOwner = vehicle.sellerId.toString() === req.user!.userId;
    const isAdmin =
      req.user!.role === "ADMIN" || req.user!.role === "SUPER_ADMIN";
    if (!isOwner && !isAdmin) throw new AppError("Forbidden", 403);

    await deleteVehicleMedia(vehicle);
    await vehicle.deleteOne();
    await Favorite.deleteMany({ vehicleId: vehicle._id });

    res.json({ success: true, message: "Vehicle deleted" });
  })
);

router.get(
  "/:id/similar",
  asyncHandler(async (req, res) => {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) throw new AppError("Vehicle not found", 404);

    const similar = await Vehicle.find({
      _id: { $ne: vehicle._id },
      status: "APPROVED",
      $or: [
        { brandId: vehicle.brandId },
        { categoryId: vehicle.categoryId },
      ],
    })
      .populate(POPULATE)
      .limit(4)
      .lean();

    res.json({
      success: true,
      data: similar.map(mapVehicle),
    });
  })
);

export default router;
