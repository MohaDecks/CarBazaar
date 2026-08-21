import { connectDatabase } from "../config/db";
import { Vehicle } from "../models";

async function repair() {
  await connectDatabase();

  const vehicles = await Vehicle.find({
    $or: [
      { mainImage: { $regex: "/temp/" } },
      { mainImage: { $exists: false } },
      { mainImage: "" },
    ],
  });

  let fixed = 0;
  for (const vehicle of vehicles) {
    const main =
      vehicle.images.find((img) => img.isMain) ??
      vehicle.images.find((img) => img.type === "MAIN") ??
      vehicle.images[0];
    if (!main?.url) continue;
    vehicle.mainImage = main.url;
    await vehicle.save();
    fixed += 1;
    console.log(`Fixed ${vehicle._id} → ${vehicle.mainImage}`);
  }

  console.log(`Repaired ${fixed} vehicle(s).`);
  process.exit(0);
}

repair().catch((err) => {
  console.error(err);
  process.exit(1);
});
