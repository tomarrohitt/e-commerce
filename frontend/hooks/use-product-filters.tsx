"use client";

import { useState, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { productService } from "@/lib/api";
import type { Category, Pagination } from "@/types"; // Import Pagination
import { useDebounce } from "@/hooks/use-debounce";
import { useQuery } from "@tanstack/react-query";

// Define a default pagination object
const defaultPagination: Pagination = {
  total: 0,
  page: 1,
  limit: 25,
  totalPages: 0,
};

export function useProductFilters(categories: Category[]) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // --- Filter State (Dynamic Page/Limit) ---
  const selectedCategorySlug = searchParams.get("category") || "";
  const [searchQuery, setSearchQuery] = useState(
    searchParams.get("search") || ""
  );

  // 1. Read page and limit from URL, with defaults
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "25", 10);

  const debouncedSearchQuery = useDebounce(searchQuery, 400);

  // --- Derived State (No change) ---
  const selectedCategory = useMemo(() => {
    if (!selectedCategorySlug) {
      return { id: "", name: "" }; // "All Products"
    }
    const match = categories.find((c) => c.slug === selectedCategorySlug);
    return match ? { id: match.id, name: match.name } : null;
  }, [categories, selectedCategorySlug]);

  const queryParams = {
    page,
    limit,
    ...(selectedCategory?.id && { categoryId: selectedCategory.id }),
    ...(debouncedSearchQuery && { search: debouncedSearchQuery }),
    inStock: true,
  };

  const { data: productsData, isLoading: loadingProducts } = useQuery({
    queryKey: ["products", queryParams],
    queryFn: () => productService.getProducts(queryParams),
    enabled:
      (selectedCategorySlug && selectedCategory !== null) ||
      !selectedCategorySlug,
  });

  // --- Event Handlers ---
  const handleFilterChange = (key: string, value: string) => {
    const pathname = "/";
    const params = new URLSearchParams(searchParams.toString());

    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.set("page", "1");

    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handlePageChange = (newPage: number) => {
    const pathname = "/";
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", newPage.toString());

    router.replace(`${pathname}?${params.toString()}`);
  };

  return {
    products: productsData?.products || [],
    pagination: productsData?.pagination || defaultPagination,
    loadingProducts,

    selectedCategorySlug,
    selectedCategoryName: selectedCategory?.name || "",
    searchQuery,
    setSearchQuery,
    handleFilterChange,
    handlePageChange,
  };
}
