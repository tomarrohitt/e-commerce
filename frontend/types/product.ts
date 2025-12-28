import z from "zod";
import { Pagination } from "./common";

export type AttributeType =
  | "text"
  | "number"
  | "select"
  | "multiselect"
  | "date"
  | "boolean"
  | "color"
  | "url";

export interface AttributeDefinition {
  key: string;
  label: string;
  type: AttributeType;
  required?: boolean;
  searchable?: boolean;
  options?: string[];
  unit?: string;
  group?: string;
}

export interface CategorySchema {
  id: string;
  name: string;
  slug: string;
  attributeSchema?: AttributeDefinition[];
}

// Update your existing Product type
export interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  stockQuantity: number;
  sku: string;
  images: string[];
  thumbnail: string | null;
  isActive: boolean;
  rating: number;
  reviewCount: number;

  attributes?: Record<string, string | number | boolean | string[]>;

  categoryId: string | null;
  category?: {
    id: string;
    name: string;
    slug: string;
    attributeSchema?: AttributeDefinition[];
  };

  reviews?: Review[];
  createdAt: string;
  updatedAt: string;
}

export type Category = {
  id: string;
  name: string;
  slug: string;
  _count?: {
    products: number;
  };
};

export type ProductListProduct = Pick<
  Product,
  | "id"
  | "name"
  | "price"
  | "thumbnail"
  | "stockQuantity"
  | "category"
  | "rating"
  | "reviewCount"
>;

export type PaginatedProducts = {
  products: ProductListProduct[];
  pagination: Pagination;
};

export interface ProductsListResponse {
  success: boolean;
  data: PaginatedProducts;
}

export type ListProductQuery = {
  page: number | undefined;
  limit: number | undefined;
  search?: string | undefined;
  inStock?: boolean | undefined;
  minPrice?: number | undefined;
  maxPrice?: number | undefined;
  categoryId?: string | undefined;
};

export interface ReviewUser {
  name: string;
  image: string | null;
}

export interface Review {
  id: string;
  rating: number;
  comment: string;
  userId: string;
  productId: string;
  createdAt: string;
  user: ReviewUser;
}

export interface ReviewTrim {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
}

export interface ReviewsData {
  reviews: Review[];
  pagination: Pagination;
}

export interface ReviewsResponse {
  success: boolean;
  data: ReviewsData;
}
export interface ReviewResponse {
  success: boolean;
  data: ReviewTrim;
}

export const createReviewSchema = z.object({
  productId: z.string({ error: "Product ID is required" }),
  rating: z.coerce
    .number()
    .int()
    .min(1, "Rating must be at least 1")
    .max(5, "Rating cannot be more than 5"),
  comment: z
    .string()
    .max(1000, "Comment cannot exceed 1000 characters")
    .optional(),
});

export const updateReviewSchema = createReviewSchema.partial();

export type CreateReviewInput = z.infer<typeof createReviewSchema>;
export type UpdateReviewInput = z.infer<typeof updateReviewSchema>;
