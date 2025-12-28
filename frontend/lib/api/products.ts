import { api } from "./client";
import type {
  CreateReviewInput,
  PaginatedProducts,
  Product,
  ProductsListResponse,
  ReviewResponse,
  ReviewsData,
  ReviewsResponse,
  ReviewTrim,
} from "@/types";

export const productService = {
  async getProducts(params?: {
    page?: number;
    limit?: number;
    search?: string;
    categoryId?: string;
    minPrice?: number;
    maxPrice?: number;
    inStock?: boolean;
  }): Promise<PaginatedProducts> {
    const response = await api.get<ProductsListResponse>("/products", {
      params,
    });
    return response.data.data;
  },

  async getProduct(id: string): Promise<Product> {
    const response = await api.get(`/products/${id}`);
    return response.data.data;
  },

  async getReviews(productId: string): Promise<ReviewsData> {
    const response = await api.get<ReviewsResponse>(
      `/reviews?productId=${productId}`,
    );
    return response.data.data;
  },
  async getReviewByProductId(productId: string) {
    const response = await api.get<ReviewResponse>(
      `/reviews/status/${productId}`,
    );
    return response.data.data;
  },
  async createReview(data: CreateReviewInput) {
    const response = await api.post<ReviewsResponse>("/reviews", data);
    return response.data.data;
  },
  async updateReview(data: ReviewTrim) {
    const response = await api.patch<ReviewResponse>(
      `/reviews/${data.id}`,
      data,
    );
    return response.data.data;
  },
  async removeReview(productId: string) {
    const response = await api.delete<ReviewsResponse>(`/reviews/${productId}`);
    return response.data.data;
  },
};
