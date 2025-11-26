import { z } from "zod";

export const createProductSchema = z.object({
  name: z
    .string({
      error: "Product Name is required",
    })
    .trim()
    .min(3, "Product Name must be at least 3 characters")
    .max(100, "Product Name cannot exceed 100 characters"),
  price: z.coerce
    .number({
      error: "Price is required",
    })
    .positive("Price must be greater than zero")
    .multipleOf(0.01, "Price can only have up to 2 decimal places"),

  description: z
    .string({
      error: "Description is required",
    })
    .trim()
    .min(10, "Description must be at least 10 characters long")
    .max(2000, "Description cannot exceed 2000 characters"),

  stockQuantity: z.coerce
    .number({
      error: "Stock Quantity is required",
    })
    .int("Stock Quantity must be a whole number")
    .min(0, "Stock cannot be negative"),

  sku: z
    .string({
      error: "SKU is required",
    })
    .trim()
    .toUpperCase()
    .min(5, "SKU must be at least 5 characters")
    .max(20, "SKU cannot exceed 20 characters")
    .regex(/^[A-Z0-9]+$/, "SKU must be alphanumeric (A-Z, 0-9)"),

  categoryId: z
    .string({
      error: "Category is required",
    })
    .min(1, "Category ID cannot be empty"),
});

export const updateProductSchema = createProductSchema.partial();

export const updateProductQuantitySchema = z.object({
  stockQuantity: z.coerce.number().int(),
});

export const addImagesSchema = z.object({
  images: z.array(z.string().url("Must be a valid URL")).min(1).max(10),
});

export const createCategorySchema = z.object({
  name: z
    .string({
      error: "Category Name is required",
    })
    .trim()
    .min(3, "Category Name must be at least 3 characters")
    .max(50, "Category Name cannot exceed 50 characters"),

  slug: z.string({
    error: "Slug is required",
  }),
});

export const updateCategorySchema = createCategorySchema.partial();

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

// --- Type Exports ---
export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type ListProductQuery = z.infer<typeof listProductSchema>;

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
