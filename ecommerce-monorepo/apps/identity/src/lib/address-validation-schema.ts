import { z } from "zod";

export const createAddressSchema = z.object({
  name: z.string().trim().max(50).optional().default("Home"), // e.g. "Home"
  isDefault: z.boolean().optional().default(false),
  street: z
    .string({ error: "Street is required" })
    .min(3, "Street address is too short")
    .max(255),
  city: z.string({ error: "City is required" }).min(2).max(100),
  state: z.string({ error: "State is required" }).min(2).max(100),
  zipCode: z.string({ error: "Zip Code is required" }).min(3).max(20),
  country: z.string({ error: "Country is required" }).min(2).max(100),
  phoneNumber: z.string().min(8).max(20).optional(),
});

export const updateAddressSchema = createAddressSchema
  .omit({ isDefault: true })
  .partial();
export const adminUpdateAddressSchema = createAddressSchema.partial();

export const adminListAddressSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  userId: z.string().optional(),
  city: z.string().trim().optional(),
  state: z.string().trim().optional(),
  zipCode: z.string().trim().optional(),
  search: z.string().trim().optional(),
  isDefault: z
    .enum(["true", "false"])
    .transform((val) => val === "true")
    .optional(),
});

export type CreateAddressInput = z.infer<typeof createAddressSchema>;
export type UpdateAddressInput = z.infer<typeof updateAddressSchema>;
export type AdminUpdateAddressInput = z.infer<typeof adminUpdateAddressSchema>;

export type AdminListAddressQuery = z.infer<typeof adminListAddressSchema>;
