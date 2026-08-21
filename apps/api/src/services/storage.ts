/**
 * Backward-compatible entry. Prefer importing from "./storage/index".
 */
export {
  storage,
  model3dStorage,
  createStorageProvider,
  createModel3dStorageProvider,
  CloudinaryStorageProvider,
  LocalStorageProvider,
  S3StorageProvider,
} from "./storage/index";
export type {
  Model3dStorageProvider,
  RelocateResult,
  StorageProvider,
  StorageProviderName,
  StorageResourceType,
  StorageUploadContext,
  UploadedFile,
} from "./storage/index";
