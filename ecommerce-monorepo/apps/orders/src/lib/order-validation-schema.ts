import { OrderStatus } from "@prisma/client";
import { z } from "zod";

// Address Schema (Reuse this)
const addressSchema = z.object({
  street: z.string().min(5),
  city: z.string().min(2),
  state: z.string().min(2),
  zipCode: z.string().min(3),
  country: z.string().min(2),
  phoneNumber: z.string().optional(),
});

const orderItemSchema = z.object({
  productId: z.string().min(1),
  quantity: z.coerce.number().int().positive(),
  price: z.coerce.number().positive(), // Snapshot Price
  name: z.string().min(1), // Snapshot Name
  sku: z.string().min(1), // Snapshot SKU
  thumbnail: z.string().optional().default(""), // Snapshot thumbnail
});

export const createOrderSchema = z
  .object({
    shippingAddress: addressSchema,
    billingAddress: addressSchema.optional(),
    paymentMethod: z.enum(["stripe", "cod"]).default("stripe"),
    totalAmount: z.coerce.number().positive(),
    items: z.array(orderItemSchema).min(1),
  })
  .transform((data) => {
    return {
      ...data,
      billingAddress: data.billingAddress ?? data.shippingAddress,
    };
  });

export const listAdminOrdersSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),

  status: z.enum(OrderStatus).optional(),
  userId: z.string().optional(),
  sortBy: z.enum(["createdAt", "totalAmount", "status"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type ListOrderInput = z.infer<typeof listAdminOrdersSchema>;
