"use cache";

import {
  PaginatedProducts,
  Product,
  ProductsListResponse,
  ReviewResponse,
  ReviewsData,
  ReviewsResponse,
} from "@/types";
import { baseApi } from "./baseApi";
import { cacheTag } from "next/cache";

export async function getProducts(params?: {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
}): Promise<PaginatedProducts> {
  cacheTag("products");
  const response = await baseApi.get<ProductsListResponse>("/products", {
    params,
  });
  return response.data.data;
}

export async function getProduct(id: string): Promise<Product> {
  const response = await baseApi.get(`/products/${id}`);
  return response.data.data;
}

export async function getCategories() {
  cacheTag("categories");
  const response = await baseApi.get("/category");
  return response.data.data;
}

export async function getCategory(id: string) {
  const response = await baseApi.get(`/category/${id}`);
  return response.data;
}

export async function getCategoryBySlug(slug: string) {
  const response = await baseApi.get(`/category/slug/${slug}`);
  return response.data;
}

export async function getReviews(productId: string): Promise<ReviewsData> {
  const response = await baseApi.get<ReviewsResponse>(
    `/reviews?productId=${productId}`,
  );
  return response.data.data;
}
export async function getReviewByProductId(productId: string) {
  const response = await baseApi.get<ReviewResponse>(
    `/reviews/status/${productId}`,
  );
  return response.data.data;
}
