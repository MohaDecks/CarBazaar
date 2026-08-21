import type { IVehicle, IVehicleImage } from "../../models/Vehicle";
import { storage, vehicleMediaPrefix } from "./index";
import type { StorageResourceType } from "./types";

function collectPublicIds(vehicle: IVehicle): Array<{
  publicId: string;
  resourceType: StorageResourceType;
}> {
  const items: Array<{ publicId: string; resourceType: StorageResourceType }> =
    [];

  for (const img of vehicle.images ?? []) {
    if (img.publicId) items.push({ publicId: img.publicId, resourceType: "image" });
  }
  for (const img of vehicle.gallery360 ?? []) {
    if (img.publicId) items.push({ publicId: img.publicId, resourceType: "image" });
  }
  if (vehicle.video) {
    items.push({
      publicId: vehicle.videoPublicId || vehicle.video,
      resourceType: "video",
    });
  }

  return items;
}

export async function relocateVehicleMedia(vehicle: IVehicle): Promise<void> {
  if (!storage.relocate) return;

  const vehicleId = vehicle._id.toString();
  let changed = false;

  const applyImage = async (img: IVehicleImage) => {
    if (!img.publicId?.includes("/temp/")) return;
    const moved = await storage.relocate!(img.publicId, vehicleId, "image");
    img.publicId = moved.publicId;
    img.url = moved.url;
    img.thumbnailUrl = moved.thumbnailUrl;
    img.secureUrl = moved.secureUrl;
    changed = true;
  };

  for (const img of vehicle.images ?? []) {
    await applyImage(img);
  }
  for (const img of vehicle.gallery360 ?? []) {
    await applyImage(img);
  }

  if (vehicle.videoPublicId?.includes("/temp/") || vehicle.video?.includes("/temp/")) {
    const current = vehicle.videoPublicId || vehicle.video!;
    const moved = await storage.relocate(current, vehicleId, "video");
    vehicle.videoPublicId = moved.publicId;
    vehicle.video = moved.url;
    changed = true;
  }

  const main =
    vehicle.images.find((img) => img.isMain) ?? vehicle.images[0];
  if (main?.url && vehicle.mainImage !== main.url) {
    vehicle.mainImage = main.url;
    changed = true;
  }

  if (changed) {
    await vehicle.save();
  }
}

export async function deleteVehicleMedia(vehicle: IVehicle): Promise<void> {
  const refs = collectPublicIds(vehicle);
  await Promise.all(
    refs.map((ref) => storage.delete(ref.publicId).catch(() => undefined))
  );

  if (storage.deletePrefix) {
    await storage
      .deletePrefix(vehicleMediaPrefix(vehicle._id.toString()))
      .catch(() => undefined);
  }
}

export async function deleteStoredMedia(input: {
  publicId?: string;
  url?: string;
}): Promise<void> {
  const target = input.publicId || input.url;
  if (!target) return;
  await storage.delete(target);
}
