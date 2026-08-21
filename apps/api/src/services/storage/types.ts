export type StorageProviderName = "local" | "cloudinary" | "s3";

export type StorageResourceType = "image" | "video" | "raw";

export interface StorageUploadContext {
  vehicleId?: string;
  userId?: string;
  /** Semantic slot: main, front, interior, additional, … */
  imageType?: string;
  resourceType?: StorageResourceType;
}

export interface UploadedFile {
  url: string;
  thumbnailUrl?: string;
  filename: string;
  mimetype: string;
  size: number;
  publicId?: string;
  secureUrl?: string;
  width?: number;
  height?: number;
  format?: string;
  bytes?: number;
}

export interface RelocateResult {
  publicId: string;
  url: string;
  thumbnailUrl?: string;
  secureUrl?: string;
}

/**
 * Provider-agnostic media storage.
 * Swap implementations via STORAGE_PROVIDER without changing upload routes.
 */
export interface StorageProvider {
  readonly name: StorageProviderName;
  upload(
    file: Express.Multer.File,
    folder: string,
    context?: StorageUploadContext
  ): Promise<UploadedFile>;
  delete(urlOrPublicId: string): Promise<void>;
  deletePrefix?(prefix: string): Promise<void>;
  relocate?(
    publicId: string,
    vehicleId: string,
    resourceType?: StorageResourceType
  ): Promise<RelocateResult>;
}

/**
 * Separate from image/video storage so GLB/GLTF can later use
 * S3, Cloudinary raw, or another object store without rewriting vehicles.
 */
export interface Model3dStorageProvider {
  upload(file: Express.Multer.File, folder: string): Promise<UploadedFile>;
  delete(urlOrPublicId: string): Promise<void>;
}
