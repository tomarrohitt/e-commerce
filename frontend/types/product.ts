import { Pagination } from "./common";

export type Category = {
  id: string;
  name: string;
  slug: string;
  _count?: {
    products: number;
  };
};

export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  stockQuantity: number;
  sku: string;
  images: string[];
  thumbnail?: string;
  categoryId?: string;
  category?: {
    id: string;
    name: string;
    slug: string;
  };
  createdAt: string;
  updatedAt: string;
};

export type PaginatedProducts = {
  products: Product[];
  pagination: Pagination;
};

export interface ProductsListResponse {
  success: boolean;
  data: PaginatedProducts;
}

export type ListProductQuery = {
  page: number;
  limit: number;
  search?: string | undefined;
  inStock?: boolean | undefined;
  minPrice?: number | undefined;
  maxPrice?: number | undefined;
  categoryId?: string | undefined;
};
