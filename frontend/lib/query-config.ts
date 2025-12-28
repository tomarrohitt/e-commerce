import { ListOrderInput, ListProductQuery } from "@/types";

export const QUERY_KEYS = {
  auth: ["auth"] as const,
  cart: ["cart"] as const,
  orders: (filters?: ListOrderInput) => ["orders", filters] as const,
  order: (id: string) => ["order", id] as const,
  addresses: ["addresses"] as const,
  address: (id: string) => ["address", id] as const,
  products: (filters?: ListProductQuery) => ["products", filters] as const,
  product: (id: string) => ["product", id] as const,
  categories: ["categories"] as const,
  reviews: (productId: string) => ["reviews", productId] as const,
} as const;

export const CACHE_TIMES = {
  categories: 1000 * 60 * 30,

  products: 1000 * 60 * 10,
  product: 1000 * 60 * 15,

  addresses: 1000 * 60 * 10,
  orders: 1000 * 60 * 5,

  cart: 1000 * 60 * 2,
  order: 1000 * 60 * 1,
} as const;
