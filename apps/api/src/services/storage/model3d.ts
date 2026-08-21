import { LocalStorageProvider } from "./local";
import type { Model3dStorageProvider, UploadedFile } from "./types";

/**
 * 3D models (GLB/GLTF) stay off Cloudinary for now.
 * Swap this implementation later for S3 or another object store.
 */
export class LocalModel3dStorageProvider implements Model3dStorageProvider {
  private inner = new LocalStorageProvider();

  upload(file: Express.Multer.File, folder: string): Promise<UploadedFile> {
    return this.inner.upload(file, folder || "models");
  }

  delete(urlOrPublicId: string): Promise<void> {
    return this.inner.delete(urlOrPublicId);
  }
}

export function createModel3dStorageProvider(): Model3dStorageProvider {
  return new LocalModel3dStorageProvider();
}
