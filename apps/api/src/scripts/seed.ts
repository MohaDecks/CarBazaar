import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { connectDatabase, disconnectDatabase } from "../config/db";
import {
  Brand,
  Category,
  Dealer,
  User,
  Vehicle,
  LocationModel,
} from "../models";
import { slugify } from "@car-marketplace/utils";
import { ETHIOPIA_CITIES, ETHIOPIA_REGIONS } from "@car-marketplace/utils";

const BRANDS = [
  "Toyota",
  "Mercedes-Benz",
  "BMW",
  "Nissan",
  "Hyundai",
  "Kia",
  "Ford",
  "Honda",
  "Lexus",
  "Land Rover",
  "Volkswagen",
  "Audi",
  "Chevrolet",
  "Mitsubishi",
  "Isuzu",
];

const CATEGORIES = [
  { name: "SUV", order: 1 },
  { name: "Sedan", order: 2 },
  { name: "Pickup", order: 3 },
  { name: "Truck", order: 4 },
  { name: "Van", order: 5 },
  { name: "Coupe", order: 6 },
  { name: "Sports", order: 7 },
  { name: "Electric", order: 8 },
  { name: "Hybrid", order: 9 },
  { name: "Luxury", order: 10 },
  { name: "Motorcycle", order: 11 },
];

/** High-quality placeholder automotive images (Unsplash) */
const PLACEHOLDER_IMAGES = [
  "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=1200&q=80",
  "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1200&q=80",
  "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=1200&q=80",
  "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=1200&q=80",
  "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=1200&q=80",
  "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=1200&q=80",
  "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=1200&q=80",
  "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=1200&q=80",
];

