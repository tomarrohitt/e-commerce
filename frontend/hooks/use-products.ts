"use client";

import { QUERY_KEYS, CACHE_TIMES } from "@/lib/query-config";
import { useOptimizedQuery } from "./use-optimized-query";
import { ListProductQuery } from "@/types";
import { getProducts } from "@/lib/api";

export function useProducts(filters: ListProductQuery) {
  const normalizedFilters = {
    page: filters.page || 1,
    limit: filters.limit || 24,
    ...(filters.search && { search: filters.search }),
    ...(filters.categoryId && { categoryId: filters.categoryId }),
    ...(filters.inStock !== undefined && { inStock: filters.inStock }),
  };

  const { data, isLoading, error } = useOptimizedQuery({
    queryKey: QUERY_KEYS.products(normalizedFilters),
    queryFn: () => getProducts(normalizedFilters),
    cacheTime: CACHE_TIMES.products,
  });

  return {
    products: data?.products ?? [],
    pagination: data?.pagination ?? {
      total: 0,
      page: 1,
      limit: 24,
      totalPages: 0,
    },
  };
}
