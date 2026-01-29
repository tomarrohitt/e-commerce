import z from "zod";

export const createAddressSchema = z.object({
  name: z.string().trim().max(50).optional().default("Home"),
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

export type CreateAddressInput = z.infer<typeof createAddressSchema>;
export type UpdateAddressInput = z.infer<typeof updateAddressSchema>;
