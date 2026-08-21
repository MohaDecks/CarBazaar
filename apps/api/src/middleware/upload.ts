import path from "path";
import multer from "multer";
import { env } from "../config/env";
import { AppError } from "../middleware/error";

const ALLOWED_IMAGES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/avif",
];
const IMAGE_EXT = /\.(jpe?g|png|webp|avif)$/i;

const ALLOWED_VIDEO = ["video/mp4", "video/webm", "video/quicktime"];
const VIDEO_EXT = /\.(mp4|webm|mov)$/i;

const ALLOWED_3D = [
  "model/gltf-binary",
  "model/gltf+json",
  "application/octet-stream",
];
const MODEL_EXT = /\.(glb|gltf)$/i;

const memoryStorage = multer.memoryStorage();

function fileFilter(
  allowedMime: string[],
  allowedExt: RegExp,
  _req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) {
  const ext = path.extname(file.originalname || "");
  const mimeOk = allowedMime.includes(file.mimetype);
  const extOk = allowedExt.test(ext) || allowedExt.test(file.originalname);

  if (mimeOk && extOk) {
    cb(null, true);
    return;
  }

  // 3D files often arrive as octet-stream
  if (allowedExt === MODEL_EXT && extOk) {
    cb(null, true);
    return;
  }

  cb(
    new AppError(
      `Invalid file type: ${file.mimetype} (${file.originalname}). Allowed: ${allowedExt.source}`,
      400
    )
  );
}

export const uploadImage = multer({
  storage: memoryStorage,
  limits: { fileSize: env.maxFileSizeMB * 1024 * 1024 },
  fileFilter: (req, file, cb) =>
    fileFilter(ALLOWED_IMAGES, IMAGE_EXT, req, file, cb),
});

export const uploadVideo = multer({
  storage: memoryStorage,
  limits: { fileSize: 100 * 1024 * 1024 },
  fileFilter: (req, file, cb) =>
    fileFilter(ALLOWED_VIDEO, VIDEO_EXT, req, file, cb),
});

export const uploadModel3d = multer({
  storage: memoryStorage,
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (req, file, cb) =>
    fileFilter(ALLOWED_3D, MODEL_EXT, req, file, cb),
});
