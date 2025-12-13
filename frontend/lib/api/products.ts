import { api } from "./client";
import type { PaginatedProducts, ProductsListResponse } from "@/types";

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

  async getProduct(id: string) {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },
};
