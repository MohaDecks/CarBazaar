import { createStorageProvider } from "./factory";
import { createModel3dStorageProvider } from "./model3d";

export const storage = createStorageProvider();
export const model3dStorage = createModel3dStorageProvider();

export { createStorageProvider } from "./factory";
export { createModel3dStorageProvider } from "./model3d";
export { CloudinaryStorageProvider } from "./cloudinary";
export { LocalStorageProvider } from "./local";
export { S3StorageProvider } from "./s3";
export { vehicleMediaPrefix } from "./paths";
export type {
  Model3dStorageProvider,
  RelocateResult,
  StorageProvider,
  StorageProviderName,
  StorageResourceType,
  StorageUploadContext,
  UploadedFile,
} from "./types";
