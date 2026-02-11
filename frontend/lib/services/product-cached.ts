import {
  PaginatedProducts,
  Product,
  ProductsListResponse,
  ReviewResponse,
  ReviewsData,
  ReviewsResponse,
  ReviewTrim,
} from "@/types";
import { baseApi } from "@/lib/clients/baseApi";
import { buildQuery } from "../constants/build-query";
import { apiClient } from "../clients/client";

export async function getProducts(params?: {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  sortBy?: "price" | "rating" | "createdAt" | undefined;
  sortOrder?: "desc" | "asc" | undefined;
}): Promise<PaginatedProducts> {
  const q = buildQuery(params);
  const res = await baseApi<ProductsListResponse>(`/products${q}`);

  const json = await res.json();
  return json.data;
}

export async function getProduct(id: string): Promise<Product> {
  const res = await baseApi<{ data: Product }>(`/products/${id}`);
  const json = await res.json();
  return json.data;
}

export async function getCategories() {
  const res = await baseApi<{ data: any[] }>("/category", {
    cache: "force-cache",
    next: {
      tags: [`category`],
    },
  });
  const json = await res.json();
  return json.data;
}

export async function getCategory(id: string) {
  const res = await baseApi(`/category/${id}`);
  const json = await res.json();
  return json.data;
}

export async function getCategoryBySlug(slug: string) {
  const res = await baseApi(`/category/slug/${slug}`);
  const json = await res.json();
  return json.data;
}

export async function getReviews(productId: string): Promise<ReviewsData> {
  const res = await baseApi<ReviewsResponse>(
    `/reviews?productId=${productId}`,
    {
      cache: "force-cache",
      next: {
        tags: [`reviews-${productId}`],
      },
    },
  );
  const json = await res.json();
  return json.data;
}

export async function getReviewByProductId(
  productId: string,
): Promise<ReviewTrim | null> {
  const json = await apiClient<ReviewResponse>(`/reviews/status/${productId}`);
  if (!json.success) return null;
  return json.data;
}
