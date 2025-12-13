"use client";

import { useQuery } from "@tanstack/react-query";

import { productService } from "@/lib/api";

import type { Pagination, Product } from "@/types";

const emptyPagination: Pagination = {
  total: 0,
  page: 1,
  limit: 12,
  totalPages: 0,
};

export function useProducts(queryParams: Record<string, unknown>) {
  const { data, isLoading } = useQuery({
    queryKey: ["products", queryParams],

    queryFn: () => productService.getProducts(queryParams),

    placeholderData: (prev) => prev,
  });

  return {
    products: (data?.products ?? []) as Product[],

    pagination: (data?.pagination ?? emptyPagination) as Pagination,

    loading: isLoading,
  };
}
