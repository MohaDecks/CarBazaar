import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128),
  firstName: z.string().min(1).max(50),
  lastName: z.string().min(1).max(50),
  phone: z.string().min(9).max(20).optional(),
  role: z.enum(["CUSTOMER", "SELLER", "DEALER"]).optional().default("CUSTOMER"),
});

export const createAdminUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128),
  firstName: z.string().min(1).max(50),
  lastName: z.string().min(1).max(50),
  phone: z.string().min(9).max(20).optional(),
  role: z
    .enum(["CUSTOMER", "SELLER", "DEALER", "ADMIN", "SUPER_ADMIN"])
    .optional()
    .default("ADMIN"),
  isActive: z.boolean().optional().default(true),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const googleAuthSchema = z.object({
  idToken: z.string().min(20),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8).max(128),
});

export const createVehicleSchema = z.object({
  brandId: z.string().min(1),
  categoryId: z.string().min(1),
  listingTypeId: z.string().min(1).optional(),
  title: z.string().min(3).max(120),
  condition: z.enum(["NEW", "USED", "CERTIFIED_USED"]),
  year: z.number().int().min(1980).max(2030),
  price: z.number().min(0),
  negotiable: z.boolean().optional(),
  mileage: z.number().min(0),
  fuel: z.enum([
    "PETROL",
    "DIESEL",
    "ELECTRIC",
    "HYBRID",
    "PLUGIN_HYBRID",
    "CNG",
    "LPG",
  ]),
  transmission: z.enum(["AUTOMATIC", "MANUAL", "CVT", "SEMI_AUTOMATIC"]),
  engine: z.string().optional(),
  drive: z.enum(["FWD", "RWD", "AWD", "FOUR_WD"]).optional(),
  color: z.string().optional(),
  bodyType: z.string().optional(),
  vin: z.string().optional(),
  description: z.string().min(20).max(5000),
  features: z
    .object({
      safety: z.array(z.string()).optional(),
      comfort: z.array(z.string()).optional(),
      technology: z.array(z.string()).optional(),
      exterior: z.array(z.string()).optional(),
      interior: z.array(z.string()).optional(),
    })
    .optional(),
  location: z.object({
    country: z.string().default("Ethiopia"),
    region: z.string().min(1),
    city: z.string().min(1),
    address: z.string().optional(),
  }),
  mainImage: z.string().min(1),
  images: z
    .array(
      z.object({
        url: z.string(),
        type: z.string().optional(),
        order: z.number().optional(),
        thumbnailUrl: z.string().optional(),
        publicId: z.string().optional(),
        secureUrl: z.string().optional(),
        width: z.number().optional(),
        height: z.number().optional(),
        format: z.string().optional(),
        bytes: z.number().optional(),
        isMain: z.boolean().optional(),
      })
    )
    .max(20)
    .optional(),
  video: z.string().optional(),
  videoPublicId: z.string().optional(),
  model3d: z
    .object({
      url: z.string(),
      format: z.enum(["glb", "gltf"]),
    })
    .optional(),
  dealerId: z.string().optional(),
  submit: z.boolean().optional(),
});

export const updateVehicleSchema = createVehicleSchema.partial();

export const vehicleStatusSchema = z.object({
  status: z.enum([
    "DRAFT",
    "PENDING",
    "APPROVED",
    "REJECTED",
    "SOLD",
    "ARCHIVED",
  ]),
  rejectionReason: z.string().optional(),
  featured: z.boolean().optional(),
});

export const createBrandSchema = z.object({
  name: z.string().min(1).max(50),
  logo: z.string().optional(),
  description: z.string().optional(),
  isActive: z.boolean().optional(),
});

export const createCategorySchema = z.object({
  name: z.string().min(1).max(50),
  description: z.string().optional(),
  icon: z.string().optional(),
  image: z.string().optional(),
  order: z.number().optional(),
  isActive: z.boolean().optional(),
});

export const createListingTypeSchema = z.object({
  name: z.string().min(1).max(50),
  description: z.string().optional(),
  defaultCondition: z.enum(["NEW", "USED", "CERTIFIED_USED"]).optional(),
  order: z.number().optional(),
  isActive: z.boolean().optional(),
});

export const createDealerSchema = z.object({
  companyName: z.string().min(2).max(100),
  description: z.string().optional(),
  phone: z.string().min(9),
  email: z.string().email(),
  website: z.string().url().optional().or(z.literal("")),
  location: z.object({
    country: z.string().default("Ethiopia"),
    region: z.string().min(1),
    city: z.string().min(1),
    address: z.string().optional(),
  }),
  logo: z.string().optional(),
  socialLinks: z
    .object({
      facebook: z.string().optional(),
      twitter: z.string().optional(),
      instagram: z.string().optional(),
      telegram: z.string().optional(),
    })
    .optional(),
});

export const sendMessageSchema = z.object({
  receiverId: z.string().min(1),
  content: z.string().min(1).max(2000),
  vehicleId: z.string().optional(),
  conversationId: z.string().optional(),
});

import { AppError } from "../middleware/error";

export function parseBody<T>(schema: z.ZodSchema<T>, data: unknown): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    const errors: Record<string, string[]> = {};
    for (const issue of result.error.issues) {
      const key = issue.path.join(".") || "root";
      if (!errors[key]) errors[key] = [];
      errors[key].push(issue.message);
    }
    throw new AppError("Validation failed", 400, errors);
  }
  return result.data;
}
