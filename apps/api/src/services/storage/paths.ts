const ROOT = "car-marketplace";

function ownerSegment(vehicleId?: string, userId?: string): string {
  if (vehicleId) return vehicleId;
  return `temp/${userId || "anonymous"}`;
}

export function vehicleImageFolder(
  vehicleId?: string,
  userId?: string
): string {
  return `${ROOT}/vehicles/${ownerSegment(vehicleId, userId)}/images`;
}

export function vehicleVideoFolder(
  vehicleId?: string,
  userId?: string
): string {
  return `${ROOT}/vehicles/${ownerSegment(vehicleId, userId)}/videos`;
}

export function vehicleMediaPrefix(vehicleId: string): string {
  return `${ROOT}/vehicles/${vehicleId}`;
}

export function sanitizeImageSlot(imageType?: string): string {
  const slot = (imageType || "additional")
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, "");
  return slot || "additional";
}
