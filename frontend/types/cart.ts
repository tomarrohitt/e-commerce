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

export type ListCartQuery = {
  page: number;
  limit: number;
  search?: string;
  inStock?: boolean;
  minPrice?: number;
  maxPrice?: number;
  categoryId?: string;
};

export type CartItem = {
  productId: string;
  quantity: number;
  addedAt: Date;
};

export interface CartItemWithProduct extends CartItem {
  product: {
    productId: string;
    name: string;
    price: number;
    thumbnail: string;
    stockQuantity: number;
    sku: string;
  };
}

export interface Cart {
  items: CartItemWithProduct[];
  totalItems: number;
  subtotal: number;
  tax: number;
  totalAmount: number;
}

export type AddToCartInput = z.infer<typeof addToCartSchema>;
export type UpdateQuantityInput = z.infer<typeof updateQuantitySchema>;
