import dotenv from "dotenv";
import path from "path";

const envDir = path.resolve(__dirname, "../..");
dotenv.config({ path: path.join(envDir, ".env") });
if (process.env.NODE_ENV === "production") {
  dotenv.config({ path: path.join(envDir, ".env.production"), override: true });
}

function required(key: string, fallback?: string): string {
  const value = process.env[key] ?? fallback;
  if (!value) throw new Error(`Missing required env: ${key}`);
  return value;
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: Number(process.env.PORT ?? 4000),
  mongodbUri: required("MONGODB_URI", "mongodb://127.0.0.1:27017/car-marketplace"),
  jwt: {
    accessSecret: required("JWT_ACCESS_SECRET", "dev-access-secret-change-in-production-min-32-chars"),
    refreshSecret: required("JWT_REFRESH_SECRET", "dev-refresh-secret-change-in-production-min-32-chars"),
    accessExpires: process.env.JWT_ACCESS_EXPIRES ?? "15m",
    refreshExpires: process.env.JWT_REFRESH_EXPIRES ?? "7d",
  },
  corsOrigin: (process.env.CORS_ORIGIN ?? "http://localhost:3000")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
  uploadDir: process.env.UPLOAD_DIR ?? "./uploads",
  maxFileSizeMB: Number(process.env.MAX_FILE_SIZE_MB ?? 10),
  maxImagesPerVehicle: Number(process.env.MAX_IMAGES_PER_VEHICLE ?? 20),
  storageProvider: (process.env.STORAGE_PROVIDER ?? "cloudinary") as
    | "local"
    | "cloudinary"
    | "s3",
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME ?? "",
    apiKey: process.env.CLOUDINARY_API_KEY ?? "",
    apiSecret: process.env.CLOUDINARY_API_SECRET ?? "",
  },
  rateLimit: {
    windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS ?? 900000),
    max: Number(process.env.RATE_LIMIT_MAX ?? 200),
  },
  isDev: (process.env.NODE_ENV ?? "development") !== "production",
};
