import type {
  StorageProvider,
  StorageUploadContext,
  UploadedFile,
} from "./types";

/**
 * Future AWS S3 provider.
 * Intentionally has no AWS SDK dependency so the app runs without an AWS account.
 */
export class S3StorageProvider implements StorageProvider {
  readonly name = "s3" as const;

  async upload(
    file: Express.Multer.File,
    folder: string,
    _context?: StorageUploadContext
  ): Promise<UploadedFile> {
    throw new Error(
      `S3StorageProvider is not implemented yet. Set STORAGE_PROVIDER=cloudinary (or local). Folder: ${folder}, file: ${file.originalname}`
    );
  }

  async delete(_url: string): Promise<void> {
    throw new Error(
      "S3StorageProvider is not implemented yet. Set STORAGE_PROVIDER=cloudinary (or local)."
    );
  }
}
