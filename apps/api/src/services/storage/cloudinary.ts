import { v2 as cloudinary } from "cloudinary";
import type { UploadApiResponse } from "cloudinary";
import { env } from "../../config/env";
import {
  sanitizeImageSlot,
  vehicleImageFolder,
  vehicleMediaPrefix,
  vehicleVideoFolder,
} from "./paths";
import type {
  RelocateResult,
  StorageProvider,
  StorageResourceType,
  StorageUploadContext,
  UploadedFile,
} from "./types";

let configured = false;

function ensureConfigured() {
  if (configured) return;

  const { cloudName, apiKey, apiSecret } = env.cloudinary;
  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error(
      "Cloudinary is the active storage provider but CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET are not set on the API."
    );
  }

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
    urlAnalytics: false,
  });
  configured = true;
}

function uploadBuffer(
  buffer: Buffer,
  options: Record<string, unknown>
): Promise<UploadApiResponse> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(options, (err, result) => {
      if (err || !result) {
        reject(err ?? new Error("Cloudinary upload returned no result"));
        return;
      }
      resolve(result);
    });
    stream.end(buffer);
  });
}

function withTransform(secureUrl: string, transform: string): string {
  if (!secureUrl.includes("/upload/")) return secureUrl;
  if (/\/upload\/[^/]*?(?:f_auto|q_auto|w_|c_)/.test(secureUrl)) {
    return secureUrl.replace(/\/upload\/[^/]+\//, `/upload/${transform}/`);
  }
  return secureUrl.replace("/upload/", `/upload/${transform}/`);
}

function deliveryUrl(
  publicId: string,
  resourceType: StorageResourceType
): string {
  return cloudinary.url(publicId, {
    resource_type: resourceType,
    secure: true,
    urlAnalytics: false,
  });
}

function optimizedImageUrls(_publicId: string, secureUrl: string) {
  return {
    url: withTransform(secureUrl, "f_auto,q_auto,c_limit,w_1600"),
    thumbnailUrl: withTransform(
      secureUrl,
      "f_auto,q_auto,c_fill,g_auto,w_480,h_320"
    ),
    secureUrl,
  };
}

function mapUpload(
  result: UploadApiResponse,
  file: Express.Multer.File,
  resourceType: StorageResourceType
): UploadedFile {
  const publicId = result.public_id;
  const secureUrl = result.secure_url;
  const urls =
    resourceType === "image"
      ? optimizedImageUrls(publicId, secureUrl)
      : { url: secureUrl, thumbnailUrl: secureUrl, secureUrl };

  return {
    url: urls.url,
    thumbnailUrl: urls.thumbnailUrl,
    filename: pathBasename(file.originalname),
    mimetype: file.mimetype,
    size: file.size,
    publicId,
    secureUrl: urls.secureUrl,
    width: result.width,
    height: result.height,
    format: result.format,
    bytes: result.bytes,
  };
}

function pathBasename(name: string): string {
  return name.split(/[/\\]/).pop() || name;
}

function inferResourceType(
  folder: string,
  context?: StorageUploadContext,
  mimetype?: string
): StorageResourceType {
  if (context?.resourceType) return context.resourceType;
  if (folder === "videos" || mimetype?.startsWith("video/")) return "video";
  return "image";
}

function resolveFolder(
  folder: string,
  context?: StorageUploadContext,
  resourceType?: StorageResourceType
): string {
  if (resourceType === "video" || folder === "videos") {
    return vehicleVideoFolder(context?.vehicleId, context?.userId);
  }
  if (folder === "vehicles" || folder === "images") {
    return vehicleImageFolder(context?.vehicleId, context?.userId);
  }
  return `car-marketplace/${folder}`;
}

function extractPublicId(urlOrPublicId: string): {
  publicId: string;
  resourceType: StorageResourceType;
} {
  if (!urlOrPublicId.includes("res.cloudinary.com")) {
    return { publicId: urlOrPublicId, resourceType: "image" };
  }

  const resourceType: StorageResourceType = urlOrPublicId.includes("/video/")
    ? "video"
    : urlOrPublicId.includes("/raw/")
      ? "raw"
      : "image";

  const match = urlOrPublicId.match(/\/upload\/(?:v\d+\/)?(.+)$/);
  let publicId = match?.[1] ?? urlOrPublicId;
  publicId = publicId.replace(/^[^/]*?(?:f_auto|q_auto|c_|w_|h_|g_)[^/]*\//, "");
  publicId = publicId.replace(/\.[a-z0-9]+$/i, "");
  return { publicId, resourceType };
}

export class CloudinaryStorageProvider implements StorageProvider {
  readonly name = "cloudinary" as const;

  async upload(
    file: Express.Multer.File,
    folder: string,
    context?: StorageUploadContext
  ): Promise<UploadedFile> {
    ensureConfigured();

    const resourceType = inferResourceType(folder, context, file.mimetype);
    const destFolder = resolveFolder(folder, context, resourceType);
    const slot = sanitizeImageSlot(context?.imageType);
    const publicId = `${slot}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    const result = await uploadBuffer(file.buffer, {
      folder: destFolder,
      public_id: publicId,
      resource_type: resourceType,
      overwrite: false,
      unique_filename: false,
    });

    return mapUpload(result, file, resourceType);
  }

  async delete(urlOrPublicId: string): Promise<void> {
    if (!urlOrPublicId) return;
    ensureConfigured();
    const { publicId, resourceType } = extractPublicId(urlOrPublicId);
    try {
      await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
    } catch (err) {
      console.warn("Cloudinary delete failed:", publicId, err);
    }
  }

  async deletePrefix(prefix: string): Promise<void> {
    ensureConfigured();
    for (const resourceType of ["image", "video"] as const) {
      try {
        await cloudinary.api.delete_resources_by_prefix(prefix, {
          resource_type: resourceType,
        });
      } catch (err) {
        console.warn("Cloudinary prefix delete failed:", prefix, resourceType, err);
      }
    }
  }

  async relocate(
    publicId: string,
    vehicleId: string,
    resourceType: StorageResourceType = "image"
  ): Promise<RelocateResult> {
    ensureConfigured();

    if (!publicId.includes("/temp/")) {
      const secureUrl = deliveryUrl(publicId, resourceType);
      const urls =
        resourceType === "image"
          ? optimizedImageUrls(publicId, secureUrl)
          : { url: secureUrl, thumbnailUrl: secureUrl, secureUrl };
      return { publicId, ...urls };
    }

    const filename = publicId.split("/").pop() || `file-${Date.now()}`;
    const destFolder =
      resourceType === "video"
        ? vehicleVideoFolder(vehicleId)
        : vehicleImageFolder(vehicleId);
    const nextPublicId = `${destFolder}/${filename}`;

    try {
      const renamed = await cloudinary.uploader.rename(publicId, nextPublicId, {
        resource_type: resourceType,
        overwrite: false,
      });
      const nextId = renamed.public_id || nextPublicId;
      const secureUrl = renamed.secure_url || deliveryUrl(nextId, resourceType);
      const urls =
        resourceType === "image"
          ? optimizedImageUrls(nextId, secureUrl)
          : { url: secureUrl, thumbnailUrl: secureUrl, secureUrl };
      return { publicId: nextId, ...urls };
    } catch (err) {
      console.warn("Cloudinary relocate failed, keeping original:", publicId, err);
      const secureUrl = deliveryUrl(publicId, resourceType);
      const urls =
        resourceType === "image"
          ? optimizedImageUrls(publicId, secureUrl)
          : { url: secureUrl, thumbnailUrl: secureUrl, secureUrl };
      return { publicId, ...urls };
    }
  }

  static vehiclePrefix(vehicleId: string): string {
    return vehicleMediaPrefix(vehicleId);
  }
}
