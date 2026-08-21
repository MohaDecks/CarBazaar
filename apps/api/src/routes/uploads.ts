import { Router } from "express";
import { z } from "zod";
import { authenticate, authorize, AuthRequest } from "../middleware/auth";
import { asyncHandler, AppError } from "../middleware/error";
import { uploadImage, uploadVideo, uploadModel3d } from "../middleware/upload";
import { model3dStorage, storage } from "../services/storage";
import { deleteStoredMedia } from "../services/storage/vehicle-media";
import { env } from "../config/env";
import { parseBody } from "../validators";

const router = Router();

function uploadContext(req: AuthRequest) {
  return {
    vehicleId:
      typeof req.query.vehicleId === "string" ? req.query.vehicleId : undefined,
    imageType:
      typeof req.query.type === "string"
        ? req.query.type
        : typeof req.body?.type === "string"
          ? req.body.type
          : undefined,
    userId: req.user?.userId,
  };
}

router.post(
  "/images",
  authenticate,
  authorize("CUSTOMER", "SELLER", "DEALER", "ADMIN", "SUPER_ADMIN"),
  uploadImage.array("images", env.maxImagesPerVehicle),
  asyncHandler(async (req: AuthRequest, res) => {
    const files = req.files as Express.Multer.File[] | undefined;
    if (!files?.length) throw new AppError("No images uploaded", 400);

    const context = uploadContext(req);
    const uploaded = await Promise.all(
      files.map((file) => storage.upload(file, "vehicles", context))
    );

    res.status(201).json({
      success: true,
      data: uploaded,
      message: `${uploaded.length} image(s) uploaded`,
    });
  })
);

router.post(
  "/image",
  authenticate,
  authorize("CUSTOMER", "SELLER", "DEALER", "ADMIN", "SUPER_ADMIN"),
  uploadImage.single("image"),
  asyncHandler(async (req: AuthRequest, res) => {
    if (!req.file) throw new AppError("No image uploaded", 400);
    const uploaded = await storage.upload(
      req.file,
      "vehicles",
      uploadContext(req)
    );
    res.status(201).json({ success: true, data: uploaded });
  })
);

router.post(
  "/video",
  authenticate,
  authorize("CUSTOMER", "SELLER", "DEALER", "ADMIN", "SUPER_ADMIN"),
  uploadVideo.single("video"),
  asyncHandler(async (req: AuthRequest, res) => {
    if (!req.file) throw new AppError("No video uploaded", 400);
    const uploaded = await storage.upload(req.file, "videos", {
      ...uploadContext(req),
      resourceType: "video",
    });
    res.status(201).json({ success: true, data: uploaded });
  })
);

router.post(
  "/model3d",
  authenticate,
  authorize("CUSTOMER", "SELLER", "DEALER", "ADMIN", "SUPER_ADMIN"),
  uploadModel3d.single("model"),
  asyncHandler(async (req, res) => {
    if (!req.file) throw new AppError("No 3D model uploaded", 400);
    const uploaded = await model3dStorage.upload(req.file, "models");
    const format = req.file.originalname.toLowerCase().endsWith(".gltf")
      ? "gltf"
      : "glb";
    res.status(201).json({
      success: true,
      data: { ...uploaded, format },
    });
  })
);

const deleteMediaSchema = z.object({
  publicId: z.string().optional(),
  url: z.string().optional(),
});

router.delete(
  "/",
  authenticate,
  authorize("CUSTOMER", "SELLER", "DEALER", "ADMIN", "SUPER_ADMIN"),
  asyncHandler(async (req, res) => {
    const data = parseBody(deleteMediaSchema, req.body);
    if (!data.publicId && !data.url) {
      throw new AppError("publicId or url is required", 400);
    }
    await deleteStoredMedia(data);
    res.json({ success: true, message: "Media deleted" });
  })
);

export default router;
