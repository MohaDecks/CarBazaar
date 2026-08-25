import { Router } from "express";
import authRoutes from "./auth";
import vehicleRoutes from "./vehicles";
import brandRoutes from "./brands";
import categoryRoutes from "./categories";
import listingTypeRoutes from "./listing-types";
import dealerRoutes from "./dealers";
import favoriteRoutes from "./favorites";
import messageRoutes from "./messages";
import adminRoutes from "./admin";
import uploadRoutes from "./uploads";
import notificationRoutes from "./notifications";

const router = Router();

router.get("/health", (_req, res) => {
  res.json({ success: true, message: "Car Marketplace API is running" });
});

router.use("/auth", authRoutes);
router.use("/vehicles", vehicleRoutes);
router.use("/brands", brandRoutes);
router.use("/categories", categoryRoutes);
router.use("/listing-types", listingTypeRoutes);
router.use("/dealers", dealerRoutes);
router.use("/favorites", favoriteRoutes);
router.use("/messages", messageRoutes);
router.use("/admin", adminRoutes);
router.use("/uploads", uploadRoutes);
router.use("/notifications", notificationRoutes);

export default router;
