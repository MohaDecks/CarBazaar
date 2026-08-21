import { Router } from "express";
import { Brand, Category, Dealer, User, Vehicle, Report } from "../models";
import { authenticate, authorize, AuthRequest } from "../middleware/auth";
import { asyncHandler, AppError } from "../middleware/error";

const router = Router();

router.use(authenticate, authorize("ADMIN", "SUPER_ADMIN"));

router.get(
  "/stats",
  asyncHandler(async (_req, res) => {
    const [
      totalVehicles,
      published,
      pending,
      sold,
      users,
      dealers,
      recentVehicles,
      recentUsers,
      pendingList,
    ] = await Promise.all([
      Vehicle.countDocuments(),
      Vehicle.countDocuments({ status: "APPROVED" }),
      Vehicle.countDocuments({ status: "PENDING" }),
      Vehicle.countDocuments({ status: "SOLD" }),
      User.countDocuments({ role: { $in: ["CUSTOMER", "SELLER", "DEALER"] } }),
      Dealer.countDocuments({ status: "APPROVED" }),
      Vehicle.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate("brandId", "name")
        .populate("sellerId", "firstName lastName")
        .lean(),
      User.find({ role: { $ne: "SUPER_ADMIN" } })
        .sort({ createdAt: -1 })
        .limit(5)
        .select("-password")
        .lean(),
      Vehicle.find({ status: "PENDING" })
        .sort({ createdAt: -1 })
        .limit(8)
        .populate("brandId", "name")
        .populate("sellerId", "firstName lastName email")
        .lean(),
    ]);

    // Simple listings over last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const listingsOverTime = await Vehicle.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const popularBrands = await Vehicle.aggregate([
      { $match: { status: "APPROVED" } },
      { $group: { _id: "$brandId", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "brands",
          localField: "_id",
          foreignField: "_id",
          as: "brand",
        },
      },
      { $unwind: "$brand" },
      { $project: { name: "$brand.name", count: 1 } },
    ]);

    const popularCategories = await Vehicle.aggregate([
      { $match: { status: "APPROVED" } },
      { $group: { _id: "$categoryId", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "categories",
          localField: "_id",
          foreignField: "_id",
          as: "category",
        },
      },
      { $unwind: "$category" },
      { $project: { name: "$category.name", count: 1 } },
    ]);

    res.json({
      success: true,
      data: {
        stats: {
          totalVehicles,
          published,
          pending,
          sold,
          users,
          dealers,
        },
        charts: {
          listingsOverTime: listingsOverTime.map((d) => ({
            date: d._id,
            count: d.count,
          })),
          popularBrands,
          popularCategories,
        },
        recentVehicles,
        recentUsers,
        pendingApprovals: pendingList,
      },
    });
  })
);

router.get(
  "/users",
  asyncHandler(async (req, res) => {
    const { page = "1", limit = "20", role, q } = req.query;
    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.min(50, Number(limit));
    const filter: Record<string, unknown> = {};
    if (role) filter.role = String(role);
    if (q) {
      filter.$or = [
        { email: new RegExp(String(q), "i") },
        { firstName: new RegExp(String(q), "i") },
        { lastName: new RegExp(String(q), "i") },
      ];
    }

    const [users, total] = await Promise.all([
      User.find(filter)
        .select("-password -refreshToken")
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
        .lean(),
      User.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: users,
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

router.patch(
  "/users/:id",
  asyncHandler(async (req: AuthRequest, res) => {
    const {
      isActive,
      role,
      firstName,
      lastName,
      email,
      phone,
    } = req.body as {
      isActive?: boolean;
      role?: string;
      firstName?: string;
      lastName?: string;
      email?: string;
      phone?: string;
    };

    if (req.params.id === req.user!.userId) {
      throw new AppError("Cannot modify your own account this way", 400);
    }

    const user = await User.findById(req.params.id);
    if (!user) throw new AppError("User not found", 404);

    if (typeof firstName === "string" && firstName.trim()) {
      user.firstName = firstName.trim();
    }
    if (typeof lastName === "string" && lastName.trim()) {
      user.lastName = lastName.trim();
    }
    if (typeof phone === "string") {
      user.phone = phone.trim();
    }
    if (typeof email === "string" && email.trim()) {
      const nextEmail = email.trim().toLowerCase();
      if (nextEmail !== user.email) {
        const taken = await User.findOne({
          email: nextEmail,
          _id: { $ne: user._id },
        });
        if (taken) throw new AppError("Email is already in use", 409);
        user.email = nextEmail;
      }
    }
    if (typeof isActive === "boolean") {
      user.isActive = isActive;
    }
    if (role) {
      const allowedRoles = [
        "CUSTOMER",
        "SELLER",
        "DEALER",
        "ADMIN",
        "SUPER_ADMIN",
      ];
      if (!allowedRoles.includes(role)) {
        throw new AppError("Invalid role", 400);
      }
      // Only SUPER_ADMIN can assign ADMIN / SUPER_ADMIN
      if (
        (role === "ADMIN" || role === "SUPER_ADMIN") &&
        req.user!.role !== "SUPER_ADMIN"
      ) {
        throw new AppError("Only super admins can assign admin roles", 403);
      }
      user.role = role as typeof user.role;
    }

    await user.save();

    res.json({
      success: true,
      data: {
        _id: user._id,
        email: user.email,
        phone: user.phone,
        firstName: user.firstName,
        lastName: user.lastName,
        avatar: user.avatar,
        role: user.role,
        isVerified: user.isVerified,
        isActive: user.isActive,
        dealerId: user.dealerId,
        location: user.location,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      message: "User updated successfully",
    });
  })
);

router.get(
  "/reports",
  asyncHandler(async (req, res) => {
    const { status = "OPEN" } = req.query;
    const reports = await Report.find({ status: String(status) })
      .sort({ createdAt: -1 })
      .populate("reporterId", "firstName lastName email")
      .lean();
    res.json({ success: true, data: reports });
  })
);

router.get(
  "/meta",
  asyncHandler(async (_req, res) => {
    const [brands, categories, pendingDealers] = await Promise.all([
      Brand.countDocuments(),
      Category.countDocuments(),
      Dealer.countDocuments({ status: "PENDING" }),
    ]);
    res.json({
      success: true,
      data: { brands, categories, pendingDealers },
    });
  })
);

export default router;
