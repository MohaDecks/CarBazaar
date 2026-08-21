import { env } from "../../config/env";
import { CloudinaryStorageProvider } from "./cloudinary";
import { LocalStorageProvider } from "./local";
import { S3StorageProvider } from "./s3";
import type { StorageProvider, StorageProviderName } from "./types";

export function createStorageProvider(
  name: StorageProviderName = env.storageProvider
): StorageProvider {
  switch (name) {
    case "cloudinary":
      return new CloudinaryStorageProvider();
    case "s3":
      return new S3StorageProvider();
    case "local":
      return new LocalStorageProvider();
    default:
      throw new Error(
        `Unknown STORAGE_PROVIDER "${name as string}". Use cloudinary, local, or s3.`
      );
  }
}
