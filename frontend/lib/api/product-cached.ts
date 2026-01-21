import {
  PaginatedProducts,
  Product,
  ProductsListResponse,
  ReviewResponse,
  ReviewsData,
  ReviewsResponse,
} from "@/types";
import { baseApi } from "./baseApi";
import { buildQuery } from "../build-query";

export async function getProducts(params?: {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
}): Promise<PaginatedProducts> {
  const q = buildQuery(params);
  const res = await baseApi<ProductsListResponse>(`/products${q}`, {
    cache: "force-cache",
    next: {
      tags: ["products"],
    },
  });

  return res.data;
}

export async function getProduct(id: string): Promise<Product> {
  const res = await baseApi<{ data: Product }>(`/products/${id}`, {
    cache: "force-cache",
    next: {
      tags: [`product-${id}`],
    },
  });
  return res.data;
}

export async function getCategories() {
  const res = await baseApi<{ data: any[] }>("/category");
  return res.data;
}

export async function getCategory(id: string) {
  const res = await baseApi(`/category/${id}`);
  return res;
}

export async function getCategoryBySlug(slug: string) {
  const res = await baseApi(`/category/slug/${slug}`);
  return res;
}

export async function getReviews(productId: string): Promise<ReviewsData> {
  const res = await baseApi<ReviewsResponse>(
    `/reviews${buildQuery({ productId })}`,
  );
  return res.data;
}

export async function getReviewByProductId(productId: string) {
  const res = await baseApi<ReviewResponse>(`/reviews/status/${productId}`);
  return res.data;
}
