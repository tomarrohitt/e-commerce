import { z } from "zod";

export const addToCartSchema = z.object({
  productId: z
    .string({
      error: "Product ID is required",
    })
    .min(1, "Product ID cannot be empty"),

  quantity: z.coerce
    .number({
      error: "Quantity is required",
    })
    .int("Quantity must be a whole number")
    .positive("Quantity must be greater than zero")
    .min(1, "You must add at least 1 item")
    .max(100, "You cannot add more than 100 items at once"),
});

export const updateQuantitySchema = z.object({
  quantity: z.coerce
    .number({
      error: "Quantity is required",
    })
    .int("Quantity must be a whole number")
    .min(1, "Quantity must be at least 1")
    .max(100, "Quantity cannot exceed 100"),
});

export const listProductSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),

  search: z.string().trim().optional(),
  inStock: z
    .enum(["true", "false"])
    .transform((val) => val === "true")
    .optional(),

  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  categoryId: z.string().optional(),
});

export type ListProductQuery = z.infer<typeof listProductSchema>;

export type AddToCartInput = z.infer<typeof addToCartSchema>;
export type UpdateQuantityInput = z.infer<typeof updateQuantitySchema>;
