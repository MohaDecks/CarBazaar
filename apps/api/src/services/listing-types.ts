import mongoose from "mongoose";
import { ListingType } from "../models/ListingType";
import { Vehicle } from "../models/Vehicle";

export const DEFAULT_LISTING_TYPES = [
  {
    name: "User Car",
    slug: "user-car",
    description: "Used cars listed by private sellers",
    defaultCondition: "USED" as const,
    order: 1,
    isActive: true,
  },
  {
    name: "New Car",
    slug: "new-car",
    description: "New cars from dealers and sellers",
    defaultCondition: "NEW" as const,
    order: 2,
    isActive: true,
  },
];

let backfilled = false;

export async function ensureDefaultListingTypes() {
  for (const type of DEFAULT_LISTING_TYPES) {
    await ListingType.findOneAndUpdate(
      { slug: type.slug },
      { $setOnInsert: type },
      { upsert: true, new: true }
    );
  }
  return ListingType.find({ isActive: true }).sort({ order: 1, name: 1 });
}

export async function backfillVehicleListingTypes() {
  if (backfilled) return;
  const types = await ensureDefaultListingTypes();
  const userCar = types.find((t) => t.slug === "user-car");
  const newCar = types.find((t) => t.slug === "new-car");
  if (!userCar || !newCar) return;

  await Vehicle.updateMany(
    {
      $or: [{ listingTypeId: { $exists: false } }, { listingTypeId: null }],
      condition: "NEW",
    },
    { $set: { listingTypeId: newCar._id } }
  );
  await Vehicle.updateMany(
    { $or: [{ listingTypeId: { $exists: false } }, { listingTypeId: null }] },
    { $set: { listingTypeId: userCar._id } }
  );
  backfilled = true;
}

export async function resolveListingTypeId(
  listingTypeId: string | undefined,
  condition: string
) {
  const types = await ensureDefaultListingTypes();
  if (listingTypeId) {
    const match = types.find((t) => String(t._id) === String(listingTypeId));
    if (match) return match;
    if (!mongoose.Types.ObjectId.isValid(listingTypeId)) {
      throw new Error("LISTING_TYPE_NOT_FOUND");
    }
    const byId = await ListingType.findById(listingTypeId);
    if (byId && byId.isActive) return byId;
    throw new Error("LISTING_TYPE_NOT_FOUND");
  }
  const slug = condition === "NEW" ? "new-car" : "user-car";
  return types.find((t) => t.slug === slug) ?? types[0];
}
