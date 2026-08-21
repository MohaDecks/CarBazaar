import fs from "fs/promises";
import path from "path";
import { env } from "../../config/env";
import type {
  RelocateResult,
  StorageProvider,
  StorageResourceType,
  StorageUploadContext,
  UploadedFile,
} from "./types";

export class LocalStorageProvider implements StorageProvider {
  readonly name = "local" as const;
  private baseDir: string;

  constructor() {
    this.baseDir = path.resolve(env.uploadDir);
  }

  private async ensureDir(dir: string) {
    await fs.mkdir(dir, { recursive: true });
  }

  async upload(
    file: Express.Multer.File,
    folder: string,
    _context?: StorageUploadContext
  ): Promise<UploadedFile> {
    const dest = path.join(this.baseDir, folder);
    await this.ensureDir(dest);

    const ext = path.extname(file.originalname) || ".jpg";
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;
    const filepath = path.join(dest, filename);

    await fs.writeFile(filepath, file.buffer);

    const url = `/uploads/${folder}/${filename}`;
    return {
      url,
      thumbnailUrl: url,
      filename,
      mimetype: file.mimetype,
      size: file.size,
      bytes: file.size,
      format: ext.replace(".", ""),
    };
  }

  async delete(url: string): Promise<void> {
    if (!url.startsWith("/uploads/")) return;
    const filepath = path.join(this.baseDir, url.replace("/uploads/", ""));
    try {
      await fs.unlink(filepath);
    } catch {
      // ignore missing files
    }
  }

  async deletePrefix(prefix: string): Promise<void> {
    const dir = path.join(this.baseDir, prefix);
    try {
      await fs.rm(dir, { recursive: true, force: true });
    } catch {
      // ignore
    }
  }

  async relocate(
    publicId: string,
    _vehicleId: string,
    _resourceType?: StorageResourceType
  ): Promise<RelocateResult> {
    return {
      publicId,
      url: publicId.startsWith("/") ? publicId : `/uploads/${publicId}`,
      thumbnailUrl: publicId.startsWith("/") ? publicId : `/uploads/${publicId}`,
      secureUrl: publicId.startsWith("/") ? publicId : `/uploads/${publicId}`,
    };
  }
}