async function seed() {
  console.log("🌱 Seeding database...");
  await connectDatabase();

  await Promise.all([
    User.deleteMany({}),
    Brand.deleteMany({}),
    Category.deleteMany({}),
    Dealer.deleteMany({}),
    Vehicle.deleteMany({}),
    LocationModel.deleteMany({}),
  ]);

  const password = await bcrypt.hash("Password123!", 12);

  const [admin, seller, customer] = await User.create([
    {
      email: "admin@carmarketplace.et",
      password,
      firstName: "Admin",
      lastName: "User",
      role: "SUPER_ADMIN",
      isVerified: true,
      phone: "+251911000001",
    },
    {
      email: "seller@carmarketplace.et",
      password,
      firstName: "Abebe",
      lastName: "Kebede",
      role: "DEALER",
      isVerified: true,
      phone: "+251911000002",
      location: {
        country: "Ethiopia",
        region: "Addis Ababa",
        city: "Addis Ababa",
      },
    },
    {
      email: "buyer@carmarketplace.et",
      password,
      firstName: "Sara",
      lastName: "Hailu",
      role: "CUSTOMER",
      isVerified: true,
      phone: "+251911000003",
    },
  ]);

  const brands = await Brand.insertMany(
    BRANDS.map((name) => ({
      name,
      slug: slugify(name),
      isActive: true,
    }))
  );

  const categories = await Category.insertMany(
    CATEGORIES.map((c) => ({
      name: c.name,
      slug: slugify(c.name),
      order: c.order,
      isActive: true,
    }))
  );

  const dealer = await Dealer.create({
    userId: seller._id,
    companyName: "Horizon Motors Ethiopia",
    slug: "horizon-motors-ethiopia",
    description:
      "Premium new and certified pre-owned vehicles across Ethiopia. Trusted dealership with nationwide delivery.",
    location: {
      country: "Ethiopia",
      region: "Addis Ababa",
      city: "Addis Ababa",
      address: "Bole Road, Addis Ababa",
    },
    phone: "+251911000002",
    email: "sales@horizonmotors.et",
    website: "https://horizonmotors.et",
    verified: true,
    status: "APPROVED",
    stats: { vehicles: 0, sold: 2, yearsActive: 8 },
  });

  await User.findByIdAndUpdate(seller._id, { dealerId: dealer._id });

  // Locations
  await LocationModel.insertMany(
    ETHIOPIA_CITIES.map((city) => ({
      country: "Ethiopia",
      region:
        ETHIOPIA_REGIONS.find((r) =>
          city === "Addis Ababa"
            ? r === "Addis Ababa"
            : city === "Jijiga"
              ? r === "Somali"
              : city === "Bahir Dar" || city === "Gondar"
                ? r === "Amhara"
                : r === "Oromia"
        ) ?? "Oromia",
      city,
      isActive: true,
    }))
  );

  const vehicleDefs = [
    {
      title: "Land Cruiser Prado",
      brand: "Toyota",
      category: "SUV",
      condition: "NEW" as const,
      year: 2025,
      price: 12500000,
      mileage: 0,
      fuel: "DIESEL" as const,
      transmission: "AUTOMATIC" as const,
      engine: "2.8L",
      drive: "FOUR_WD" as const,
      color: "Pearl White",
      bodyType: "SUV",
      city: "Jijiga",
      region: "Somali",
      featured: true,
      img: 0,
    },
    {
      title: "C-Class",
      brand: "Mercedes-Benz",
      category: "Sedan",
      condition: "USED" as const,
      year: 2022,
      price: 6800000,
      mileage: 28000,
      fuel: "PETROL" as const,
      transmission: "AUTOMATIC" as const,
      engine: "2.0L",
      drive: "RWD" as const,
      color: "Obsidian Black",
      bodyType: "Sedan",
      city: "Addis Ababa",
      region: "Addis Ababa",
      featured: true,
      img: 1,
    },
    {
      title: "X5 xDrive40i",
      brand: "BMW",
      category: "SUV",
      condition: "CERTIFIED_USED" as const,
      year: 2023,
      price: 9200000,
      mileage: 15000,
      fuel: "PETROL" as const,
      transmission: "AUTOMATIC" as const,
      engine: "3.0L",
      drive: "AWD" as const,
      color: "Alpine White",
      bodyType: "SUV",
      city: "Addis Ababa",
      region: "Addis Ababa",
      featured: true,
      img: 2,
    },
    {
      title: "Patrol",
      brand: "Nissan",
      category: "SUV",
      condition: "NEW" as const,
      year: 2024,
      price: 11000000,
      mileage: 50,
      fuel: "PETROL" as const,
      transmission: "AUTOMATIC" as const,
      engine: "4.0L",
      drive: "FOUR_WD" as const,
      color: "Gun Metallic",
      bodyType: "SUV",
      city: "Dire Dawa",
      region: "Dire Dawa",
      featured: false,
      img: 3,
    },
    {
      title: "Tucson",
      brand: "Hyundai",
      category: "SUV",
      condition: "USED" as const,
      year: 2021,
      price: 4200000,
      mileage: 45000,
      fuel: "PETROL" as const,
      transmission: "AUTOMATIC" as const,
      engine: "2.0L",
      drive: "FWD" as const,
      color: "Phantom Black",
      bodyType: "SUV",
      city: "Bahir Dar",
      region: "Amhara",
      featured: false,
      img: 4,
    },
    {
      title: "Sportage",
      brand: "Kia",
      category: "SUV",
      condition: "NEW" as const,
      year: 2024,
      price: 5100000,
      mileage: 0,
      fuel: "HYBRID" as const,
      transmission: "AUTOMATIC" as const,
      engine: "1.6L Hybrid",
      drive: "AWD" as const,
      color: "Gravity Gray",
      bodyType: "SUV",
      city: "Hawassa",
      region: "Sidama",
      featured: true,
      img: 5,
    },
    {
      title: "Ranger Wildtrak",
      brand: "Ford",
      category: "Pickup",
      condition: "USED" as const,
      year: 2022,
      price: 5500000,
      mileage: 32000,
      fuel: "DIESEL" as const,
      transmission: "AUTOMATIC" as const,
      engine: "2.0L Bi-Turbo",
      drive: "FOUR_WD" as const,
      color: "Blue Lightning",
      bodyType: "Pickup",
      city: "Jimma",
      region: "Oromia",
      featured: false,
      img: 6,
    },
    {
      title: "CR-V",
      brand: "Honda",
      category: "SUV",
      condition: "USED" as const,
      year: 2020,
      price: 3800000,
      mileage: 62000,
      fuel: "PETROL" as const,
      transmission: "CVT" as const,
      engine: "1.5L Turbo",
      drive: "AWD" as const,
      color: "Modern Steel",
      bodyType: "SUV",
      city: "Mekelle",
      region: "Tigray",
      featured: false,
      img: 7,
    },
  ];

  for (const def of vehicleDefs) {
    const brand = brands.find((b) => b.name === def.brand)!;
    const category = categories.find((c) => c.name === def.category)!;
    const mainImage = PLACEHOLDER_IMAGES[def.img];
    const slug = `${slugify(brand.name)}/${slugify(def.title)}-${def.year}`;

    const angleImages = [
        PLACEHOLDER_IMAGES[def.img % PLACEHOLDER_IMAGES.length],
        PLACEHOLDER_IMAGES[(def.img + 1) % PLACEHOLDER_IMAGES.length],
        PLACEHOLDER_IMAGES[(def.img + 2) % PLACEHOLDER_IMAGES.length],
        PLACEHOLDER_IMAGES[(def.img + 3) % PLACEHOLDER_IMAGES.length],
        PLACEHOLDER_IMAGES[(def.img + 4) % PLACEHOLDER_IMAGES.length],
        PLACEHOLDER_IMAGES[(def.img + 5) % PLACEHOLDER_IMAGES.length],
        PLACEHOLDER_IMAGES[(def.img + 6) % PLACEHOLDER_IMAGES.length],
        PLACEHOLDER_IMAGES[(def.img + 7) % PLACEHOLDER_IMAGES.length],
      ];

      await Vehicle.create({
      sellerId: seller._id,
      dealerId: dealer._id,
      brandId: brand._id,
      categoryId: category._id,
      title: def.title,
      slug,
      condition: def.condition,
      year: def.year,
      price: def.price,
      currency: "ETB",
      negotiable: def.condition !== "NEW",
      mileage: def.mileage,
      fuel: def.fuel,
      transmission: def.transmission,
      engine: def.engine,
      drive: def.drive,
      color: def.color,
      bodyType: def.bodyType,
      description: `Experience the ${def.year} ${brand.name} ${def.title} — meticulously maintained and ready for Ethiopian roads. Available through Horizon Motors Ethiopia with full documentation and support.`,
      features: {
        safety: ["ABS", "Airbags", "Stability Control", "Parking Sensors"],
        comfort: ["Climate Control", "Leather Seats", "Power Windows"],
        technology: ["Touchscreen", "Bluetooth", "Reverse Camera"],
        exterior: ["Alloy Wheels", "LED Headlights"],
        interior: ["Multi-function Steering", "Ambient Lighting"],
      },
      images: [
        { url: angleImages[0], thumbnailUrl: angleImages[0], type: "MAIN", order: 0 },
        { url: angleImages[1], type: "FRONT", order: 1 },
        { url: angleImages[2], type: "LEFT", order: 2 },
        { url: angleImages[3], type: "REAR", order: 3 },
        { url: angleImages[4], type: "RIGHT", order: 4 },
        { url: angleImages[5], type: "INTERIOR", order: 5 },
      ],
      gallery360: angleImages.map((url, order) => ({
        url,
        thumbnailUrl: url,
        type: "GALLERY_360" as const,
        order,
      })),
      mainImage,
      location: {
        country: "Ethiopia",
        region: def.region,
        city: def.city,
      },
      status: "APPROVED",
      featured: def.featured,
      views: Math.floor(Math.random() * 500),
      favoritesCount: Math.floor(Math.random() * 40),
      publishedAt: new Date(),
    });
  }

  await Dealer.findByIdAndUpdate(dealer._id, {
    "stats.vehicles": vehicleDefs.length,
  });

  console.log("✓ Seed complete");
  console.log("");
  console.log("Accounts (password: Password123!):");
  console.log("  Admin:  admin@carmarketplace.et");
  console.log("  Seller: seller@carmarketplace.et");
  console.log("  Buyer:  buyer@carmarketplace.et");
  console.log(`  Vehicles: ${vehicleDefs.length}`);
  console.log(`  Brands: ${brands.length}`);

  await disconnectDatabase();
  process.exit(0);
}

seed().catch(async (err) => {
  console.error(err);
  await mongoose.disconnect().catch(() => undefined);
  process.exit(1);
});
